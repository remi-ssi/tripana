"""Create places table with indexing

Revision ID: 20260524_create_places_table
Revises: 20260416_drop_otp_codes_table
Create Date: 2026-05-24 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260524_create_places_table'
down_revision = '20260416_drop_otp_codes_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the places table
    op.create_table(
        'places',
        sa.Column('place_id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('google_place_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('address', sa.Text(), nullable=False),
        sa.Column('city', sa.String(length=255), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('user_ratings_total', sa.Integer(), nullable=True),
        sa.Column('types', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('opening_hours', sa.Text(), nullable=True),
        sa.Column('photos', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('website', sa.String(length=500), nullable=True),
        sa.Column('price_level', sa.Integer(), nullable=True),
        sa.Column('date_created', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('date_updated', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('place_id'),
        sa.UniqueConstraint('google_place_id', name='uq_google_place_id')
    )
    
    # Create indexes for better query performance
    op.create_index('idx_google_place_id', 'places', ['google_place_id'])
    op.create_index('idx_city', 'places', ['city'])
    op.create_index('idx_date_created', 'places', ['date_created'])
    
    # Create GIN index for city and types (PostgreSQL specific for JSON filtering)
    op.execute(
        "CREATE INDEX idx_city_types ON places USING gin (city, types)"
    )


def downgrade() -> None:
    op.drop_index('idx_city_types', table_name='places')
    op.drop_index('idx_date_created', table_name='places')
    op.drop_index('idx_city', table_name='places')
    op.drop_index('idx_google_place_id', table_name='places')
    op.drop_table('places')
