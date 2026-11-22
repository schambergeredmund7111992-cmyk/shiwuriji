import * as ort from 'onnxruntime-web/wasm';
ort.env.wasm.numThreads=1;
ort.env.wasm.proxy=false;
ort.env.wasm.wasmPaths=new URL('./',import.meta.url).href;
let session;
async function foreground(blob,report){
 report('加载轻量抠图模型…');
 session ||= ort.InferenceSession.create(new URL('../model/u2netp.onnx',import.meta.url).href,{executionProviders:['wasm'],graphOptimizationLevel:'all'}).catch(error=>{session=null;throw error});
 const engine=await session;
 report('正在识别物品主体…');
 const image=await createImageBitmap(blob),size=320,area=size*size;
 const resized=new OffscreenCanvas(size,size),ctx=resized.getContext('2d',{willReadFrequently:true});
 ctx.drawImage(image,0,0,size,size);
 const rgba=ctx.getImageData(0,0,size,size).data;
 let max=1;for(let i=0;i<rgba.length;i+=4)max=Math.max(max,rgba[i],rgba[i+1],rgba[i+2]);
 const input=new Float32Array(3*area),mean=[.485,.456,.406],std=[.229,.224,.225];
 for(let i=0;i<area;i++)for(let c=0;c<3;c++)input[c*area+i]=(rgba[i*4+c]/max-mean[c])/std[c];
 const result=await engine.run({[engine.inputNames[0]]:new ort.Tensor('float32',input,[1,3,size,size])});
 const prediction=result[engine.outputNames[0]].data;
 let lo=Infinity,hi=-Infinity;for(let i=0;i<area;i++){lo=Math.min(lo,prediction[i]);hi=Math.max(hi,prediction[i])}
 const maskData=new ImageData(size,size),range=Math.max(hi-lo,1e-6);
 for(let i=0;i<area;i++){maskData.data[i*4]=255;maskData.data[i*4+1]=255;maskData.data[i*4+2]=255;maskData.data[i*4+3]=Math.round((prediction[i]-lo)/range*255)}
 ctx.putImageData(maskData,0,0);
 const output=new OffscreenCanvas(image.width,image.height),out=output.getContext('2d');
 out.drawImage(image,0,0);out.globalCompositeOperation='destination-in';out.drawImage(resized,0,0,image.width,image.height);image.close();
 for(const tensor of Object.values(result))tensor.dispose();
 return output.convertToBlob({type:'image/png'});
}
self.onmessage=async({data})=>{const{id,blob}=data;try{const result=await foreground(blob,progress=>self.postMessage({id,progress}));self.postMessage({id,blob:result})}catch(error){self.postMessage({id,error:error.message||String(error)})}};
