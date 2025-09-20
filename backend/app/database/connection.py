# app/database/connection.py

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
import logging
import asyncio
from typing import Dict, Any, Optional

# --- IMPORT THE CENTRAL SETTINGS OBJECT ---
# This is the single source of truth for all configuration
from app.config import settings

logger = logging.getLogger(__name__)

# --- USE THE DATABASE_URL DIRECTLY FROM SETTINGS ---
# All the logic for building the URL is now handled in config.py
DATABASE_URL = settings.DATABASE_URL

# Log the URL for debugging (password is not logged by the settings object)
logger.info(f"Database engine configured using central settings for host: {settings.DB_HOST}")

# --- SQLAlchemy Engine and Session Configuration ---
# This section remains the same, but it now uses the reliable DATABASE_URL from above
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=5,
    pool_timeout=30,
    connect_args={
        "statement_cache_size": 0,
        "command_timeout": 60
    }
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

# --- Core Database Functions ---
async def get_db():
    """FastAPI dependency to get a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def test_connection() -> bool:
    """Tests the database connection using the engine."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection successful.")
        return True
    except Exception as e:
        logger.warning(f"⚠️ Database connection failed: {str(e)}")
        return False

async def create_tables():
    """Creates all database tables defined in the models."""
    try:
        async with engine.begin() as conn:
            from app.models import user
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created or verified successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to create database tables: {str(e)}")
        raise

# --- Startup and Initialization Logic ---
async def retry_init_db(retries=3, delay=5):
    """Retries database connection and table creation in the background."""
    for i in range(retries):
        logger.info(f"🔄 Retrying database initialization... (Attempt {i+1}/{retries})")
        if await test_connection():
            try:
                await create_tables()
                return
            except Exception:
                pass
        await asyncio.sleep(delay)
    logger.error("❌ All database initialization attempts failed after multiple retries.")

async def init_db():
    """Initializes the database on application startup."""
    logger.info("🚀 Starting database initialization process...")
    if not await test_connection():
        logger.info("🔄 Database not available. Scheduling background retries.")
        asyncio.create_task(retry_init_db())
    else:
        asyncio.create_task(create_tables())

# --- Health Check and Data Manager ---
async def health_check():
    """Provides a health status of the database connection."""
    if await test_connection():
        return {"status": "healthy", "database": "connected"}
    else:
        return {"status": "degraded", "database": "disconnected"}

class RawDataManager:
    """Utility class for executing raw SQL queries."""
    def __init__(self, session: AsyncSession):
        self.session = session

    async def execute_query(self, query: str, params: Optional[Dict] = None):
        """Executes a raw SQL query and fetches all results."""
        try:
            result = await self.session.execute(text(query), params or {})
            return result.fetchall()
        except Exception as e:
            logger.error(f"Raw query failed: {str(e)}")
            raise

def get_raw_data_manager(session: AsyncSession) -> RawDataManager:
    """FastAPI dependency to get the RawDataManager."""
    return RawDataManager(session)