import logging
from pathlib import Path

from src.core.database import JsonFileDB, KeyValueDB
from src.session import SessionManager
from src.settings import Settings

log = logging.getLogger('uvicorn')


settings = Settings()
settings.validate()
# log.info(settings)
session_manager = SessionManager(settings.postgres_db_url)

local_store_path = Path('data')
if not local_store_path.exists():
    Path.mkdir(local_store_path)

en_pron_db = KeyValueDB(db_path=Path('data/pron/en_pron.bin'))
de_pron_db = KeyValueDB(db_path=Path('data/pron/de_pron.bin'))
en_ru_db = JsonFileDB(db_path=Path('data/json/en_ru.json'))


def open_session():
    """Use async context manager:

    Import src.context as ctx
    async with ctx.open_session() as session:
        res = session.select(...)
    """
    return session_manager.session_factory()


async def close_all_connections():
    en_pron_db.close()
    de_pron_db.close()
    en_ru_db.close()
    await session_manager.dispose()
