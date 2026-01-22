"""voc new column order, description

Revision ID: 0a437f27e2f8
Revises: 84b74f007717
Create Date: 2026-01-22 06:43:19.387018

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '0a437f27e2f8'
down_revision: str | Sequence[str] | None = '84b74f007717'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('vocs', sa.Column('order', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('vocs', sa.Column('description', sa.String(length=10000), server_default=''))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('vocs', 'description')
    op.drop_column('vocs', 'order')
