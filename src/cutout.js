let worker;
let jobId=0;
const jobs=new Map();
function removeBackground(blob,config,onProgress){
 if(!worker){worker=new Worker(new URL('./cutout-worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>{const task=jobs.get(data.id);if(!task)return;if(data.progress)task.progress(data.progress);else{jobs.delete(data.id);data.error?task.reject(new Error(data.error)):task.resolve(data.blob)}};worker.onerror=()=>{for(const task of jobs.values())task.reject(new Error('抠图计算线程未能启动'));jobs.clear();worker.terminate();worker=null}}
 return new Promise((resolve,reject)=>{const id=++jobId;jobs.set(id,{resolve,reject,progress:onProgress});worker.postMessage({id,blob,config})});
}

// All image inference happens on the visitor's device. No image-upload API.
const modelConfig = {};
let queue = Promise.resolve();
const loadImage = src => new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('照片加载失败'));image.src=src});
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
async function makeSticker(source,onProgress=()=>{}) {
  onProgress('读取照片…');
  const image = await loadImage(source);
  const scale=Math.min(1,1200/Math.max(image.width,image.height));
  const input=canvas(Math.round(image.width*scale),Math.round(image.height*scale));
  const inputCtx=input.getContext('2d',{willReadFrequently:true});inputCtx.drawImage(image,0,0,input.width,input.height);
  const pixels=inputCtx.getImageData(0,0,input.width,input.height).data;
  let transparent=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]<30)transparent++;
  let foreground=input;
  if(transparent/(pixels.length/4)<.01){
    onProgress('准备轻量抠图模型，首次加载约 5 MB…');
    const blob=await new Promise(r=>input.toBlob(r,'image/png'));
    const result=await removeBackground(blob,modelConfig,onProgress);
    const url=URL.createObjectURL(result);
    try{foreground=await loadImage(url)}finally{URL.revokeObjectURL(url)}
  }
  onProgress('裁切主体，制作白边贴纸…');
  const mask=canvas(foreground.width,foreground.height), m=mask.getContext('2d',{willReadFrequently:true});m.drawImage(foreground,0,0);
  const maskData=m.getImageData(0,0,mask.width,mask.height),rgba=maskData.data;
  // Discard low-confidence background haze before dilation: repeating translucent
  // pixels would otherwise turn tiny mask errors into large white islands.
  const size=mask.width*mask.height,seen=new Uint8Array(size),components=[];
  for(let i=0;i<size;i++)rgba[i*4+3]=rgba[i*4+3]>=140?255:0;
  for(let i=0;i<size;i++){
    if(seen[i]||!rgba[i*4+3])continue;
    const pixels=[i];seen[i]=1;
    for(let q=0;q<pixels.length;q++){
      const at=pixels[q],x=at%mask.width;
      for(const next of [x>0?at-1:-1,x<mask.width-1?at+1:-1,at-mask.width,at+mask.width])
        if(next>=0&&next<size&&!seen[next]&&rgba[next*4+3]){seen[next]=1;pixels.push(next)}
    }
    components.push(pixels);
  }
  const largest=components.reduce((n,c)=>Math.max(n,c.length),0);
  for(const part of components)if(part.length<Math.max(40,largest*.012))for(const i of part)rgba[i*4+3]=0;
  m.putImageData(maskData,0,0);
  let minX=mask.width,minY=mask.height,maxX=-1,maxY=-1;
  for(let y=0;y<mask.height;y++)for(let x=0;x<mask.width;x++)if(rgba[(y*mask.width+x)*4+3]>35){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
  if(maxX<minX||maxY<minY)throw Error('没有找到清晰主体，请换一张照片重试');
  const width=maxX-minX+1,height=maxY-minY+1,resize=Math.min(1,650/Math.max(width,height));
  const w=Math.round(width*resize),h=Math.round(height*resize),radius=Math.max(9,Math.round(Math.max(w,h)*.022)),pad=radius+5;
  const subject=canvas(w,h);subject.getContext('2d').drawImage(mask,minX,minY,width,height,0,0,w,h);
  const output=canvas(w+pad*2,h+pad*2),ctx=output.getContext('2d');
  // Dilate the actual alpha silhouette, not the rectangular image bounds.
  for(let angle=0;angle<360;angle+=8){const a=angle*Math.PI/180;ctx.drawImage(subject,pad+Math.cos(a)*radius,pad+Math.sin(a)*radius)}
  ctx.drawImage(subject,pad,pad);ctx.globalCompositeOperation='source-in';ctx.fillStyle='#fff';ctx.fillRect(0,0,output.width,output.height);ctx.globalCompositeOperation='source-over';ctx.drawImage(subject,pad,pad);
  const data=output.toDataURL('image/png');onProgress('贴纸已完成');return data;
}
window.LittleThingsCutout={make:(source,onProgress)=>{const task=queue.then(()=>makeSticker(source,onProgress));queue=task.catch(()=>{});return task}};
window.dispatchEvent(new Event('cutout-ready'));
