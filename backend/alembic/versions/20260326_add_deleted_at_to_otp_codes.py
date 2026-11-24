"""add deleted_at column to otp_codes

Revision ID: 20260326_add_deleted_at_to_otp_codes
Revises:
Create Date: 2026-03-26
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260326_add_deleted_at_to_otp_codes"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("otp_codes", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("otp_codes", sa.Column("blocked_until", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("otp_codes", "blocked_until")
    op.drop_column("otp_codes", "deleted_at")
