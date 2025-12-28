from src.api.dao import BaseDAO
from src.repo.model import Tag


class TagsDAO(BaseDAO[Tag]):
    model = Tag
