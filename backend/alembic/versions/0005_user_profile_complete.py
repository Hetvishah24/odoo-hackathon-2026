"""add is_profile_complete to users

Revision ID: 0005
Revises: 0004
Create Date: 2026-07-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_profile_complete", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.execute("UPDATE users SET is_profile_complete = true WHERE role_id IN "
               "(SELECT id FROM roles WHERE name = 'admin')")


def downgrade() -> None:
    op.drop_column("users", "is_profile_complete")
