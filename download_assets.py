from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen, Request

root = Path(__file__).parent / 'dist' / 'assets'
photos = {
 'coffee': 'photo-1461023058943-07fcbe16d735',
 'food': 'photo-1547592180-85f173990554',
 'book': 'photo-1544947950-fa07a98d237f',
 'headphones': 'photo-1546435770-a3e426bf472b',
 'camera': 'photo-1516035069371-29a1b244cc32',
 'plant': 'photo-1416879595882-3373a0480b5b',
}
def fetch(item):
 name, photo = item
 try:
  url = f'https://images.unsplash.com/{photo}?auto=format&fit=crop&w=900&q=85'
  with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=45) as response:
   data = response.read()
  (root / f'{name}.jpg').write_bytes(data)
  return f'{name}: {len(data)} bytes'
 except Exception as e:
  return f'{name}: FAILED {e}'
with ThreadPoolExecutor(max_workers=6) as pool:
 for result in pool.map(fetch, photos.items()): print(result)
