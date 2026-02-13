import logging
from urllib.parse import unquote

import src.context as ctx
from fastapi import APIRouter, Response, status
from fastapi.exceptions import HTTPException
from src.api.corpus.schema import EnRuResponse

router = APIRouter(prefix='', tags=['Corpus'])
log = logging.getLogger('uvicorn')


@router.head('/corpus/de_pron/search')
async def check_de_audio_file(key: str):
    decoded_key = unquote(key)
    if ctx.de_pron_db.has(decoded_key):
        return Response(status_code=status.HTTP_200_OK)
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Audio <{decoded_key}> not found')


@router.get('/corpus/de_pron/search')
async def get_de_audio_file(key: str):
    decoded_key = unquote(key)
    bb = ctx.de_pron_db.read(decoded_key)
    if bb:
        return Response(content=bb, media_type='audio/mpeg')
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Audio <{decoded_key}> not found')


@router.head('/corpus/en_pron/search')
async def check_en_audio_file(key: str):
    decoded_key = unquote(key)
    if ctx.en_pron_db.has(decoded_key):
        return Response(status_code=status.HTTP_200_OK)
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Audio <{decoded_key}> not found')


@router.get('/corpus/en_pron/search')
async def get_en_audio_file(key: str):
    decoded_key = unquote(key)
    bb = ctx.en_pron_db.read(decoded_key)
    if bb:
        return Response(content=bb, media_type='audio/mpeg')
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Audio <{decoded_key}> not found')


@router.head('/corpus/en_ru/search')
async def check_translation(key: str):
    decoded_key = unquote(key)
    if ctx.en_ru_db.has(decoded_key):
        return Response(status_code=status.HTTP_200_OK)
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Translation of <{decoded_key}> not found')


@router.get('/corpus/en_ru/search', response_model=EnRuResponse)
async def get_translation(key: str):
    decoded_key = unquote(key)
    item = ctx.en_ru_db.read(decoded_key)
    if item:
        return item
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Translation of <{decoded_key}> not found')


@router.get('/corpus/de_lemma')
async def get_de_lemma(word: str):
    decoded_word = unquote(word)
    res = ctx.de_tagger.analyze(decoded_word)
    if res and res[0]:
        return res[0]
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f'Taking lemma of <{decoded_word}> has failed'
        )
