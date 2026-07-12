from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.crud import CRUDBase
from app.core.deps import CurrentUser, require_permissions
from app.core.pagination import Page, PageParams
from app.core.responses import SuccessResponse, ok
from app.db.session import get_db
from app.maintenance import service
from app.maintenance.models import MaintenanceLog, MaintenanceStatus
from app.maintenance.schemas import MaintenanceCreate, MaintenanceRead, MaintenanceUpdate
from app.vehicles.models import Vehicle

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]

maintenance_crud = CRUDBase(MaintenanceLog)
vehicle_crud = CRUDBase(Vehicle)


@router.get(
    "",
    response_model=SuccessResponse[Page[MaintenanceRead]],
    dependencies=[Depends(require_permissions("maintenance:read"))],
)
def list_maintenance(
    db: DbSession,
    params: Annotated[PageParams, Depends()],
    status_: Annotated[MaintenanceStatus | None, Query(alias="status")] = None,
    vehicle_id: Annotated[int | None, Query()] = None,
):
    items, total = maintenance_crud.list(
        db, params=params, filters={"status": status_, "vehicle_id": vehicle_id}
    )
    return ok(Page[MaintenanceRead].create(items, total, params), "Maintenance logs retrieved successfully.")


@router.post(
    "",
    response_model=SuccessResponse[MaintenanceRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions("maintenance:write"))],
)
def open_maintenance(payload: MaintenanceCreate, db: DbSession, current_user: CurrentUser):
    vehicle = vehicle_crud.get_or_404(db, payload.vehicle_id)
    log = service.open_maintenance(
        db, vehicle, payload.description, payload.cost, payload.opened_at, current_user.id
    )
    return ok(log, "Maintenance opened successfully.")


@router.post(
    "/{maintenance_id}/close",
    response_model=SuccessResponse[MaintenanceRead],
    dependencies=[Depends(require_permissions("maintenance:write"))],
)
def close_maintenance(maintenance_id: int, db: DbSession):
    log = maintenance_crud.get_or_404(db, maintenance_id)
    vehicle = vehicle_crud.get_or_404(db, log.vehicle_id)
    updated = service.close_maintenance(db, log, vehicle)
    return ok(updated, "Maintenance closed successfully.")


@router.patch(
    "/{maintenance_id}",
    response_model=SuccessResponse[MaintenanceRead],
    dependencies=[Depends(require_permissions("maintenance:write"))],
)
def update_maintenance(maintenance_id: int, payload: MaintenanceUpdate, db: DbSession):
    log = maintenance_crud.get_or_404(db, maintenance_id)
    updated = maintenance_crud.update(db, log, payload.model_dump(exclude_unset=True))
    return ok(updated, "Maintenance log updated successfully.")
