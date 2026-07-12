"""Vehicle-status side effects for the maintenance open/close workflow."""

import datetime

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException
from app.maintenance.models import MaintenanceLog, MaintenanceStatus
from app.vehicles.models import Vehicle, VehicleStatus


def open_maintenance(db: Session, vehicle: Vehicle, description: str, cost: float, opened_at, created_by: int) -> MaintenanceLog:
    if vehicle.status == VehicleStatus.retired:
        raise ConflictException("Cannot open maintenance on a retired vehicle")

    log = MaintenanceLog(
        vehicle_id=vehicle.id,
        description=description,
        cost=cost,
        opened_at=opened_at,
        status=MaintenanceStatus.open,
        created_by=created_by,
    )
    db.add(log)
    vehicle.status = VehicleStatus.in_shop
    db.commit()
    db.refresh(log)
    return log


def close_maintenance(db: Session, log: MaintenanceLog, vehicle: Vehicle) -> MaintenanceLog:
    if log.status == MaintenanceStatus.closed:
        raise ConflictException("Maintenance log is already closed")

    log.status = MaintenanceStatus.closed
    log.closed_at = datetime.datetime.now(datetime.timezone.utc)

    if vehicle.status != VehicleStatus.retired:
        vehicle.status = VehicleStatus.available

    db.commit()
    db.refresh(log)
    return log
