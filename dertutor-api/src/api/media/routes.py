import logging
import uuid
from pathlib import Path

import src.context as ctx
from fastapi import APIRouter, Response, UploadFile, status
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
    bb = await file.read()
    # Read the entire file
    # Or, stream the file in chunks:
    # while chunk := await file.read(8192):
    # Process chunk

    p = ctx.local_store_path / 'media' / str(note_id)
    if not p.exists():
        Path.mkdir(p)

    p /= uid
    with p.open('wb') as f:
        f.write(bb)

    return await MediaDAO.add_one(session, name=file.filename, note_id=note_id, uid=uid, media_type=file.content_type)


@router.get('/media/{note_id}/{media_uid}')
async def get_media_file(note_id: int, media_uid: str):
    p = ctx.local_store_path / 'media' / str(note_id) / media_uid
    if p.exists:
        return FileResponse(p.as_posix())
    else:
        return Response(
            content=f'Media <{p.relative_to(ctx.local_store_path).as_posix()}> not found',
            status_code=status.HTTP_404_NOT_FOUND,
        )


@router.delete('/media', response_model=str)
@open_session
@only_superuser
async def delete_media_file(session: AsyncSession, m: MediaDelete):
    item = await MediaDAO.delete_one(session, uid=m.uid)
    p = ctx.local_store_path / 'media' / str(item.note_id) / item.uid
    if p.exists():
        log.info('MediaFile <%s> is deleted', p.as_posix())
        p.unlink()
    return Response(content='deleted', status_code=status.HTTP_200_OK)
