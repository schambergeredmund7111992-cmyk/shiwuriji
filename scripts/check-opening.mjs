import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const code=readFileSync('dist/opening.js','utf8');
async function setup({reduced=false,imageError=false,pending=false}={}){
 const classes=new Set(['intro-active']),timers=new Map(),events={};let id=0;
 const nodes=[{inert:false},{inert:true},{inert:false}];
 const skip={addEventListener:(_,fn)=>events.skip=fn,focus(){}};
 const opening={dataset:{},classList:{add:x=>classes.add(x)},remove(){this.removed=true},contains:()=>false,querySelector:()=>skip,querySelectorAll:()=>[{decode:()=>pending?new Promise(()=>{}):imageError?Promise.reject(Error('missing image')):Promise.resolve()}]};
 const ctx={document:{documentElement:{classList:{remove:x=>classes.delete(x)}},getElementById:()=>opening,querySelectorAll:()=>nodes,addEventListener:(_,fn)=>events.key=fn,removeEventListener(){}},window:{},matchMedia:()=>({matches:reduced}),setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id},clearTimeout:n=>timers.delete(n),console};
 vm.createContext(ctx);vm.runInContext(code,ctx);await new Promise(setImmediate);
 return {opening,nodes,classes,timers,events,run(ms){for(const [key,timer] of [...timers].sort((a,b)=>a[1].ms-b[1].ms)){if(timer.ms<=ms&&timers.has(key)){timers.delete(key);timer.fn()}}}};
}
const normal=await setup();assert.equal(normal.opening.dataset.phase,'back');assert.ok(normal.nodes.every(n=>n.inert));normal.run(1500);assert.equal(normal.opening.dataset.phase,'front');normal.run(2700);assert.ok(normal.opening.removed);assert.deepEqual(normal.nodes.map(n=>n.inert),[false,true,false]);
const skip=await setup();skip.events.skip();skip.run(7000);assert.ok(skip.opening.removed);assert.ok(!skip.classes.has('intro-active'));
const failed=await setup({imageError:true});assert.ok(failed.opening.removed);assert.equal(failed.nodes[0].inert,false);
const reduced=await setup({reduced:true});assert.ok(reduced.opening.removed);assert.equal(reduced.timers.size,0);
const stalled=await setup({pending:true});stalled.run(6000);assert.ok(stalled.opening.removed);assert.equal(stalled.nodes[0].inert,false);
console.log('Passed: timed reveal, skip, failed/stalled images, reduced motion and prior inert state.');
