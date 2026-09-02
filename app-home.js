
async function prepareExportImageBackgrounds(sheet){
  const items=[];
  const images=[...sheet.querySelectorAll('.archive-image img:not([hidden])')];

  await Promise.all(images.map(async img=>{
    if(!img.complete){
      await new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
      });
    }
    if(typeof img.decode==='function'){
      try{ await img.decode(); }catch(_){}
    }
  }));

  images.forEach(img=>{
    const card=img.closest('.archive-card');
    if(!card || !card.id || !img.src) return;
    items.push({cardId:card.id, src:img.src});
  });
  return items;
}




function applySheetFont(fontValue){
  if(!fontValue) return;
  document.documentElement.style.setProperty('--sheet-font',fontValue);
  const sheet=document.getElementById('sheet');
  if(sheet) sheet.style.setProperty('--sheet-font',fontValue);
  localStorage.setItem('aiSheetFont',fontValue);
}

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

  const deep=mix(hex,'#47333c',.45);
  const soft=mix(hex,'#ffffff',.72);
  const pale=mix(hex,'#ffffff',.91);
  const line=mix(hex,'#ffffff',.76);

  root.style.setProperty('--theme',hex);
  root.style.setProperty('--deep',deep);
  root.style.setProperty('--soft',soft);
  root.style.setProperty('--pale',pale);
  root.style.setProperty('--line',line);

  const sheet=$('sheet');
  if(sheet){
    sheet.style.setProperty('--theme',hex);
    sheet.style.setProperty('--deep',deep);
    sheet.style.setProperty('--soft',soft);
    sheet.style.setProperty('--pale',pale);
    sheet.style.setProperty('--line',line);
  }

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
    if(input==='nickname' && $('sideNickname')) $('sideNickname').textContent=$(input).value || '—';
    if(input==='twitterId' && $('sideTwitter')) $('sideTwitter').textContent=$(input).value || '—';
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
  const input=$('playStyleInput');
  const v=(input.value||'').trim();
  if(!v) return;
  const presets=selected('playStyles');
  if(!customPlayStyles.includes(v) && !presets.includes(v)){
    customPlayStyles.push(v);
  }
  input.value='';
  renderCustomPlayStyles();
  input.focus();
}
$('playStyleAddBtn').onclick=addPlayStyle;
$('playStyleInput').onkeydown=(e)=>{
  if(e.key==='Enter'){
    e.preventDefault();
    addPlayStyle();
  }
};
$('playStyleEditorTags').onclick=(e)=>{
  const b=e.target.closest('button[data-i]');
  if(!b) return;
  const i=Number(b.dataset.i);
  if(Number.isInteger(i) && i>=0){
    customPlayStyles.splice(i,1);
    renderCustomPlayStyles();
  }
};
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

let cropState={
  inputId:null,imgId:null,file:null,
  baseScale:1,zoom:1,x:0,y:0,
  dragging:false,startX:0,startY:0,originX:0,originY:0
};

function cropElements(){
  return {
    modal:$('cropModal'),
    box:$('cropBox'),
    image:$('cropImg'),
    zoom:$('cropZoom')
  };
}
function clampCrop(){
  const {box,image}=cropElements();
  if(!box || !image || !image.naturalWidth || !image.naturalHeight) return;
  const size=box.clientWidth || 320;
  const scale=cropState.baseScale*cropState.zoom;
  const w=image.naturalWidth*scale;
  const h=image.naturalHeight*scale;
  const maxX=Math.max(0,(w-size)/2);
  const maxY=Math.max(0,(h-size)/2);
  cropState.x=Math.max(-maxX,Math.min(maxX,cropState.x));
  cropState.y=Math.max(-maxY,Math.min(maxY,cropState.y));
}
function renderCrop(){
  const {image}=cropElements();
  if(!image?.naturalWidth) return;
  clampCrop();
  const scale=cropState.baseScale*cropState.zoom;
  image.style.width=(image.naturalWidth*scale)+'px';
  image.style.height=(image.naturalHeight*scale)+'px';
  image.style.transform=`translate(calc(-50% + ${cropState.x}px), calc(-50% + ${cropState.y}px))`;
}
function closeCropper(){
  const {modal,image}=cropElements();
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
  if(image) image.removeAttribute('src');
  cropState.file=null;
}
function openCropper(inputId,imgId,file){
  const {modal,box,image,zoom}=cropElements();
  if(!modal || !box || !image || !zoom) return;

  cropState.inputId=inputId;
  cropState.imgId=imgId;
  cropState.file=file;
  cropState.zoom=1;
  cropState.x=0;
  cropState.y=0;
  zoom.value='1';

  const reader=new FileReader();
  reader.onload=()=>{
    image.onload=()=>{
      const size=box.clientWidth || 320;
      cropState.baseScale=Math.max(size/image.naturalWidth,size/image.naturalHeight);
      renderCrop();
    };
    image.src=reader.result;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  };
  reader.readAsDataURL(file);
}
function makeCropDataURL(){
  const {box,image}=cropElements();
  const size=box.clientWidth || 320;
  const output=900;
  const canvas=document.createElement('canvas');
  canvas.width=output;
  canvas.height=output;
  const ctx=canvas.getContext('2d');

  const scale=cropState.baseScale*cropState.zoom;
  const displayW=image.naturalWidth*scale;
  const displayH=image.naturalHeight*scale;
  const left=(size-displayW)/2+cropState.x;
  const top=(size-displayH)/2+cropState.y;
  const k=output/size;

  ctx.fillStyle='#ffffff';
  ctx.fillRect(0,0,output,output);
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(image,left*k,top*k,displayW*k,displayH*k);
  return canvas.toDataURL('image/jpeg',0.94);
}
function bindImage(inputId,imgId){
  $(inputId).addEventListener('change',e=>{
    const img=$(imgId);
    const file=e.target.files?.[0];
    if(!file){
      img.hidden=true;
      img.removeAttribute('src');
      return;
    }
    if(!file.type.startsWith('image/')) return;
    openCropper(inputId,imgId,file);
  });
}
[
 ['favoriteImage','favoritePreview'],['favorite2Image','favorite2Preview'],['favorite3Image','favorite3Preview'],
 ['pairImage','pairPreview'],['pair2Image','pair2Preview'],['pair3Image','pair3Preview']
].forEach(x=>bindImage(...x));

