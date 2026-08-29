import re
from typing import Any

import aiohttp
import src.context as ctx

DWDS_BASE_URL = 'https://www.dwds.de'
HEADERS = {
    'Referer': DWDS_BASE_URL,
    'User-Agent': 'Mozilla/5.1 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/536.36 (KHTML, like Gecko) Chrome/145.1.2.0 Safari/537.38',
}


async def _fetch(
    session: aiohttp.ClientSession,
    url: str,
    as_json: bool = False,
    headers: Any | None = None,
    cookies: Any | None = None,
) -> Any | None:
    timeout_sec = aiohttp.ClientTimeout(total=10)

    async with session.get(url, timeout=timeout_sec, cookies=cookies, headers=headers) as response:
        response.raise_for_status()
        if as_json:
            res = await response.json()
        else:
            res = await response.text()

        # print(f'<== {response.status}, headers: {response.headers}, url:{url}')
        if response.status == 200:
            print(f'    200: {url}')
            return res
        elif response.status == 202:
            print(f'    <== 202: url:{url}')
        else:
            print(f'    <== {response.status}: Failed, url:{url}')
    return None


async def load_and_store_audio_file(word: str):
    async with aiohttp.ClientSession() as session:
        duden_word = (
            word.replace('ß', 'sz')
            .replace('ü', 'ue')
            .replace('ä', 'ae')
            .replace('ö', 'oe')
            .replace('Ü', 'Ue')
            .replace('Ä', 'Ae')
            .replace('Ö', 'Oe')
        )
        url = 'https://www.duden.de/rechtschreibung/' + duden_word
        payload = await _fetch(session, url, as_json=False, headers=HEADERS)
        if not payload:
            return ''

        mp3_url_match_result = re.search(r'cdn.duden.de\/_media_\/audio\/(ID\d+_\d+).mp3', payload)
        if mp3_url_match_result:
            mp3_url = 'https://cdn.duden.de/_media_/audio/' + mp3_url_match_result.group(1) + '.mp3'
        else:
            return ''

        store_mp3_file_path = ctx.local_store_path / 'pron' / 'de' / (word + '.mp3')
        if store_mp3_file_path.exists():
            print(f'    File:{word + ".mp3"} already exists')
        else:
            async with session.get(mp3_url) as response:
                response.raise_for_status()
                bb = await response.read()
                if response.status == 200:
                    f = store_mp3_file_path.open('wb')
                    f.write(bb)
                    f.close()
                    return mp3_url
    return ''
