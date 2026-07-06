import os

PROXY_PORT = 8080
LOCAL_API_PORT = 3456
CACHE_FILE = os.path.join(os.path.dirname(__file__), 'market_cache.json')
AODP_BASE = 'https://europe.albion-online-data.com/api/v2/stats'
ALBION_DOMAINS = [
    'live.albiononline.com',
    'gameinfo.albiononline.com',
    'albiononline.com',
]
