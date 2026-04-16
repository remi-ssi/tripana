"""drop otp_codes table

Revision ID: 20260416_drop_otp_codes_table
Revises: 20260331_insert_predefined_categories
Create Date: 2026-04-16
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "20260416_drop_otp_codes_table"
down_revision = "20260331_insert_predefined_categories"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DROP TABLE IF EXISTS otp_codes CASCADE")


def downgrade() -> None:
    op.create_table(
        "otp_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_code", sa.String(), nullable=False),
        sa.Column("is_used", sa.Boolean(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=True),
        sa.Column("blocked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_otp_email_code", "otp_codes", ["email", "hashed_code"], unique=False)
    op.create_index(op.f("ix_otp_codes_email"), "otp_codes", ["email"], unique=False)
