from datetime import UTC, datetime, timedelta
from enum import StrEnum
from typing import Any

import jwt

type Token = str


class TokenName(StrEnum):
    ACCESS = 'access_token'
    REFRESH = 'refresh_token'


class JWTParser:
    def __init__(
        self, secret_key: str, algorithm: str, access_expire_in_days: int, refresh_expire_in_days: int
    ) -> None:
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_expire_in_days = access_expire_in_days
        self.refresh_expire_in_days = refresh_expire_in_days

    def encode(self, data: dict) -> tuple[Token, Token]:
        access = data.copy()
        refresh = data.copy()

        now = datetime.now(UTC)
        access.update({'exp': now + timedelta(days=self.access_expire_in_days)})
        refresh.update({'exp': now + timedelta(days=self.refresh_expire_in_days)})
        a = jwt.encode(access, self.secret_key, self.algorithm)
        r = jwt.encode(refresh, self.secret_key, self.algorithm)
        return a, r

    def decode(self, token: Token) -> dict[str, Any]:
        return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
