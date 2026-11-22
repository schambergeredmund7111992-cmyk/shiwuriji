import json, hashlib
from pathlib import Path
from urllib.request import urlopen, Request
from concurrent.futures import ThreadPoolExecutor

base='https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/'
root=Path(__file__).resolve().parents[1]/'outputs'/'model-cache'
root.mkdir(parents=True,exist_ok=True)
def get(url): return urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=90)
with get(base+'resources.json') as response: all_resources=json.load(response)
resources={k:v for k,v in all_resources.items() if k in ['/models/isnet_quint8','/onnxruntime-web/ort-wasm-simd-threaded.wasm','/onnxruntime-web/ort-wasm-simd-threaded.mjs']}
(root/'resources.json').write_text(json.dumps(resources),encoding='utf-8')
chunks={c['name']:c for v in resources.values() for c in v['chunks']}
def fetch(c):
 target=root/c['name']
 if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()==c['hash']: return
 for attempt in range(3):
  try:
   with get(base+c['name']) as response: data=response.read()
   if hashlib.sha256(data).hexdigest()!=c['hash']: raise ValueError('Model checksum mismatch')
   target.write_bytes(data)
   return
  except Exception:
   if attempt==2: raise
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(fetch,chunks.values()))
print(f'Verified {len(chunks)} self-hosted model/runtime chunks ({sum(p.stat().st_size for p in root.iterdir())//1024//1024} MB)')
