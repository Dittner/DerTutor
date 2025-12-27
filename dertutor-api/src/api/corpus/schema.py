from pydantic import BaseModel


class EnRuExample(BaseModel):
    en: str
    ru: str


class EnRuResponse(BaseModel):
    key: str
    description: str
    examples: list[EnRuExample]
