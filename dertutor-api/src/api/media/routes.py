import logging
import uuid
from pathlib import Path

import src.context as ctx
from fastapi import APIRouter, Response, UploadFile, status
from fastapi.exceptions import HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio.session import AsyncSession
from src.api.decorators import only_superuser, open_session
from src.api.media.dao import MediaDAO
from src.api.media.schema import MediaDelete, MediaRead

router = APIRouter(prefix='', tags=['Media'])
log = logging.getLogger('uvicorn')


@router.get('/media', response_model=list[MediaRead])
@open_session
async def get_all_media_files(session: AsyncSession, note_id: int):
    return await MediaDAO.find_all(session, note_id=note_id)


@router.post('/media/uploadfile', response_model=MediaRead)
@open_session
@only_superuser
async def upload_file(session: AsyncSession, file: UploadFile, note_id: int):
    log.info('Uploading to note.id: %s', note_id)
    uid = str(uuid.uuid4())
    suffix = Path(file.filename).suffix if file.filename else ''
    url = f'/media/{note_id}/{uid}{suffix}'

    bb = await file.read()
    # Read the entire file
    # Or, stream the file in chunks:
    # while chunk := await file.read(8192):
    # Process chunk

    p = ctx.local_store_path / 'media' / str(note_id)
    if not p.exists():
        Path.mkdir(p)

    p = Path(ctx.local_store_path.as_posix() + url)
    log.info('Uploading. storing media file, src: %s', p.as_posix())

    with p.open('wb') as f:
        f.write(bb)

    return await MediaDAO.add_one(
        session, name=file.filename, note_id=note_id, uid=uid, media_type=file.content_type, url=url
    )


@router.get('/media/{note_id}/{media_uid_and_suffix}')
async def get_media_file(note_id: int, media_uid_and_suffix: str):
    p = ctx.local_store_path / 'media' / str(note_id) / media_uid_and_suffix
    if p.exists:
        return FileResponse(p.as_posix())
    else:
        msg = 'Media file not found, url:' + p.relative_to(ctx.local_store_path).as_posix()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)


@router.delete('/media', response_model=str)
@open_session
@only_superuser
async def delete_media_file(session: AsyncSession, m: MediaDelete):
    item = await MediaDAO.delete_one(session, uid=m.uid)
    p = Path(ctx.local_store_path.as_posix() + item.url)
    if p.exists():
        log.info('MediaFile <%s> is deleted', p.as_posix())
        p.unlink()
        return Response(content='deleted', status_code=status.HTTP_200_OK)
    else:
        msg = 'Deleting media file not found, url:' + item.url
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
