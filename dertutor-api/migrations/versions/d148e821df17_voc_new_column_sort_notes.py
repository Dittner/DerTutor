"""voc new column sort_notes

Revision ID: d148e821df17
Revises: 0a437f27e2f8
Create Date: 2026-01-23 07:08:00.663476

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'd148e821df17'
down_revision: str | Sequence[str] | None = '0a437f27e2f8'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('vocs', sa.Column('sort_notes', sa.String(length=255), nullable=False, server_default='id:desc'))
    op.alter_column(
        'vocs',
        'description',
        existing_type=sa.VARCHAR(length=10000),
        nullable=False,
        existing_server_default=sa.text("''::character varying"),
    )
    op.drop_column('vocs', 'order')


def downgrade() -> None:
    op.add_column(
        'vocs', sa.Column('order', sa.INTEGER(), server_default=sa.text('0'), autoincrement=False, nullable=False)
    )
    op.alter_column(
        'vocs',
        'description',
        existing_type=sa.VARCHAR(length=10000),
        nullable=True,
        existing_server_default=sa.text("''::character varying"),
    )
    op.drop_column('vocs', 'sort_notes')
