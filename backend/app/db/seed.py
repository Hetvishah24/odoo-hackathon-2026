"""Idempotent database seeding: default roles and the initial admin user."""

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.core.security import hash_password
from app.roles.models import Role
from app.users.models import User

logger = logging.getLogger(__name__)

ADMIN_ROLE = "admin"
FLEET_MANAGER_ROLE = "fleet_manager"
DRIVER_ROLE = "driver"
SAFETY_OFFICER_ROLE = "safety_officer"
FINANCIAL_ANALYST_ROLE = "financial_analyst"

# Roles a user may pick for themselves via POST /auth/register.
# "admin" is provisioned separately (see settings.admin_email below) and is never self-assigned.
SELF_REGISTERABLE_ROLES = [
    FLEET_MANAGER_ROLE,
    DRIVER_ROLE,
    SAFETY_OFFICER_ROLE,
    FINANCIAL_ANALYST_ROLE,
]

DEFAULT_ROLES = [
    {"name": ADMIN_ROLE, "description": "Full access", "permissions": ["*"]},
    # Permission matrix combines Dev A's §8 (vehicles/maintenance/dashboard) and Dev B's §8
    # (drivers/trips/fuel/expenses/reports) tables from the frozen contract - both devs edit
    # this same list, so coordinate here rather than duplicating role entries.
    {
        "name": FLEET_MANAGER_ROLE,
        "description": (
            "Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency."
        ),
        "permissions": [
            "vehicles:read",
            "vehicles:write",
            "maintenance:read",
            "maintenance:write",
            "drivers:read",
            "drivers:write",
            "trips:read",
            "trips:write",
            "fuel:read",
            "fuel:write",
            "expenses:read",
            "expenses:write",
            "reports:read",
            "dashboard:read",
        ],
    },
    {
        "name": DRIVER_ROLE,
        "description": "Creates trips, assigns vehicles and drivers, and monitors active deliveries.",
        "permissions": [
            "vehicles:read",
            "drivers:read",
            "trips:read",
            "trips:write",
            "fuel:write",
            "expenses:write",
            "dashboard:read",
        ],
    },
    {
        "name": SAFETY_OFFICER_ROLE,
        "description": "Ensures driver compliance, tracks license validity, and monitors safety scores.",
        "permissions": [
            "vehicles:read",
            "drivers:read",
            "drivers:write",
            "trips:read",
            "reports:read",
            "dashboard:read",
        ],
    },
    {
        "name": FINANCIAL_ANALYST_ROLE,
        "description": (
            "Reviews operational expenses, fuel consumption, maintenance costs, and profitability."
        ),
        "permissions": [
            "vehicles:read",
            "maintenance:read",
            "trips:read",
            "fuel:read",
            "expenses:read",
            "reports:read",
            "dashboard:read",
        ],
    },
]


def seed_db(db: Session) -> None:
    for spec in DEFAULT_ROLES:
        if db.scalar(select(Role).where(Role.name == spec["name"])) is None:
            db.add(Role(**spec))
            logger.info("Seeded role: %s", spec["name"])
    db.commit()

    if db.scalar(select(User).where(User.email == settings.admin_email)) is None:
        admin_role = db.scalar(select(Role).where(Role.name == ADMIN_ROLE))
        db.add(
            User(
                email=settings.admin_email,
                full_name="Admin",
                hashed_password=hash_password(settings.admin_password),
                role=admin_role,
                is_approved=True,
            )
        )
        db.commit()
        logger.info("Seeded admin user: %s", settings.admin_email)
