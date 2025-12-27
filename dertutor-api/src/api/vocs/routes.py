import logging

import src.context as ctx
from fastapi import APIRouter
from src.api.vocs.dao import VocsDAO
from src.api.vocs.schema import VocCreate, VocDelete, VocRead, VocRename

router = APIRouter(prefix='', tags=['Vocs'])
log = logging.getLogger('uvicorn')


@router.get('/vocs', response_model=list[VocRead])
async def get_vocs(lang_id: int):
    async with ctx.open_session() as session:
        return await VocsDAO.find_all(session, lang_id=lang_id)


@router.post('/vocs', response_model=VocRead)
async def create_voc(voc: VocCreate):
    async with ctx.open_session() as session:
        return await VocsDAO.add_one(session, **voc.model_dump())


@router.patch('/vocs/rename', response_model=VocRead)
async def rename_voc(voc: VocRename):
    async with ctx.open_session() as session:
        return await VocsDAO.update_one(session, voc.id, name=voc.name)


@router.delete('/vocs', response_model=VocRead)
async def delete_voc(voc: VocDelete):
    async with ctx.open_session() as session:
        return await VocsDAO.delete_one(session, id=voc.id)
