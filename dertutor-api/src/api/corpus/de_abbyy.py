import re
from typing import Any

import aiohttp

ABBYY_BASE_URL = 'https://www.lingvolive.com/ru-ru/translate/de-ru/'
DWDS_BASE_URL = 'https://www.dwds.de'
irregular_verbs = [
    'schwinden',
    'scheißen',
    'bersten',
    'stecken',
    'klimmen',
    'weisen',
    'mahlen',
    'saugen',
    'schelten',
    'triefen',
    'glimmen',
    'rinnen',
    'schlingen',
    'genesen',
    'zeihen',
    'schwellen',
    'kneifen',
    'weben',
    'speien',
    'preisen',
    'saufen',
    'schmeißen',
    'gären',
    'sprießen',
    'winden',
    'bergen',
    'fechten',
    'scheren',
    'trügen',
    'stinken',
    'blasen',
    'beginnen',
    'schwören',
    'quellen',
    'sinnen',
    'graben',
    'schmelzen',
    'stechen',
    'ringen',
    'hauen',
    'schwingen',
    'kriechen',
    'fliehen',
    'flechten',
    'wenden',
    'klingen',
    'sinken',
    'stoßen',
    'heben',
    'treiben',
    'fließen',
    'gewinnen',
    'gießen',
    'winken',
    'spinnen',
    'zwingen',
    'werfen',
    'wachsen',
    'steigen',
    'pflegen',
    'brennen',
    'schlagen',
    'riechen',
    'fangen',
    'reiben',
    'gelingen',
    'schwimmen',
    'schaffen',
    'stehlen',
    'schallen',
    'fahren',
    'werben',
    'backen',
    'gelten',
    'messen',
    'waschen',
    'treten',
    'empfehlen',
    'ziehen',
    'tragen',
    'laden',
    'lassen',
    'fressen',
    'braten',
    'raten',
    'leihen',
    'müssen',
    'sollen',
    'dürfen',
    'können',
    'wissen',
    'senden',
    'rennen',
    'nennen',
    'kennen',
    'denken',
    'bringen',
    'werden',
    'haben',
    'sein',
    'tun',
    'stehen',
    'kommen',
    'gehen',
    'rufen',
    'laufen',
    'heißen',
    'hängen',
    'fallen',
    'halten',
    'schlafen',
    'lügen',
    'sitzen',
    'liegen',
    'bitten',
    'essen',
    'geben',
    'geschehen',
    'lesen',
    'sehen',
    'vergessen',
    'gebären',
    'brechen',
    'helfen',
    'nehmen',
    'sprechen',
    'sterben',
    'treffen',
    'binden',
    'dringen',
    'finden',
    'singen',
    'springen',
    'trinken',
    'biegen',
    'bieten',
    'fliegen',
    'frieren',
    'genießen',
    'schieben',
    'schießen',
    'schließen',
    'verlieren',
    'wiegen',
    'bleiben',
    'scheiden',
    'scheinen',
    'schreiben',
    'schreien',
    'schweigen',
    'verzeihen',
    'mögen',
    'wollen',
    'weichen',
    'streiten',
    'streichen',
    'schreiten',
    'schneiden',
    'schleifen',
    'schleichen',
    'reiten',
    'reißen',
    'pfeifen',
    'leiden',
    'greifen',
    'gleiten',
    'gleichen',
    'beißen',
]


HEADERS = {
    'Referer': DWDS_BASE_URL,
    'User-Agent': 'Mozilla/5.1 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/536.36 (KHTML, like Gecko) Chrome/145.1.2.0 Safari/537.38',
}


async def load_translation(word: str):
    async with aiohttp.ClientSession() as session:
        translation = await _load_translation_from_abbyy(session, word)

        url = DWDS_BASE_URL + '/wb/' + word
        payload = await _fetch(session, url, as_json=False, headers=HEADERS)
        if not payload:
            return word + '\n' + translation

        title = ''
        title_index = 0
        while title_index != -1:
            title_index = payload.find('<h1 class="dwdswb-ft-lemmaansatz">', title_index + 1)
            if title_index != -1:
                # await load_mp3(session, payload[title_index:], word)
                title += _parse_word(payload[title_index:], word, irregular_verbs) + '\n'

        if title:
            return '# ' + title + translation
        else:
            return '# ' + word + '\n' + translation
    return ''


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


