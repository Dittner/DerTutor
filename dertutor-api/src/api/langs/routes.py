import logging

import src.context as ctx
from fastapi import APIRouter
from src.api.langs.dao import LangsDAO
from src.api.langs.schema import LangCreate, LangRead, LangReadFull

router = APIRouter(prefix='', tags=['Languages'])
log = logging.getLogger('uvicorn')


@router.get('/langs', response_model=list[LangRead])
async def get_languages():
    async with ctx.open_session() as session:
        return await LangsDAO.find_all(session)


@router.get('/langs/full', response_model=list[LangReadFull])
async def get_languages_with_vocs_and_tags():
    async with ctx.open_session() as session:
        return await LangsDAO.find_all_includes_vocs_and_tags(session)


@router.post('/langs', response_model=LangRead)
async def create_language(lang: LangCreate):
    async with ctx.open_session() as session:
        return await LangsDAO.add_one(session, **lang.model_dump())
