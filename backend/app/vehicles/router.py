from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.crud import CRUDBase
from app.core.deps import require_permissions
from app.core.exceptions import ConflictException
from app.core.pagination import Page, PageParams
from app.core.responses import SuccessResponse, ok
from app.db.session import get_db
from app.vehicles.models import Vehicle, VehicleStatus, VehicleType
from app.vehicles.schemas import VehicleCreate, VehicleRead, VehicleUpdate

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]

vehicle_crud = CRUDBase(Vehicle, search_fields=["registration_number", "name_model"])


# Static sub-path must be registered before "/{vehicle_id}" below, otherwise FastAPI
# would try to parse "dispatchable" as an id.
@router.get(
    "/dispatchable",
    response_model=SuccessResponse[list[VehicleRead]],
    dependencies=[Depends(require_permissions("vehicles:read"))],
)
def list_dispatchable_vehicles(db: DbSession):
    stmt = select(Vehicle).where(Vehicle.status == VehicleStatus.available)
    vehicles = list(db.scalars(stmt).all())
    return ok(vehicles, "Dispatchable vehicles retrieved successfully.")


@router.get(
    "",
    response_model=SuccessResponse[Page[VehicleRead]],
    dependencies=[Depends(require_permissions("vehicles:read"))],
)
def list_vehicles(
    db: DbSession,
    params: Annotated[PageParams, Depends()],
    status_: Annotated[VehicleStatus | None, Query(alias="status")] = None,
    type_: Annotated[VehicleType | None, Query(alias="type")] = None,
    region: Annotated[str | None, Query()] = None,
):
    items, total = vehicle_crud.list(
        db, params=params, filters={"status": status_, "type": type_, "region": region}
    )
    return ok(Page[VehicleRead].create(items, total, params), "Vehicles retrieved successfully.")


@router.post(
    "",
    response_model=SuccessResponse[VehicleRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions("vehicles:write"))],
)
def create_vehicle(payload: VehicleCreate, db: DbSession):
    if db.scalar(select(Vehicle).where(Vehicle.registration_number == payload.registration_number)):
        raise ConflictException("A vehicle with this registration number already exists")
    vehicle = vehicle_crud.create(db, payload.model_dump())
    return ok(vehicle, "Vehicle created successfully.")


@router.get(
    "/{vehicle_id}",
    response_model=SuccessResponse[VehicleRead],
    dependencies=[Depends(require_permissions("vehicles:read"))],
)
def get_vehicle(vehicle_id: int, db: DbSession):
    return ok(vehicle_crud.get_or_404(db, vehicle_id), "Vehicle retrieved successfully.")


@router.patch(
    "/{vehicle_id}",
    response_model=SuccessResponse[VehicleRead],
    dependencies=[Depends(require_permissions("vehicles:write"))],
)
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, db: DbSession):
    vehicle = vehicle_crud.get_or_404(db, vehicle_id)
    updated = vehicle_crud.update(db, vehicle, payload.model_dump(exclude_unset=True))
    return ok(updated, "Vehicle updated successfully.")


@router.delete(
    "/{vehicle_id}",
    response_model=SuccessResponse[VehicleRead],
    dependencies=[Depends(require_permissions("vehicles:write"))],
)
def retire_vehicle(vehicle_id: int, db: DbSession):
    """Soft delete: sets status=retired. Vehicles are never hard-deleted since
    trips/fuel_logs/expenses/maintenance_logs hold FKs to their history."""
    vehicle = vehicle_crud.get_or_404(db, vehicle_id)
    updated = vehicle_crud.update(db, vehicle, {"status": VehicleStatus.retired})
    return ok(updated, "Vehicle retired successfully.")
