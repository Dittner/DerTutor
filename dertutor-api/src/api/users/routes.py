import logging

import src.context as ctx
from fastapi import APIRouter, Request, Response
from src.api.users import auth
from src.api.users.dao import UserDAO
from src.api.users.schema import UserAuth, UserRead

router = APIRouter(prefix='', tags=['Auth'])
log = logging.getLogger('uvicorn')


@router.get('/users', response_model=list[UserRead])
async def get_users(request: Request, response: Response):
    async with ctx.open_session() as session:
        await auth.authorize(session, request, response)
        return await UserDAO.find_all(session)


@router.post('/users/register', response_model=UserRead)
async def register_user(data: UserAuth):
    async with ctx.open_session() as session:
        return await UserDAO.add_one(
            session,
            username=data.username,
            hashed_password=auth.hash_pwd(data.password),
            is_active=True,
            is_superuser=False,
        )


@router.post('/users/login', response_model=UserRead)
async def login(user: UserAuth, response: Response):
    async with ctx.open_session() as session:
        return await auth.login(session, user.username, user.password, response)


@router.post('/users/logout')
async def logout(response: Response):
    auth.logout(response)
    return Response(content='success')
