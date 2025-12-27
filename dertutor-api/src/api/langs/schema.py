from pydantic import BaseModel


class LangCreate(BaseModel):
    code: str
    name: str


class LangRead(BaseModel):
    id: int
    code: str
    name: str


class LangDelete(BaseModel):
    id: int


class VocRead(BaseModel):
    id: int
    lang_id: int
    name: str


class TagRead(BaseModel):
    id: int
    lang_id: int
    name: str


class LangReadFull(BaseModel):
    id: int
    code: str
    name: str
    vocs: list[VocRead]
    tags: list[TagRead]
