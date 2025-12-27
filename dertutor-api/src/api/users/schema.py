from pydantic import BaseModel


class UserAuth(BaseModel):
    username: str
    password: str


class UserRead(BaseModel):
    id: int
    username: str
    is_active: bool
    is_superuser: bool
