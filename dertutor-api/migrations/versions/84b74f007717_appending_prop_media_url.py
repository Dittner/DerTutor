"""appending prop media.url

Revision ID: 84b74f007717
Revises: c244f8131c03
Create Date: 2026-01-08 02:40:23.140263

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '84b74f007717'
down_revision: str | Sequence[str] | None = 'c244f8131c03'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('media', sa.Column('url', sa.String(length=255), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('media', 'url')
