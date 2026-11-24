import asyncio
from sqlalchemy import text
from app.database import engine

async def fix_alembic():
    async with engine.begin() as conn:
        # Update the alembic version
        await conn.execute(text("DELETE FROM alembic_version"))
        await conn.execute(text("INSERT INTO alembic_version (version_num) VALUES ('20260416_drop_otp_codes_table')"))
        print('Fixed alembic version')

asyncio.run(fix_alembic())
