"""rename admin role to super_admin, drop legacy unused 'user' role

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
    # A fresh 'super_admin' row may already have been auto-seeded (app startup runs
    # seed_db() before this migration necessarily applies) while 'admin' still holds the
    # real users - merge rather than blind-rename to avoid a unique-constraint clash.
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM roles WHERE name = 'admin')
               AND EXISTS (SELECT 1 FROM roles WHERE name = 'super_admin') THEN
                UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'super_admin')
                    WHERE role_id = (SELECT id FROM roles WHERE name = 'admin');
                DELETE FROM roles WHERE name = 'admin';
            ELSIF EXISTS (SELECT 1 FROM roles WHERE name = 'admin') THEN
                UPDATE roles SET name = 'super_admin' WHERE name = 'admin';
            END IF;
        END $$;
        """
    )
    # Defensive: detach any user still on the legacy 'user' role before dropping it.
    op.execute(
        "UPDATE users SET role_id = NULL WHERE role_id IN (SELECT id FROM roles WHERE name = 'user')"
    )
    op.execute("DELETE FROM roles WHERE name = 'user'")


def downgrade() -> None:
    op.execute("UPDATE roles SET name = 'admin' WHERE name = 'super_admin'")
    op.execute(
        "INSERT INTO roles (name, description, permissions, created_at, updated_at) "
        "VALUES ('user', 'Standard user', '[]', now(), now())"
    )
