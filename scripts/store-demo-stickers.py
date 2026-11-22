"""Copy already-generated PNGs from a browser-exported demo backup; no image edits."""
import base64,json,re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
folder=root/'dist/assets/stickers';folder.mkdir(parents=True,exist_ok=True)
mapping={}
for record in data['records']:
 match=re.fullmatch(r'assets/(coffee|book|food|headphones|plant|camera)\.jpg',record['photo'])
 sticker=record.get('sticker','')
 if not match or not sticker.startswith('data:image/png;base64,'):continue
 payload=base64.b64decode(sticker.split(',',1)[1],validate=True)
 if not payload.startswith(b'\x89PNG\r\n\x1a\n'):raise ValueError('Invalid PNG')
 name=match.group(1)
 (folder/f'{name}.png').write_bytes(payload)
 mapping[record['photo']]=f'assets/stickers/{name}.png'
if not mapping:raise ValueError('No generated demo stickers found')
p=root/'dist/app.js';app=p.read_text(encoding='utf-8');app=re.sub(r'const builtinStickers = [^;]+;', 'const builtinStickers = '+json.dumps(mapping,ensure_ascii=False)+';',app,count=1);p.write_text(app,encoding='utf-8')
print(f'Saved {len(mapping)} original-photo cutouts and registered instant demo stickers.')
