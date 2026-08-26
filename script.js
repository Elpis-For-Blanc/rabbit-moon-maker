const $ = (id) => document.getElementById(id);
const root = document.documentElement;

function hexToRgb(hex){
  const n = hex.replace('#','');
  if(!/^[0-9a-fA-F]{6}$/.test(n)) return null;
  return {r:parseInt(n.slice(0,2),16),g:parseInt(n.slice(2,4),16),b:parseInt(n.slice(4,6),16)};
}
function mix(hex, target, ratio){
  const a=hexToRgb(hex), b=hexToRgb(target); if(!a||!b) return hex;
  const c=k=>Math.round(a[k]*(1-ratio)+b[k]*ratio).toString(16).padStart(2,'0');
  return `#${c('r')}${c('g')}${c('b')}`;
}
function applyTheme(hex){
  if(!hexToRgb(hex)) return;
  root.style.setProperty('--theme',hex);
  root.style.setProperty('--theme-deep',mix(hex,'#3b2430',.35));
  root.style.setProperty('--theme-soft',mix(hex,'#ffffff',.78));
  root.style.setProperty('--theme-pale',mix(hex,'#ffffff',.91));
  $('themeColor').value=hex;
  $('themeHex').value=hex;
  localStorage.setItem('princessTheme',hex);
}

const bindings = [
  ['nickname','outNickname'],['twitterId','outTwitter'],['intro','outIntro'],
  ['favoriteName','outFavoriteName'],['favoriteDesc','outFavoriteDesc'],
  ['dreamName','outDreamName'],['dreamDesc','outDreamDesc'],
  ['overlapDream','outOverlapDream'],['oneTOneD','outOneTOneD'],['ngText','outNg']
];
bindings.forEach(([input,output])=>{
  $(input).addEventListener('input',()=>{ $(output).textContent=$(input).value || '—'; saveForm(); });
});

function getChecked(target){
  return [...document.querySelectorAll(`.chip-editor[data-target="${target}"] input:checked`)].map(x=>x.value);
}
function renderTags(target,outId,extra=''){
  const vals=getChecked(target); if(extra.trim()) vals.push(extra.trim());
  $(outId).innerHTML=vals.length?vals.map(v=>`<span class="tag">${escapeHtml(v)}</span>`).join(''):'<span class="tag">선택 없음</span>';
}
function escapeHtml(v){return v.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

document.querySelectorAll('.chip-editor input').forEach(i=>i.addEventListener('change',()=>{renderAllTags();saveForm();}));
$('platformOther').addEventListener('input',()=>{renderAllTags();saveForm();});
function renderAllTags(){
  renderTags('platforms','outPlatforms',$('platformOther').value);
  renderTags('playStyles','outPlayStyles');
  renderTags('socialStyles','outSocialStyles');
}

function bindImage(inputId,previewId){
  $(inputId).addEventListener('change',e=>{
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader(); r.onload=()=>{$(previewId).src=r.result;}; r.readAsDataURL(file);
  });
}
bindImage('favoriteImage','favoritePreview'); bindImage('dreamImage','dreamPreview');

$('themeColor').addEventListener('input',e=>applyTheme(e.target.value));
$('themeHex').addEventListener('change',e=>applyTheme(e.target.value));
document.querySelectorAll('.color-preset').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.color)));

function saveForm(){
  const data={}; bindings.forEach(([i])=>data[i]=$(i).value); data.platformOther=$('platformOther').value;
  ['platforms','playStyles','socialStyles'].forEach(t=>data[t]=getChecked(t));
  localStorage.setItem('princessSheetData',JSON.stringify(data));
}
function restoreForm(){
  const theme=localStorage.getItem('princessTheme'); if(theme) applyTheme(theme);
  const raw=localStorage.getItem('princessSheetData'); if(!raw) return;
  try{
    const data=JSON.parse(raw);
    bindings.forEach(([i,o])=>{if(data[i]!=null){$(i).value=data[i];$(o).textContent=data[i]||'—';}});
    if(data.platformOther!=null)$('platformOther').value=data.platformOther;
    ['platforms','playStyles','socialStyles'].forEach(t=>{
      if(!Array.isArray(data[t])) return;
      document.querySelectorAll(`.chip-editor[data-target="${t}"] input`).forEach(i=>i.checked=data[t].includes(i.value));
    });
  }catch(e){}
}

$('downloadBtn').addEventListener('click',async()=>{
  const btn=$('downloadBtn'); const old=btn.textContent; btn.textContent='이미지 만드는 중…'; btn.disabled=true;
  try{
    const canvas=await html2canvas($('sheet'),{scale:2,useCORS:true,backgroundColor:null});
    const a=document.createElement('a'); a.download=`ai-chat-friend-sheet-${Date.now()}.png`; a.href=canvas.toDataURL('image/png'); a.click();
  }finally{btn.textContent=old;btn.disabled=false;}
});

restoreForm(); renderAllTags();
