import inspect
import logging
from collections.abc import Callable

import src.context as ctx
from fastapi import Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from src.api.users import auth

log = logging.getLogger('uvicorn')


def open_session(decorated_func: Callable):
    decorated_func_sig = inspect.signature(decorated_func)
    is_session_param_found = any(p.annotation is AsyncSession for p in decorated_func_sig.parameters.values())
    if not is_session_param_found:
        log.warning(
            'Decorator @open_session is declared, but decorated func <%s> does not use a session param',
            decorated_func.__name__,
        )

    async def wrapper(*args, **kwargs):
        if is_session_param_found:
            async with ctx.session_manager.session_factory() as session:
                return await decorated_func(session, *args, **kwargs)
        else:
            return await decorated_func(*args, **kwargs)

    wrapper.__signature__ = inspect.Signature(
        parameters=[*filter(lambda p: p.annotation is not AsyncSession, decorated_func_sig.parameters.values())],
        return_annotation=decorated_func_sig.return_annotation,
    )
    return wrapper


def only_superuser(decorated_func: Callable):
    """Authorization of superuser is requered to access a requested resource

    Decorator func expects AsyncSession as param, therefore use it with open_session decorator

    e.g.::

        @router.get('/orders')
        @open_session
        @only_superuser
        async def get_orders(session: AsyncSession):
            return await OrderDAO.find_all(session)

    """
    decorated_func_sig = inspect.signature(decorated_func)

    async def wrapper(session: AsyncSession, request: Request, response: Response, *args, **kwargs):
        await auth.authorize(session, request, response)

        for name, param in decorated_func_sig.parameters.items():
            if param.annotation is Request:
                kwargs[name] = request
            elif param.annotation is Response:
                kwargs[name] = response
            elif param.annotation is AsyncSession:
                kwargs[name] = session

        return await decorated_func(*args, **kwargs)

    wrapper.__signature__ = inspect.Signature(
        parameters=[
            # Use all parameters from decorated_func excluding Request, Response and AsyncSession
            *filter(
                lambda p: p.annotation not in (Request, Response, AsyncSession),
                decorated_func_sig.parameters.values(),
            ),
            # Skip *args and **kwargs from wrapper parameters:
            *filter(
                lambda p: p.kind not in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD),
                inspect.signature(wrapper).parameters.values(),
            ),
        ],
        return_annotation=decorated_func_sig.return_annotation,
    )

    return wrapper
