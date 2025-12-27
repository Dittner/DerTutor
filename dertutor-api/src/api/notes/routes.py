import logging
import shutil
from typing import Annotated

import src.context as ctx
from fastapi import APIRouter, Query
from sqlalchemy import event
from src.api.notes.dao import NotesDAO, Page, SearchParams
from src.api.notes.schema import NoteCreate, NoteDelete, NoteRead, NoteReadFull, NoteRename, NoteUpdate
from src.repo.model import Note

router = APIRouter(prefix='', tags=['Notes'])
log = logging.getLogger('uvicorn')


@event.listens_for(Note, 'before_delete')
def receive_before_delete(mapper, connection, target):
    if isinstance(target, Note):
        p = ctx.local_store_path / 'media' / str(target.id)
        if p.exists():
            shutil.rmtree(p.absolute().as_posix())
            log.info('All MediaFiles of note with id: <%s> are deleted', p.as_posix())


@router.post('/notes', response_model=NoteRead)
async def create_note(note: NoteCreate):
    async with ctx.open_session() as session:
        return await NotesDAO.add_one(session, **note.model_dump())


@router.get('/notes', response_model=NoteReadFull | None)
async def get_note(note_id: int):
    async with ctx.open_session() as session:
        return await NotesDAO.find_one_or_none(session, id=note_id)


@router.put('/notes', response_model=NoteRead | None)
async def update_note(note: NoteUpdate):
    async with ctx.open_session() as session:
        return await NotesDAO.update_one(session, note.id, **note.model_dump())


@router.patch('/notes/rename', response_model=NoteRead | None)
async def rename_note(note: NoteRename):
    async with ctx.open_session() as session:
        return await NotesDAO.update_one(session, note.id, name=note.name)


@router.get('/notes/search', response_model=Page[NoteRead])
async def search_notes(params: Annotated[SearchParams, Query()]):
    async with ctx.open_session() as session:
        return await NotesDAO.search_notes(session, params)


@router.delete('/notes', response_model=NoteRead | None)
async def delete_note(note: NoteDelete):
    async with ctx.open_session() as session:
        return await NotesDAO.delete_one(session, id=note.id)
