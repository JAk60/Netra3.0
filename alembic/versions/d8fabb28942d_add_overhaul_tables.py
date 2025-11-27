"""add overhaul tables

Revision ID: d8fabb28942d
Revises: 39c87dc44064
Create Date: 2025-11-27 16:56:24.317526
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import mssql

# revision identifiers, used by Alembic.
revision: str = 'd8fabb28942d'
down_revision: Union[str, Sequence[str], None] = '39c87dc44064'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # -----------------------------
    # NEW TABLES
    # -----------------------------
    op.create_table(
        'Overhaul_Readings',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('component_id', sa.Uuid(), nullable=False),
        sa.Column('maintenance_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('defect_date', sa.Date(), nullable=False),
        sa.Column('cmms_running_age', sa.Float(), nullable=False),
        sa.Column('running_age', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['component_id'], ['system_configuration.component_id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_Overhaul_Readings_id'), 'Overhaul_Readings', ['id'], unique=False)

    op.create_table(
        'Overhaul_metadata',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('component_id', sa.Uuid(), nullable=False),
        sa.Column('overhaul_frequency_hours', sa.Integer(), nullable=False),
        sa.Column('total_overhaul_events', sa.Integer(), nullable=False),
        sa.Column('last_overhaul_date', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.ForeignKeyConstraint(['component_id'], ['system_configuration.component_id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_Overhaul_metadata_id'), 'Overhaul_metadata', ['id'], unique=False)

    # -----------------------------
    # SAFE COLUMN UPDATES
    # -----------------------------
    op.alter_column(
        'Mission_configurations', 'ship_id',
        existing_type=mssql.UNIQUEIDENTIFIER(),
        nullable=False
    )

    op.alter_column(
        'Mission_configurations', 'ship_name',
        existing_type=sa.VARCHAR(length=255, collation='SQL_Latin1_General_CP1_CI_AS'),
        type_=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False
    )

    # Keep system_id as nullable - removed the NOT NULL constraint
    # op.alter_column(
    #     'system_configuration', 'system_id',
    #     existing_type=mssql.UNIQUEIDENTIFIER(),
    #     nullable=False
    # )


def downgrade() -> None:
    """Downgrade schema."""

    # No change needed for system_id as it remains nullable
    
    op.alter_column(
        'Mission_configurations', 'ship_name',
        existing_type=sqlmodel.sql.sqltypes.AutoString(),
        type_=sa.VARCHAR(length=255, collation='SQL_Latin1_General_CP1_CI_AS'),
        nullable=True
    )

    op.alter_column(
        'Mission_configurations', 'ship_id',
        existing_type=mssql.UNIQUEIDENTIFIER(),
        nullable=True
    )

    op.drop_index(op.f('ix_Overhaul_metadata_id'), table_name='Overhaul_metadata')
    op.drop_table('Overhaul_metadata')

    op.drop_index(op.f('ix_Overhaul_Readings_id'), table_name='Overhaul_Readings')
    op.drop_table('Overhaul_Readings')