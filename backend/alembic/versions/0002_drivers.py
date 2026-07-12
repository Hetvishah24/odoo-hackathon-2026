"""drivers table

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "drivers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, unique=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("license_number", sa.String(length=50), nullable=False),
        sa.Column("license_category", sa.String(length=50), nullable=False),
        sa.Column("license_expiry_date", sa.Date(), nullable=False),
        sa.Column("contact_number", sa.String(length=20), nullable=False),
        sa.Column("safety_score", sa.Float(), nullable=False, server_default="100"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="available"),
        sa.Column("region", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_drivers_license_number"), "drivers", ["license_number"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_drivers_license_number"), table_name="drivers")
    op.drop_table("drivers")
