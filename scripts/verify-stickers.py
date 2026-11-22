"""Inspect exported assets; does not change images."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]/'dist/assets/stickers'
for path in sorted(root.glob('*.png')):
 with Image.open(path) as image:
  assert image.mode=='RGBA', f'{path.name}: missing alpha'
  alpha=image.getchannel('A')
  assert alpha.getextrema()==(0,255),f'{path.name}: no real transparency'
  for xy in [(0,0),(image.width-1,0),(0,image.height-1),(image.width-1,image.height-1)]:
   assert image.getpixel(xy)[3]==0,f'{path.name}: nontransparent corner'
  white=sum(1 for r,g,b,a in image.getdata() if r>245 and g>245 and b>245 and a>250)
  assert white>100,f'{path.name}: missing white contour'
  print(f'{path.name}: RGBA {image.width}x{image.height}; transparent corners; white pixels={white}')
assert len(list(root.glob('*.png')))==6
