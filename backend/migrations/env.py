"""
env.py – Alembic migration environment
"""

from logging.config import fileConfig
import os
import sys
from pathlib import Path

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Make sure project root is on PYTHONPATH ────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

# ── Local imports (deferred until after path tweak) ────────────────────────────
from app.config import settings  # noqa: E402
from app.utils.db import Base  # noqa: E402
from app.models import chat  # noqa: F401  (imported for autogenerate)

# ── Alembic configuration ─────────────────────────────────────────────────────
config = context.config
# Don't set the URL in config to avoid ConfigParser interpolation issues
# We'll use the URL directly in the migration functions

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# All metadata that Alembic should scan when autogenerating migrations
target_metadata = Base.metadata


# ── Helper functions ──────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (generates SQL scripts without a live DB)."""
    context.configure(
        url=settings.effective_database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connects to DB and executes)."""
    # Create engine directly from settings to avoid ConfigParser interpolation issues
    from sqlalchemy import create_engine
    from sqlalchemy.exc import OperationalError

    try:
        connectable = create_engine(
            settings.effective_database_url,
            poolclass=pool.NullPool,
        )

        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                compare_type=True,
                compare_server_default=True,
            )

            with context.begin_transaction():
                context.run_migrations()

    except OperationalError as e:
        print(f"Database connection failed: {e}")
        print("Cannot generate autogenerate migration without database connection.")
        print("Please ensure database connectivity or run a manual migration.")
        raise SystemExit(1)


# ── Entrypoint ────────────────────────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