def _read_trans_from_abbyy(value: str, word: str) -> str:
    res = ''
    title_checked = False
    if value:
        begin_index = value.find('<div name="#dictionary"')
        if begin_index == -1:
            print('    ABBYY: begin_index == -1')
            return ''

        end_limit = value.find('<div name="#addcard"', begin_index)
        if end_limit == -1:
            print('    ABBYY: end_limit == -1')
            return ''

        h1_title_begin_index = value.find('<h1 ', begin_index, end_limit)
        if h1_title_begin_index == -1:
            print('    ABBYY: h1_title_begin_index == -1')
            return ''

        h1_title_end_index = value.find('</h1>', h1_title_begin_index, end_limit)
        if h1_title_end_index == -1:
            print('    ABBYY: h1_title_end_index == -1')
            return ''

        trans_begin_index = h1_title_end_index
        trans_end_index = value.find('</div>', trans_begin_index, end_limit)
        if h1_title_end_index == -1:
            print('    ABBYY: trans_end_index == -1')
            return ''

        title = value[h1_title_begin_index:h1_title_end_index]
        title = re.sub(r'<\/?[^>]+>', '', title)
        if title == word or title == word + '*':
            title_checked = True
        else:
            print(f'    ABBYY: >{title}< != >{word}<')

        res = value[trans_begin_index:trans_end_index]

        res = re.sub(r'\n', ' ', res, flags=re.MULTILINE)
        res = res.replace('</p>', '\n')
        res = res.replace('</li>', '\n')

        # remove symbols
        res = re.sub(r'<\/?[^>]+>', '', res)
        res = re.sub(r'\[[^\]]+\]', '', res)
        res = re.sub(r'[*⁰¹²³⁴⁵⁶⁷⁸⁹]', '', res)
        res = re.sub(r'и т. п.', ' ', res)
        res = re.sub(r'и пр.', ' ', res)
        res = re.sub(r'обыкн ', ' ', res)
        res = re.sub(r'напр\.? ', ' ', res)
        res = re.sub(r'&lt;[^&]+&gt;', ' ', res)
        res = re.sub(r'^ *(с|c|от) *$', ' ', res, flags=re.MULTILINE)
        res = re.sub(r'^(.*)$', r' \1 ', res, flags=re.MULTILINE)
        res = re.sub(r' (тж|тк|употр|m|f|n|s|a) ', ' ', res)
        res = re.sub(r' (тж|тк|употр|m|f|n|s|a) ', ' ', res)
        res = re.sub(r'см [a-zA-ZßāüöÄÜÖ]+', '', res)

        # replace symbols
        res = re.sub(r"[«»'`]", '"', res)
        res = res.replace('…', '...')
        res = re.sub(r'неотд ', 'untren. ', res)
        res = re.sub(r'отд ', 'tren. ', res)
        res = re.sub(r'разг ', 'umg. ', res)
        res = re.sub(r'устарев ', 'устар. ', res)
        res = re.sub(r'vi (s)', 'vi. sein', res)
        res = re.sub(r'vi. s ', 'vi. sein ', res)
        res = re.sub(r'vi ', 'vi. ', res)
        res = re.sub(r'sg ', 'sg: ', res)
        res = re.sub(r'pl ', 'pl: ', res)

        abbr_pattern = r' (хим|груб|фарм|исп|ж-д|вет|греч|карт|эл|грам|ирон|астр|эвф|шутл|ю-нем|с-х|кул|грам|охот|стр|дип|спец|психол|метео|лит|филос|бирж|горн|биол|физиол|косм|ав|неодобр|церк|зоол|мор|миф|архит|швейц|фр|фам|жарг|фин|полигр|напр|бот|жив|иск|авт|канц|физ|ком|социол|информ|мат|спорт|геогр|опт|мед|книжн|рел|ист|радио|тлв|австр|полит|лингв|муз|хим|воен|эк|юр|анат|редк|геол|сокр|сущ|тех|высок|поэт|диал|уст|англ|пренебр|перен|ст|орф|inter|part|adj|num|pron|refl|pers|prp|indef|rez|adv) '
        res = re.sub(abbr_pattern, r' \1. ', res)
        res = re.sub(abbr_pattern, r' \1. ', res)

        if res.find('vi.') == -1:
            res = re.sub(r'vt ', '', res)
        else:
            res = re.sub(r'vt ', 'vt. ', res)

        res = re.sub(r'^ +', '', res, flags=re.MULTILINE)
        res = re.sub(r';', ',', res)
        res = re.sub(r' (N|G|D|A|sich|inf|sein) ([а-яА-Я])', r' \1: \2', res)
        res = re.sub(r' (N|G|D|A|sich|inf|sein) ([а-яА-Я])', r' \1: \2', res)
        res = re.sub(r'[()]', ' ', res)
        res = re.sub(r'[ ,;:,?!]+$', '', res, flags=re.MULTILINE)
        res = re.sub(r' +([.,;:!?])', r'\1', res)
        res = re.sub(r'\n+', '\n', res)
        res = re.sub(r' +', ' ', res)

        res = res.strip()

        if res.find('\n') != -1:
            res = re.sub(r'^(.*)$', r'1. \1;', res, flags=re.MULTILINE)
            res = re.sub(r'^1. неотд;$', 'untren:', res, flags=re.MULTILINE)
            res = re.sub(r'^1. отд;$', 'tren:', res, flags=re.MULTILINE)
            res = re.sub(r'^1. sich[ a-zA-ZßāüöÄÜÖ]+;$', 'sich:', res, flags=re.MULTILINE)

            res = re.sub(r'^1. (vt|vi|cj|adv|prp|num);$', r'\1:', res, flags=re.MULTILINE)
            res = re.sub(r' [-–] ', ' — ', res)

            res = '```ol\n' + res + '\n```'

        res = re.sub(r' +', ' ', res)
        res = re.sub('sich ' + word + ' ', 'sich: ', res)

    if res and title_checked:
        return res
    else:
        return ''


