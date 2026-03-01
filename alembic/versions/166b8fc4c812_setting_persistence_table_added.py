"""setting persistence table added

Revision ID: 166b8fc4c812
Revises: c1df140b79eb
Create Date: 2026-02-27 00:19:54.858999

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import mssql

# revision identifiers, used by Alembic.
revision: str = '166b8fc4c812'
down_revision: Union[str, Sequence[str], None] = 'c1df140b79eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Stripped — these were false Alembic noise diffs between SQLModel AutoString
    # and MSSQL VARCHAR collation. No real schema change needed.
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass