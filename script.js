const $ = (id) => document.getElementById(id);
const root = document.documentElement;

const SHEET_FONTS = {
  gowun: '"Gowun Dodum","Noto Sans KR",sans-serif',
  noto: '"Noto Sans KR",Arial,sans-serif',
  myeongjo: '"Nanum Myeongjo","Noto Serif KR",serif',
  gaegu: '"Gaegu","Noto Sans KR",cursive',
  jua: '"Jua","Noto Sans KR",sans-serif',
  serif: 'Georgia,"Times New Roman","Nanum Myeongjo",serif'
};

function applySheetFont(key){
  const font = SHEET_FONTS[key] || SHEET_FONTS.gowun;
  root.style.setProperty('--sheet-font', font);
  if($('sheetFont')) $('sheetFont').value = key;
  localStorage.setItem('princessSheetFont', key);
}


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
  ['favorite2Name','outFavorite2Name'],['favorite2Desc','outFavorite2Desc'],
  ['favorite3Name','outFavorite3Name'],['favorite3Desc','outFavorite3Desc'],
  ['dreamName','outDreamName'],['dreamDesc','outDreamDesc'],
  ['dream2Name','outDream2Name'],['dream2Desc','outDream2Desc'],
  ['dream3Name','outDream3Name'],['dream3Desc','outDream3Desc'],
  ['overlapDream','outOverlapDream'],['oneTOneD','outOneTOneD'],['ngText','outNg']
];

bindings.forEach(([input,output])=>{
  $(input).addEventListener('input',()=>{
    $(output).textContent=$(input).value || '—';
    saveForm();
  });
});

function getChecked(target){
  return [...document.querySelectorAll(`.chip-editor[data-target="${target}"] input:checked`)].map(x=>x.value);
}
function renderTags(target,outId,extra=''){
  const vals=getChecked(target);
  if(extra.trim()) vals.push(extra.trim());
  $(outId).innerHTML=vals.length
    ? vals.map(v=>`<span class="tag">${escapeHtml(v)}</span>`).join('')
    : '<span class="tag">선택 없음</span>';
}
function escapeHtml(v){
  return v.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

document.querySelectorAll('.chip-editor input').forEach(i=>i.addEventListener('change',()=>{
  renderAllTags();
  saveForm();
}));
$('platformOther').addEventListener('input',()=>{
  renderAllTags();
  saveForm();
});
function renderAllTags(){
  renderTags('platforms','outPlatforms',$('platformOther').value);
  renderTags('playStyles','outPlayStyles');
}

function bindImage(inputId,previewId){
  $(inputId).addEventListener('change',e=>{
    const img=$(previewId);
    const file=e.target.files[0];
    if(!file){
      img.hidden=true;
      img.removeAttribute('src');
      return;
    }
    const r=new FileReader();
    r.onload=()=>{
      img.src=r.result;
      img.hidden=false;
    };
    r.readAsDataURL(file);
  });
}
bindImage('favoriteImage','favoritePreview');
bindImage('favorite2Image','favorite2Preview');
bindImage('favorite3Image','favorite3Preview');
bindImage('dreamImage','dreamPreview');
bindImage('dream2Image','dream2Preview');
bindImage('dream3Image','dream3Preview');

function updateCharacterCards(){
  const fav2=$('favorite2Enabled').checked;
  const fav3=$('favorite3Enabled').checked;
  const pair=$('pairEnabled').checked;
  const pair2=pair && $('pair2Enabled').checked;
  const pair3=pair && $('pair3Enabled').checked;

  $('favorite2Fields').classList.toggle('is-hidden',!fav2);
  $('favorite3Fields').classList.toggle('is-hidden',!fav3);
  $('favoriteCard2').classList.toggle('is-hidden',!fav2);
  $('favoriteCard3').classList.toggle('is-hidden',!fav3);

  $('pairFields').classList.toggle('is-hidden',!pair);
  $('pairCard').classList.toggle('is-hidden',!pair);
  $('pair2Fields').classList.toggle('is-hidden',!pair2);
  $('pair3Fields').classList.toggle('is-hidden',!pair3);
  $('pairCard2').classList.toggle('is-hidden',!pair2);
  $('pairCard3').classList.toggle('is-hidden',!pair3);

  const favCount=1+(fav2?1:0)+(fav3?1:0);
  const pairCount=pair ? 1+(pair2?1:0)+(pair3?1:0) : 0;
  const totalCards=favCount+pairCount;
  const cards=$('characterCards');

  cards.classList.toggle('pair-disabled',!pair);
  cards.dataset.favoriteCount=String(favCount);
  cards.dataset.pairCount=String(pairCount);
  cards.dataset.totalCards=String(totalCards);
}

['favorite2Enabled','favorite3Enabled','pairEnabled','pair2Enabled','pair3Enabled'].forEach(id=>{
  $(id).addEventListener('change',()=>{
    updateCharacterCards();
    saveForm();
  });
});


let socialStylesCustom = [];

function renderSocialStyles(){
  const list = $('socialStyleList');
  list.innerHTML = socialStylesCustom.length
    ? socialStylesCustom.map((v,i)=>`
        <button type="button" class="custom-tag-item" data-index="${i}" title="클릭해서 삭제">
          <span>${escapeHtml(v)}</span><b>×</b>
        </button>`).join('')
    : '<span class="custom-tag-empty">아직 추가한 교류 성향이 없어요.</span>';

  $('outSocialStyles').innerHTML = socialStylesCustom.length
    ? socialStylesCustom.map(v=>`<span class="tag">${escapeHtml(v)}</span>`).join('')
    : '<span class="tag">선택 없음</span>';
}

function addSocialStyle(){
  const input = $('socialStyleInput');
  const value = input.value.trim();
  if(!value) return;
  if(!socialStylesCustom.includes(value)) socialStylesCustom.push(value);
  input.value = '';
  renderSocialStyles();
  saveForm();
}

$('addSocialStyleBtn').addEventListener('click', addSocialStyle);
$('socialStyleInput').addEventListener('keydown', e=>{
  if(e.key === 'Enter'){
    e.preventDefault();
    addSocialStyle();
  }
});
$('socialStyleList').addEventListener('click', e=>{
  const btn = e.target.closest('.custom-tag-item');
  if(!btn) return;
  const i = Number(btn.dataset.index);
  socialStylesCustom.splice(i,1);
  renderSocialStyles();
  saveForm();
});


if($('sheetFont')){
  $('sheetFont').addEventListener('change', e=>{
    applySheetFont(e.target.value);
    saveForm();
  });
}

$('themeColor').addEventListener('input',e=>applyTheme(e.target.value));
$('themeHex').addEventListener('change',e=>applyTheme(e.target.value));
document.querySelectorAll('.color-preset').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.color)));

