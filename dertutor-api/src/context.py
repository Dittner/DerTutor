import logging
from pathlib import Path

from HanTa import HanoverTagger as ht
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

media_path = Path('data/media')
if not media_path.exists():
    Path.mkdir(media_path)

en_pron_db = KeyValueDB(db_path=Path('data/pron/en_pron.bin'))
de_pron_db = KeyValueDB(db_path=Path('data/pron/de_pron.bin'))
en_ru_db = JsonFileDB(db_path=Path('data/json/en_ru.json'))

de_tagger = ht.HanoverTagger('morphmodel_ger.pgz')


async def close_all_connections():
    en_pron_db.close()
    de_pron_db.close()
    en_ru_db.close()
    await session_manager.dispose()
