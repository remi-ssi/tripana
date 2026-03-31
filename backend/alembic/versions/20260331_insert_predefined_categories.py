"""insert predefined categories

Revision ID: 20260331_insert_predefined_categories
Revises: 20260326_add_deleted_at_to_otp_codes
Create Date: 2026-03-31
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260331_insert_predefined_categories"
down_revision = "20260326_add_deleted_at_to_otp_codes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Insert predefined categories
    op.execute(
        """
        INSERT INTO categories (name) VALUES 
        ('Nature'),
        ('Cultural and Historical'),
        ('Adventure'),
        ('Events'),
        ('Food'),
        ('City Exploration'),
        ('Entertainment'),
        ('Wellness Relaxation')
        """
    )


def downgrade() -> None:
    # Delete the categories we inserted
    op.execute(
        """
        DELETE FROM categories WHERE name IN (
            'Nature',
            'Cultural and Historical',
            'Adventure',
            'Events',
            'Food',
            'City Exploration',
            'Entertainment',
            'Wellness Relaxation'
        )
        """
    )
