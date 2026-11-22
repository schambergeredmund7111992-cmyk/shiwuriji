from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
names=['a81b9fbf-cf4a-46f4-9707-76017ae7b298','962ed74f-a937-47d8-aa87-24b8fcaf1a36','ffd8ab46-6d20-47af-8ef0-3481f7106985','48422045-1e02-467d-bc64-46a9862523ee','934f197c-2ee6-4888-bad2-f5e20c7cb9da','0994704d-a277-47c8-8e1b-9b22e67666d6','3c51e20f-b6f6-4883-b0f6-879cde4b8cff','d0dc49b5-3c10-4b24-bb41-65704d218e5a','ba476059-f295-40fa-9427-f14fb2b4578b']
folder=root/'dist/assets/backgrounds';folder.mkdir(parents=True,exist_ok=True)
for i,name in enumerate(names,1):
 shutil.copyfile(Path('C:/Users/24879/AppData/Local/Temp')/f'codex-clipboard-{name}.jpg',folder/f'campus-{i:02}.jpg')
p=root/'dist/index.html';html=p.read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="typography.css">','<link rel="stylesheet" href="typography.css"><link rel="stylesheet" href="backgrounds.css">')
html=html.replace('<body>','''<body>
<div class="campus-backdrop" aria-hidden="true"><div class="campus-scene"></div><div class="campus-frost"></div></div>
<svg width="0" height="0" class="glass-definitions" aria-hidden="true"><defs><filter id="campus-glass" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".045 .065" numOctaves="3" seed="23" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="12" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="3.2"/></filter></defs></svg>''')
html=html.replace('<script src="app.js"></script>','<script src="backgrounds.js"></script><script src="app.js"></script>')
p.write_text(html,encoding='utf-8')
p=root/'dist/app.js';s=p.read_text(encoding='utf-8')
s=s.replace('<h2>我的手账工具</h2>','<h2>我的手账工具</h2>${backgroundSettingRow()}')
s=s.replace("function showModal(html){", "function showModal(html){if(modalCloseHook){const hook=modalCloseHook;modalCloseHook=null;hook()}")
s=s.replace("function closeModal(){if(saveBusy)return;", "function closeModal(){if(saveBusy)return;if(modalCloseHook){const hook=modalCloseHook;modalCloseHook=null;hook()}")
p.write_text(s,encoding='utf-8')
print('Copied all 9 original campus photos; integrated background settings and modal cleanup.')
