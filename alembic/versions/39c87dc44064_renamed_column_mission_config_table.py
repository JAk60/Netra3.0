"""Renamed column + mission config table

Revision ID: 39c87dc44064
Revises: 63e81db748b4
Create Date: 2025-11-26 21:17:38.862687
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

revision: str = '39c87dc44064'
down_revision: Union[str, Sequence[str], None] = '63e81db748b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # Add new ship_name column
    op.add_column(
        'Mission_configurations',
        sa.Column('ship_name', sa.String(length=255), nullable=True)
    )

    # Safely alter ship_id NULL/NOT NULL for MSSQL: must include existing_type!
    op.alter_column(
        'Mission_configurations',
        'ship_id',
        nullable=True,
        existing_type=mssql.UNIQUEIDENTIFIER()
    )

    # Drop old Mission_name column
    op.drop_column('Mission_configurations', 'Mission_name')


def downgrade() -> None:

    # Restore Mission_name
    op.add_column(
        'Mission_configurations',
        sa.Column('Mission_name', sa.String(length=255), nullable=True)
    )

    # Drop ship_name
    op.drop_column('Mission_configurations', 'ship_name')

    # Revert ship_id nullable state (must include existing type for MSSQL)
    op.alter_column(
        'Mission_configurations',
        'ship_id',
        nullable=True,
        existing_type=mssql.UNIQUEIDENTIFIER()
    )
