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
    # Determine dialect to handle boolean literals correctly
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == 'sqlite'
    
    # SQLite uses 0/1, Postgres uses false/true
    default_expr = '0' if is_sqlite else 'false'
    true_expr = '1' if is_sqlite else 'true'
    false_expr = '0' if is_sqlite else 'false'

    # Add is_admin column with appropriate default
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_admin', sa.Boolean(), nullable=True, server_default=sa.text(default_expr)))

    # Set cloud_user as admin
    op.execute(f"UPDATE users SET is_admin = {true_expr} WHERE username = 'cloud_user'")
    op.execute(f"UPDATE users SET is_admin = {false_expr} WHERE is_admin IS NULL")


def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('is_admin')
