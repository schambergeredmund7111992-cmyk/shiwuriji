import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync('dist/app.js','utf8');
const prefix=readFileSync('dist/catalog.js','utf8')+'\n'+source.slice(0,source.indexOf('function toast('));
function run(stored){
 const data=new Map(stored===null?[]:[['little-things-journal-v1',JSON.stringify(stored)]]);
 const context={localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},document:{querySelector:()=>({classList:{add(){},remove(){}},textContent:''})},setTimeout(){},crypto:{randomUUID:()=> 'new-id'},console};
 vm.createContext(context);vm.runInContext(prefix+';this.result=records;this.validate=parseBackup;',context);return context;
}
const fresh=run(null);assert.equal(fresh.result.length,5);assert.equal(fresh.result.find(r=>r.id==='demo-smbu-candy').amount,25);
assert.equal(fresh.validate(JSON.parse(JSON.stringify(fresh.result))).length,5);
const personal={...fresh.result[0],id:'my-record',name:'我的私人记录',demo:false};
const old={...fresh.result[0],id:'demo-coffee',name:'旧示例',demo:true};
const upgraded=run([personal,old]);assert.equal(upgraded.result.length,6);assert.equal(upgraded.result.filter(r=>!r.demo)[0].name,'我的私人记录');
assert.equal(run([personal]).result.length,1);assert.equal(run([]).result.length,0);
const stickerOnly={...personal,id:'sticker-only',photo:'',sticker:'',displayMode:'sticker',stickerId:'momo-01'};
assert.equal(fresh.validate([stickerOnly])[0].stickerId,'momo-01');
assert.equal(fresh.validate([stickerOnly])[0].displayMode,'sticker');
assert.equal(fresh.validate([personal])[0].displayMode,'object');
assert.throws(()=>fresh.validate([{...stickerOnly,stickerId:'../invalid'}]));
assert.throws(()=>fresh.validate([{...stickerOnly,displayMode:'object'}]));
assert.equal(fresh.validate([{...personal,displayMode:'sticker',stickerId:'milk-16'}])[0].photo,personal.photo);
for(const stickerId of ['gugu-01','gugu-12','penguin-01','penguin-12'])assert.equal(fresh.validate([{...stickerOnly,stickerId}])[0].stickerId,stickerId);
console.log('Passed: five examples, valid backup, personal data preserved, removed examples stay removed.');
