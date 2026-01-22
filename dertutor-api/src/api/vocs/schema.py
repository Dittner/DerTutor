from pydantic import BaseModel


class VocCreate(BaseModel):
    lang_id: int
    name: str
    order: int
    description: str


class VocRename(BaseModel):
    id: int
    name: str


class VocReorder(BaseModel):
    id: int
    order: int


class VocUpdate(BaseModel):
    id: int
    order: int
    name: str
    description: str


class VocRead(BaseModel):
    id: int
    lang_id: int
    name: str
    order: int
    description: str


class VocDelete(BaseModel):
    id: int
