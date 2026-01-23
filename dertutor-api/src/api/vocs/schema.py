from pydantic import BaseModel


class VocCreate(BaseModel):
    lang_id: int
    name: str
    sort_notes: str
    description: str


class VocRename(BaseModel):
    id: int
    name: str


class VocUpdate(BaseModel):
    id: int
    name: str
    sort_notes: str
    description: str


class VocRead(BaseModel):
    id: int
    lang_id: int
    name: str
    sort_notes: str
    description: str


class VocDelete(BaseModel):
    id: int
