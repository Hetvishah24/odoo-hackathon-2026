"""Section builders for GET /dashboard.

fleet_overview/vehicle lookups use the Vehicle ORM (our own table). trips/drivers are
Dev B's tables - queried via raw SQL, same cross-team convention Dev B's own trips/reports
modules already use for `vehicles`/`maintenance_logs`. financial_overview specifically
calls into app.reports.service (Dev B's module) rather than re-deriving the ROI/cost
formulas, per the dashboard doc's instruction to avoid drifting from the Reports page.
"""

import datetime

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.reports import service as reports_service
from app.users.models import User
from app.vehicles.models import Vehicle, VehicleStatus

# No real-time GPS/tracking exists in this app, so ETA can't be authentically computed.
# This is a rough placeholder estimate from planned_distance for dispatched trips only -
# not a claim of real ETA accuracy.
ASSUMED_AVG_SPEED_KMPH = 40
RECENT_TRIPS_LIMIT = 10
LICENSE_ALERT_WINDOW_DAYS = 30


def _eta_minutes(planned_distance: float | None, status: str) -> int | None:
    if status != "dispatched" or not planned_distance:
        return None
    return round(planned_distance / ASSUMED_AVG_SPEED_KMPH * 60)


def build_fleet_overview(db: Session) -> dict:
    rows = db.execute(select(Vehicle.status, func.count()).group_by(Vehicle.status)).all()
    counts = {status.value: count for status, count in rows}

    available = counts.get(VehicleStatus.available.value, 0)
    on_trip = counts.get(VehicleStatus.on_trip.value, 0)
    in_shop = counts.get(VehicleStatus.in_shop.value, 0)
    retired = counts.get(VehicleStatus.retired.value, 0)
    denominator = available + on_trip

    return {
        "active_vehicles": available + on_trip + in_shop,
        "available_vehicles": available,
        "vehicles_in_maintenance": in_shop,
        "retired_vehicles": retired,
        "fleet_utilization_pct": round((on_trip / denominator) * 100, 2) if denominator else 0.0,
        "vehicle_status_breakdown": {
            "available": available,
            "on_trip": on_trip,
            "in_shop": in_shop,
            "retired": retired,
        },
    }


def build_trip_overview(db: Session) -> dict:
    active_trips = db.execute(text("SELECT COUNT(*) FROM trips WHERE status = 'dispatched'")).scalar() or 0
    pending_trips = db.execute(text("SELECT COUNT(*) FROM trips WHERE status = 'draft'")).scalar() or 0

    rows = db.execute(
        text(
            """
            SELECT t.id, t.status, t.planned_distance, v.registration_number, d.name AS driver_name
            FROM trips t
            JOIN vehicles v ON v.id = t.vehicle_id
            JOIN drivers d ON d.id = t.driver_id
            ORDER BY t.created_at DESC
            LIMIT :limit
            """
        ),
        {"limit": RECENT_TRIPS_LIMIT},
    ).mappings().all()

    recent_trips = [
        {
            "id": r["id"],
            "trip_number": f"TR-{r['id']:03d}",
            "vehicle": r["registration_number"],
            "driver": r["driver_name"],
            "status": r["status"],
            "eta_minutes": _eta_minutes(r["planned_distance"], r["status"]),
        }
        for r in rows
    ]

    return {
        "active_trips": active_trips,
        "pending_trips": pending_trips,
        "recent_trips": recent_trips,
    }


def build_driver_overview(db: Session) -> dict:
    rows = db.execute(text("SELECT status, COUNT(*) AS count FROM drivers GROUP BY status")).mappings().all()
    counts = {r["status"]: r["count"] for r in rows}
    available = counts.get("available", 0)
    on_trip = counts.get("on_trip", 0)
    suspended = counts.get("suspended", 0)

    today = datetime.date.today()
    horizon = today + datetime.timedelta(days=LICENSE_ALERT_WINDOW_DAYS)
    expiring_soon = db.execute(
        text("SELECT COUNT(*) FROM drivers WHERE license_expiry_date BETWEEN :today AND :horizon"),
        {"today": today, "horizon": horizon},
    ).scalar() or 0

    return {
        "drivers_on_duty": available + on_trip,
        "drivers_available": available,
        "drivers_suspended": suspended,
        "licenses_expiring_soon": expiring_soon,
    }


