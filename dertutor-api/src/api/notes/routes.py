import logging
import shutil
from typing import Annotated

import src.context as ctx
from fastapi import APIRouter, Query
from sqlalchemy import event
from sqlalchemy.ext.asyncio.session import AsyncSession
from src.api.decorators import only_superuser, open_session
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


@router.get('/notes', response_model=NoteReadFull | None)
@open_session
async def get_note(session: AsyncSession, note_id: int):
    return await NotesDAO.find_one_or_none_with_media(session, id=note_id)


@router.get('/notes/search', response_model=Page[NoteRead])
@open_session
async def search_notes(session: AsyncSession, params: Annotated[SearchParams, Query()]):
    return await NotesDAO.search_notes(session, params)


@router.post('/notes', response_model=NoteRead)
@open_session
@only_superuser
async def create_note(session: AsyncSession, note: NoteCreate):
    return await NotesDAO.add_one(session, **note.model_dump())


@router.put('/notes', response_model=NoteRead | None)
@open_session
@only_superuser
async def update_note(session: AsyncSession, note: NoteUpdate):
    return await NotesDAO.update_one(session, note.id, **note.model_dump())


@router.patch('/notes/rename', response_model=NoteRead | None)
@open_session
@only_superuser
async def rename_note(session: AsyncSession, note: NoteRename):
    return await NotesDAO.update_one(session, note.id, name=note.name)


@router.delete('/notes', response_model=NoteRead | None)
@open_session
@only_superuser
async def delete_note(session: AsyncSession, note: NoteDelete):
    return await NotesDAO.delete_one(session, id=note.id)
