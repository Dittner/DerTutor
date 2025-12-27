from src.api.dao import BaseDAO
from src.repo import Voc


class VocsDAO(BaseDAO[Voc]):
    model = Voc
