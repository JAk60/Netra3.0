"""Renamed column + add FK mission config table

Revision ID: 63e81db748b4
Revises: e17c8ad27b4f
Create Date: 2025-11-26 21:11:32.498949
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '63e81db748b4'
down_revision: Union[str, Sequence[str], None] = 'e17c8ad27b4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # 1. Add new column ship_id (nullable first to avoid issues)
    op.add_column(
        'Mission_configurations',
        sa.Column('ship_id', sa.Uuid(), nullable=True)
    )

    # 2. Create FK to ships table
    op.create_foreign_key(
        'fk_mission_ship',                        # FK name
        'Mission_configurations',                 # source table
        'ships',                                  # target table
        ['ship_id'],                              # local column
        ['ship_id']                               # referenced column
    )

    # 3. Drop old Mission_id column
    op.drop_column('Mission_configurations', 'Mission_id')

    # 4. DO NOT modify PK column `id`
    # 5. DO NOT modify system_configuration.system_id
    # (removed dangerous autogen parts)


def downgrade() -> None:
    """Downgrade schema."""

    # 1. Restore Mission_id column
    op.add_column(
        'Mission_configurations',
        sa.Column('Mission_id', sa.VARCHAR(length=255), nullable=True)
    )

    # 2. Drop FK
    op.drop_constraint(
        'fk_mission_ship',
        'Mission_configurations',
        type_='foreignkey'
    )

    # 3. Drop ship_id column
    op.drop_column('Mission_configurations', 'ship_id')
