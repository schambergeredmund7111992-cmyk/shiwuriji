const stickerCatalog=[
 ...['OK','欢迎','哇','你好','100分','爱你','生气了','谢谢','惊讶','湖边发呆','问号','庆祝','加油','认真学习','再见','晚安'].map((name,i)=>({id:`momo-${String(i+1).padStart(2,'0')}`,name,group:'莫莫熊'})),
 ...['奶蛙','奶蛋','小奶蛙','奶鼠','奶豆','奶狗','奶粉','奶鸡','奶猫','奶屎','豆奶','奶兔','奶鱼','奶茶','奶瓶','西格玛奶蛙'].map((name,i)=>({id:`milk-${String(i+1).padStart(2,'0')}`,name,group:'奶系伙伴'})),
 ...['奶笑','窗边发呆','眼镜宝宝','比心','耳机摇摆','嘟嘟嘴','胆子真大','委屈巴巴','站得笔直','挥挥手','探头','坏点子'].map((name,i)=>({id:`gugu-${String(i+1).padStart(2,'0')}`,name,group:'咕咕嘎嘎',format:'webp'})),
 ...['毕业啦','悠闲一下','勤劳中','开拍','认真读报','准备迎战','小魔法师','高雅出行','举杯','早安搭子','咖啡时间','看向远方'].map((name,i)=>({id:`penguin-${String(i+1).padStart(2,'0')}`,name,group:'高雅企鹅',format:'webp'}))
];
const stickerGroups=[...new Set(stickerCatalog.map(s=>s.group))];
const catalogEntry=id=>stickerCatalog.find(s=>s.id===id);
const catalogPath=id=>{const entry=catalogEntry(id);return entry?`assets/catalog/${id}.${entry.format||'png'}`:''};
function stickerPicker(selected,group='莫莫熊'){
 return `<div class="sticker-library"><div class="sticker-groups" role="group" aria-label="贴纸分类">${stickerGroups.map(g=>`<button type="button" data-sticker-group="${g}" aria-pressed="${g===group}">${g}</button>`).join('')}</div><div class="sticker-options" role="group" aria-label="选择展示贴纸">${stickerCatalog.filter(s=>s.group===group).map(s=>`<button type="button" class="sticker-option" data-sticker-id="${s.id}" aria-label="${s.group}：${s.name}" aria-pressed="${s.id===selected}"><img src="${catalogPath(s.id)}" alt="${s.name}" loading="lazy"><span>${s.name}</span><i aria-hidden="true">✓</i></button>`).join('')}</div></div>`;
}
