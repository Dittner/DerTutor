import logging

from fastapi import APIRouter
from sqlalchemy.ext.asyncio.session import AsyncSession
from src.api.decorators import only_superuser, open_session
from src.api.langs.dao import LangsDAO
from src.api.langs.schema import LangCreate, LangRead, LangReadFull

router = APIRouter(prefix='', tags=['Languages'])
log = logging.getLogger('uvicorn')


@router.get('/langs', response_model=list[LangRead])
@open_session
async def get_languages(session: AsyncSession):
    return await LangsDAO.find_all(session)


@router.get('/langs/full', response_model=list[LangReadFull])
@open_session
async def get_languages_with_vocs_and_tags(session: AsyncSession):
    return await LangsDAO.find_all_includes_vocs_and_tags(session)


@router.post('/langs', response_model=LangRead)
@open_session
@only_superuser
async def create_language(session: AsyncSession, lang: LangCreate):
    return await LangsDAO.add_one(session, **lang.model_dump())
