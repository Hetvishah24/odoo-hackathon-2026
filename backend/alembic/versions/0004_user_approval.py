"""add is_approved to users

Revision ID: 0004
Revises: 0003
Create Date: 2026-07-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.execute("UPDATE users SET is_approved = true WHERE role_id IN "
               "(SELECT id FROM roles WHERE name = 'admin')")


def downgrade() -> None:
    op.drop_column("users", "is_approved")