function saveForm(){
  const data={};
  bindings.forEach(([i])=>data[i]=$(i).value);
  data.platformOther=$('platformOther').value;
  data.favorite2Enabled=$('favorite2Enabled').checked;
  data.favorite3Enabled=$('favorite3Enabled').checked;
  data.pairEnabled=$('pairEnabled').checked;
  data.pair2Enabled=$('pair2Enabled').checked;
  data.pair3Enabled=$('pair3Enabled').checked;
  data.sheetFont=$('sheetFont') ? $('sheetFont').value : 'gowun';
  data.socialStylesCustom=socialStylesCustom;
  ['platforms','playStyles'].forEach(t=>data[t]=getChecked(t));
  localStorage.setItem('princessSheetData',JSON.stringify(data));
}

function restoreForm(){
  const theme=localStorage.getItem('princessTheme');
  if(theme) applyTheme(theme);
  const savedFont=localStorage.getItem('princessSheetFont');
  if(savedFont) applySheetFont(savedFont);
  else applySheetFont('gowun');

  const raw=localStorage.getItem('princessSheetData');
  if(!raw) return;
  try{
    const data=JSON.parse(raw);
    if(data.sheetFont) applySheetFont(data.sheetFont);
    bindings.forEach(([i,o])=>{
      if(data[i]!=null){
        $(i).value=data[i];
        $(o).textContent=data[i]||'—';
      }
    });
    if(data.platformOther!=null)$('platformOther').value=data.platformOther;
    if(typeof data.favorite2Enabled==='boolean')$('favorite2Enabled').checked=data.favorite2Enabled;
    if(typeof data.favorite3Enabled==='boolean')$('favorite3Enabled').checked=data.favorite3Enabled;
    if(typeof data.pairEnabled==='boolean')$('pairEnabled').checked=data.pairEnabled;
    if(typeof data.pair2Enabled==='boolean')$('pair2Enabled').checked=data.pair2Enabled;
    if(typeof data.pair3Enabled==='boolean')$('pair3Enabled').checked=data.pair3Enabled;
    socialStylesCustom=Array.isArray(data.socialStylesCustom)?data.socialStylesCustom:[];

    ['platforms','playStyles'].forEach(t=>{
      if(!Array.isArray(data[t])) return;
      document.querySelectorAll(`.chip-editor[data-target="${t}"] input`).forEach(i=>{
        i.checked=data[t].includes(i.value);
      });
    });
  }catch(e){}
}

$('downloadBtn').addEventListener('click',async()=>{
  const btn=$('downloadBtn');
  const old=btn.textContent;
  btn.textContent='이미지 만드는 중…';
  btn.disabled=true;
  try{
    const canvas=await html2canvas($('sheet'),{scale:2,useCORS:true,backgroundColor:null});
    const a=document.createElement('a');
    a.download=`ai-chat-friend-sheet-${Date.now()}.png`;
    a.href=canvas.toDataURL('image/png');
    a.click();
  }finally{
    btn.textContent=old;
    btn.disabled=false;
  }
});

document.querySelectorAll('#sheet .portrait-frame img').forEach(img=>{
  if(!img.getAttribute('src')) img.hidden=true;
});
restoreForm();
updateCharacterCards();
renderAllTags();
renderSocialStyles();
