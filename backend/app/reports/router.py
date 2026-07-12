from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.deps import require_permissions
from app.core.exceptions import BadRequestException
from app.core.responses import SuccessResponse, ok
from app.db.session import get_db
from app.reports import service

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]


@router.get(
    "/fuel-efficiency",
    response_model=SuccessResponse[list[dict]],
    dependencies=[Depends(require_permissions("reports:read"))],
)
def fuel_efficiency_report(
    db: DbSession,
    vehicle_id: Annotated[int | None, Query()] = None,
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
):
    return ok(service.fuel_efficiency(db, vehicle_id, date_from, date_to), "Fuel efficiency report generated.")


@router.get(
    "/fleet-utilization",
    response_model=SuccessResponse[dict],
    dependencies=[Depends(require_permissions("reports:read"))],
)
def fleet_utilization_report(
    db: DbSession,
    region: Annotated[str | None, Query()] = None,
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
):
    return ok(service.fleet_utilization(db, region, date_from, date_to), "Fleet utilization report generated.")


@router.get(
    "/operational-cost",
    response_model=SuccessResponse[list[dict]],
    dependencies=[Depends(require_permissions("reports:read"))],
)
def operational_cost_report(
    db: DbSession,
    vehicle_id: Annotated[int | None, Query()] = None,
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
):
    return ok(service.operational_cost(db, vehicle_id, date_from, date_to), "Operational cost report generated.")


@router.get(
    "/vehicle-roi",
    response_model=SuccessResponse[list[dict]],
    dependencies=[Depends(require_permissions("reports:read"))],
)
def vehicle_roi_report(db: DbSession, vehicle_id: Annotated[int | None, Query()] = None):
    return ok(service.vehicle_roi(db, vehicle_id), "Vehicle ROI report generated.")


@router.get("/export.csv", dependencies=[Depends(require_permissions("reports:read"))])
def export_csv(
    db: DbSession,
    type: Annotated[str, Query()],
    vehicle_id: Annotated[int | None, Query()] = None,
    region: Annotated[str | None, Query()] = None,
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
):
    if type == "fuel-efficiency":
        rows = service.fuel_efficiency(db, vehicle_id, date_from, date_to)
    elif type == "utilization":
        rows = service.fleet_utilization(db, region, date_from, date_to)["per_vehicle"]
    elif type == "cost":
        rows = service.operational_cost(db, vehicle_id, date_from, date_to)
    elif type == "roi":
        rows = service.vehicle_roi(db, vehicle_id)
    else:
        raise BadRequestException("Unknown report type. Use one of: fuel-efficiency, utilization, cost, roi")

    return Response(
        content=service.to_csv(rows),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{type}.csv"'},
    )
