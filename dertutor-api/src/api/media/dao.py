import logging

from src.api.dao import BaseDAO
from src.repo.model import Media

log = logging.getLogger('uvicorn')


class MediaDAO(BaseDAO[Media]):
    model = Media
