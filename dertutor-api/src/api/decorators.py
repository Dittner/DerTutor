import inspect
import logging
from collections.abc import Callable

import src.context as ctx
from fastapi import Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from src.api.users import auth
from src.repo import User

log = logging.getLogger('uvicorn')


def open_session(decorated_fn: Callable):
    decorated_fn_sig = inspect.signature(decorated_fn)
    session_param_name = ''
    for p in decorated_fn_sig.parameters.values():
        if p.annotation is AsyncSession:
            session_param_name = p.name
            break

    if not session_param_name:
        log.warning(
            'Decorator @open_session is declared, but decorated func <%s> does not use a session param',
            decorated_fn.__name__,
        )

    async def wrapper(*args, **kwargs):
        async with ctx.session_manager.session_factory() as session:
            if session_param_name:
                kwargs[session_param_name] = session
            return await decorated_fn(*args, **kwargs)

    wrapper.__signature__ = inspect.Signature(
        parameters=[*filter(lambda p: p.annotation is not AsyncSession, decorated_fn_sig.parameters.values())],
        return_annotation=decorated_fn_sig.return_annotation,
    )
    return wrapper


def only_superuser(decorated_fn: Callable):
    """Authorization of superuser is requered to access a requested resource

    Decorator func expects AsyncSession as param, therefore use it with open_session decorator

    e.g.::

        @router.get('/orders')
        @open_session
        @only_superuser
        async def get_orders(session: AsyncSession):
            return await OrderDAO.find_all(session)

    """
    decorated_fn_sig = inspect.signature(decorated_fn)

    async def wrapper(session: AsyncSession, request: Request, response: Response, *args, **kwargs):
        user = await auth.authorize(session, request, response)

        for name, param in decorated_fn_sig.parameters.items():
            if param.annotation is Request:
                kwargs[name] = request
            elif param.annotation is Response:
                kwargs[name] = response
            elif param.annotation is AsyncSession:
                kwargs[name] = session
            elif param.annotation is User:
                kwargs[name] = user

        return await decorated_fn(*args, **kwargs)

    wrapper.__signature__ = inspect.Signature(
        parameters=[
            # Use all parameters from decorated_fn excluding Request, Response and AsyncSession
            *filter(
                lambda p: p.annotation not in (Request, Response, AsyncSession, User),
                decorated_fn_sig.parameters.values(),
            ),
            # Skip *args and **kwargs from wrapper parameters:
            *filter(
                lambda p: p.kind not in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD),
                inspect.signature(wrapper).parameters.values(),
            ),
        ],
        return_annotation=decorated_fn_sig.return_annotation,
    )

    return wrapper
