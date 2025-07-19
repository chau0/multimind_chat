"""add agent display fields

Revision ID: add_agent_display_fields
Revises: 94327365becd
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_agent_display_fields'
down_revision = '94327365becd'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to agents table
    op.add_column('agents', sa.Column('display_name', sa.String(255), nullable=True))
    op.add_column('agents', sa.Column('avatar', sa.String(10), nullable=True))
    op.add_column('agents', sa.Column('color', sa.String(100), nullable=True))

def downgrade():
    # Remove the columns
    op.drop_column('agents', 'color')
    op.drop_column('agents', 'avatar')
    op.drop_column('agents', 'display_name')