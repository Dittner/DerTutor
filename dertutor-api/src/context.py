import logging
from pathlib import Path

from HanTa import HanoverTagger as ht

from src.core.database import JsonFileDB
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

pron_path = Path('data/pron')
if not pron_path.exists():
    Path.mkdir(pron_path)

de_pron_path = Path('data/pron/de')
if not de_pron_path.exists():
    Path.mkdir(de_pron_path)

en_pron_path = Path('data/pron/en')
if not en_pron_path.exists():
    Path.mkdir(en_pron_path)

en_ru_db = JsonFileDB(db_path=Path('data/json/en_ru.json'))

de_tagger = ht.HanoverTagger('morphmodel_ger.pgz')


async def close_all_connections():
    en_ru_db.close()
    await session_manager.dispose()
