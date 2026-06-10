"""Add proposed_extension_months and proposed_extension_amount to decisions.

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-10
"""

from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("decisions", sa.Column("proposed_extension_months", sa.Integer(), nullable=True))
    op.add_column("decisions", sa.Column("proposed_extension_amount", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("decisions", "proposed_extension_amount")
    op.drop_column("decisions", "proposed_extension_months")
