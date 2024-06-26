"""Added completed attribute

Revision ID: 147cd0ed9a47
Revises: 
Create Date: 2024-06-13 19:58:13.476827

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '147cd0ed9a47'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('todo', schema=None) as batch_op:
        batch_op.add_column(sa.Column('completed', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('todo', schema=None) as batch_op:
        batch_op.drop_column('completed')

    # ### end Alembic commands ###