document.addEventListener('DOMContentLoaded',()=>{
  const {modal,box,zoom}=cropElements();
  if(!modal || !box || !zoom) return;

  zoom.addEventListener('input',()=>{
    cropState.zoom=parseFloat(zoom.value)||1;
    renderCrop();
  });

  box.addEventListener('pointerdown',e=>{
    cropState.dragging=true;
    cropState.startX=e.clientX;
    cropState.startY=e.clientY;
    cropState.originX=cropState.x;
    cropState.originY=cropState.y;
    box.classList.add('drag');
    box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove',e=>{
    if(!cropState.dragging) return;
    cropState.x=cropState.originX+(e.clientX-cropState.startX);
    cropState.y=cropState.originY+(e.clientY-cropState.startY);
    renderCrop();
  });
  const stopDrag=()=>{
    cropState.dragging=false;
    box.classList.remove('drag');
  };
  box.addEventListener('pointerup',stopDrag);
  box.addEventListener('pointercancel',stopDrag);

  $('cropCancel').addEventListener('click',closeCropper);
  $('cropX').addEventListener('click',closeCropper);
  modal.addEventListener('click',e=>{ if(e.target===modal) closeCropper(); });

  $('cropOK').addEventListener('click',()=>{
    if(!cropState.imgId) return;
    const img=$(cropState.imgId);
    img.src=makeCropDataURL();
    img.hidden=false;
    closeCropper();
  });
});

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
  setVisible('pairFields',pair); setVisible('pairSection',pair);
  setVisible('pairCard1',pair);
  setVisible('pair2Fields',p2); setVisible('pairCard2',p2);
  setVisible('pair3Fields',p3); setVisible('pairCard3',p3);

  const favoriteTotal=1+(f2?1:0)+(f3?1:0);
  const pairTotal=pair ? 1+(p2?1:0)+(p3?1:0) : 0;
  if($('favoriteGrid')) $('favoriteGrid').dataset.total=String(favoriteTotal);
  if($('pairGrid')) $('pairGrid').dataset.total=String(pairTotal);

  document.querySelector('.home-main')?.classList.toggle('no-pair',!pair);
}
['favorite2Enabled','favorite3Enabled','pairEnabled','pair2Enabled','pair3Enabled']
  .forEach(id=>$(id).addEventListener('change',updateCharacters));

$('dreamTendency').addEventListener('change',()=>{$('outDreamTendency').textContent=$('dreamTendency').value});
$('oneTOneD').addEventListener('change',()=>{$('outOneTOneD').textContent=$('oneTOneD').value});

$('sheetFont').addEventListener('change',e=>applyFont(e.target.value));
$('themeColor').oninput=(e)=>applyTheme(e.target.value);
$('themeHex').onchange=(e)=>applyTheme(e.target.value);
document.querySelectorAll('.color-preset').forEach(b=>{ b.onclick=()=>applyTheme(b.dataset.color); });

