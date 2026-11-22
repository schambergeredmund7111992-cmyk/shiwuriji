let enginePromise;
function cutoutEngine(){return enginePromise ||= import('./vendor/cutout.js').then(()=>window.LittleThingsCutout).catch(err=>{enginePromise=null;throw err})}
let migrating=false;
function migrationStatus(message,retry=false){let node=$('#migration-status');if(!node){node=document.createElement('aside');node.id='migration-status';node.className='migration-status';node.setAttribute('role','status');document.body.appendChild(node)}node.innerHTML=`<span>${esc(message)}</span>${retry?'<button data-action="retry-migration">重试</button>':''}`;node.hidden=false}
async function migrateStickers(){
 if(migrating)return;migrating=true;let completed=0;
 const pending=records.filter(r=>!stickerFor(r));
 if(!pending.length){migrating=false;return}
 try{
  const engine=await cutoutEngine();
  for(const item of pending){
   if(saveBusy)break;
   if(!records.some(r=>r.id===item.id&&r.photo===item.photo))continue;
   try{migrationStatus(`正在为旧记录制作贴纸 ${completed+1}/${pending.length}…`);const sticker=await engine.make(item.photo,text=>migrationStatus(`旧照片 ${completed+1}/${pending.length} · ${text}`));const current=records.find(r=>r.id===item.id);if(current&&current.photo===item.photo&&!stickerFor(current)){if(!commit(records.map(r=>r.id===item.id?{...r,sticker}:r)))break;render()}completed++}catch(err){console.warn('Sticker migration failed:',err);migrationStatus('旧照片贴纸暂未生成，原始记录仍在。',true);return}
  }
  const remains=records.filter(r=>!stickerFor(r)).length;if(remains) migrationStatus(`还有 ${remains} 条记录待制作贴纸。`,true);else {const status=$('#migration-status');if(status)status.hidden=true}
 }catch(err){console.warn('Cutout model load failed:',err);migrationStatus('抠图模型没有加载成功，旧记录都还在。',true)}finally{migrating=false}
}
async function recutRecord(id){const item=records.find(r=>r.id===id);if(!item)return;closeModal();migrationStatus('正在重新制作这张贴纸…');try{const engine=await cutoutEngine(),sticker=await engine.make(item.photo,text=>migrationStatus(text));if(records.some(r=>r.id===id&&r.photo===item.photo)&&commit(records.map(r=>r.id===id?{...r,sticker}:r))){render();detail(id);toast('贴纸已更新，记录、标签和日历都换好了')}$('#migration-status').hidden=true}catch{migrationStatus('重新抠图失败，请稍后再试。',true)}}
setTimeout(migrateStickers,500);
