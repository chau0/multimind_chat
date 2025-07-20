"""add timestamp to messages

Revision ID: add_timestamp_to_messages
Revises: add_agent_display_fields
Create Date: 2025-01-19 16:15:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_timestamp_to_messages'
down_revision = 'add_agent_display_fields'
branch_labels = None
depends_on = None

def upgrade():
    # Add created_at column to messages table
    op.add_column('messages', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True))

def downgrade():
    # Remove created_at column from messages table
    op.drop_column('messages', 'created_at')