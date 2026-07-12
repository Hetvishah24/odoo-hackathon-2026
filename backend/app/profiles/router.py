"""Step-2 registration profile endpoints for roles with no dedicated entity in the spec.

Driver has its own module (app/drivers) because the spec gives it a full entity
(license number, category, expiry, safety score, status). Fleet Manager, Safety
Officer, and Financial Analyst have no such entity (§6 Expected Database Entities
lists only Users, Roles, Vehicles, Drivers, Trips, Maintenance Logs, Fuel Logs,
Expenses) so their step-2 details live on the User row itself.
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import CurrentUser
from app.core.exceptions import ForbiddenException
from app.core.responses import SuccessResponse, ok
from app.db.seed import FINANCIAL_ANALYST_ROLE, FLEET_MANAGER_ROLE, SAFETY_OFFICER_ROLE
from app.db.session import get_db
from app.profiles.schemas import ProfileUpdate
from app.users.models import User
from app.users.schemas import UserRead

DbSession = Annotated[Session, Depends(get_db)]


def _build_profile_router(role_name: str, role_label: str) -> APIRouter:
    router = APIRouter()

    def _require_role(current_user: User) -> None:
        if current_user.role is None or current_user.role.name != role_name:
            raise ForbiddenException(f"Only users registered as {role_label} can access this profile")

    @router.get("/me", response_model=SuccessResponse[UserRead])
    def read_profile(current_user: CurrentUser):
        _require_role(current_user)
        return ok(current_user, "Profile retrieved successfully.")

    @router.post("/me", response_model=SuccessResponse[UserRead])
    def complete_profile(payload: ProfileUpdate, current_user: CurrentUser, db: DbSession):
        _require_role(current_user)
        if payload.contact_number is not None:
            current_user.contact_number = payload.contact_number
        if payload.region is not None:
            current_user.region = payload.region
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        return ok(current_user, "Profile completed successfully.")

    return router


fleet_manager_router = _build_profile_router(FLEET_MANAGER_ROLE, "a fleet manager")
safety_officer_router = _build_profile_router(SAFETY_OFFICER_ROLE, "a safety officer")
financial_analyst_router = _build_profile_router(FINANCIAL_ANALYST_ROLE, "a financial analyst")