def _read_value(text: str, prefix: str, postfix: str, remove_tags: bool = False) -> str:
    if text:
        begin_index = text.find(prefix)
        if begin_index != -1:
            end_index = text.find(postfix, begin_index + len(prefix))
            if end_index != -1 and begin_index < end_index:
                value = text[begin_index + len(prefix) : end_index]
                if remove_tags:
                    value = re.sub(r'<\/?[^>]+>', '', value)
                return value
    return ''


def _read_values(text: str, prefix: str, postfix: str, remove_tags: bool = False) -> list[str]:
    index = 0
    res = []
    if text:
        while True:
            begin_index = text.find(prefix, index)
            if begin_index != -1:
                end_index = text.find(postfix, begin_index + len(prefix))
                if end_index != -1 and begin_index < end_index:
                    value = text[begin_index + len(prefix) : end_index]
                    if remove_tags:
                        value = re.sub(r'<\/?[^>]+>', '', value)
                    res.append(value)
                    index = end_index
                else:
                    break
            else:
                break
    return res


def _parse_word(payload: str, word: str, irr_verbs: list[str]) -> str:
    res = ''

    # VERB
    details_text = _read_value(payload, '<span>Verb', '</div>', remove_tags=True)
    if details_text:
        title = _read_value(payload, '<h1 class="dwdswb-ft-lemmaansatz">', '</h1>', remove_tags=True)
        is_irregular = any(word.endswith(verb) for verb in irr_verbs)
        if is_irregular:
            details = details_text.strip()
            details = re.sub(r' *· *', '', details, flags=re.MULTILINE)
            res = title.strip()
            if details:
                res += ', ' + details.strip()
        else:
            res = title
        return res

    # Substantiv
    details_text = _read_value(payload, 'Genitiv Singular:', '</span>', remove_tags=True)
    if details_text:
        details = details_text.strip()
        details = details.replace(' · Nominativ Plural: ', ', ')
        details = details.replace('wird nur im Singular verwendet', ', sg')
        details = re.sub(r' *· *', '', details, flags=re.MULTILINE)
        title = _read_value(payload, '<h1 class="dwdswb-ft-lemmaansatz">', '</h1>', remove_tags=True)
        title_parts = title.split(',')
        title_parts.reverse()
        title = ' '.join(title_parts)
        res = title.strip().replace(' oder ', '/').replace('die/der', 'der/die')
        if details:
            details = details.replace(word, '-')
            details = details.replace('-,', '=,')
            details = re.sub(r'-$', '=', details, flags=re.MULTILINE)
            res += ', ' + details.strip()
        return res

    # Substantiv plural
    if payload.find('wird nur im Plural verwendet') != -1:
        return 'die ' + word + ', pl'

    return word


async def _load_translation_from_abbyy(session: aiohttp.ClientSession, word: str) -> str:
    url = ABBYY_BASE_URL + word
    abbyy_timeout_sec = 60
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=abbyy_timeout_sec)) as response:
        response.raise_for_status()
        payload = await response.text()

        if response.status == 200:
            return _read_trans_from_abbyy(payload, word)
        elif response.status == 202:
            print(f'    <== 202: url:{url}')
        else:
            print(f'    <== {response.status}: Failed, url:{url}')
    return ''
