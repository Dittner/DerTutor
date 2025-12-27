from src.api.dao import BaseDAO
from src.repo.model import User


class UserDAO(BaseDAO[User]):
    model = User
