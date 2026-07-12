"""Idempotent demo dataset: one pre-approved login per role + a realistic fleet.

Called from seed_db() on every startup. The 4 demo users are synced every time (cheap,
keeps credentials/role assignment correct if the role matrix changes). The fleet dataset
(vehicles/drivers/trips/fuel/expenses/maintenance/documents) is only generated once - gated
on the `vehicles` table being empty - so restarting the app never piles up duplicates.
"""

import logging
import random
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.seed import (
    DRIVER_ROLE,
    FINANCIAL_ANALYST_ROLE,
    FLEET_MANAGER_ROLE,
    SAFETY_OFFICER_ROLE,
)
from app.drivers.models import Driver, DriverStatus
from app.expenses.models import Expense, ExpenseType
from app.fuel.models import FuelLog
from app.maintenance.models import MaintenanceLog, MaintenanceStatus
from app.roles.models import Role
from app.trips.models import Trip, TripStatus
from app.users.models import User
from app.vehicle_documents.models import VehicleDocument
from app.vehicles.models import Vehicle, VehicleStatus, VehicleType

logger = logging.getLogger(__name__)
random.seed(42)

DEMO_PASSWORD = "Demo@1234"

# One pre-approved, profile-complete login per role so each role can be exercised
# immediately without going through self-registration + admin approval.
DEMO_USERS = [
    {"email": "fleet.manager@transitops.demo", "full_name": "Raven Kapoor", "role": FLEET_MANAGER_ROLE},
    {"email": "driver@transitops.demo", "full_name": "Alex Menon", "role": DRIVER_ROLE},
    {"email": "safety.officer@transitops.demo", "full_name": "Priya Sharma", "role": SAFETY_OFFICER_ROLE},
    {"email": "financial.analyst@transitops.demo", "full_name": "Karan Patel", "role": FINANCIAL_ANALYST_ROLE},
]

REGIONS = ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai"]

VEHICLE_SEED = [
    ("GJ01AB1001", "Tata Ace", VehicleType.van, 500, 620000, 8.5),
    ("GJ01AB1002", "Mahindra Bolero Pickup", VehicleType.van, 700, 780000, 7.2),
    ("MH04CD2003", "Ashok Leyland Dost", VehicleType.truck, 1500, 1450000, 15.0),
    ("MH04CD2004", "Tata 407", VehicleType.truck, 2500, 1850000, 18.5),
    ("MH12EF3005", "Eicher Pro 2049", VehicleType.truck, 4000, 2650000, 22.0),
    ("DL01GH4006", "Bajaj RE Cargo", VehicleType.bike, 150, 210000, 3.0),
    ("DL01GH4007", "Hero Splendor Courier", VehicleType.bike, 60, 95000, 2.0),
    ("KA05IJ5008", "Ashok Leyland Trailer", VehicleType.trailer, 8000, 4200000, 28.0),
    ("KA05IJ5009", "Tata Signa Trailer", VehicleType.trailer, 9000, 4500000, 30.0),
    ("TN09KL6010", "Force Traveller", VehicleType.other, 1200, 1100000, 12.0),
    ("MH20MN7011", "Tata Ace Gold", VehicleType.van, 550, 640000, 8.8),
    ("PB03OP8012", "Mahindra Jeeto", VehicleType.van, 400, 480000, 6.5),
]

EXTRA_DRIVER_NAMES = [
    "Sneha Iyer", "Vikram Singh", "Anjali Desai", "Meera Nair", "Arjun Reddy",
    "Divya Joshi", "Rohan Gupta", "Kavya Pillai", "Ibrahim Khan", "Neha Kulkarni",
    "Suresh Rao", "Tanvi Malhotra",
]

LICENSE_CATEGORIES = ["LMV", "HMV", "MCWG"]

DOC_TYPES = ["Insurance", "Registration", "Permit", "Fitness Certificate"]


def _rand_license_expiry(index: int) -> date:
    # A handful expiring within 30 days (for safety_overview alerts), rest spread out further.
    if index < 3:
        return date.today() + timedelta(days=random.randint(3, 28))
    return date.today() + timedelta(days=random.randint(60, 900))


