"""add source column to activity_sessions

Revision ID: a2b3c4d5e6f7
Revises: fbfddde84811
Create Date: 2026-03-24 22:25:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, None] = 'fbfddde84811'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the source column with a default so existing rows get 'desktop'
    op.add_column(
        'activity_sessions',
        sa.Column('source', sa.String(50), nullable=False, server_default='desktop')
    )
    op.create_index('ix_activity_sessions_source', 'activity_sessions', ['source'])


def downgrade() -> None:
    op.drop_index('ix_activity_sessions_source', table_name='activity_sessions')
    op.drop_column('activity_sessions', 'source')
