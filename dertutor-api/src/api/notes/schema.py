from pydantic import BaseModel


class NoteCreate(BaseModel):
    lang_id: int
    voc_id: int
    name: str
    text: str
    audio_url: str
    level: int | None = None
    tag_id: int | None = None


class NoteUpdate(BaseModel):
    id: int
    voc_id: int
    name: str
    text: str
    audio_url: str
    level: int | None = None
    tag_id: int | None = None


class NoteRename(BaseModel):
    id: int
    name: str


class NoteRead(BaseModel):
    id: int
    lang_id: int
    voc_id: int
    name: str
    text: str
    audio_url: str
    level: int | None = None
    tag_id: int | None = None

    class Config:
        orm_mode = True


class Page[T](BaseModel):
    items: list[T]
    total: int
    page: int
    pages: int
    size: int


class MediaRead(BaseModel):
    uid: str
    note_id: int
    name: str
    media_type: str


class NoteReadFull(BaseModel):
    id: int
    lang_id: int
    voc_id: int
    name: str
    text: str
    audio_url: str
    level: int | None = None
    tag_id: int | None = None
    media: list[MediaRead]


class NoteDelete(BaseModel):
    id: int
