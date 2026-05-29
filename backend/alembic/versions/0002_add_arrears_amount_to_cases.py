"""Add arrears_amount column to cases table.

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-29

"""

from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add arrears_amount nullable Float to cases for case list display."""
    op.add_column("cases", sa.Column("arrears_amount", sa.Float(), nullable=True))


def downgrade() -> None:
    """Remove arrears_amount from cases."""
    op.drop_column("cases", "arrears_amount")
