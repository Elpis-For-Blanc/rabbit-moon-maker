const $ = (id)=>document.getElementById(id);
const root = document.documentElement;

const FONT_MAP = {
  gowun:'"Gowun Dodum","Noto Sans KR",sans-serif',
  noto:'"Noto Sans KR",Arial,sans-serif',
  myeongjo:'"Nanum Myeongjo",serif',
  gaegu:'"Gaegu",cursive',
  jua:'"Jua",sans-serif',
  serif:'Georgia,"Times New Roman","Nanum Myeongjo",serif'
};

const bindings = [
  ['nickname','outNickname'],['twitterId','outTwitter'],['intro','outIntro'],
  ['favoriteName','outFavoriteName'],['favoriteDesc','outFavoriteDesc'],
  ['favorite2Name','outFavorite2Name'],['favorite2Desc','outFavorite2Desc'],
  ['favorite3Name','outFavorite3Name'],['favorite3Desc','outFavorite3Desc'],
  ['pairName','outPairName'],['pairDesc','outPairDesc'],
  ['pair2Name','outPair2Name'],['pair2Desc','outPair2Desc'],
  ['pair3Name','outPair3Name'],['pair3Desc','outPair3Desc'],
  ['ngText','outNg']
];

const socialStyles = [];
const customPlayStyles = [];

function esc(s){
  return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function mix(hex,target,ratio){
  const parse=h=>({r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)});
  const a=parse(hex),b=parse(target);
  const f=k=>Math.round(a[k]*(1-ratio)+b[k]*ratio).toString(16).padStart(2,'0');
  return `#${f('r')}${f('g')}${f('b')}`;
}
function applyTheme(hex){
  if(!/^#[0-9a-f]{6}$/i.test(hex)) return;
  root.style.setProperty('--theme',hex);
  root.style.setProperty('--deep',mix(hex,'#47333c',.45));
  root.style.setProperty('--soft',mix(hex,'#ffffff',.72));
  root.style.setProperty('--pale',mix(hex,'#ffffff',.91));
  root.style.setProperty('--line',mix(hex,'#ffffff',.76));
  $('themeColor').value=hex;
  $('themeHex').value=hex;
  localStorage.setItem('aiSheetTheme',hex);
}
function applyFont(key){
  root.style.setProperty('--sheet-font',FONT_MAP[key]||FONT_MAP.gowun);
  localStorage.setItem('aiSheetFont',key);
}

bindings.forEach(([input,output])=>{
  $(input).addEventListener('input',()=>{
    $(output).textContent=$(input).value || '—';
  });
});

function selected(target){
  return [...document.querySelectorAll(`.chip-editor[data-target="${target}"] input:checked`)].map(x=>x.value);
}
function renderTags(values,target){
  $(target).innerHTML = (values.length?values:['선택 없음']).map(v=>`<span class="tag">${esc(v)}</span>`).join('');
}
function renderPlatforms(){
  const vals=selected('platforms');
  const other=$('platformOther').value.trim();
  if(other) vals.push(other);
  renderTags(vals,'outPlatforms');
}
function renderPlayStyles(){
  renderTags([...selected('playStyles'), ...customPlayStyles],'outPlayStyles');
}
function renderCustomPlayStyles(){
  $('playStyleEditorTags').innerHTML = customPlayStyles.map((v,i)=>`<button type="button" data-i="${i}">${esc(v)} ×</button>`).join('');
  renderPlayStyles();
}
function addPlayStyle(){
  const v=$('playStyleInput').value.trim();
  if(!v) return;
  const presets=selected('playStyles');
  if(!customPlayStyles.includes(v) && !presets.includes(v)) customPlayStyles.push(v);
  $('playStyleInput').value='';
  renderCustomPlayStyles();
}
$('playStyleAddBtn').addEventListener('click',addPlayStyle);
$('playStyleInput').addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();addPlayStyle();}
});
$('playStyleEditorTags').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  customPlayStyles.splice(Number(b.dataset.i),1);
  renderCustomPlayStyles();
});
document.querySelectorAll('.chip-editor input').forEach(i=>i.addEventListener('change',()=>{
  renderPlatforms();renderPlayStyles();
}));
$('platformOther').addEventListener('input',renderPlatforms);

