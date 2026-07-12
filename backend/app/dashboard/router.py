from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import CurrentUser, has_permission
from app.core.responses import SuccessResponse, ok
from app.dashboard import service
from app.db.session import get_db

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=SuccessResponse[dict])
def get_dashboard(current_user: CurrentUser, db: DbSession):
    sections: dict = {}

    granted = set(current_user.role.permissions) if current_user.role else set()
    is_super = "*" in granted
    # Pending accounts get an empty dashboard rather than a hard 403, since this is the
    # first thing hit right after login - the "*" bypass matches require_permissions().
    if is_super or current_user.is_approved:
        if has_permission(current_user, "dashboard:fleet"):
            sections["fleet_overview"] = service.build_fleet_overview(db)

        if has_permission(current_user, "dashboard:trips"):
            sections["trip_overview"] = service.build_trip_overview(db)

        if has_permission(current_user, "dashboard:drivers"):
            sections["driver_overview"] = service.build_driver_overview(db)

        if has_permission(current_user, "dashboard:safety"):
            sections["safety_overview"] = service.build_safety_overview(db)

        if has_permission(current_user, "dashboard:financial"):
            sections["financial_overview"] = service.build_financial_overview(db)

        if has_permission(current_user, "dashboard:mytrips"):
            sections["my_dashboard"] = service.build_my_dashboard(db, current_user)

    return ok(
        {
            "role": current_user.role.name if current_user.role else None,
            "user": {"id": current_user.id, "full_name": current_user.full_name},
            "sections": sections,
        },
        "Dashboard retrieved successfully.",
    )
