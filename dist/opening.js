(()=>{
 const root=document.documentElement,opening=document.getElementById('opening');
 if(!opening)return;
 const timers=[],locked=[];let done=false;
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
 const finish=()=>{
  if(done)return;done=true;timers.forEach(clearTimeout);clearTimeout(window.__openingWatchdog);
  const hadFocus=opening.contains(document.activeElement);
  root.classList.remove('intro-active');opening.remove();
  locked.forEach(({node,inert})=>{node.inert=inert});
  document.removeEventListener('keydown',onKey);
  if(hadFocus){const heading=document.querySelector('#main h1');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.addEventListener('blur',()=>heading.removeAttribute('tabindex'),{once:true})}}
 };
 window.finishOpening=finish;
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();finish()}};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
 document.querySelectorAll('.site-header,#main,.bottom-wrap').forEach(node=>{locked.push({node,inert:node.inert});node.inert=true});
 document.addEventListener('keydown',onKey);
 opening.querySelector('.opening-skip').addEventListener('click',finish);
 opening.querySelector('.opening-skip').focus({preventScroll:true});
 const images=[...opening.querySelectorAll('img')];
 Promise.all(images.map(image=>image.decode())).then(()=>{
  if(done)return;opening.dataset.phase='back';
  later(()=>{opening.classList.add('is-turning');opening.dataset.phase='turn'},850);
  later(()=>{opening.dataset.phase='front'},1430);
  later(()=>{opening.classList.add('is-leaving');opening.dataset.phase='leaving'},2150);
  later(finish,2600);
 }).catch(finish);
 later(finish,6000);
})();
