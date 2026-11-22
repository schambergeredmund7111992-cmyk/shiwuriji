const campusBackgrounds=[
 {id:1,name:'夜色楼宇'}, {id:2,name:'湖上双鹅'}, {id:3,name:'图书馆夜色'},
 {id:4,name:'蓝天下的图书馆'}, {id:5,name:'林间石阶'}, {id:6,name:'主楼夜色'},
 {id:7,name:'绿荫长阶'}, {id:8,name:'湖畔凉亭'}, {id:9,name:'晴空下的主楼'}
];
const backgroundKey='little-things-background-v1';
let currentBackground=9,modalCloseHook=null;
try{const n=Number(localStorage.getItem(backgroundKey));if(campusBackgrounds.some(bg=>bg.id===n))currentBackground=n}catch{}
const campusPhoto=id=>`assets/backgrounds/campus-${String(id).padStart(2,'0')}.jpg`;
function applyCampusBackground(id){
 if(!campusBackgrounds.some(bg=>bg.id===id))return;
 document.documentElement.style.setProperty('--campus-photo',`url("${campusPhoto(id)}")`);
 document.documentElement.dataset.campusBackground=String(id);
}
applyCampusBackground(currentBackground);
function backgroundSettingRow(){const bg=campusBackgrounds.find(x=>x.id===currentBackground);return `<button class="setting-row background-setting" data-campus-picker><span>更换背景<small>${String(bg.id).padStart(2,'0')} · ${bg.name} · 磨砂玻璃</small></span>${icons('photo')}</button>`}
function openCampusBackgrounds(){
 let selected=currentBackground;
 showModal(`<h2 id="dialog-title">把校园，放进日常里。</h2><p class="modal-subtitle">9 幅校园风景，每一幅都带着磨砂玻璃的朦胧质感。</p><div class="background-preview" id="background-preview" style="--preview-photo:url('${campusPhoto(selected)}')"><span>磨砂效果预览</span></div><div class="background-choices" role="group" aria-label="校园背景选择">${campusBackgrounds.map(bg=>`<button type="button" class="background-choice ${bg.id===selected?'selected':''}" data-campus-choice="${bg.id}" aria-label="背景 ${bg.id}：${bg.name}" aria-pressed="${bg.id===selected}"><img src="${campusPhoto(bg.id)}" alt="校园照片 ${bg.id}：${bg.name}" loading="lazy"><span><b>${String(bg.id).padStart(2,'0')}</b>${bg.name}${bg.id===9?'<small>默认</small>':''}</span><i aria-hidden="true">✓</i></button>`).join('')}</div><div class="background-picker-footer"><p id="background-selection">已选择 ${String(selected).padStart(2,'0')} · ${campusBackgrounds[selected-1].name}</p><button type="button" class="solid-button" id="save-background">使用这张背景</button></div>`);
 modalCloseHook=()=>applyCampusBackground(currentBackground);
 document.querySelectorAll('[data-campus-choice]').forEach(button=>button.addEventListener('click',()=>{
  selected=Number(button.dataset.campusChoice);applyCampusBackground(selected);
  document.querySelector('#background-preview').style.setProperty('--preview-photo',`url("${campusPhoto(selected)}")`);
  document.querySelector('#background-selection').textContent=`已选择 ${String(selected).padStart(2,'0')} · ${campusBackgrounds[selected-1].name}`;
  document.querySelectorAll('[data-campus-choice]').forEach(choice=>{const chosen=Number(choice.dataset.campusChoice)===selected;choice.classList.toggle('selected',chosen);choice.setAttribute('aria-pressed',String(chosen))});
 }));
 document.querySelector('#save-background').onclick=()=>{
  try{localStorage.setItem(backgroundKey,String(selected))}catch{toast('背景未能保存，请检查浏览器存储设置');return}
  currentBackground=selected;closeModal();render();toast('校园背景已更换，刷新后也会保留');
 };
}
document.addEventListener('click',event=>{if(event.target.closest('[data-campus-picker]'))openCampusBackgrounds()});
window.addEventListener('storage',event=>{if(event.key===backgroundKey){const n=Number(event.newValue);currentBackground=campusBackgrounds.some(bg=>bg.id===n)?n:9;applyCampusBackground(currentBackground);if(typeof view!=='undefined'&&view==='mine')render()}});
