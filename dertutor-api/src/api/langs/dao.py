from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.orm.strategy_options import selectinload
from src.api.dao import BaseDAO
from src.repo import Lang


class LangsDAO(BaseDAO[Lang]):
    model = Lang

    @classmethod
    async def find_all_includes_vocs_and_tags(cls, session: AsyncSession) -> list[Lang]:
        q = select(Lang).options(selectinload(Lang.vocs), selectinload(Lang.tags))
        res = await session.execute(q)
        return list(res.unique().scalars().all())
