"""creating users table

Revision ID: 022192288e98
Revises: 28495cac4168
Create Date: 2025-12-26 00:45:00.750143

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '022192288e98'
down_revision: str | list[str] | None = '28495cac4168'
branch_labels: str | list[str] | None = None
depends_on: str | list[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=256), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_superuser', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_users')),
        sa.UniqueConstraint('username', name=op.f('uq_users_username')),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('users')
