from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.core.crud import CRUDBase
from app.core.deps import CurrentUser, require_permissions
from app.core.exceptions import ConflictException
from app.core.pagination import Page, PageParams
from app.core.responses import SuccessResponse, ok
from app.db.session import get_db
from app.trips import service
from app.trips.models import Trip, TripStatus
from app.trips.schemas import TripComplete, TripCreate, TripRead, TripUpdate

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]

trip_crud = CRUDBase(Trip, search_fields=["source", "destination"])


@router.get(
    "",
    response_model=SuccessResponse[Page[TripRead]],
    dependencies=[Depends(require_permissions("trips:read"))],
)
def list_trips(
    db: DbSession,
    params: Annotated[PageParams, Depends()],
    status_: Annotated[TripStatus | None, Query(alias="status")] = None,
    vehicle_id: Annotated[int | None, Query()] = None,
    driver_id: Annotated[int | None, Query()] = None,
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
):
    stmt = select(Trip)
    if status_ is not None:
        stmt = stmt.where(Trip.status == status_)
    if vehicle_id is not None:
        stmt = stmt.where(Trip.vehicle_id == vehicle_id)
    if driver_id is not None:
        stmt = stmt.where(Trip.driver_id == driver_id)
    if date_from is not None:
        stmt = stmt.where(func.date(Trip.created_at) >= date_from)
    if date_to is not None:
        stmt = stmt.where(func.date(Trip.created_at) <= date_to)
    if params.search:
        pattern = f"%{params.search}%"
        stmt = stmt.where(or_(Trip.source.ilike(pattern), Trip.destination.ilike(pattern)))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    sort_column = getattr(Trip, params.sort_by, None) if params.sort_by else None
    if sort_column is not None:
        stmt = stmt.order_by(desc(sort_column) if params.sort_order == "desc" else asc(sort_column))
    else:
        stmt = stmt.order_by(Trip.id)

    stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
    items = list(db.scalars(stmt).all())
    return ok(Page[TripRead].create(items, total, params), "Trips retrieved successfully.")


@router.post(
    "",
    response_model=SuccessResponse[TripRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions("trips:write"))],
)
def create_trip(payload: TripCreate, db: DbSession, current_user: CurrentUser):
    service.validate_trip_create(db, payload.vehicle_id, payload.driver_id, payload.cargo_weight)
    trip = trip_crud.create(db, {**payload.model_dump(), "created_by": current_user.id})
    return ok(trip, "Trip created successfully.")


@router.get(
    "/{trip_id}",
    response_model=SuccessResponse[TripRead],
    dependencies=[Depends(require_permissions("trips:read"))],
)
def get_trip(trip_id: int, db: DbSession):
    return ok(trip_crud.get_or_404(db, trip_id), "Trip retrieved successfully.")


@router.patch(
    "/{trip_id}",
    response_model=SuccessResponse[TripRead],
    dependencies=[Depends(require_permissions("trips:write"))],
)
def update_trip(trip_id: int, payload: TripUpdate, db: DbSession):
    trip = trip_crud.get_or_404(db, trip_id)
    if trip.status != TripStatus.draft:
        raise ConflictException("Only draft trips can be edited")

    data = payload.model_dump(exclude_unset=True)
    if "vehicle_id" in data or "cargo_weight" in data:
        service.validate_trip_create(
            db,
            data.get("vehicle_id", trip.vehicle_id),
            data.get("driver_id", trip.driver_id),
            data.get("cargo_weight", trip.cargo_weight),
        )
    updated = trip_crud.update(db, trip, data)
    return ok(updated, "Trip updated successfully.")


@router.post(
    "/{trip_id}/dispatch",
    response_model=SuccessResponse[TripRead],
    dependencies=[Depends(require_permissions("trips:write"))],
)
def dispatch_trip(trip_id: int, db: DbSession):
    trip = trip_crud.get_or_404(db, trip_id)
    updated = service.dispatch_trip(db, trip)
    return ok(updated, "Trip dispatched successfully.")


@router.post(
    "/{trip_id}/complete",
    response_model=SuccessResponse[TripRead],
    dependencies=[Depends(require_permissions("trips:write"))],
)
def complete_trip(trip_id: int, payload: TripComplete, db: DbSession):
    trip = trip_crud.get_or_404(db, trip_id)
    updated = service.complete_trip(db, trip, payload.end_odometer, payload.fuel_consumed, payload.actual_distance)
    return ok(updated, "Trip completed successfully.")


@router.post(
    "/{trip_id}/cancel",
    response_model=SuccessResponse[TripRead],
    dependencies=[Depends(require_permissions("trips:write"))],
)
def cancel_trip(trip_id: int, db: DbSession):
    trip = trip_crud.get_or_404(db, trip_id)
    updated = service.cancel_trip(db, trip)
    return ok(updated, "Trip cancelled successfully.")