def build_safety_overview(db: Session) -> dict:
    average_safety_score = db.execute(text("SELECT AVG(safety_score) FROM drivers")).scalar()

    today = datetime.date.today()
    horizon = today + datetime.timedelta(days=LICENSE_ALERT_WINDOW_DAYS)
    rows = db.execute(
        text(
            """
            SELECT id AS driver_id, name, license_expiry_date
            FROM drivers
            WHERE license_expiry_date BETWEEN :today AND :horizon
            ORDER BY license_expiry_date ASC
            """
        ),
        {"today": today, "horizon": horizon},
    ).mappings().all()

    license_alerts = [
        {
            "driver_id": r["driver_id"],
            "name": r["name"],
            "license_expiry_date": r["license_expiry_date"].isoformat(),
            "days_remaining": (r["license_expiry_date"] - today).days,
        }
        for r in rows
    ]

    return {
        "average_safety_score": round(float(average_safety_score), 2) if average_safety_score is not None else 0.0,
        "license_alerts": license_alerts,
    }


def build_financial_overview(db: Session) -> dict:
    cost_rows = reports_service.operational_cost(db, vehicle_id=None, date_from=None, date_to=None)
    roi_rows = reports_service.vehicle_roi(db, vehicle_id=None)

    total_fuel_cost = sum(r["fuel_cost"] for r in cost_rows)
    total_maintenance_cost = sum(r["maintenance_cost"] for r in cost_rows)
    total_operational_cost = total_fuel_cost + total_maintenance_cost

    roi_values = [r["roi"] * 100 for r in roi_rows if r["roi"] is not None]
    average_roi_pct = round(sum(roi_values) / len(roi_values), 2) if roi_values else 0.0

    vehicle_ids = [r["vehicle_id"] for r in cost_rows]
    registration_by_id = {}
    if vehicle_ids:
        vehicles = db.execute(
            select(Vehicle.id, Vehicle.registration_number).where(Vehicle.id.in_(vehicle_ids))
        ).all()
        registration_by_id = {vid: reg for vid, reg in vehicles}

    cost_breakdown = [
        {
            "vehicle_id": r["vehicle_id"],
            "registration_number": registration_by_id.get(r["vehicle_id"]),
            "fuel_cost": r["fuel_cost"],
            "maintenance_cost": r["maintenance_cost"],
        }
        for r in cost_rows
    ]

    return {
        "total_operational_cost": total_operational_cost,
        "total_fuel_cost": total_fuel_cost,
        "total_maintenance_cost": total_maintenance_cost,
        "average_roi_pct": average_roi_pct,
        "cost_breakdown": cost_breakdown,
    }


def build_my_dashboard(db: Session, current_user: User) -> dict | None:
    driver = db.execute(
        text("SELECT id, name, safety_score FROM drivers WHERE user_id = :user_id"),
        {"user_id": current_user.id},
    ).mappings().first()
    if driver is None:
        return None

    driver_id = driver["id"]

    active = db.execute(
        text(
            """
            SELECT t.id, t.source, t.destination, t.status, t.planned_distance,
                   v.registration_number, v.status AS vehicle_status
            FROM trips t
            JOIN vehicles v ON v.id = t.vehicle_id
            WHERE t.driver_id = :driver_id AND t.status = 'dispatched'
            ORDER BY t.created_at DESC
            LIMIT 1
            """
        ),
        {"driver_id": driver_id},
    ).mappings().first()

    my_vehicle = None
    my_active_trip = None
    if active is not None:
        my_vehicle = {"registration_number": active["registration_number"], "status": active["vehicle_status"]}
        my_active_trip = {
            "trip_number": f"TR-{active['id']:03d}",
            "source": active["source"],
            "destination": active["destination"],
            "status": active["status"],
            "eta_minutes": _eta_minutes(active["planned_distance"], active["status"]),
        }

    upcoming_rows = db.execute(
        text(
            """
            SELECT id, source, destination, status
            FROM trips
            WHERE driver_id = :driver_id AND status = 'draft'
            ORDER BY created_at ASC
            LIMIT 5
            """
        ),
        {"driver_id": driver_id},
    ).mappings().all()
    my_upcoming_trips = [
        {
            "trip_number": f"TR-{r['id']:03d}",
            "source": r["source"],
            "destination": r["destination"],
            "status": r["status"],
        }
        for r in upcoming_rows
    ]

    completed_count = db.execute(
        text("SELECT COUNT(*) FROM trips WHERE driver_id = :driver_id AND status = 'completed'"),
        {"driver_id": driver_id},
    ).scalar() or 0

    return {
        "my_vehicle": my_vehicle,
        "my_active_trip": my_active_trip,
        "my_upcoming_trips": my_upcoming_trips,
        "my_completed_trips_count": completed_count,
        "my_safety_score": driver["safety_score"],
    }
