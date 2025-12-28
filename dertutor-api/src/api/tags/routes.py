import logging

from fastapi import APIRouter
from sqlalchemy.ext.asyncio.session import AsyncSession
from src.api.decorators import only_superuser, open_session
from src.api.tags.dao import TagsDAO
from src.api.tags.schema import TagCreate, TagDelete, TagRead, TagRename

router = APIRouter(prefix='', tags=['Tags'])
log = logging.getLogger('uvicorn')


@router.get('/tags', response_model=list[TagRead])
@open_session
async def get_tags(session: AsyncSession, lang_id: int):
    return await TagsDAO.find_all(session, lang_id=lang_id)


@router.post('/tags', response_model=TagRead)
@open_session
@only_superuser
async def create_tag(session: AsyncSession, t: TagCreate):
    return await TagsDAO.add_one(session, **t.model_dump())


@router.patch('/tags/rename', response_model=TagRead)
@open_session
@only_superuser
async def rename_tag(session: AsyncSession, t: TagRename, tag_id: int):
    return await TagsDAO.update_one(session, filter_by_id=tag_id, name=t.name)


@router.delete('/tags', response_model=TagRead)
@open_session
@only_superuser
async def delete_tag(session: AsyncSession, t: TagDelete):
    return await TagsDAO.delete_one(session, id=t.id)
