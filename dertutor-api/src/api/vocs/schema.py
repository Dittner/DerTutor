from pydantic import BaseModel


class VocCreate(BaseModel):
    lang_id: int
    name: str


class VocRename(BaseModel):
    id: int
    name: str


class VocRead(BaseModel):
    id: int
    lang_id: int
    name: str


class VocDelete(BaseModel):
    id: int
