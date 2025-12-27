import sys

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    postgres_db_url: str = ''
    token_secret_key: str = ''
    token_algorithm: str = ''
    token_access_expire_days: int = 0
    token_refresh_expire_days: int = 0
    connect_en_ru_db: bool = False
    connect_en_pron_db: bool = False
    connect_de_pron_db: bool = False

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
    )

    def validate(self):
        if not self.postgres_db_url:
            sys.exit('Settings.postgres_db_url not specified')
        elif not self.token_secret_key:
            sys.exit('Settings.token_secret_key not specified')
        elif self.token_access_expire_days == 0:
            sys.exit('Settings.token_access_expire_days not specified')
        elif self.token_refresh_expire_days == 0:
            sys.exit('Settings.token_refresh_expire_days not specified')
        elif self.token_refresh_expire_days <= self.token_access_expire_days:
            sys.exit('Settings.token_refresh_expire_days < Settings.token_access_expire_days')
