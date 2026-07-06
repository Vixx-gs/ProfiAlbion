import json
import logging
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

from config import LOCAL_API_PORT, AODP_BASE
from cache import get_prices

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('albion-server')

def fetch_aodp(path: str) -> list[dict] | None:
    url = f'{AODP_BASE}{path}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'ProfiAlbion/1.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        log.warning(f'AODP fallback failed for {path}: {e}')
        return None

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)
        self._query_string = parsed.query

        log.info(f'[REQ] {self.path}')

        if path.startswith('/api/v2/stats/prices/'):
            self._handle_prices(path, qs)
        elif path == '/health':
            self._json(200, {'status': 'ok'})
        elif path == '/freshness':
            from cache import get_freshness
            ts = get_freshness()
            self._json(200, {'last_capture': ts})
        elif path == '/proxy/status':
            self._handle_proxy_status()
        elif path == '/proxy/enable':
            self._handle_proxy_set(True)
        elif path == '/proxy/disable':
            self._handle_proxy_set(False)
        else:
            self._json(404, {'error': 'not_found'})

    def _handle_prices(self, path: str, qs: dict):
        prefix = '/api/v2/stats/prices/'
        suffix = path[len(prefix):]
        item_ids = suffix.replace('.json', '').split(',')

        raw_locations = qs.get('locations', [''])[0]
        locations = [l.strip() for l in raw_locations.split(',') if l.strip()] or ['']
        raw_qualities = qs.get('qualities', ['1,2,3,4,5'])[0]
        qualities = [int(q) for q in raw_qualities.split(',') if q.strip()]

        items_filter = []
        for raw in item_ids:
            raw = raw.strip()
            if not raw:
                continue
            items_filter.append(raw)

        if not items_filter:
            self._json(400, {'error': 'no_item_ids'})
            return

        cached = get_prices(items_filter, locations, qualities)
        if cached:
            log.info(f'[HIT] {len(cached)} entries from cache for {len(items_filter)} items')
            self._json(200, cached)
            return

        log.info(f'[MISS] Cache miss for {len(items_filter)} items, falling back to AODP')
        query = self._query_string or ''
        aodp_path = path[len('/api/v2/stats'):]
        aodp_url = f'{aodp_path}?{query}' if query else aodp_path
        data = fetch_aodp(aodp_url)
        if data is not None:
            self._json(200, data)
        else:
            self._json(502, {'error': 'no_data_available'})

    def _proxy_reg(self) -> tuple:
        import winreg
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r'Software\Microsoft\Windows\CurrentVersion\Internet Settings',
            0, winreg.KEY_READ | winreg.KEY_SET_VALUE,
        )
        return key, winreg

    def _handle_proxy_status(self):
        try:
            key, wr = self._proxy_reg()
            enabled = wr.QueryValueEx(key, 'ProxyEnable')[0]
            server = wr.QueryValueEx(key, 'ProxyServer')[0]
            wr.CloseKey(key)
            self._json(200, {'enabled': bool(enabled), 'server': server})
        except Exception as e:
            self._json(500, {'error': str(e)})

    def _handle_proxy_set(self, enable: bool):
        try:
            key, wr = self._proxy_reg()
            wr.SetValueEx(key, 'ProxyEnable', 0, wr.REG_DWORD, 1 if enable else 0)
            wr.SetValueEx(key, 'ProxyServer', 0, wr.REG_SZ, '127.0.0.1:8080')
            if enable:
                wr.SetValueEx(key, 'ProxyOverride', 0, wr.REG_SZ, '127.0.0.1;localhost;*.local;<local>')
            wr.CloseKey(key)
            self._json(200, {'enabled': enable, 'server': '127.0.0.1:8080'})
        except Exception as e:
            self._json(500, {'error': str(e)})

    def _json(self, status: int, data):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        log.info(f'[HTTP] {args[0]} {args[1]} {args[2]}')

def run():
    server = HTTPServer(('127.0.0.1', LOCAL_API_PORT), Handler)
    log.info(f'Local API server running on http://127.0.0.1:{LOCAL_API_PORT}')
    log.info('Endpoints:')
    log.info(f'  GET /api/v2/stats/prices/ITEM_ID.json?locations=...&qualities=...')
    log.info(f'  GET /health')
    log.info(f'  GET /freshness')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()

if __name__ == '__main__':
    run()
