import json
import logging
import os
import time
from urllib.parse import urlparse, parse_qs
from mitmproxy import http

from cache import store_prices

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('albion-proxy')

KNOWN_MARKET_PATHS = [
    '/api/v2/stats/prices',
    '/api/gameinfo/market',
]

DISCOVERY_LOG = os.path.join(os.path.dirname(__file__), 'discovery.ndjson')

def _log_discovery(entry: dict):
    try:
        with open(DISCOVERY_LOG, 'a') as f:
            f.write(json.dumps(entry) + '\n')
    except Exception:
        pass

def request(flow: http.HTTPFlow):
    url = flow.request.pretty_url
    host = flow.request.pretty_host
    path = urlparse(url).path

    if 'albion' in host or 'albiononline' in host:
        log.info(f'[REQ] {flow.request.method} {url}')
        _log_discovery({
            'ts': time.time(),
            'type': 'request',
            'method': flow.request.method,
            'host': host,
            'path': path,
            'url': url,
        })

def response(flow: http.HTTPFlow):
    url = flow.request.pretty_url
    host = flow.request.pretty_host
    path = urlparse(url).path
    status = flow.response.status_code
    ct = flow.response.headers.get('content-type', '')

    if 'albion' not in host and 'albiononline' not in host:
        return

    is_json = 'json' in ct

    entry = {
        'ts': time.time(),
        'type': 'response',
        'method': flow.request.method,
        'host': host,
        'path': path,
        'status': status,
        'content_type': ct,
        'size': len(flow.response.content),
    }

    if is_json:
        try:
            body = json.loads(flow.response.text)
            entry['body_preview'] = body if isinstance(body, list) else {k: v for k, v in (list(body.items())[:10])}
            entry['body_keys'] = list(body.keys()) if isinstance(body, dict) else f'array[{len(body)}]'
        except (ValueError, AttributeError):
            entry['body_preview'] = '<not json>'

    log.info(f'[RES] {status} {flow.request.method} {url}  ({ct})')
    _log_discovery(entry)

    is_price = any(p in path for p in KNOWN_MARKET_PATHS)
    if not is_price or not is_json or status != 200:
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


def websocket_start(flow: http.HTTPFlow):
    host = flow.request.pretty_host
    url = flow.request.pretty_url
    if 'albion' not in host and 'albiononline' not in host:
        return
    log.info(f'[WS START] {url}')
    _log_discovery({
        'ts': time.time(),
        'type': 'websocket_start',
        'host': host,
        'path': urlparse(url).path,
        'url': url,
    })


def websocket_message(flow: http.HTTPFlow):
    host = flow.request.pretty_host
    if 'albion' not in host and 'albiononline' not in host:
        return
    msg = flow.websocket.messages[-1]
    direction = 'SEND' if msg.from_client else 'RECV'
    size = len(msg.content)
    preview = msg.content[:500]
    try:
        text = preview.decode('utf-8')
        try:
            parsed = json.loads(text)
            preview = parsed if isinstance(parsed, list) else {k: v for k, v in list(parsed.items())[:8]}
        except (ValueError, AttributeError):
            preview = text[:300]
    except UnicodeDecodeError:
        preview = f'<binary {size}b>'

    log.info(f'[WS {direction}] {host} {size}b')
    _log_discovery({
        'ts': time.time(),
        'type': 'websocket_message',
        'direction': direction,
        'host': host,
        'size': size,
        'preview': preview,
    })


def websocket_end(flow: http.HTTPFlow):
    host = flow.request.pretty_host
    if 'albion' not in host and 'albiononline' not in host:
        return
    log.info(f'[WS END] {flow.request.pretty_url}')
    _log_discovery({
        'ts': time.time(),
        'type': 'websocket_end',
        'host': host,
        'url': flow.request.pretty_url,
    })