def _seed_demo_users(db: Session) -> dict[str, User]:
    by_role: dict[str, User] = {}
    for spec in DEMO_USERS:
        user = db.scalar(select(User).where(User.email == spec["email"]))
        role = db.scalar(select(Role).where(Role.name == spec["role"]))
        if role is None:
            logger.warning("Role %s not found - skipping demo user %s", spec["role"], spec["email"])
            continue
        if user is None:
            user = User(
                email=spec["email"],
                full_name=spec["full_name"],
                hashed_password=hash_password(DEMO_PASSWORD),
                role=role,
                is_approved=True,
                is_profile_complete=True,
                contact_number="9000000000",
                region="Mumbai",
            )
            db.add(user)
            logger.info("Seeded demo user: %s", spec["email"])
        else:
            # Keep it usable even if seed.py's role matrix changed underneath it.
            user.role = role
            user.is_approved = True
            user.is_profile_complete = True
        by_role[spec["role"]] = user
    db.commit()
    for user in by_role.values():
        db.refresh(user)
    return by_role


def _seed_vehicles(db: Session) -> list[Vehicle]:
    vehicles: list[Vehicle] = []
    for i, (reg, model, vtype, capacity, cost, revenue_per_km) in enumerate(VEHICLE_SEED):
        status = VehicleStatus.available
        if i == len(VEHICLE_SEED) - 1:
            status = VehicleStatus.retired
        elif i == len(VEHICLE_SEED) - 2:
            status = VehicleStatus.in_shop
        vehicle = Vehicle(
            registration_number=reg,
            name_model=model,
            type=vtype,
            max_load_capacity=capacity,
            odometer=random.randint(5000, 180000),
            acquisition_cost=cost,
            revenue_per_km=revenue_per_km,
            status=status,
            region=random.choice(REGIONS),
        )
        db.add(vehicle)
        vehicles.append(vehicle)
    db.commit()
    for v in vehicles:
        db.refresh(v)
    return vehicles


def _seed_drivers(db: Session, demo_driver_user: User | None) -> list[Driver]:
    drivers: list[Driver] = []

    if demo_driver_user is not None:
        demo_driver = Driver(
            user_id=demo_driver_user.id,
            name=demo_driver_user.full_name,
            license_number="DL0000AX9001",
            license_category="LMV",
            license_expiry_date=date.today() + timedelta(days=400),
            contact_number="9000000001",
            safety_score=95.0,
            status=DriverStatus.available,
            region="Mumbai",
        )
        db.add(demo_driver)
        drivers.append(demo_driver)

    for i, name in enumerate(EXTRA_DRIVER_NAMES):
        license_number = f"DL{1000 + i:04d}{random.randint(100000, 999999)}"
        driver = Driver(
            name=name,
            license_number=license_number,
            license_category=random.choice(LICENSE_CATEGORIES),
            license_expiry_date=_rand_license_expiry(i),
            contact_number=f"9{random.randint(100000000, 999999999)}",
            safety_score=round(random.uniform(70, 99), 1),
            status=DriverStatus.available,
            region=random.choice(REGIONS),
        )
        db.add(driver)
        drivers.append(driver)

    db.commit()
    for d in drivers:
        db.refresh(d)
    return drivers


