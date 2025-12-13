"""Added rcm table

Revision ID: 66fa5f87bdbb
Revises: 44941befb53c
Create Date: 2025-12-07 12:54:35.178164
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '66fa5f87bdbb'
down_revision: Union[str, Sequence[str], None] = '44941befb53c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'rcm',
        sa.Column('rcm_id', sa.String(36), nullable=False),
        sa.Column('component_id', sa.dialects.mssql.UNIQUEIDENTIFIER, nullable=False),

        sa.Column('decision_path', sa.JSON(), nullable=True),
        sa.Column('maintenance_policy', sa.String(2000), nullable=True),

        sa.Column('created_date', sa.DateTime(), nullable=False),
        sa.Column('modified_date', sa.DateTime(), nullable=False),

        sa.ForeignKeyConstraint(
            ['component_id'],
            ['system_configuration.component_id']
        ),
        sa.PrimaryKeyConstraint('rcm_id', 'component_id')
    )


def downgrade() -> None:
    op.drop_table('rcm')
