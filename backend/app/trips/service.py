"""Trip business logic: dispatch/complete/cancel status transitions.

Vehicles live in Dev A's `app/vehicles` module, which this app may not have merged in yet.
Per the team's migration/coupling discipline, vehicle rows are read and updated here via
raw SQL against the `vehicles` table rather than importing Dev A's ORM class - this keeps
the trips module runnable regardless of merge order, as long as the table exists by the
time a combined migration has run.
"""

from datetime import date

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, NotFoundException, ValidationException
from app.drivers.models import Driver, DriverStatus
from app.fuel.models import FuelLog
from app.trips.models import Trip, TripStatus

VEHICLE_AVAILABLE = "available"
VEHICLE_ON_TRIP = "on_trip"


def _get_vehicle_row(db: Session, vehicle_id: int, for_update: bool = False) -> dict:
    query = "SELECT id, status, max_load_capacity, odometer FROM vehicles WHERE id = :id"
    if for_update:
        query += " FOR UPDATE"
    row = db.execute(text(query), {"id": vehicle_id}).mappings().first()
    if row is None:
        raise NotFoundException("Vehicle not found")
    return dict(row)


def _set_vehicle_status(db: Session, vehicle_id: int, status: str, odometer: float | None = None) -> None:
    if odometer is not None:
        db.execute(
            text("UPDATE vehicles SET status = :status, odometer = :odometer, updated_at = now() WHERE id = :id"),
            {"status": status, "odometer": odometer, "id": vehicle_id},
        )
    else:
        db.execute(
            text("UPDATE vehicles SET status = :status, updated_at = now() WHERE id = :id"),
            {"status": status, "id": vehicle_id},
        )


def _get_driver_or_404(db: Session, driver_id: int, for_update: bool = False) -> Driver:
    driver = db.get(Driver, driver_id, with_for_update=for_update)
    if driver is None:
        raise NotFoundException("Driver not found")
    return driver


def validate_trip_create(db: Session, vehicle_id: int, driver_id: int, cargo_weight: float) -> None:
    vehicle = _get_vehicle_row(db, vehicle_id)
    if cargo_weight > vehicle["max_load_capacity"]:
        raise ValidationException("Cargo weight exceeds vehicle's maximum load capacity")
    _get_driver_or_404(db, driver_id)


def dispatch_trip(db: Session, trip: Trip) -> Trip:
    if trip.status != TripStatus.draft:
        raise ConflictException("Only draft trips can be dispatched")

    # Lock both rows and re-check availability inside this transaction to avoid double-booking.
    vehicle = _get_vehicle_row(db, trip.vehicle_id, for_update=True)
    if vehicle["status"] != VEHICLE_AVAILABLE:
        raise ConflictException("Vehicle is not available for dispatch")

    driver = _get_driver_or_404(db, trip.driver_id, for_update=True)
    if driver.status != DriverStatus.available:
        raise ConflictException("Driver is not available for dispatch")
    if driver.license_expiry_date < date.today():
        raise ConflictException("Driver's license has expired")

    _set_vehicle_status(db, trip.vehicle_id, VEHICLE_ON_TRIP)
    driver.status = DriverStatus.on_trip

    trip.status = TripStatus.dispatched
    trip.start_odometer = vehicle["odometer"]

    db.commit()
    db.refresh(trip)
    return trip


def complete_trip(
    db: Session, trip: Trip, end_odometer: float, fuel_consumed: float, actual_distance: float
) -> Trip:
    if trip.status != TripStatus.dispatched:
        raise ConflictException("Only dispatched trips can be completed")

    trip.end_odometer = end_odometer
    trip.fuel_consumed = fuel_consumed
    trip.actual_distance = actual_distance
    trip.status = TripStatus.completed

    _set_vehicle_status(db, trip.vehicle_id, VEHICLE_AVAILABLE, odometer=end_odometer)

    driver = _get_driver_or_404(db, trip.driver_id)
    driver.status = DriverStatus.available

    if fuel_consumed > 0:
        # Cost isn't captured at trip-completion time; financial_analyst/fleet_manager can
        # backfill it via PATCH /fuel-logs/{id} once the fuel receipt is available.
        db.add(
            FuelLog(
                vehicle_id=trip.vehicle_id,
                trip_id=trip.id,
                liters=fuel_consumed,
                cost=0.0,
                date=date.today(),
                created_by=trip.created_by,
            )
        )

    db.commit()
    db.refresh(trip)
    return trip


def cancel_trip(db: Session, trip: Trip) -> Trip:
    if trip.status not in (TripStatus.draft, TripStatus.dispatched):
        raise ConflictException("Only draft or dispatched trips can be cancelled")

    if trip.status == TripStatus.dispatched:
        _set_vehicle_status(db, trip.vehicle_id, VEHICLE_AVAILABLE)
        driver = _get_driver_or_404(db, trip.driver_id)
        driver.status = DriverStatus.available

    trip.status = TripStatus.cancelled
    db.commit()
    db.refresh(trip)
    return trip
