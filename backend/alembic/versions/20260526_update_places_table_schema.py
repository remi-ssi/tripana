"""Update places table schema to match new Place model

Revision ID: 20260526_update_places_table_schema
Revises: 20260524_create_places_table
Create Date: 2026-05-26 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260526_update_places_table_schema'
down_revision = '20260524_create_places_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the old unique constraint on googleplaceid
    op.drop_constraint('places_googleplaceid_key', 'places', type_='unique')
    
    # Drop existing indices if they exist
    try:
        op.drop_index('places_googleplaceid_key', table_name='places')
    except Exception:
        pass
    
    try:
        op.drop_index('idx_google_place_id', table_name='places')
    except Exception:
        pass
    
    try:
        op.drop_index('idx_city', table_name='places')
    except Exception:
        pass
    
    try:
        op.drop_index('idx_city_types', table_name='places')
    except Exception:
        pass
    
    # Rename columns from old naming convention to new
    op.alter_column('places', 'placeid', new_column_name='id', existing_type=sa.Integer())
    op.alter_column('places', 'googleplaceid', new_column_name='google_place_id', existing_type=sa.String(255))
    op.alter_column('places', 'destination', new_column_name='city', existing_type=sa.String(255))
    op.alter_column('places', 'userratingtotal', new_column_name='user_ratings_total', existing_type=sa.Integer(), nullable=True)
    op.alter_column('places', 'pricelevel', new_column_name='price_level', existing_type=sa.Integer(), nullable=True)
    op.alter_column('places', 'openinghours', new_column_name='opening_hours', existing_type=sa.Text(), nullable=True)
    op.alter_column('places', 'datefetched', new_column_name='date_fetched', existing_type=sa.DateTime(), nullable=True)
    op.alter_column('places', 'lastupdate', new_column_name='last_update', existing_type=sa.DateTime(), nullable=True)
    op.alter_column('places', 'isactive', new_column_name='is_active', existing_type=sa.Boolean(), nullable=True)
    
    # Add missing columns
    op.add_column('places', sa.Column('name', sa.String(255), nullable=False, server_default='Unknown'))
    op.add_column('places', sa.Column('types', sa.JSON(), nullable=True))
    op.add_column('places', sa.Column('address', sa.String(500), nullable=True))
    
    # Drop columns that are no longer used
    op.drop_column('places', 'is_open_now')
    op.drop_column('places', 'phonenumber')
    
    # Create new indices
    op.create_index('idx_google_place_id', 'places', ['google_place_id'], unique=True)
    op.create_index('idx_city', 'places', ['city'])
    op.create_index('idx_city_types', 'places', ['city', 'types'], using='gin')


def downgrade() -> None:
    # Reverse the migration
    op.drop_index('idx_google_place_id', table_name='places')
    op.drop_index('idx_city', table_name='places')
    op.drop_index('idx_city_types', table_name='places')
    
    # Drop new columns
    op.drop_column('places', 'name')
    op.drop_column('places', 'types')
    op.drop_column('places', 'address')
    
    # Re-add old columns
    op.add_column('places', sa.Column('is_open_now', sa.Boolean(), nullable=True))
    op.add_column('places', sa.Column('phonenumber', sa.String(255), nullable=True))
    
    # Rename columns back to old names
    op.alter_column('places', 'id', new_column_name='placeid', existing_type=sa.Integer())
    op.alter_column('places', 'google_place_id', new_column_name='googleplaceid', existing_type=sa.String(255))
    op.alter_column('places', 'city', new_column_name='destination', existing_type=sa.String(255))
    op.alter_column('places', 'user_ratings_total', new_column_name='userratingtotal', existing_type=sa.Integer(), nullable=True)
    op.alter_column('places', 'price_level', new_column_name='pricelevel', existing_type=sa.Integer(), nullable=True)
    op.alter_column('places', 'opening_hours', new_column_name='openinghours', existing_type=sa.Text(), nullable=True)
    op.alter_column('places', 'date_fetched', new_column_name='datefetched', existing_type=sa.DateTime(), nullable=True)
    op.alter_column('places', 'last_update', new_column_name='lastupdate', existing_type=sa.DateTime(), nullable=True)
    op.alter_column('places', 'is_active', new_column_name='isactive', existing_type=sa.Boolean(), nullable=True)
    
    # Re-create old unique constraint
    op.create_unique_constraint('places_googleplaceid_key', 'places', ['googleplaceid'])
