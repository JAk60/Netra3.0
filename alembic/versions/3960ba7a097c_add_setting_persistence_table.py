"""add system_settings table

Revision ID: 3960ba7a097c
Revises: 166b8fc4c812
Create Date: 2026-02-27 00:19:54.858999

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '3960ba7a097c'
down_revision: Union[str, Sequence[str], None] = '166b8fc4c812'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop if exists from previous broken run (table created but with IDENTITY)
    op.execute("IF OBJECT_ID('system_settings', 'U') IS NOT NULL DROP TABLE system_settings")

    # Recreate WITHOUT identity — note no autoincrement, we always insert id=1 explicitly
    op.create_table(
        'system_settings',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=False),
        sa.Column('inactivity_timeout_minutes', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('session_timeout_minutes', sa.Integer(), nullable=False, server_default='30'),
        sa.Column('max_login_attempts', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('lockout_duration_minutes', sa.Integer(), nullable=False, server_default='30'),
        sa.Column('password_min_length', sa.Integer(), nullable=False, server_default='8'),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('system_settings')