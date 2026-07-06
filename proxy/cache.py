import json
import os
import threading
from datetime import datetime, timezone
from config import CACHE_FILE

_lock = threading.Lock()

def _load():
    if not os.path.exists(CACHE_FILE):
        return {}
    with open(CACHE_FILE, 'r') as f:
        return json.load(f)

def _save(data):
    with open(CACHE_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def store_prices(entries: list[dict]):
    now = datetime.now(timezone.utc).isoformat()
    with _lock:
        cache = _load()
        for e in entries:
            key = f"{e.get('item_id')}|{e.get('city')}|{e.get('quality', 1)}"
            e['_captured_at'] = now
            cache[key] = e
        _save(cache)

def get_prices(item_ids: list[str], locations: list[str], qualities: list[int]) -> list[dict]:
    with _lock:
        cache = _load()
    results = []
    for key, entry in cache.items():
        item_id, city, quality = key.rsplit('|', 2)
        quality = int(quality)
        if item_id in item_ids and city in locations and quality in qualities:
            e = dict(entry)
            e.pop('_captured_at', None)
            results.append(e)
    return results

def get_freshness():
    with _lock:
        cache = _load()
    if not cache:
        return None
    timestamps = []
    for e in cache.values():
        if '_captured_at' in e:
            timestamps.append(e['_captured_at'])
    if not timestamps:
        return None
    return max(timestamps)
