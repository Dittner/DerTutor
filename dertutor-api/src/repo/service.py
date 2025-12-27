from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.repo.model import Lang, Tag, User, Voc


class InsertDefaultRowsService:
    @classmethod
    async def run(cls, session: AsyncSession, admin_name: str, admin_pwd: str) -> None:
        res = await session.execute(select(Lang))
        if len(res.scalars().all()) == 0:
            await cls.create_superuser(session, admin_name, admin_pwd)
            await cls.create_languages(session)
            await cls.create_de_vocs(session)
            await cls.create_en_vocs(session)
            await cls.create_de_tags(session)
            await cls.create_en_tags(session)
            await session.commit()

    @classmethod
    async def create_superuser(cls, session: AsyncSession, username: str, password: str) -> None:
        session.add(User(username=username, hashed_password=password, is_active=True, is_superuser=True))

    @classmethod
    async def create_languages(cls, session: AsyncSession) -> None:
        session.add(Lang(code='de', name='Deutsch'))
        session.add(Lang(code='en', name='English'))
        await session.flush()

    @classmethod
    async def create_de_vocs(cls, session: AsyncSession) -> None:
        q = select(Lang).where(Lang.code == 'de')
        res = await session.execute(q)
        lang = res.scalar_one_or_none()
        if lang:
            session.add(Voc(lang_id=lang.id, name='Lexikon'))

    @classmethod
    async def create_en_vocs(cls, session: AsyncSession) -> None:
        q = select(Lang).where(Lang.code == 'en')
        res = await session.execute(q)
        lang = res.scalar_one_or_none()
        if lang:
            session.add(Voc(lang_id=lang.id, name='Lexicon'))

    @classmethod
    async def create_en_tags(cls, session: AsyncSession) -> None:
        q = select(Lang).where(Lang.code == 'en')
        res = await session.execute(q)
        lang = res.scalar_one_or_none()
        if lang:
            session.add(Tag(lang_id=lang.id, name='Irregular verbs'))

    @classmethod
    async def create_de_tags(cls, session: AsyncSession) -> None:
        q = select(Lang).where(Lang.code == 'de')
        res = await session.execute(q)
        lang = res.scalar_one_or_none()
        if lang:
            session.add(Tag(lang_id=lang.id, name='Unregelmäßige Verben'))
