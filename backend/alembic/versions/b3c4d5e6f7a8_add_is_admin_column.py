"""add is_admin column to users

Revision ID: b3c4d5e6f7a8
Revises: a2b3c4d5e6f7
Create Date: 2026-03-27 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b3c4d5e6f7a8'
down_revision = 'a2b3c4d5e6f7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_admin column with default False
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_admin', sa.Boolean(), nullable=True, server_default=sa.text('0')))

    # Set cloud_user as admin
    op.execute("UPDATE users SET is_admin = 1 WHERE username = 'cloud_user'")
    op.execute("UPDATE users SET is_admin = 0 WHERE is_admin IS NULL")


def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('is_admin')
