"""add new column to my systemconfig table

Revision ID: 44941befb53c
Revises: d8fabb28942d
Create Date: 2025-12-02 00:22:03.867512
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# revision identifiers, used by Alembic.
revision: str = "44941befb53c"
down_revision: Union[str, Sequence[str], None] = "d8fabb28942d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""

    # --- Add the new enum column ---
    op.add_column(
        "system_configuration",
        sa.Column(
            "RepairType",
            sa.Enum("repairable", "replaceable", name="repairtypeenum"),
            nullable=True,
        ),
    )

    # --- Apply NOT NULL constraint on system_id (if you want this) ---
    op.alter_column(
        "system_configuration",
        "system_id",
        existing_type=mssql.UNIQUEIDENTIFIER(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # --- Revert NOT NULL constraint ---
    op.alter_column(
        "system_configuration",
        "system_id",
        existing_type=mssql.UNIQUEIDENTIFIER(),
        nullable=True,
    )

    # --- Remove the enum column ---
    op.drop_column("system_configuration", "RepairType")

    # --- Drop enum type if needed (SQL Server may ignore) ---
    # op.execute("DROP TYPE repairtypeenum")   # Uncomment if required
