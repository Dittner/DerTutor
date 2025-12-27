from pydantic import BaseModel


class TagCreate(BaseModel):
    lang_id: int
    name: str


class TagRename(BaseModel):
    name: str


class TagRead(BaseModel):
    id: int
    lang_id: int
    name: str


class TagDelete(BaseModel):
    id: int