def _seed_trips_fuel_expenses(
    db: Session, vehicles: list[Vehicle], drivers: list[Driver], created_by: int
) -> None:
    active_vehicles = [v for v in vehicles if v.status != VehicleStatus.retired]
    now = datetime.now(timezone.utc)

    for _ in range(90):
        vehicle = random.choice(active_vehicles)
        driver = random.choice(drivers)
        planned_distance = round(random.uniform(40, 650), 1)
        cargo_weight = round(
            min(vehicle.max_load_capacity * random.uniform(0.2, 0.95), vehicle.max_load_capacity), 1
        )
        created_at = now - timedelta(days=random.randint(0, 75), hours=random.randint(0, 23))

        roll = random.random()
        if roll < 0.7:
            status = TripStatus.completed
        elif roll < 0.85:
            status = TripStatus.dispatched
        elif roll < 0.93:
            status = TripStatus.draft
        else:
            status = TripStatus.cancelled

        trip = Trip(
            source=random.choice(REGIONS),
            destination=random.choice(REGIONS),
            vehicle_id=vehicle.id,
            driver_id=driver.id,
            cargo_weight=cargo_weight,
            planned_distance=planned_distance,
            created_by=created_by,
            status=status,
        )

        if status in (TripStatus.completed, TripStatus.dispatched):
            trip.start_odometer = round(vehicle.odometer, 1)
        if status == TripStatus.completed:
            actual_distance = round(planned_distance * random.uniform(0.9, 1.15), 1)
            trip.actual_distance = actual_distance
            trip.end_odometer = round(trip.start_odometer + actual_distance, 1)
            trip.fuel_consumed = round(actual_distance / random.uniform(4, 20), 1)

        db.add(trip)
        db.flush()
        trip.created_at = created_at
        trip.updated_at = created_at

        if status == TripStatus.completed and trip.fuel_consumed:
            liters = trip.fuel_consumed
            db.add(
                FuelLog(
                    vehicle_id=vehicle.id,
                    trip_id=trip.id,
                    liters=liters,
                    cost=round(liters * random.uniform(90, 108), 2),
                    date=created_at.date(),
                    created_by=created_by,
                )
            )

        if random.random() < 0.35:
            db.add(
                Expense(
                    vehicle_id=vehicle.id,
                    trip_id=trip.id,
                    type=random.choice([ExpenseType.toll, ExpenseType.other]),
                    amount=round(random.uniform(100, 2500), 2),
                    date=created_at.date(),
                    description=random.choice(["Toll plaza", "Parking", "Loading charges", "Misc"]),
                    created_by=created_by,
                )
            )

    db.commit()


def _seed_maintenance(db: Session, vehicles: list[Vehicle], created_by: int) -> None:
    now = datetime.now(timezone.utc)
    for vehicle in vehicles:
        for _ in range(random.randint(1, 3)):
            opened_at = now - timedelta(days=random.randint(5, 90))
            is_closed = random.random() < 0.75 or vehicle.status == VehicleStatus.available
            db.add(
                MaintenanceLog(
                    vehicle_id=vehicle.id,
                    description=random.choice(
                        ["Brake pad replacement", "Oil change", "Tyre rotation", "Engine service", "AC repair", "General checkup"]
                    ),
                    cost=round(random.uniform(1500, 25000), 2),
                    opened_at=opened_at,
                    closed_at=opened_at + timedelta(days=random.randint(1, 5)) if is_closed else None,
                    status=MaintenanceStatus.closed if is_closed else MaintenanceStatus.open,
                    created_by=created_by,
                )
            )
    db.commit()


def _seed_vehicle_documents(db: Session, vehicles: list[Vehicle]) -> None:
    for vehicle in vehicles:
        for doc_type in random.sample(DOC_TYPES, k=random.randint(1, 3)):
            # A couple of near-expiry / already-expired documents so the amber/red badges
            # in the UI have something real to show, not just far-future dates.
            expiry_roll = random.random()
            if expiry_roll < 0.15:
                expiry = date.today() - timedelta(days=random.randint(1, 30))
            elif expiry_roll < 0.3:
                expiry = date.today() + timedelta(days=random.randint(1, 30))
            else:
                expiry = date.today() + timedelta(days=random.randint(60, 700))
            db.add(
                VehicleDocument(
                    vehicle_id=vehicle.id,
                    doc_type=doc_type,
                    file_url=f"https://example.com/documents/{vehicle.registration_number}-{doc_type.lower().replace(' ', '-')}.pdf",
                    expiry_date=expiry,
                )
            )
    db.commit()


def seed_demo_data(db: Session) -> None:
    demo_users_by_role = _seed_demo_users(db)

    if db.query(Vehicle).count() > 0:
        logger.info("Demo fleet data already present - skipping generation")
        return

    fleet_manager = demo_users_by_role.get(FLEET_MANAGER_ROLE)
    created_by = fleet_manager.id if fleet_manager else None
    if created_by is None:
        logger.warning("No fleet_manager demo user available - skipping fleet data generation")
        return

    logger.info("Generating demo fleet dataset...")
    vehicles = _seed_vehicles(db)
    drivers = _seed_drivers(db, demo_users_by_role.get(DRIVER_ROLE))
    _seed_trips_fuel_expenses(db, vehicles, drivers, created_by=created_by)
    _seed_maintenance(db, vehicles, created_by=created_by)
    _seed_vehicle_documents(db, vehicles)
    logger.info(
        "Demo fleet dataset ready: %d vehicles, %d drivers, plus trips/fuel/expenses/maintenance/documents",
        len(vehicles),
        len(drivers),
    )
