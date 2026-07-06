import json
import logging
from urllib.parse import urlparse, parse_qs
from mitmproxy import http

from cache import store_prices

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('albion-proxy')

KNOWN_MARKET_PATHS = [
    '/api/v2/stats/prices',
    '/api/gameinfo/market',
]

CAPTURED_HOSTS = set()

def request(flow: http.HTTPFlow):
    url = flow.request.pretty_url
    host = flow.request.pretty_host
    path = urlparse(url).path

    if 'albion' in host or 'albiononline' in host:
        if host not in CAPTURED_HOSTS:
            log.info(f'[ALBION] {flow.request.method} {url}')
            CAPTURED_HOSTS.add(host)

    is_price = any(p in path for p in KNOWN_MARKET_PATHS)
    if is_price and flow.request.method == 'GET':
        log.info(f'[MARKET] {url}')

def response(flow: http.HTTPFlow):
    url = flow.request.pretty_url
    path = urlparse(url).path

    is_price = any(p in path for p in KNOWN_MARKET_PATHS)
    if not is_price:
        return

    ct = flow.response.headers.get('content-type', '')
    if 'json' not in ct:
        return

    try:
        data = json.loads(flow.response.text)
    except (ValueError, AttributeError):
        return

    entries = data if isinstance(data, list) else data.get('prices', data)
    if not isinstance(entries, list) or not entries:
        return

    log.info(f'[CACHE] Stored {len(entries)} price entries from {url}')
    store_prices(entries)
