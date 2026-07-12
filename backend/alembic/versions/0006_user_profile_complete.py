"""add is_profile_complete to users

Revision ID: 0006
Revises: 0005
Create Date: 2026-07-12

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # IF NOT EXISTS: this revision briefly shared its number with an unrelated
    # migration during a branch merge, so some local dev DBs may already have
    # this column from before the collision was fixed. Idempotent either way.
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_profile_complete "
        "BOOLEAN NOT NULL DEFAULT false"
    )
    op.execute(
        "UPDATE users SET is_profile_complete = true WHERE role_id IN "
        "(SELECT id FROM roles WHERE name IN ('admin', 'super_admin'))"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS is_profile_complete")
