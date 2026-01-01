import logging

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

log = logging.getLogger('uvicorn')


class BaseDAO[T]:
    model: type[T]

    @classmethod
    async def add_one(cls, session: AsyncSession, **fields: str | int | bool | None) -> T:
        try:
            new_instance = cls.model(**fields)
            session.add(new_instance)
            await session.commit()
            return new_instance
        except IntegrityError as e:
            await session.rollback()
            if 'UniqueViolationError' in str(e.orig):
                log.info('UniqueViolationError catched: %s', e)
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=cls.model.__name__ + ' already exists')
            log.info('Error inserting item: %s', e.orig)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e.orig))

    @classmethod
    async def find_one_or_none(cls, session: AsyncSession, **filter_by: str | int | bool) -> T | None:
        query = select(cls.model).filter_by(**filter_by)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def find_one(cls, session: AsyncSession, **filter_by: str | int | bool) -> T:
        instance = await cls.find_one_or_none(session, **filter_by)
        if instance:
            return instance
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=cls.model.__name__ + ' not found')

    @classmethod
    async def find_all(cls, session: AsyncSession, **filter_by: str | int | bool) -> list[T]:
        query = select(cls.model).filter_by(**filter_by)
        result = await session.execute(query)
        return list(result.scalars().all())

    @classmethod
    async def update_one(cls, session: AsyncSession, filter_by_id: int, **fields: str | int | bool | None) -> T:
        try:
            instance = await cls.find_one(session, id=filter_by_id)
            for k, v in fields.items():
                setattr(instance, k, v)
            await session.commit()
            return instance
        except SQLAlchemyError as e:
            await session.rollback()
            raise e

    @classmethod
    async def delete_one(cls, session: AsyncSession, **filter_by: str | int | bool) -> T:
        try:
            instance = await cls.find_one(session, **filter_by)
            await session.delete(instance)
            await session.commit()
            return instance
        except SQLAlchemyError as e:
            await session.rollback()
            raise e
