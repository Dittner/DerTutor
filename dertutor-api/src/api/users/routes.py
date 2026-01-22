import logging

from fastapi import APIRouter, Response
from sqlalchemy.ext.asyncio import AsyncSession
from src.api.decorators import only_superuser, open_session
from src.api.users import auth
from src.api.users.dao import UserDAO
from src.api.users.schema import UserAuth, UserRead
from src.repo import User

router = APIRouter(prefix='', tags=['Auth'])
log = logging.getLogger('uvicorn')


@router.get('/users', response_model=list[UserRead])
@open_session
@only_superuser
async def get_users(session: AsyncSession):
    return await UserDAO.find_all(session, ['id'])


@router.get('/users/me', response_model=UserRead)
@open_session
@only_superuser
async def get_me(user: User):
    return user


@router.post('/users/register', response_model=UserRead)
@open_session
@only_superuser
async def register_user(session: AsyncSession, data: UserAuth):
    return await UserDAO.add_one(
        session,
        username=data.username,
        hashed_password=auth.hash_pwd(data.password),
        is_active=True,
        is_superuser=False,
    )


@router.post('/users/auth', response_model=UserRead)
@open_session
async def login(session: AsyncSession, user: UserAuth, response: Response):
    return await auth.login(session, user.username, user.password, response)


@router.post('/users/logout')
async def logout(response: Response):
    auth.logout(response)
    return {'message': 'Logged out'}
