import logging
from typing import Any

import src.context as ctx
from fastapi import HTTPException, Request, Response, status
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy.ext.asyncio import AsyncSession
from src.api.users.dao import UserDAO
from src.api.users.jwt import JWTParser, TokenName
from src.repo.model import User

log = logging.getLogger('uvicorn')
password_hash = PasswordHash.recommended()

jwt_parser = JWTParser(
    secret_key=ctx.settings.token_secret_key,
    algorithm=ctx.settings.token_algorithm,
    access_expire_in_days=ctx.settings.token_access_expire_days,
    refresh_expire_in_days=ctx.settings.token_refresh_expire_days,
)


def verify_pwd(plain_pwd: str, hashed_pwd: str):
    return password_hash.verify(plain_pwd, hashed_pwd)


def hash_pwd(pwd: str):
    return password_hash.hash(pwd)


def write_tokens(data_to_sign: dict[str, Any], response: Response):
    [access_token, refresh_token] = jwt_parser.encode(data=data_to_sign)
    response.set_cookie(key=TokenName.ACCESS, value=access_token, httponly=True, secure=False, samesite='strict')
    response.set_cookie(key=TokenName.REFRESH, value=refresh_token, httponly=True, secure=False, samesite='strict')


def delete_tokens(response: Response):
    response.delete_cookie(key=TokenName.ACCESS)
    response.delete_cookie(key=TokenName.REFRESH)


async def login(session: AsyncSession, username: str, password: str, response: Response) -> User:
    user = await UserDAO.find_one(session, username=username)
    if not verify_pwd(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Password not valid')

    write_tokens({'sub': str(user.id)}, response)

    return user


def logout(response: Response):
    delete_tokens(response)


async def authorize(session: AsyncSession, request: Request, response: Response) -> User:
    access_token = request.cookies.get(TokenName.ACCESS)
    refresh_token = request.cookies.get(TokenName.REFRESH)
    if not access_token or not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authentication is required')
    try:
        payload = jwt_parser.decode(access_token)
        user_id = payload.get('sub')
    except ExpiredSignatureError:
        try:
            log.info('Access token is expired')
            payload = jwt_parser.decode(refresh_token)
            user_id = payload.get('sub')
            log.info('Updating access and refresh tokens')
            write_tokens({'sub': str(user_id)}, response)
        except ExpiredSignatureError:
            log.info('Refresh token is expired')
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token is expired')
    except InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token: ' + str(e))

    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token: no user_id')

    user = await UserDAO.find_one(session, id=int(user_id))
    if not user.is_active or not user.is_superuser:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Access denied')
    return user
