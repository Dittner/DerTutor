import logging

from src.api.dao import BaseDAO
from src.repo.model import Tag

log = logging.getLogger('uvicorn')


class TagsDAO(BaseDAO[Tag]):
    pass