$('downloadBtn').onclick=async()=>{
  const btn=$('downloadBtn');
  const old=btn.textContent;
  btn.disabled=true;
  btn.textContent='PNG 만드는 중…';

  try{
    if(typeof window.html2canvas!=='function'){
      throw new Error('PNG 저장 라이브러리를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.');
    }

    // Wait for web fonts before capture to prevent broken text rendering.
    if(document.fonts && document.fonts.ready){
      await document.fonts.ready;
    }

    const sheet=$('sheet');

    // Wait for every uploaded image to be completely decoded.
    const exportImages=[...sheet.querySelectorAll('.archive-image img:not([hidden])')];
    await Promise.all(exportImages.map(async(img)=>{
      if(!img.complete){
        await new Promise(resolve=>{
          img.addEventListener('load',resolve,{once:true});
          img.addEventListener('error',resolve,{once:true});
        });
      }
      if(typeof img.decode==='function'){
        try{ await img.decode(); }catch(_){}
      }
    }));

    const exportImageBackgrounds=await prepareExportImageBackgrounds(sheet);

    const canvas=await window.html2canvas(sheet,{
      scale:2,
      backgroundColor:'#fffdfd',
      useCORS:true,
      allowTaint:false,
      logging:false,
      width:960,
      height:540,
      scrollX:0,
      scrollY:0,
      windowWidth:960,
      windowHeight:540,
      onclone:(doc)=>{
        const clone=doc.getElementById('sheet');
        if(clone){
          const rootStyle=getComputedStyle(document.documentElement);

          clone.classList.add('exporting-sheet');

          // Replace uploaded <img> elements only inside the cloned export DOM.
          // The browser preview remains untouched.
          exportImageBackgrounds.forEach(info=>{
            const card=doc.getElementById(info.cardId);
            const frame=card?.querySelector('.archive-image');
            const img=frame?.querySelector('img:not([hidden])');
            if(!frame || !img) return;

            img.style.display='none';

            let bg=frame.querySelector('.export-image-bg');
            if(!bg){
              bg=doc.createElement('div');
              bg.className='export-image-bg';
              frame.appendChild(bg);
            }
            bg.style.position='absolute';
            bg.style.inset='0';
            bg.style.width='100%';
            bg.style.height='100%';
            bg.style.backgroundImage=`url("${info.src}")`;
            bg.style.backgroundRepeat='no-repeat';
            bg.style.backgroundPosition='center center';
            bg.style.backgroundSize='cover';
          });

          clone.style.setProperty('--theme', rootStyle.getPropertyValue('--theme').trim() || '#e77aa8');
          clone.style.setProperty('--deep', rootStyle.getPropertyValue('--deep').trim() || '#81445f');
          clone.style.setProperty('--soft', rootStyle.getPropertyValue('--soft').trim() || '#f8dce8');
          clone.style.setProperty('--pale', rootStyle.getPropertyValue('--pale').trim() || '#fff5f9');
          clone.style.setProperty('--line', rootStyle.getPropertyValue('--line').trim() || '#efd6e0');
          clone.style.setProperty('--sheet-font', rootStyle.getPropertyValue('--sheet-font').trim() || 'sans-serif');
        }
      }
    });

    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob) throw new Error('PNG 파일 생성에 실패했습니다.');

    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`ai-chat-friend-sheet-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }catch(err){
    console.error(err);
    alert(err?.message || 'PNG 저장 중 오류가 발생했습니다.');
  }finally{
    btn.disabled=false;
    btn.textContent=old;
  }
};

applyTheme(localStorage.getItem('aiSheetTheme')||'#e77aa8');
const savedFont=localStorage.getItem('aiSheetFont')||'gowun';
$('sheetFont').value=savedFont;
applyFont(savedFont);
if($('sideNickname')) $('sideNickname').textContent=$('nickname').value || '—';
if($('sideTwitter')) $('sideTwitter').textContent=$('twitterId').value || '—';
renderPlatforms();
renderPlayStyles();
renderCustomPlayStyles();
renderSocial();
updateCharacters();

document.addEventListener('DOMContentLoaded',()=>{
  const fontControl =
    document.getElementById('fontSelect') ||
    document.getElementById('sheetFont') ||
    document.querySelector('select[name="font"]') ||
    document.querySelector('select[name="sheetFont"]');

  const savedFont=localStorage.getItem('aiSheetFont');
  if(savedFont) applySheetFont(savedFont);

  if(fontControl){
    if(savedFont) fontControl.value=savedFont;
    applySheetFont(fontControl.value);
    fontControl.addEventListener('change',()=>applySheetFont(fontControl.value));
    fontControl.addEventListener('input',()=>applySheetFont(fontControl.value));
  }
});

function updateNgDensity(){
  const el=document.getElementById('outNg');
  const input=document.getElementById('ngText');
  if(!el || !input) return;
  const n=input.value.length;
  el.classList.toggle('ng-medium', n>160 && n<=320);
  el.classList.toggle('ng-long', n>320);
}
document.addEventListener('DOMContentLoaded',()=>{
  const ng=document.getElementById('ngText');
  if(ng){
    ng.addEventListener('input',updateNgDensity);
    updateNgDensity();
  }
});

