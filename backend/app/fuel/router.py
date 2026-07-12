from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import asc, desc, func, select
from sqlalchemy.orm import Session

from app.core.crud import CRUDBase
from app.core.deps import CurrentUser, require_permissions
from app.core.pagination import Page, PageParams
from app.core.responses import SuccessResponse, ok
from app.db.session import get_db
from app.fuel.models import FuelLog
from app.fuel.schemas import FuelLogCreate, FuelLogRead, FuelLogUpdate

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]

fuel_crud = CRUDBase(FuelLog)


@router.get(
    "",
    response_model=SuccessResponse[Page[FuelLogRead]],
    dependencies=[Depends(require_permissions("fuel:read"))],
)
def list_fuel_logs(
    db: DbSession,
    params: Annotated[PageParams, Depends()],
    vehicle_id: Annotated[int | None, Query()] = None,
    trip_id: Annotated[int | None, Query()] = None,
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
):
    stmt = select(FuelLog)
    if vehicle_id is not None:
        stmt = stmt.where(FuelLog.vehicle_id == vehicle_id)
    if trip_id is not None:
        stmt = stmt.where(FuelLog.trip_id == trip_id)
    if date_from is not None:
        stmt = stmt.where(FuelLog.date >= date_from)
    if date_to is not None:
        stmt = stmt.where(FuelLog.date <= date_to)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    sort_column = getattr(FuelLog, params.sort_by, None) if params.sort_by else None
    if sort_column is not None:
        stmt = stmt.order_by(desc(sort_column) if params.sort_order == "desc" else asc(sort_column))
    else:
        stmt = stmt.order_by(FuelLog.id)

    stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
    items = list(db.scalars(stmt).all())
    return ok(Page[FuelLogRead].create(items, total, params), "Fuel logs retrieved successfully.")


@router.post(
    "",
    response_model=SuccessResponse[FuelLogRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions("fuel:write"))],
)
def create_fuel_log(payload: FuelLogCreate, db: DbSession, current_user: CurrentUser):
    log = fuel_crud.create(db, {**payload.model_dump(), "created_by": current_user.id})
    return ok(log, "Fuel log created successfully.")


@router.patch(
    "/{fuel_log_id}",
    response_model=SuccessResponse[FuelLogRead],
    dependencies=[Depends(require_permissions("fuel:write"))],
)
def update_fuel_log(fuel_log_id: int, payload: FuelLogUpdate, db: DbSession):
    log = fuel_crud.get_or_404(db, fuel_log_id)
    updated = fuel_crud.update(db, log, payload.model_dump(exclude_unset=True))
    return ok(updated, "Fuel log updated successfully.")


@router.delete(
    "/{fuel_log_id}",
    response_model=SuccessResponse[None],
    dependencies=[Depends(require_permissions("fuel:write"))],
)
def delete_fuel_log(fuel_log_id: int, db: DbSession):
    log = fuel_crud.get_or_404(db, fuel_log_id)
    fuel_crud.delete(db, log)
    return ok(None, "Fuel log deleted successfully.")
