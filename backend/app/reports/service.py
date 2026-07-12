"""Aggregate reports over trips/fuel_logs (ours) and vehicles/maintenance_logs (Dev A's).

Cross-team tables are queried via raw SQL rather than importing Dev A's ORM classes (same
reasoning as app/trips/service.py). `maintenance_logs` with a `cost`/`vehicle_id`/`opened_at`
column is Dev A's assumed table name per their POST /maintenance body `{vehicle_id, description,
cost, opened_at}` - confirm against their actual model at the integration checkpoint.
"""

import csv
import io
from datetime import date

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException


def fuel_efficiency(
    db: Session, vehicle_id: int | None, date_from: date | None, date_to: date | None
) -> list[dict]:
    trip_filters = ["status = 'completed'"]
    trip_params: dict = {}
    if vehicle_id is not None:
        trip_filters.append("vehicle_id = :vehicle_id")
        trip_params["vehicle_id"] = vehicle_id
    if date_from is not None:
        trip_filters.append("created_at >= :date_from")
        trip_params["date_from"] = date_from
    if date_to is not None:
        trip_filters.append("created_at <= :date_to")
        trip_params["date_to"] = date_to

    distance_rows = db.execute(
        text(f"SELECT vehicle_id, SUM(actual_distance) AS distance FROM trips WHERE {' AND '.join(trip_filters)} GROUP BY vehicle_id"),
        trip_params,
    ).mappings().all()

    fuel_filters = []
    fuel_params: dict = {}
    if vehicle_id is not None:
        fuel_filters.append("vehicle_id = :vehicle_id")
        fuel_params["vehicle_id"] = vehicle_id
    if date_from is not None:
        fuel_filters.append("date >= :date_from")
        fuel_params["date_from"] = date_from
    if date_to is not None:
        fuel_filters.append("date <= :date_to")
        fuel_params["date_to"] = date_to
    fuel_where = f"WHERE {' AND '.join(fuel_filters)}" if fuel_filters else ""

    fuel_rows = db.execute(
        text(f"SELECT vehicle_id, SUM(liters) AS liters FROM fuel_logs {fuel_where} GROUP BY vehicle_id"),
        fuel_params,
    ).mappings().all()

    distance_by_vehicle = {r["vehicle_id"]: float(r["distance"] or 0) for r in distance_rows}
    liters_by_vehicle = {r["vehicle_id"]: float(r["liters"] or 0) for r in fuel_rows}
    vehicle_ids = set(distance_by_vehicle) | set(liters_by_vehicle)

    return [
        {
            "vehicle_id": vid,
            "total_distance": distance_by_vehicle.get(vid, 0.0),
            "total_liters": liters_by_vehicle.get(vid, 0.0),
            "fuel_efficiency_km_per_l": round(distance_by_vehicle.get(vid, 0.0) / liters_by_vehicle[vid], 2)
            if liters_by_vehicle.get(vid)
            else None,
        }
        for vid in sorted(vehicle_ids)
    ]


def operational_cost(
    db: Session, vehicle_id: int | None, date_from: date | None, date_to: date | None
) -> list[dict]:
    fuel_filters = []
    fuel_params: dict = {}
    if vehicle_id is not None:
        fuel_filters.append("vehicle_id = :vehicle_id")
        fuel_params["vehicle_id"] = vehicle_id
    if date_from is not None:
        fuel_filters.append("date >= :date_from")
        fuel_params["date_from"] = date_from
    if date_to is not None:
        fuel_filters.append("date <= :date_to")
        fuel_params["date_to"] = date_to
    fuel_where = f"WHERE {' AND '.join(fuel_filters)}" if fuel_filters else ""

    fuel_rows = db.execute(
        text(f"SELECT vehicle_id, SUM(cost) AS cost FROM fuel_logs {fuel_where} GROUP BY vehicle_id"), fuel_params
    ).mappings().all()

    maint_filters = []
    maint_params: dict = {}
    if vehicle_id is not None:
        maint_filters.append("vehicle_id = :vehicle_id")
        maint_params["vehicle_id"] = vehicle_id
    if date_from is not None:
        maint_filters.append("opened_at >= :date_from")
        maint_params["date_from"] = date_from
    if date_to is not None:
        maint_filters.append("opened_at <= :date_to")
        maint_params["date_to"] = date_to
    maint_where = f"WHERE {' AND '.join(maint_filters)}" if maint_filters else ""

    maint_rows = db.execute(
        text(f"SELECT vehicle_id, SUM(cost) AS cost FROM maintenance_logs {maint_where} GROUP BY vehicle_id"),
        maint_params,
    ).mappings().all()

    fuel_cost = {r["vehicle_id"]: float(r["cost"] or 0) for r in fuel_rows}
    maint_cost = {r["vehicle_id"]: float(r["cost"] or 0) for r in maint_rows}
    vehicle_ids = set(fuel_cost) | set(maint_cost)

    return [
        {
            "vehicle_id": vid,
            "fuel_cost": fuel_cost.get(vid, 0.0),
            "maintenance_cost": maint_cost.get(vid, 0.0),
            "total_operational_cost": fuel_cost.get(vid, 0.0) + maint_cost.get(vid, 0.0),
        }
        for vid in sorted(vehicle_ids)
    ]


