from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.crud import CRUDBase
from app.core.deps import CurrentUser, require_permissions
from app.core.exceptions import BadRequestException, ConflictException, ForbiddenException
from app.core.pagination import Page, PageParams
from app.core.responses import SuccessResponse, ok
from app.core.security import hash_password
from app.db.seed import DRIVER_ROLE
from app.db.session import get_db
from app.drivers.models import Driver, DriverStatus
from app.users.models import User
from app.users.schemas import (
    MyProfileResponse,
    ProfileCompletionRequest,
    UserCreate,
    UserRead,
    UserUpdate,
)

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]

user_crud = CRUDBase(User, search_fields=["email", "full_name"])

# Which ProfileCompletionRequest fields are mandatory for each role's step-2 form.
# One dynamic endpoint (POST /users/me/profile) instead of a router per role —
# add a role here and its step-2 requirement is enforced with no new endpoint.
ROLE_PROFILE_REQUIRED_FIELDS: dict[str, list[str]] = {
    DRIVER_ROLE: ["license_number", "license_category", "license_expiry_date", "contact_number"],
}
# Roles with no dedicated entity (§6 of the spec) just need a contact number;
# region stays optional for everyone.
_CONTACT_ONLY_REQUIRED = ["contact_number"]


def _prepare_user_data(data: dict) -> dict:
    """Convert the plain `password` field into `hashed_password`."""
    password = data.pop("password", None)
    if password is not None:
        data["hashed_password"] = hash_password(password)
    return data


def _driver_profile_for(db: Session, user: User) -> Driver | None:
    return db.scalar(select(Driver).where(Driver.user_id == user.id))


@router.get("/me/profile", response_model=SuccessResponse[MyProfileResponse])
def read_my_profile(current_user: CurrentUser, db: DbSession):
    driver = None
    if current_user.role and current_user.role.name == DRIVER_ROLE:
        driver = _driver_profile_for(db, current_user)
    return ok(
        MyProfileResponse(user=current_user, driver=driver), "Profile retrieved successfully."
    )


@router.post("/me/profile", response_model=SuccessResponse[MyProfileResponse])
def complete_my_profile(
    payload: ProfileCompletionRequest, current_user: CurrentUser, db: DbSession
):
    role_name = current_user.role.name if current_user.role else None
    required_fields = ROLE_PROFILE_REQUIRED_FIELDS.get(role_name, _CONTACT_ONLY_REQUIRED)

    provided = payload.model_dump()
    missing = [field for field in required_fields if not provided.get(field)]
    if missing:
        raise BadRequestException(f"Missing required fields: {', '.join(missing)}")

    driver = None
    if role_name == DRIVER_ROLE:
        if _driver_profile_for(db, current_user) is not None:
            raise ConflictException("Driver profile already completed")
        if db.scalar(select(Driver).where(Driver.license_number == payload.license_number)):
            raise ConflictException("A driver with this license number already exists")
        driver = Driver(
            user_id=current_user.id,
            name=current_user.full_name,
            license_number=payload.license_number,
            license_category=payload.license_category,
            license_expiry_date=payload.license_expiry_date,
            contact_number=payload.contact_number,
            region=payload.region,
            status=DriverStatus.available.value,
        )
        db.add(driver)
    else:
        current_user.contact_number = payload.contact_number
        if payload.region is not None:
            current_user.region = payload.region

    current_user.is_profile_complete = True
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    if driver is not None:
        db.refresh(driver)
    return ok(MyProfileResponse(user=current_user, driver=driver), "Profile completed successfully.")


@router.get(
    "",
    response_model=SuccessResponse[Page[UserRead]],
    dependencies=[Depends(require_permissions("users:read"))],
)
def list_users(
    db: DbSession,
    params: Annotated[PageParams, Depends()],
    role_id: Annotated[int | None, Query()] = None,
    is_active: Annotated[bool | None, Query()] = None,
    is_approved: Annotated[bool | None, Query()] = None,
):
    items, total = user_crud.list(
        db,
        params=params,
        filters={"role_id": role_id, "is_active": is_active, "is_approved": is_approved},
    )
    return ok(Page[UserRead].create(items, total, params), "Users retrieved successfully.")


@router.post(
    "",
    response_model=SuccessResponse[UserRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions("users:write"))],
)
def create_user(payload: UserCreate, db: DbSession):
    if db.scalar(select(User).where(User.email == payload.email)):
        raise ConflictException("A user with this email already exists")
    user = user_crud.create(db, _prepare_user_data(payload.model_dump()))
    return ok(user, "User created successfully.")


@router.get(
    "/{user_id}",
    response_model=SuccessResponse[UserRead],
    dependencies=[Depends(require_permissions("users:read"))],
)
def get_user(user_id: int, db: DbSession):
    return ok(user_crud.get_or_404(db, user_id), "User retrieved successfully.")


@router.patch(
    "/{user_id}",
    response_model=SuccessResponse[UserRead],
    dependencies=[Depends(require_permissions("users:write"))],
)
def update_user(user_id: int, payload: UserUpdate, db: DbSession):
    user = user_crud.get_or_404(db, user_id)
    updated = user_crud.update(db, user, _prepare_user_data(payload.model_dump(exclude_unset=True)))
    return ok(updated, "User updated successfully.")


@router.delete(
    "/{user_id}",
    response_model=SuccessResponse[None],
    dependencies=[Depends(require_permissions("users:write"))],
)
def delete_user(user_id: int, db: DbSession, current_user: CurrentUser):
    if user_id == current_user.id:
        raise BadRequestException("You cannot delete your own account")
    user = user_crud.get_or_404(db, user_id)
    user_crud.delete(db, user)
    return ok(None, "User deleted successfully.")


@router.post(
    "/{user_id}/approve",
    response_model=SuccessResponse[UserRead],
)
def approve_user(user_id: int, current_user: CurrentUser, db: DbSession):
    """Approve a pending user. Gated by a dynamic "<role>:approve" permission

    rather than a fixed "users:write" check, so who can approve which role is
    just another entry in that role's permissions list (see PATCH /roles/{id})
    — e.g. grant safety_officer "driver:approve" without making them an admin.
    """
    granted = set(current_user.role.permissions) if current_user.role else set()
    is_super = "*" in granted
    if not is_super and not current_user.is_approved:
        raise ForbiddenException("Your account is pending admin approval")

    target = user_crud.get_or_404(db, user_id)
    if target.role is None:
        raise BadRequestException("Target user has no role assigned")

    permission = f"{target.role.name}:approve"
    if not is_super and permission not in granted:
        raise ForbiddenException(f"Missing permission: {permission}")

    if target.is_approved:
        raise ConflictException("User is already approved")

    target.is_approved = True
    db.add(target)
    db.commit()
    db.refresh(target)
    return ok(target, "User approved successfully.")
