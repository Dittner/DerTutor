import logging
from urllib.parse import unquote

import src.context as ctx
from fastapi import APIRouter, Response, status
from fastapi.exceptions import HTTPException
from src.api.corpus.de_abbyy import load_translation
from src.api.corpus.duden import load_and_store_audio_file
from src.api.corpus.schema import DeRuResponse, EnRuResponse, LoadAudioFromDudenResponse
from src.api.decorators import only_superuser, open_session

router = APIRouter(prefix='', tags=['Corpus'])
log = logging.getLogger('uvicorn')


@router.head('/corpus/de_pron/search')
async def check_de_audio_file(key: str):
    decoded_key = unquote(key)
    p = ctx.de_pron_path / (decoded_key + '.mp3')
    if p.exists():
        return Response(status_code=status.HTTP_200_OK)
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Audio <{decoded_key}> not found')


@router.get('/corpus/de_pron/search')
async def get_de_audio_file(key: str):
    decoded_key = unquote(key)
    p = ctx.de_pron_path / (decoded_key + '.mp3')
    if p.exists():
        return Response(content=p.read_bytes(), media_type='audio/mpeg')
    else:
        print(f'Audio not found: {p.as_posix()}')
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Audio <{decoded_key}> not found')


@router.post('/corpus/de_pron/load_from_duden', response_model=LoadAudioFromDudenResponse)
@open_session
@only_superuser
async def load_and_store_audio_file_from_duden(key: str):
    word = unquote(key)
    p = ctx.de_pron_path / (word + '.mp3')
    successed_responce = {'key': key, 'url': '/corpus/de_pron/search?key=' + key}
    if p.exists():
        return successed_responce
    else:
        try:
            mp3_url = await load_and_store_audio_file(word)
        except:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Failed to load audio of <{word}>')

        if mp3_url == '':
            print(f'Audio not found: {p.as_posix()}')
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Audio <{word}> not found')
        print(f'load_and_store_audio_file_from_duden, 200: {mp3_url}')
        return successed_responce


@router.head('/corpus/en_pron/search')
async def check_en_audio_file(key: str):
    decoded_key = unquote(key)
    p = ctx.en_pron_path / (decoded_key + '.mp3')
    if p.exists():
        return Response(status_code=status.HTTP_200_OK)
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Audio <{decoded_key}> not found')


@router.get('/corpus/en_pron/search')
async def get_en_audio_file(key: str):
    decoded_key = unquote(key)
    p = ctx.en_pron_path / (decoded_key + '.mp3')
    if p.exists():
        return Response(content=p.read_bytes(), media_type='audio/mpeg')
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
async def get_en_translation(key: str):
    decoded_key = unquote(key)
    item = ctx.en_ru_db.read(decoded_key)
    if item:
        return item
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Translation of <{decoded_key}> not found')


@router.get('/corpus/de_ru/search', response_model=DeRuResponse)
async def get_de_translation(key: str):
    decoded_key = unquote(key)
    try:
        translation = await load_translation(decoded_key)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f'Failed to load translation of <{decoded_key}>'
        )

    if translation == '':
        print(f'Translation not found: {decoded_key}')
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Translation of <{decoded_key}> not found')
    return {'key': key, 'text': translation}


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
