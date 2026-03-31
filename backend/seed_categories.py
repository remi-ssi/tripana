"""
Seed script to insert predefined categories into the database.
Run this after the database is set up and migrations are applied.

Usage:
    python seed_categories.py
"""

import asyncio
from app.database import get_db
from app.models import Base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.category import Category

# Predefined categories
CATEGORIES = [
    "Nature",
    "Cultural and Historical",
    "Adventure",
    "Events",
    "Food",
    "City Exploration",
    "Entertainment",
    "Wellness Relaxation",
]


async def seed_categories():
    """Insert predefined categories into the database."""
    # Create async engine
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
    )

    # Create session factory
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            # Check if categories already exist
            from sqlalchemy import select

            result = await session.execute(select(Category))
            existing = result.scalars().all()

            if existing:
                print(f"✓ Categories already exist ({len(existing)} found):")
                for cat in existing:
                    print(f"  - {cat.name}")
                return

            # Insert categories
            print(f"📥 Inserting {len(CATEGORIES)} categories...")
            for category_name in CATEGORIES:
                category = Category(name=category_name)
                session.add(category)
                print(f"  ✓ {category_name}")

            await session.commit()
            print("\n✅ Categories inserted successfully!")

        except Exception as e:
            await session.rollback()
            print(f"❌ Error: {e}")
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_categories())
