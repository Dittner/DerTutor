import sys

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


class SessionManager:
    def __init__(self, postgres_db_url: str) -> None:
        if not postgres_db_url:
            sys.exit('postgres_db_url env not specified')

        self.postgres_db_url = postgres_db_url

        self.engine: AsyncEngine = create_async_engine(
            url=postgres_db_url,
            echo=False,
            echo_pool=False,
            pool_size=20,
            max_overflow=10,
        )
        self.session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    async def dispose(self) -> None:
        await self.engine.dispose()
        print('Database engine disposed')
