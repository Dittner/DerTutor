import logging

from fastapi import APIRouter
from sqlalchemy.ext.asyncio.session import AsyncSession
from src.api.decorators import only_superuser, open_session
from src.api.vocs.dao import VocsDAO
from src.api.vocs.schema import VocCreate, VocDelete, VocRead, VocRename, VocReorder, VocUpdate

router = APIRouter(prefix='', tags=['Vocs'])
log = logging.getLogger('uvicorn')


@router.get('/vocs', response_model=list[VocRead])
@open_session
async def get_vocs(session: AsyncSession, lang_id: int):
    return await VocsDAO.find_all(session, ['name'], lang_id=lang_id)


@router.post('/vocs', response_model=VocRead)
@open_session
@only_superuser
async def create_voc(session: AsyncSession, voc: VocCreate):
    return await VocsDAO.add_one(session, **voc.model_dump())


@router.patch('/vocs/rename', response_model=VocRead)
@open_session
@only_superuser
async def rename_voc(session: AsyncSession, voc: VocRename):
    return await VocsDAO.update_one(session, voc.id, name=voc.name)


@router.patch('/vocs/reorder', response_model=VocRead)
@open_session
@only_superuser
async def reorder_voc(session: AsyncSession, voc: VocReorder):
    return await VocsDAO.update_one(session, voc.id, order=voc.order)


@router.put('/vocs', response_model=VocRead | None)
@open_session
@only_superuser
async def update_note(session: AsyncSession, voc: VocUpdate):
    return await VocsDAO.update_one(session, voc.id, **voc.model_dump())


@router.delete('/vocs', response_model=VocRead)
@open_session
@only_superuser
async def delete_voc(session: AsyncSession, voc: VocDelete):
    return await VocsDAO.delete_one(session, id=voc.id)
