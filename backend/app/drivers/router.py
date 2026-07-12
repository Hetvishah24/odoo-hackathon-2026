from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.crud import CRUDBase
from app.core.deps import require_permissions
from app.core.pagination import Page, PageParams
from app.core.responses import SuccessResponse, ok
from app.db.session import get_db
from app.drivers.models import Driver, DriverStatus
from app.drivers.schemas import DriverRead, DriverUpdate

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]

driver_crud = CRUDBase(Driver, search_fields=["name", "license_number"])


# Static sub-paths must be registered before the "/{driver_id}" route below,
# otherwise FastAPI would try to parse "dispatchable"/"expiring-licenses" as an id.
# Self-service profile completion lives at POST/GET /users/me/profile instead of
# here — one dynamic endpoint handles step-2 registration for every role.
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
