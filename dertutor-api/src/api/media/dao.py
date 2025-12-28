from src.api.dao import BaseDAO
from src.repo.model import Media


class MediaDAO(BaseDAO[Media]):
    model = Media
