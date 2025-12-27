from pydantic import BaseModel


class MediaRead(BaseModel):
    uid: str
    note_id: int
    name: str
    media_type: str


class MediaDelete(BaseModel):
    uid: str
