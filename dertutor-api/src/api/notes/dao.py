import math
from typing import Any

import sqlalchemy
from pydantic.fields import Field
from pydantic.main import BaseModel
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.orm.strategy_options import selectinload
from src.api.dao import BaseDAO
from src.api.notes.schema import Page
from src.repo import Note


class SearchParams(BaseModel):
    lang_id: int
    size: int = Field(50, gt=0, le=100, description='Limit of items to return (1-100)')
    page: int = Field(1, ge=1, description='Offset for pagination')
    key: str | None = Field(None, min_length=2, description='Search key')
    voc_id: int | None = Field(None, ge=1)
    level: int | None = Field(None, ge=1)
    tag_id: int | None = Field(None, ge=1)


class NotesDAO(BaseDAO[Note]):
    model = Note

    @classmethod
    async def find_one_or_none_with_media(cls, session: AsyncSession, **filter_by: str | int | bool) -> Note | None:
        query = sqlalchemy.select(Note).filter_by(**filter_by).options(selectinload(Note.media))
        result = await session.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def search_notes(cls, session: AsyncSession, params: SearchParams) -> Page[Any]:
        count_result = await session.execute(cls.search_query(params=params, count=True))
        total_items = count_result.scalars().one()

        select_result = await session.execute(cls.search_query(params=params, count=False))
        items = [row._mapping for row in select_result]
        return Page(
            items=items,
            total=total_items,
            page=params.page,
            pages=math.ceil(total_items / params.size),
            size=params.size,
        )

    @classmethod
    def search_query(cls, params: SearchParams, count: bool) -> sqlalchemy.TextClause:
        select_from_notes = 'SELECT * FROM notes'
        count_from_notes = 'SELECT COUNT(*) FROM notes'

        filters = f"""
            WHERE lang_id = :lang_id
            {"AND (name ILIKE '%' || :key || '%' OR text ILIKE '%' || :key || '%')" if params.key else ''}
            {'AND voc_id = :voc_id' if params.voc_id else ''}
            {'AND level = :level' if params.level else ''}
            {'AND tag_id = :tag_id' if params.tag_id else ''}
            """

        sort_and_paginate = f"""
            ORDER BY
                {
            '''
                CASE
                    WHEN POSITION(:key IN name) = 1 THEN 0
                    WHEN POSITION(:key IN name) > 1 THEN 1
                    ELSE 2
                END ASC,
                '''
            if params.key
            else ''
        }
                id DESC
            LIMIT :limit
            OFFSET :offset;
            """

        ss = [count_from_notes, filters] if count else [select_from_notes, filters, sort_and_paginate]

        pp = {
            'lang_id': params.lang_id,
            'key': params.key,
            'voc_id': params.voc_id,
            'level': params.level,
            'tag_id': params.tag_id,
        }

        if not count:
            pp['limit'] = params.size
            pp['offset'] = params.size * (params.page - 1)
        pp = {k: v for k, v in pp.items() if v is not None}

        return sqlalchemy.text('\n'.join(ss)).bindparams(**pp)
