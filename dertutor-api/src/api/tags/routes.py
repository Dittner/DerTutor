import logging

import src.context as ctx
from fastapi import APIRouter
from src.api.tags.dao import TagsDAO
from src.api.tags.schema import TagCreate, TagDelete, TagRead, TagRename

router = APIRouter(prefix='', tags=['Tags'])
log = logging.getLogger('uvicorn')


@router.get('/tags', response_model=list[TagRead])
async def get_tags(lang_id: int):
    async with ctx.open_session() as session:
        return await TagsDAO.find_all(session, lang_id=lang_id)


@router.post('/tags', response_model=TagRead)
async def create_tag(t: TagCreate):
    async with ctx.open_session() as session:
        return await TagsDAO.add_one(session, **t.model_dump())


@router.patch('/tags/{tag_id}/rename', response_model=TagRead)
async def rename_tag(t: TagRename, tag_id: int):
    async with ctx.open_session() as session:
        return await TagsDAO.update_one(session, filter_by_id=tag_id, name=t.name)


@router.delete('/tags', response_model=TagRead)
async def delete_tag(t: TagDelete):
    async with ctx.open_session() as session:
        return await TagsDAO.delete_one(session, id=t.id)
