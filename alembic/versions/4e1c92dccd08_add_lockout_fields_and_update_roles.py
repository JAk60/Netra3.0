"""add lockout fields and update roles

Revision ID: 4e1c92dccd08
Revises: cb90e1cb957c
Create Date: 2025-12-29 01:23:58.482592

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = '4e1c92dccd08'
down_revision: Union[str, Sequence[str], None] = 'cb90e1cb957c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - USERS TABLE ONLY."""
    
    # Add lockout fields to users table
    op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('locked_until', sa.DateTime(), nullable=True))
    
    # Update role enum - first change column to VARCHAR to avoid enum issues
    op.execute("ALTER TABLE users ALTER COLUMN role VARCHAR(50)")
    
    # Update existing role values to new simplified roles
    op.execute("""
        UPDATE users 
        SET role = CASE 
            WHEN role IN ('Admin/ INSMA', 'ADMIN_INSMA') THEN 'admin'
            WHEN role = 'Developer Mode' THEN 'user'
            WHEN role IN ('Ship HoD', 'Ship CO', 'Fleet/ Command HQ', 'NHQ', 'Handheld') THEN 'user'
            ELSE 'user'
        END
    """)


def downgrade() -> None:
    """Downgrade schema."""
    
    # Remove lockout fields
    op.drop_column('users', 'locked_until')
    op.drop_column('users', 'failed_login_attempts')
    
    # Revert role changes (lossy - maps everything back to old roles)
    op.execute("""
        UPDATE users 
        SET role = CASE 
            WHEN role = 'admin' THEN 'Admin/ INSMA'
            WHEN role = 'superuser' THEN 'Admin/ INSMA'
            ELSE 'Developer Mode'
        END
    """)