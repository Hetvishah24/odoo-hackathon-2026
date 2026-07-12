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
DEFAULT_USER_ROLE = "user"

DEFAULT_ROLES = [
    {"name": ADMIN_ROLE, "description": "Full access", "permissions": ["*"]},
    {"name": DEFAULT_USER_ROLE, "description": "Standard user", "permissions": []},
    # Permission matrix combines Dev A's §8 (vehicles/maintenance/dashboard) and Dev B's §8
    # (drivers/trips/fuel/expenses/reports) tables from the frozen contract - both devs edit
    # this same list, so coordinate here rather than duplicating role entries.
    {
        "name": "fleet_manager",
        "description": "Manages fleet operations end-to-end",
        "permissions": [
            "vehicles:read",
            "vehicles:write",
            "maintenance:read",
            "maintenance:write",
            "dashboard:read",
            "drivers:read",
            "drivers:write",
            "trips:read",
            "trips:write",
            "fuel:read",
            "fuel:write",
            "expenses:read",
            "expenses:write",
            "reports:read",
        ],
    },
    {
        "name": "driver",
        "description": "Drives trips and logs fuel/expenses",
        "permissions": [
            "vehicles:read",
            "dashboard:read",
            "drivers:read",
            "trips:read",
            "trips:write",
            "fuel:write",
            "expenses:write",
        ],
    },
    {
        "name": "safety_officer",
        "description": "Oversees driver safety and compliance",
        "permissions": [
            "vehicles:read",
            "dashboard:read",
            "drivers:read",
            "drivers:write",
            "trips:read",
            "reports:read",
        ],
    },
    {
        "name": "financial_analyst",
        "description": "Tracks costs, fuel spend and ROI",
        "permissions": [
            "vehicles:read",
            "maintenance:read",
            "dashboard:read",
            "trips:read",
            "fuel:read",
            "expenses:read",
            "reports:read",
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
            )
        )
        db.commit()
        logger.info("Seeded admin user: %s", settings.admin_email)
