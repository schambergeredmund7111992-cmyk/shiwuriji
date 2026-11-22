from pathlib import Path
from fontTools.ttLib import TTFont
import sys

root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:
 raise SystemExit('Usage: python scripts/apply-font.py <font.ttf>')
source=Path(sys.argv[1])
folder=root/'dist/assets/fonts'
folder.mkdir(parents=True,exist_ok=True)
font=TTFont(source)
font.flavor='woff'
target=folder/'jiangcheng-yuanti-200w.woff'
font.save(target)
print(f'Full font: {len(font.getBestCmap())} characters; {source.stat().st_size} -> {target.stat().st_size} bytes')

p=root/'dist/style.css'
style=p.read_text(encoding='utf-8')
style=style.replace("@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap');\n",'')
p.write_text(style,encoding='utf-8')
p=root/'dist/index.html'
html=p.read_text(encoding='utf-8')
if 'as="font"' not in html:
 html=html.replace('<link rel="stylesheet" href="style.css">','<link rel="preload" href="assets/fonts/jiangcheng-yuanti-200w.woff" as="font" type="font/woff" crossorigin>\n  <link rel="stylesheet" href="style.css">')
if 'href="typography.css"' not in html:
 html=html.replace('<link rel="stylesheet" href="stickers.css">','<link rel="stylesheet" href="stickers.css"><link rel="stylesheet" href="typography.css">')
p.write_text(html,encoding='utf-8')
p=root/'dist/app.js'
app=p.read_text(encoding='utf-8')
for old,new in [('24px sans-serif','24px "JiangChengRounded"'),('52px "Noto Serif SC",serif','52px "JiangChengRounded"'),('23px sans-serif','23px "JiangChengRounded"'),('24px "Noto Serif SC",serif','24px "JiangChengRounded"'),('16px sans-serif','16px "JiangChengRounded"'),('21px "Noto Serif SC",serif','21px "JiangChengRounded"'),('17px sans-serif','17px "JiangChengRounded"')]:
 app=app.replace(old,new)
app=app.replace("try{await document.fonts.ready;const canvas", "try{await document.fonts.load('24px JiangChengRounded');await document.fonts.ready;const canvas")
p.write_text(app,encoding='utf-8')