function renderSocial(){
  $('socialEditorTags').innerHTML = socialStyles.map((v,i)=>`<button type="button" data-i="${i}">${esc(v)} ×</button>`).join('');
  renderTags(socialStyles,'outSocialStyles');
}
function addSocial(){
  const v=$('socialInput').value.trim();
  if(!v) return;
  if(!socialStyles.includes(v)) socialStyles.push(v);
  $('socialInput').value='';
  renderSocial();
}
$('socialAddBtn').addEventListener('click',addSocial);
$('socialInput').addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();addSocial();}
});
$('socialEditorTags').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  socialStyles.splice(Number(b.dataset.i),1); renderSocial();
});

function bindImage(inputId,imgId){
  $(inputId).addEventListener('change',e=>{
    const img=$(imgId);
    const file=e.target.files[0];
    if(!file){
      img.hidden=true;img.removeAttribute('src');return;
    }
    const r=new FileReader();
    r.onload=()=>{img.src=r.result;img.hidden=false};
    r.readAsDataURL(file);
  });
}
[
 ['favoriteImage','favoritePreview'],['favorite2Image','favorite2Preview'],['favorite3Image','favorite3Preview'],
 ['pairImage','pairPreview'],['pair2Image','pair2Preview'],['pair3Image','pair3Preview']
].forEach(x=>bindImage(...x));

function setVisible(id,show){
  const el=$(id);
  el.hidden=!show;
  el.classList.toggle('hidden',!show);
}
function updateCharacters(){
  const f2=$('favorite2Enabled').checked;
  const f3=$('favorite3Enabled').checked;
  const pair=$('pairEnabled').checked;
  const p2=pair && $('pair2Enabled').checked;
  const p3=pair && $('pair3Enabled').checked;

  setVisible('favorite2Fields',f2); setVisible('favoriteCard2',f2);
  setVisible('favorite3Fields',f3); setVisible('favoriteCard3',f3);
  setVisible('pairFields',pair); setVisible('pairCard1',pair);
  setVisible('pair2Fields',p2); setVisible('pairCard2',p2);
  setVisible('pair3Fields',p3); setVisible('pairCard3',p3);

  const total=1+(f2?1:0)+(f3?1:0)+(pair?1:0)+(p2?1:0)+(p3?1:0);
  $('characterCards').dataset.total=String(total);
}
['favorite2Enabled','favorite3Enabled','pairEnabled','pair2Enabled','pair3Enabled']
  .forEach(id=>$(id).addEventListener('change',updateCharacters));

$('dreamTendency').addEventListener('change',()=>{$('outDreamTendency').textContent=$('dreamTendency').value});
$('oneTOneD').addEventListener('change',()=>{$('outOneTOneD').textContent=$('oneTOneD').value});

$('sheetFont').addEventListener('change',e=>applyFont(e.target.value));
$('themeColor').addEventListener('input',e=>applyTheme(e.target.value));
$('themeHex').addEventListener('change',e=>applyTheme(e.target.value));
document.querySelectorAll('.color-preset').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.color)));

$('downloadBtn').addEventListener('click',async()=>{
  const btn=$('downloadBtn'), old=btn.textContent;
  btn.disabled=true;btn.textContent='이미지 만드는 중…';
  try{
    const canvas=await html2canvas($('sheet'),{scale:2,backgroundColor:null,useCORS:true});
    const a=document.createElement('a');
    a.download=`ai-chat-friend-sheet-${Date.now()}.png`;
    a.href=canvas.toDataURL('image/png');
    a.click();
  }finally{
    btn.disabled=false;btn.textContent=old;
  }
});

applyTheme(localStorage.getItem('aiSheetTheme')||'#e77aa8');
const savedFont=localStorage.getItem('aiSheetFont')||'gowun';
$('sheetFont').value=savedFont;
applyFont(savedFont);
renderPlatforms();
renderPlayStyles();
renderCustomPlayStyles();
renderSocial();
updateCharacters();