def vehicle_roi(db: Session, vehicle_id: int | None) -> list[dict]:
    if vehicle_id is not None:
        vehicle_rows = db.execute(
            text("SELECT id, acquisition_cost, revenue_per_km FROM vehicles WHERE id = :id"),
            {"id": vehicle_id},
        ).mappings().all()
        if not vehicle_rows:
            raise NotFoundException("Vehicle not found")
    else:
        vehicle_rows = db.execute(
            text("SELECT id, acquisition_cost, revenue_per_km FROM vehicles WHERE status != 'retired'")
        ).mappings().all()

    results = []
    for v in vehicle_rows:
        vid = v["id"]
        distance = float(
            db.execute(
                text("SELECT COALESCE(SUM(actual_distance), 0) FROM trips WHERE vehicle_id = :id AND status = 'completed'"),
                {"id": vid},
            ).scalar()
            or 0
        )
        revenue = distance * float(v["revenue_per_km"] or 0)
        fuel_cost = float(
            db.execute(text("SELECT COALESCE(SUM(cost), 0) FROM fuel_logs WHERE vehicle_id = :id"), {"id": vid}).scalar()
            or 0
        )
        maintenance_cost = float(
            db.execute(
                text("SELECT COALESCE(SUM(cost), 0) FROM maintenance_logs WHERE vehicle_id = :id"), {"id": vid}
            ).scalar()
            or 0
        )
        acquisition_cost = float(v["acquisition_cost"] or 0)
        roi = (revenue - (maintenance_cost + fuel_cost)) / acquisition_cost if acquisition_cost else None

        results.append(
            {
                "vehicle_id": vid,
                "revenue": revenue,
                "fuel_cost": fuel_cost,
                "maintenance_cost": maintenance_cost,
                "acquisition_cost": acquisition_cost,
                "roi": round(roi, 4) if roi is not None else None,
            }
        )
    return results


def fleet_utilization(db: Session, region: str | None, date_from: date | None, date_to: date | None) -> dict:
    conditions = ["status != 'retired'"]
    params: dict = {}
    if region is not None:
        conditions.append("region = :region")
        params["region"] = region
    where = " AND ".join(conditions)

    counts = db.execute(
        text(f"SELECT status, COUNT(*) AS count FROM vehicles WHERE {where} GROUP BY status"), params
    ).mappings().all()
    counts_by_status = {r["status"]: r["count"] for r in counts}
    available = counts_by_status.get("available", 0)
    on_trip = counts_by_status.get("on_trip", 0)
    in_shop = counts_by_status.get("in_shop", 0)
    denominator = available + on_trip
    utilization_pct = round((on_trip / denominator) * 100, 2) if denominator else 0.0

    trip_filters = ["t.status = 'completed'"]
    trip_params: dict = dict(params)
    if region is not None:
        trip_filters.append("v.region = :region")
    if date_from is not None:
        trip_filters.append("t.created_at >= :date_from")
        trip_params["date_from"] = date_from
    if date_to is not None:
        trip_filters.append("t.created_at <= :date_to")
        trip_params["date_to"] = date_to

    trip_stats = db.execute(
        text(
            f"""
            SELECT t.vehicle_id, COUNT(*) AS trip_count, COALESCE(SUM(t.actual_distance), 0) AS total_distance
            FROM trips t
            JOIN vehicles v ON v.id = t.vehicle_id
            WHERE {' AND '.join(trip_filters)}
            GROUP BY t.vehicle_id
            """
        ),
        trip_params,
    ).mappings().all()

    return {
        "available_vehicles": available,
        "on_trip_vehicles": on_trip,
        "in_shop_vehicles": in_shop,
        "fleet_utilization_pct": utilization_pct,
        "per_vehicle": [
            {
                "vehicle_id": r["vehicle_id"],
                "trip_count": r["trip_count"],
                "total_distance": float(r["total_distance"]),
            }
            for r in trip_stats
        ],
    }


def to_csv(rows: list[dict]) -> str:
    if not rows:
        return ""
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()
