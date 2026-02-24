"""recreate etl_schedule composite pk

Revision ID: c1df140b79eb
Revises: 2370969d316a
Create Date: 2026-02-18 01:22:27.398154

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c1df140b79eb'
down_revision: Union[str, Sequence[str], None] = '2370969d316a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'etl_schedule',
        sa.Column('component_id', sa.Uuid(), nullable=False),
        sa.Column('etl_type', sa.String(length=50), nullable=False),
        sa.Column('frequency_minutes', sa.Integer(), nullable=False),
        sa.Column('last_run_time', sa.DateTime(), nullable=True),
        sa.Column('next_run_time', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('retry_count', sa.Integer(), nullable=False),
        sa.Column('max_retries', sa.Integer(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('session_id', sa.Integer(), nullable=True),
        sa.Column('current_execution_id', sa.Uuid(), nullable=True),
        sa.Column('cancellation_requested', sa.Boolean(), nullable=False),
        sa.Column('last_trigger_type', sa.String(length=20), nullable=True),
        sa.Column('source_watermark', sa.DateTime(), nullable=True),
        sa.Column('target_watermark', sa.DateTime(), nullable=True),
        sa.Column('rows_changed_since_last_check', sa.Integer(), nullable=True),
        sa.Column('last_change_detected', sa.DateTime(), nullable=True),
        sa.Column('sync_risk_score', sa.Integer(), nullable=False),
        sa.Column('last_sync_start', sa.DateTime(), nullable=True),
        sa.Column('last_sync_duration_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ['component_id'],
            ['system_configuration.component_id']
        ),
        sa.PrimaryKeyConstraint('component_id', 'etl_type')
    )

def downgrade() -> None:
    op.drop_table('etl_schedule')
