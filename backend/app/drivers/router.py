from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.crud import CRUDBase
from app.core.deps import CurrentUser, require_permissions
from app.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from app.core.pagination import Page, PageParams
from app.core.responses import SuccessResponse, ok
from app.db.seed import DRIVER_ROLE
from app.db.session import get_db
from app.drivers.models import Driver, DriverStatus
from app.drivers.schemas import DriverCreate, DriverProfileCreate, DriverRead, DriverUpdate
from app.users.models import User

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]

driver_crud = CRUDBase(Driver, search_fields=["name", "license_number"])


def _require_driver_role(current_user: User) -> None:
    if current_user.role is None or current_user.role.name != DRIVER_ROLE:
        raise ForbiddenException("Only users registered with the driver role have a driver profile")


# Static sub-paths must be registered before the "/{driver_id}" route below,
# otherwise FastAPI would try to parse "me"/"dispatchable"/"expiring-licenses" as an id.
@router.get("/me", response_model=SuccessResponse[DriverRead])
def read_my_driver_profile(current_user: CurrentUser, db: DbSession):
    _require_driver_role(current_user)
    driver = db.scalar(select(Driver).where(Driver.user_id == current_user.id))
    if driver is None:
        raise NotFoundException("Driver profile not completed yet")
    return ok(driver, "Driver profile retrieved successfully.")


@router.post(
    "/me",
    response_model=SuccessResponse[DriverRead],
    status_code=status.HTTP_201_CREATED,
)
def complete_my_driver_profile(
    payload: DriverProfileCreate, current_user: CurrentUser, db: DbSession
):
    _require_driver_role(current_user)

    existing = db.scalar(select(Driver).where(Driver.user_id == current_user.id))
    if existing:
        raise ConflictException("Driver profile already completed")

    driver = Driver(
        user_id=current_user.id,
        status=DriverStatus.available.value,
        **payload.model_dump(),
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return ok(driver, "Driver profile completed successfully.")


@router.get(
    "/dispatchable",
    response_model=SuccessResponse[list[DriverRead]],
    dependencies=[Depends(require_permissions("drivers:read"))],
)
def list_dispatchable_drivers(db: DbSession):
    today = date.today()
    stmt = select(Driver).where(
        Driver.status == DriverStatus.available,
        Driver.license_expiry_date >= today,
    )
    drivers = list(db.scalars(stmt).all())
    return ok(drivers, "Dispatchable drivers retrieved successfully.")


@router.get(
    "/expiring-licenses",
    response_model=SuccessResponse[list[DriverRead]],
    dependencies=[Depends(require_permissions("drivers:read"))],
)
def list_expiring_licenses(db: DbSession, days: Annotated[int, Query(ge=1, le=365)] = 30):
    today = date.today()
    horizon = today + timedelta(days=days)
    stmt = select(Driver).where(
        Driver.license_expiry_date >= today,
        Driver.license_expiry_date <= horizon,
    )
    drivers = list(db.scalars(stmt).all())
    return ok(drivers, "Drivers with expiring licenses retrieved successfully.")


@router.get(
    "",
    response_model=SuccessResponse[Page[DriverRead]],
    dependencies=[Depends(require_permissions("drivers:read"))],
)
def list_drivers(
    db: DbSession,
    params: Annotated[PageParams, Depends()],
    status_: Annotated[DriverStatus | None, Query(alias="status")] = None,
    region: Annotated[str | None, Query()] = None,
):
    items, total = driver_crud.list(db, params=params, filters={"status": status_, "region": region})
    return ok(Page[DriverRead].create(items, total, params), "Drivers retrieved successfully.")


@router.post(
    "",
    response_model=SuccessResponse[DriverRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions("drivers:write"))],
)
def create_driver(payload: DriverCreate, db: DbSession):
    if db.scalar(select(Driver).where(Driver.license_number == payload.license_number)):
        raise ConflictException("A driver with this license number already exists")
    driver = driver_crud.create(db, payload.model_dump())
    return ok(driver, "Driver created successfully.")


@router.get(
    "/{driver_id}",
    response_model=SuccessResponse[DriverRead],
    dependencies=[Depends(require_permissions("drivers:read"))],
)
def get_driver(driver_id: int, db: DbSession):
    return ok(driver_crud.get_or_404(db, driver_id), "Driver retrieved successfully.")


@router.patch(
    "/{driver_id}",
    response_model=SuccessResponse[DriverRead],
    dependencies=[Depends(require_permissions("drivers:write"))],
)
def update_driver(driver_id: int, payload: DriverUpdate, db: DbSession):
    driver = driver_crud.get_or_404(db, driver_id)
    updated = driver_crud.update(db, driver, payload.model_dump(exclude_unset=True))
    return ok(updated, "Driver updated successfully.")


@router.delete(
    "/{driver_id}",
    response_model=SuccessResponse[None],
    dependencies=[Depends(require_permissions("drivers:write"))],
)
def delete_driver(driver_id: int, db: DbSession):
    driver = driver_crud.get_or_404(db, driver_id)
    driver_crud.delete(db, driver)
    return ok(None, "Driver deleted successfully.")
