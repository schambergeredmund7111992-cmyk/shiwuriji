import { build } from 'esbuild';
import { mkdir,copyFile,writeFile,readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
let app=await readFile('dist/app.js','utf8');
const formStart=app.indexOf('function openForm('),formEnd=app.indexOf('\nfunction resizePhoto(',formStart);
if(formStart<0||formEnd<0)throw new Error('Form section not found');
app=app.slice(0,formStart)+(await readFile('src/form.js','utf8')).trim()+app.slice(formEnd);
const migrationStart=app.indexOf('\nlet enginePromise;');
if(migrationStart<0)throw new Error('Migration section not found');
app=app.slice(0,migrationStart)+'\n'+await readFile('src/migration.js','utf8');
await writeFile('dist/app.js',app);
await mkdir('dist/vendor',{recursive:true});
await build({entryPoints:['src/cutout.js'],outfile:'dist/vendor/cutout.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'linked'});
await build({entryPoints:['src/cutout-worker.js'],outfile:'dist/vendor/cutout-worker.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'linked'});
await mkdir('dist/model',{recursive:true});
await mkdir('outputs',{recursive:true});
let model;
try{model=await readFile('outputs/u2netp.onnx')}catch{
 const response=await fetch('https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx');
 if(!response.ok)throw new Error('Light model download failed: '+response.status);
 model=Buffer.from(await response.arrayBuffer());
 await writeFile('outputs/u2netp.onnx',model);
}
if(createHash('md5').update(model).digest('hex')!=='8e83ca70e441ab06c318d82300c84806')throw new Error('Light model checksum mismatch');
await copyFile('outputs/u2netp.onnx','dist/model/u2netp.onnx');
for(const file of ['ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'])
 await copyFile('node_modules/onnxruntime-web/dist/'+file,'dist/vendor/'+file);
await copyFile('node_modules/@imgly/background-removal/LICENSE.md','dist/vendor/IMG-LY-LICENSE.txt');
await writeFile('dist/vendor/ONNX-LICENSE.txt','ONNX Runtime Web: MIT License. https://github.com/microsoft/onnxruntime/blob/main/LICENSE');
await copyFile('node_modules/@imgly/background-removal/LICENSE.md','LICENSE.md');
execFileSync('tar',['-czf','dist/source.tar.gz','LICENSE.md','README.md','ASSETS.md','package.json','package-lock.json','scripts','src','dist/app.js','dist/index.html','dist/style.css','dist/stickers.css','dist/typography.css','dist/backgrounds.js','dist/backgrounds.css','dist/catalog.js','dist/catalog.css','dist/opening.js','dist/opening.css'],{stdio:'inherit'});
console.log('Browser cutout bundle and runtime ready.');
