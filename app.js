/* ================= state & constants ================= */
const board=document.getElementById('board');
let zTop=20;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];

const PIN_COLORS=['#d6453c','#3b6fd6','#d6a23b','#3f8f5c','#7a4dbb','#2c2c34'];
const state={pin:{style:'ball',color:'#d6453c'}};

const DAISY_SVG=`<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
  <g fill="#fdfaf1" stroke="#d8d2bd" stroke-width=".6">
    <ellipse cx="13" cy="13" rx="3.6" ry="11"/>
    <ellipse cx="13" cy="13" rx="3.6" ry="11" transform="rotate(60 13 13)"/>
    <ellipse cx="13" cy="13" rx="3.6" ry="11" transform="rotate(120 13 13)"/>
  </g>
  <circle cx="13" cy="13" r="4.2" fill="#f2c14e" stroke="#caa033" stroke-width=".8"/>
</svg>`;

const heartSVG=c=>`<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M13 22C5 16 3 12 5.4 8.6 7.2 6.1 11 6.6 13 9.6 15 6.6 18.8 6.1 20.6 8.6 23 12 21 16 13 22Z" fill="${c}" stroke="rgba(0,0,0,.18)" stroke-width=".6"/><path d="M8 9.5c.8-1 2.2-1.2 3.2-.4" stroke="rgba(255,255,255,.6)" stroke-width="1.1" fill="none" stroke-linecap="round"/></svg>`;
const starSVG=c=>`<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M13 3l3 6.2 6.8.7-5.1 4.6 1.5 6.7L13 18.9 6.8 21.2l1.5-6.7L3.2 9.9 10 9.2z" fill="${c}" stroke="rgba(0,0,0,.18)" stroke-width=".6"/><path d="M11 7.5l1.4-2.6" stroke="rgba(255,255,255,.6)" stroke-width="1.1" fill="none" stroke-linecap="round"/></svg>`;

function pinHTML(style=state.pin.style,color=state.pin.color,pos=''){
  const p=pos?' '+pos:'';
  if(style==='brass')return `<span class="pin brass${p}" data-shape="brass"></span>`;
  if(style==='daisy')return `<span class="pin daisy${p}" data-shape="daisy">${DAISY_SVG}</span>`;
  if(style==='pearl')return `<span class="pin pearl${p}" data-shape="pearl"></span>`;
  if(style==='heart')return `<span class="pin svgpin${p}" data-shape="heart" data-color="${color}">${heartSVG(color)}</span>`;
  if(style==='star')return `<span class="pin svgpin${p}" data-shape="star" data-color="${color}">${starSVG(color)}</span>`;
  return `<span class="pin${p}" data-shape="ball" data-color="${color}" style="--c:${color}"></span>`;
}
/* mutate an existing pin span in place (used by click-to-restyle) */
function pinApply(span,shape,color){
  const pos=span.classList.contains('left')?'left':span.classList.contains('right')?'right':'';
  span.className='pin'+(pos?' '+pos:'');
  span.style.removeProperty('--c');
  span.innerHTML='';
  if(shape==='brass')span.classList.add('brass');
  else if(shape==='daisy'){span.classList.add('daisy');span.innerHTML=DAISY_SVG;}
  else if(shape==='pearl')span.classList.add('pearl');
  else if(shape==='heart'){span.classList.add('svgpin');span.innerHTML=heartSVG(color);}
  else if(shape==='star'){span.classList.add('svgpin');span.innerHTML=starSVG(color);}
  else span.style.setProperty('--c',color);
  span.dataset.shape=shape;
  if(color)span.dataset.color=color;
}
/* ordered presets that clicking a pin cycles through */
const PIN_PRESETS=[
  {s:'ball',c:'#d6453c'},{s:'ball',c:'#3b6fd6'},{s:'ball',c:'#d6a23b'},{s:'ball',c:'#3f8f5c'},{s:'ball',c:'#7a4dbb'},
  {s:'pearl'},{s:'brass'},{s:'daisy'},
  {s:'heart',c:'#d6453c'},{s:'heart',c:'#e07f9a'},{s:'star',c:'#d6a23b'},{s:'star',c:'#3b6fd6'}
];

const TAPES={
  blush:{cls:'',t:'rgba(247,178,189,.65)'},
  sky:{cls:'',t:'rgba(173,216,230,.6)'},
  butter:{cls:'',t:'rgba(255,224,158,.65)'},
  mint:{cls:'mint',t:''},
  lilac:{cls:'lilac',t:''},
  gingham:{cls:'gingham',t:''},
  dots:{cls:'dots',t:''},
  stripes:{cls:'stripes',t:''},
  chevron:{cls:'chevron',t:''},
  hearts:{cls:'hearts',t:''},
  stars:{cls:'stars',t:''},
  clear:{cls:'clear',t:''},
  kraft:{cls:'kraft',t:''}
};
function tapeHTML(name,left=36,rot=-3){
  const tp=TAPES[name]||TAPES.blush;
  const style=`left:${left}px;top:-13px;transform:rotate(${rot}deg);${tp.t?`--t:${tp.t}`:''}`;
  return `<span class="tape ${tp.cls}" style="${style}"></span>`;
}

const STICKY_COLORS={
  butter:'linear-gradient(160deg,#fff6a8,#f5e27a)',
  blush:'linear-gradient(160deg,#ffd3da,#f7b3bf)',
  mint:'linear-gradient(160deg,#cdeede,#a8dcc3)',
  sky:'linear-gradient(160deg,#cfe0f5,#aac6ea)',
  lilac:'linear-gradient(160deg,#e6d8f7,#cdb8ee)'
};

/* ================= photo scenes ================= */
let __sc=0;
const SCENES=[
  ()=>{const id='sg'+(++__sc);return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2ae"/><stop offset=".5" stop-color="#ffa173"/><stop offset=".78" stop-color="#e76e90"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#${id})"/>
    <circle cx="50" cy="56" r="16" fill="#fff3d6" opacity=".3"/><circle cx="50" cy="56" r="10.5" fill="#fff6dd"/>
    <path d="M28 38q3-3.5 6 0M60 30q3-3.5 6 0" stroke="#6b3c55" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <rect y="64" width="100" height="36" fill="#6e4270"/><rect y="64" width="100" height="2.4" fill="#ffd9a0" opacity=".55"/>
    <g fill="#ffcf9e" opacity=".5"><rect x="44" y="69" width="13" height="1.6"/><rect x="46" y="74" width="9" height="1.4"/><rect x="43" y="80" width="14" height="1.3"/></g></svg>`},
  ()=>{const id='sg'+(++__sc);return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2550"/><stop offset=".6" stop-color="#5c4a7d"/><stop offset="1" stop-color="#a06a8a"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#${id})"/>
    <circle cx="72" cy="22" r="9" fill="#f4ecd2"/><circle cx="69" cy="20" r="8" fill="#332e58" opacity=".88"/>
    <g fill="#f4ecd2"><circle cx="18" cy="14" r="1"/><circle cx="34" cy="26" r=".8"/><circle cx="52" cy="12" r="1.1"/><circle cx="86" cy="38" r=".8"/></g>
    <path d="M-5 76 30 40 52 66 68 50 105 82V102H-5Z" fill="#2b2547"/>
    <path d="M30 40l6 7-4 1 5 5-7-2z" fill="#cfc6e8" opacity=".8"/>
    <path d="M-5 92 22 68 44 88 70 64 105 95v7H-5Z" fill="#1b1733"/></svg>`},
  ()=>{return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#101522"/>
    <g fill="#1b2235"><rect x="12" y="32" width="18" height="68"/><rect x="38" y="20" width="22" height="80"/><rect x="68" y="40" width="18" height="60"/></g>
    <g fill="#ffe9a8"><rect x="15" y="38" width="3" height="4"/><rect x="22" y="46" width="3" height="4"/><rect x="42" y="26" width="3" height="4"/><rect x="50" y="38" width="3" height="4"/><rect x="42" y="52" width="3" height="4"/><rect x="71" y="46" width="3" height="4"/><rect x="78" y="58" width="3" height="4"/></g>
    <circle cx="87" cy="13" r="6.5" fill="#f4ecd2"/></svg>`},
  ()=>{return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#9bd0c9"/><rect y="55" width="100" height="45" fill="#5b9aa8"/>
    <circle cx="28" cy="24" r="9" fill="#fff8e0"/>
    <path d="M0 55h100" stroke="#e8f4ef" stroke-width="1.5" opacity=".7"/>
    <path d="M10 70q8-5 16 0M40 80q8-5 16 0M66 68q8-5 16 0" stroke="#e8f4ef" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`},
  ()=>{return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#f2ead8"/>
    <path d="M36 100V74c0-16 4-26 14-34" stroke="#4d7a44" stroke-width="3" fill="none"/>
    <path d="M50 40c-14-4-20-14-18-26 12 0 20 8 18 26z" fill="#5d9c4e"/>
    <path d="M50 42c2-14 12-20 24-18 0 12-10 20-24 18z" fill="#3f7a3c"/>
    <path d="M30 100v-8h40v8" fill="#b06a4a"/><path d="M33 92h34l-4-18H37z" fill="#c07a55"/></svg>`}
];
const CAPS=['new memory ✶','today was good','don’t forget this','somewhere lovely','◡̈','film & friends','sunday things'];

/* ================= drag ================= */
function overBin(ev){
  const b=document.getElementById('bin').getBoundingClientRect();
  return ev.clientX>b.left-14&&ev.clientX<b.right+14&&ev.clientY>b.top-14&&ev.clientY<b.bottom+14;
}
function addGrip(el){
  if(el.querySelector('.grip'))return;
  const g=document.createElement('div');
  g.className='grip';
  g.innerHTML='<svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 9L9 1M5 9l4-4M1 5l4-4" stroke="#8a6a45" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
  el.appendChild(g);
  g.addEventListener('pointerdown',e=>{
    e.preventDefault();e.stopPropagation();
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    const d0=Math.hypot(e.clientX-cx,e.clientY-cy)||1;
    const s0=parseFloat(el.style.getPropertyValue('--s'))||1;
    el.style.zIndex=++zTop;
    el.classList.add('lift');
    g.setPointerCapture(e.pointerId);
    const move=ev=>{
      const s=Math.max(.45,Math.min(2.4,s0*Math.hypot(ev.clientX-cx,ev.clientY-cy)/d0));
      el.style.setProperty('--s',s.toFixed(3));
    };
    const up=()=>{
      el.classList.remove('lift');
      el.classList.add('settle');
      setTimeout(()=>el.classList.remove('settle'),720);
      g.removeEventListener('pointermove',move);
      g.removeEventListener('pointerup',up);
    };
    g.addEventListener('pointermove',move);
    g.addEventListener('pointerup',up);
  });
}
function addRotor(el){
  if(el.querySelector('.rotor'))return;
  const r=document.createElement('div');
  r.className='rotor';
  r.innerHTML='<svg width="11" height="11" viewBox="0 0 11 11"><path d="M9 4.2A4 4 0 1 0 9.4 7" fill="none" stroke="#8a6a45" stroke-width="1.3" stroke-linecap="round"/><path d="M9.3 1.6L9.6 4.5 6.7 4.2z" fill="#8a6a45"/></svg>';
  el.appendChild(r);
  r.addEventListener('pointerdown',e=>{
    e.preventDefault();e.stopPropagation();
    const rect=el.getBoundingClientRect();
    const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
    const startAng=Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI;
    const r0=parseFloat(el.style.getPropertyValue('--r'))||0;
    el.classList.remove('settle');
    el.classList.add('lift');
    el.style.zIndex=++zTop;
    r.setPointerCapture(e.pointerId);
    const move=ev=>{
      const a=Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI;
      let nr=r0+(a-startAng);
      const snap=Math.round(nr/15)*15;       // gentle pull toward every 15°
      if(Math.abs(nr-snap)<3)nr=snap;
      el.style.setProperty('--r',nr.toFixed(1)+'deg');
    };
    const up=()=>{
      el.classList.remove('lift');
      el.classList.add('settle');
      setTimeout(()=>el.classList.remove('settle'),720);
      r.removeEventListener('pointermove',move);
      r.removeEventListener('pointerup',up);
    };
    r.addEventListener('pointermove',move);
    r.addEventListener('pointerup',up);
  });
}
function makeDraggable(el){
  addGrip(el);
  addRotor(el);
  el.addEventListener('pointerdown',e=>{
    if(document.body.classList.contains('cutting'))return;
    if(e.target.closest('a,button,input,iframe,[contenteditable],.playbtn,.pin,.spotify-slip,.grip,.rotor'))return;
    e.preventDefault();
    const br=board.getBoundingClientRect();
    const sc=br.width/board.offsetWidth;
    const r=el.getBoundingClientRect();
    const ox=(e.clientX-r.left)/sc, oy=(e.clientY-r.top)/sc;
    el.classList.remove('settle');
    el.classList.add('lift');
    el.style.zIndex=++zTop;
    el.setPointerCapture(e.pointerId);
    const move=ev=>{
      // unclamped while held, so things can leave the board and reach the bin
      el.style.left=(ev.clientX-br.left)/sc-ox+'px';
      el.style.top=(ev.clientY-br.top)/sc-oy+'px';
      document.getElementById('bin').classList.toggle('hot',overBin(ev));
    };
    const up=ev=>{
      document.getElementById('bin').classList.remove('hot');
      el.removeEventListener('pointermove',move);
      el.removeEventListener('pointerup',up);
      el.classList.remove('lift');
      if(overBin(ev)){trashItem(el);return}
      // rubber-band back onto the board
      const x=Math.max(-40,Math.min(board.offsetWidth-el.offsetWidth+40,parseFloat(el.style.left)));
      const y=Math.max(-44,Math.min(board.offsetHeight-el.offsetHeight+40,parseFloat(el.style.top)));
      el.style.left=x+'px';el.style.top=y+'px';
      el.classList.add('settle');
      setTimeout(()=>el.classList.remove('settle'),720);
    };
    el.addEventListener('pointermove',move);
    el.addEventListener('pointerup',up);
  });
}
document.querySelectorAll('.item').forEach(makeDraggable);

function spawn(html,x,y){
  const t=document.createElement('div');
  t.innerHTML=html.trim();
  const el=t.firstChild;
  el.style.left=(x??rnd(280,620))+'px';
  el.style.top=(y??rnd(140,360))+'px';
  if(!el.style.getPropertyValue('--r'))el.style.setProperty('--r',rnd(-6,6).toFixed(1)+'deg');
  el.style.zIndex=++zTop;
  board.insertBefore(el,board.querySelector('.board-light'));
  makeDraggable(el);
  el.classList.add('settle');
  setTimeout(()=>el.classList.remove('settle'),720);
  return el;
}

/* ================= the bin: crumple & toss ================= */
const sfx={ac:null};
function crumpleSound(){
  try{
    sfx.ac=sfx.ac||new (window.AudioContext||window.webkitAudioContext)();
    const ac=sfx.ac;ac.resume();
    const dur=.6,sr=ac.sampleRate,buf=ac.createBuffer(1,Math.floor(dur*sr),sr),d=buf.getChannelData(0);
    let burst=0;
    for(let i=0;i<d.length;i++){
      const p=i/d.length;
      if(Math.random()<0.0035*(1.2-p))burst=20+Math.random()*60;
      if(burst>0){d[i]=(Math.random()*2-1)*(burst/80)*(.8-.5*p);burst--;}
    }
    const src=ac.createBufferSource();src.buffer=buf;
    const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2400;bp.Q.value=.5;
    const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6500;
    const g=ac.createGain();g.gain.value=.5;
    src.connect(bp);bp.connect(lp);lp.connect(g);g.connect(ac.destination);
    src.start();
  }catch(e){}
}
const BALL_SVG=`<svg viewBox="0 0 60 60" width="58" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 4c10-3 22 5 24 15 3 12-3 24-13 28-11 5-24 1-29-9C7 28 9 14 18 8c4-3 8-3 12-4z" fill="#f3efe2" stroke="#cfc8b4" stroke-width="1.5"/>
  <path d="M18 20l14-6 9 10-12 4zM22 38l10-9 12 6" stroke="#bdb49c" stroke-width="1.2" fill="none"/>
  <path d="M14 30l12 2 8 12" stroke="#cac1a9" stroke-width="1" fill="none"/></svg>`;
let binBalls=0;
function addBinBall(){
  const g=document.querySelector('#bin .balls');
  if(!g||binBalls>=3)return;
  const spots=[[42,21],[63,18],[80,22]];
  const [cx,cy]=spots[binBalls++];
  const ball=document.createElementNS('http://www.w3.org/2000/svg','g');
  ball.innerHTML=`<circle cx="${cx}" cy="${cy}" r="9" fill="#f3efe2" stroke="#c9c1ab" stroke-width="1.2"/><path d="M${cx-5} ${cy-2}l5-3 4 4M${cx-3} ${cy+4}l6-2" stroke="#bdb49c" stroke-width="1" fill="none"/>`;
  g.appendChild(ball);
}
const PAPERY='.polaroid,.pstrip,.pgrid,.note-lined,.note-sticky,.note-torn,.quote-card,.banner,.strip,.guestbook,.paper';
async function trashItem(el){
  const binEl=document.getElementById('bin');
  const r=el.getBoundingClientRect();
  const isPaper=el.matches(PAPERY);
  if(el._spotify){try{el._spotify.destroy()}catch(e){}}
  const clone=el.cloneNode(true);
  clone.removeAttribute('id');
  clone.classList.remove('lift','settle');
  clone.querySelectorAll('iframe').forEach(f=>f.remove());
  Object.assign(clone.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',margin:'0',zIndex:1000,transform:'none',transition:'none',pointerEvents:'none'});
  document.body.appendChild(clone);
  el.remove();
  const b=binEl.getBoundingClientRect();
  const dx=(b.left+b.width/2)-(r.left+r.width/2);
  const dy=(b.top+b.height*0.18)-(r.top+r.height/2);
  if(isPaper){
    crumpleSound();
    await clone.animate([
      {transform:'none'},
      {transform:'rotate(4deg) scale(.82,.76) skew(3deg)',offset:.4},
      {transform:'rotate(-5deg) scale(.6,.66) skew(-4deg)',offset:.75},
      {transform:'rotate(3deg) scale(.5,.5)'}
    ],{duration:340,easing:'ease-in',fill:'forwards'}).finished;
    clone.innerHTML=BALL_SVG;
    Object.assign(clone.style,{display:'flex',alignItems:'center',justifyContent:'center',filter:'drop-shadow(2px 4px 4px rgba(40,18,0,.35))'});
  }
  await clone.animate([
    {transform:isPaper?'scale(.5)':'scale(.9)',offset:0},
    {transform:`translate(${dx*.55}px,${dy-70}px) scale(${isPaper?.42:.45}) rotate(150deg)`,offset:.55},
    {transform:`translate(${dx}px,${dy}px) scale(.28) rotate(260deg)`,opacity:.9}
  ],{duration:500,easing:'cubic-bezier(.35,.5,.45,1)',fill:'forwards'}).finished;
  clone.remove();
  if(isPaper)addBinBall();
  binEl.classList.remove('wob');void binEl.offsetWidth;
  binEl.classList.add('wob');
  setTimeout(()=>binEl.classList.remove('wob'),620);
}

/* ================= pins: click any pin to restyle it ================= */
board.addEventListener('click',e=>{
  if(document.body.classList.contains('cutting'))return;
  const pin=e.target.closest('.pin');
  if(!pin)return;
  const idx=isNaN(+pin.dataset.preset)?0:(+pin.dataset.preset+1)%PIN_PRESETS.length;
  const pr=PIN_PRESETS[idx];
  pinApply(pin,pr.s,pr.c||PIN_COLORS[0]);
  pin.dataset.preset=idx;
});

/* ================= supply drawer panels ================= */
document.querySelectorAll('.tray button[data-panel]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const target=document.getElementById(btn.dataset.panel);
    const wasOpen=!target.hidden;
    document.querySelectorAll('.panel').forEach(p=>p.hidden=true);
    document.querySelectorAll('.tray button').forEach(b=>b.classList.remove('active'));
    if(!wasOpen){target.hidden=false;btn.classList.add('active');}
  });
});
document.querySelectorAll('.panel .close').forEach(c=>c.addEventListener('click',()=>{
  c.closest('.panel').hidden=true;
  document.querySelectorAll('.tray button').forEach(b=>b.classList.remove('active'));
}));
function chipGroup(sel,onPick,defIdx=0){
  const chips=[...document.querySelectorAll(sel)];
  chips.forEach(ch=>ch.addEventListener('click',()=>{
    chips.forEach(c=>c.classList.remove('sel'));
    ch.classList.add('sel');
    onPick(ch);
  }));
  if(chips[defIdx]){chips[defIdx].classList.add('sel');onPick(chips[defIdx]);}
}

/* ---- polaroid panel: pick a format, it spawns ---- */
function photoCell(){return `<div class="photo">${pick(SCENES)()}</div>`}
document.querySelectorAll('#panel-polaroid .chip').forEach(ch=>{
  ch.addEventListener('click',()=>{
    const type=ch.dataset.type;
    const cap=`<div class="cap">${pick(CAPS)}</div>`;
    let html;
    if(type==='strip')html=`<div class="item pstrip grain">${pinHTML()}${photoCell()}${photoCell()}${photoCell()}${cap}</div>`;
    else if(type==='grid')html=`<div class="item pgrid grain">${pinHTML()}${photoCell()}${photoCell()}${photoCell()}${photoCell()}${cap}</div>`;
    else html=`<div class="item polaroid grain">${pinHTML()}${photoCell()}${cap}</div>`;
    spawn(html);
  });
});

/* ---- sticky note panel ---- */
const sticky={color:'butter',shape:'square',attach:'pin',tape:'blush'};
chipGroup('#panel-sticky .chip[data-color]',ch=>sticky.color=ch.dataset.color);
chipGroup('#panel-sticky .chip[data-shape]',ch=>sticky.shape=ch.dataset.shape);
chipGroup('#panel-sticky .chip[data-attach]',ch=>{
  sticky.attach=ch.dataset.attach;
  if(ch.dataset.tape)sticky.tape=ch.dataset.tape;
},1);
document.getElementById('stickyAdd').addEventListener('click',()=>{
  const shapeCls=sticky.shape==='square'?'':sticky.shape;
  const attach=sticky.attach==='pin'?pinHTML():tapeHTML(sticky.tape,sticky.shape==='wide'?68:36);
  spawn(`<div class="item note-sticky ${shapeCls} grain" style="--paper:${STICKY_COLORS[sticky.color]}">${attach}<div contenteditable="true" spellcheck="false">write something…</div></div>`);
});

/* ---- notes panel ---- */
const note={paper:'p-lined',color:'#fbf9f0',font:'f-caveat',bullet:'♡',attach:'pin',tape:'blush',img:null};
chipGroup('#panel-note .chip[data-npaper]',ch=>{note.paper=ch.dataset.npaper;note.img=null;document.getElementById('paperUpChip').classList.remove('sel');});
chipGroup('#panel-note .chip[data-ncolor]',ch=>note.color=ch.dataset.ncolor);
chipGroup('#panel-note .chip[data-nfont]',ch=>note.font=ch.dataset.nfont);
chipGroup('#panel-note .chip[data-nbullet]',ch=>note.bullet=ch.dataset.nbullet,1);
chipGroup('#panel-note .chip[data-nattach]',ch=>{note.attach=ch.dataset.nattach;if(ch.dataset.ntape)note.tape=ch.dataset.ntape;});
document.getElementById('paperFile').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{
    note.img=rd.result;
    document.querySelectorAll('#panel-note .chip[data-npaper]').forEach(c=>c.classList.remove('sel'));
    document.getElementById('paperUpChip').classList.add('sel');
  };
  rd.readAsDataURL(f);
  e.target.value='';
});
document.getElementById('noteAdd').addEventListener('click',()=>{
  const attach=note.attach==='pin'?pinHTML():tapeHTML(note.tape,76);
  const title=document.getElementById('noteTitle').value.trim();
  const isImg=!!note.img;
  const style=`--pc:${note.color};${isImg?`background-image:url(${note.img});`:''}`;
  const paperCls=isImg?'p-image':note.paper;
  const start=note.bullet?note.bullet+' ':'';
  spawn(`<div class="item note-custom grain paper ${paperCls} ${note.font}" style="${style}">${attach}${title?`<h3 class="nc-title">${title}</h3>`:''}<div class="nc-body" contenteditable="true" spellcheck="false" data-bullet="${note.bullet}">${start}write something…</div></div>`);
});
/* each new line starts with the chosen bullet */
board.addEventListener('keydown',e=>{
  const t=e.target.closest('.nc-body[data-bullet]');
  if(!t||e.key!=='Enter'||!t.dataset.bullet)return;
  e.preventDefault();
  document.execCommand('insertText',false,'\n'+t.dataset.bullet+' ');
});

/* ---- guestbook builder ---- */
const GB_PAPERS={
  kraft:'linear-gradient(170deg,#eedfc2,#e3d0ad)',
  cream:'linear-gradient(170deg,#f8f4e6,#efe6cc)',
  blush:'linear-gradient(170deg,#f7dfe2,#eecfd4)',
  sage:'linear-gradient(170deg,#e6edda,#d6e0c4)'
};
const gb={paper:GB_PAPERS.kraft,stitch:'#b0413e'};
chipGroup('#panel-guestbook .chip[data-gbpaper]',ch=>gb.paper=GB_PAPERS[ch.dataset.gbpaper]);
chipGroup('#panel-guestbook .chip[data-gbstitch]',ch=>gb.stitch=ch.dataset.gbstitch);
document.getElementById('gbAdd').addEventListener('click',()=>{
  const t=(document.getElementById('gbTitle').value.trim()||'guestbook — stitched in').replace(/</g,'&lt;');
  spawn(`<div class="item guestbook grain" style="--gbp:${gb.paper};--gbs:${gb.stitch}">${pinHTML(state.pin.style,state.pin.color,'left')}${pinHTML(state.pin.style,state.pin.color,'right')}<h3>✂ ${t}</h3><div class="write" contenteditable="true" spellcheck="false"></div></div>`);
});
/* pressing enter in any guestbook sews the note in as a signed entry */
board.addEventListener('keydown',e=>{
  const w=e.target.closest('.guestbook .write');
  if(!w||e.key!=='Enter')return;
  e.preventDefault();
  const txt=w.innerText.trim();
  if(!txt)return;
  const n=document.createElement('div');
  n.className='gnote';
  n.innerHTML=`${txt.replace(/</g,'&lt;')} <em>— guest</em>`;
  w.before(n);
  w.innerHTML='';
});

/* ---- scissors: recut the edges of papers & stickers ---- */
function snipSound(){
  try{
    sfx.ac=sfx.ac||new (window.AudioContext||window.webkitAudioContext)();
    const ac=sfx.ac;ac.resume();
    [0,.07].forEach((t,k)=>{
      const len=Math.floor(ac.sampleRate*.04),b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0);
      for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/len*9);
      const s=ac.createBufferSource();s.buffer=b;
      const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=k?3000:4400;f.Q.value=1.2;
      const g=ac.createGain();g.gain.value=.22;
      s.connect(f);f.connect(g);g.connect(ac.destination);
      s.start(ac.currentTime+t);
    });
  }catch(e){}
}
const CUT_STYLES=(()=>{
  const TOP=4;
  const mk=P=>`polygon(${P.map(p=>p[0].toFixed(2)+'% '+p[1].toFixed(2)+'%').join(',')})`;
  const build=(side,bottom)=>{
    const P=[[-20,-30],[120,-30],[120,TOP]];
    side.forEach(([t,d])=>P.push([100-d,TOP+t*(100-TOP)]));
    bottom.forEach(([t,d])=>P.push([100-t*100,100-d]));
    side.slice().reverse().forEach(([t,d])=>P.push([d,TOP+t*(100-TOP)]));
    P.push([-20,TOP]);
    return mk(P);
  };
  const alt=(n,amp)=>Array.from({length:n+1},(_,i)=>[i/n,i%2?amp:0]);
  const bumps=(n,amp)=>{
    const a=[],steps=n*4;
    for(let i=0;i<=steps;i++)a.push([i/steps,amp*(.5-.5*Math.cos(Math.PI*2*(i%4)/4))]);
    return a;
  };
  const rough=n=>Array.from({length:n+1},(_,i)=>[i/n,(i===0||i===n)?0:1+Math.random()*3.4]);
  const stampE=n=>{
    const a=[[0,0]];
    for(let i=0;i<n;i++){const t0=i/n;a.push([t0+.25/n,0],[t0+.5/n,3],[t0+.75/n,0]);}
    a.push([1,0]);
    return a;
  };
  return {
    pinked:build(alt(12,2.6),alt(14,3.2)),
    wave:build(bumps(4,2.4),bumps(6,3)),
    torn:build([[0,0],[1,0]],rough(16)),
    stamp:build(stampE(5),stampE(7))
  };
})();
const CUT_ORDER=['','pinked','wave','torn','stamp'];
function applyCut(el){
  const idx=((+el.dataset.cut||0)+1)%CUT_ORDER.length;
  el.dataset.cut=idx;
  el.style.clipPath=CUT_ORDER[idx]?CUT_STYLES[CUT_ORDER[idx]]:'';
  snipSound();
}
const scissorsBtn=document.getElementById('scissorsBtn');
scissorsBtn.addEventListener('click',()=>{
  const on=!document.body.classList.contains('cutting');
  document.body.classList.toggle('cutting',on);
  scissorsBtn.classList.toggle('active',on);
  document.querySelectorAll('.panel').forEach(p=>p.hidden=true);
});
board.addEventListener('click',e=>{
  if(!document.body.classList.contains('cutting'))return;
  const it=e.target.closest('.item');
  if(!it||!(it.matches(PAPERY)||it.matches('.sticker')))return;
  applyCut(it);
});

/* ---- pins panel ---- */
chipGroup('#panel-pins .chip[data-pinstyle]',ch=>state.pin.style=ch.dataset.pinstyle);
chipGroup('#panel-pins .chip[data-pincolor]',ch=>state.pin.color=ch.dataset.pincolor);

/* ---- sticker panel ---- */
const STICKERS=[
  `<svg width="92" height="64" viewBox="0 0 92 64" xmlns="http://www.w3.org/2000/svg"><path d="M10 56a36 36 0 0 1 72 0h-10a26 26 0 0 0-52 0z" fill="#fffdf7"/><path d="M16 56a30 30 0 0 1 60 0" fill="none" stroke="#f08a8a" stroke-width="6"/><path d="M22 56a24 24 0 0 1 48 0" fill="none" stroke="#f6c177" stroke-width="6"/><path d="M28 56a18 18 0 0 1 36 0" fill="none" stroke="#8fd0b0" stroke-width="6"/><ellipse cx="13" cy="55" rx="12" ry="8" fill="#fffdf7"/><ellipse cx="79" cy="55" rx="12" ry="8" fill="#fffdf7"/></svg>`,
  `<svg width="64" height="60" viewBox="0 0 64 60" xmlns="http://www.w3.org/2000/svg"><path d="M32 54C12 40 4 28 8 17c3-9 16-11 24-3 8-8 21-6 24 3 4 11-4 23-24 37z" fill="#e2566a" stroke="#fffdf7" stroke-width="7" paint-order="stroke" stroke-linejoin="round"/><path d="M18 18c2-3 6-4 9-2" stroke="#ffd3da" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  `<svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg"><circle cx="35" cy="35" r="26" fill="#f6c177" stroke="#fffdf7" stroke-width="6"/><circle cx="27" cy="30" r="3" fill="#6b4a1e"/><circle cx="43" cy="30" r="3" fill="#6b4a1e"/><path d="M25 42q10 9 20 0" stroke="#6b4a1e" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  `<svg width="60" height="74" viewBox="0 0 60 74" xmlns="http://www.w3.org/2000/svg"><path d="M30 6c10 16 18 26 18 38a18 18 0 0 1-36 0C12 32 20 22 30 6z" fill="#8fb8e8" stroke="#fffdf7" stroke-width="6" paint-order="stroke" stroke-linejoin="round"/><path d="M24 44a8 8 0 0 0 7 8" stroke="#e8f2ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  `<svg width="96" height="92" viewBox="0 0 96 92" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="88" height="84" rx="14" fill="#cfe8df" stroke="#fffdf7" stroke-width="6"/><text x="48" y="42" text-anchor="middle" font-family="Caveat,cursive" font-weight="700" font-size="26" fill="#3f6a5a">stay</text><text x="48" y="72" text-anchor="middle" font-family="Caveat,cursive" font-weight="700" font-size="26" fill="#3f6a5a">weird ✶</text></svg>`
];
const grid=document.querySelector('#panel-sticker .stickergrid');
STICKERS.forEach(svg=>{
  const ch=document.createElement('div');ch.className='chip';ch.innerHTML=svg;
  ch.addEventListener('click',()=>spawn(`<div class="item sticker">${svg}</div>`));
  grid.appendChild(ch);
});
document.getElementById('stickerFile').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{
    const img=new Image();
    img.onload=()=>openCutmat(img);
    img.src=rd.result;
  };
  rd.readAsDataURL(f);
  e.target.value='';
});

/* ---- the cutting mat: remove background or lasso-cut an uploaded sticker ---- */
const cm={work:null,orig:null,scale:1,lasso:false,drawing:false,pts:[],target:'sticker'};
const cutmatEl=document.getElementById('cutmat');
const cmCanvas=document.getElementById('cmCanvas');
function openCutmat(img,target='sticker'){
  cm.target=target;
  const max=900,k=Math.min(1,max/Math.max(img.width,img.height));
  const w=Math.max(2,Math.round(img.width*k)),h=Math.max(2,Math.round(img.height*k));
  cm.orig=document.createElement('canvas');cm.orig.width=w;cm.orig.height=h;
  cm.orig.getContext('2d').drawImage(img,0,0,w,h);
  cm.work=document.createElement('canvas');cm.work.width=w;cm.work.height=h;
  cm.work.getContext('2d').drawImage(cm.orig,0,0);
  cm.lasso=false;cm.pts=[];
  document.getElementById('cmLasso').classList.remove('toggled');
  cutmatEl.classList.remove('lasso');
  document.querySelectorAll('.panel').forEach(p=>p.hidden=true);
  cutmatEl.hidden=false;
  cmDraw();
}
function cmDraw(){
  const W=460,H=340;
  const k=Math.min(W/cm.work.width,H/cm.work.height);
  cm.scale=k;
  cmCanvas.width=Math.max(2,Math.round(cm.work.width*k));
  cmCanvas.height=Math.max(2,Math.round(cm.work.height*k));
  const ctx=cmCanvas.getContext('2d');
  for(let y=0;y<cmCanvas.height;y+=12)for(let x=0;x<cmCanvas.width;x+=12){
    ctx.fillStyle=((x+y)/12)%2?'#cfc9bd':'#e8e2d4';ctx.fillRect(x,y,12,12);
  }
  ctx.drawImage(cm.work,0,0,cmCanvas.width,cmCanvas.height);
  if(cm.pts.length>1){
    ctx.setLineDash([6,4]);ctx.lineWidth=2;
    ctx.strokeStyle='#fffdf7';
    ctx.beginPath();ctx.moveTo(cm.pts[0][0],cm.pts[0][1]);
    cm.pts.forEach(p=>ctx.lineTo(p[0],p[1]));
    ctx.stroke();ctx.setLineDash([]);
  }
}
function cmRemoveBg(){
  const tol=+document.getElementById('cmTol').value;
  const w=cm.work.width,h=cm.work.height;
  const ctx=cm.work.getContext('2d');
  const id=ctx.getImageData(0,0,w,h),d=id.data;
  const samp=(x0,y0)=>{let r=0,g=0,b=0,n=0;
    for(let y=y0;y<y0+3;y++)for(let x=x0;x<x0+3;x++){const i=(y*w+x)*4;r+=d[i];g+=d[i+1];b+=d[i+2];n++}
    return [r/n,g/n,b/n];
  };
  const corners=[samp(0,0),samp(w-3,0),samp(0,h-3),samp(w-3,h-3)];
  const isBg=i=>{
    if(d[i+3]===0)return true;
    for(const c of corners){
      const dr=d[i]-c[0],dg=d[i+1]-c[1],db=d[i+2]-c[2];
      if(dr*dr+dg*dg+db*db<tol*tol*3)return true;
    }
    return false;
  };
  const vis=new Uint8Array(w*h);
  const Q=[];
  for(let x=0;x<w;x++){Q.push(x,0,x,h-1);}
  for(let y=0;y<h;y++){Q.push(0,y,w-1,y);}
  while(Q.length){
    const y=Q.pop(),x=Q.pop();
    if(x<0||y<0||x>=w||y>=h)continue;
    const p=y*w+x;
    if(vis[p])continue;
    vis[p]=1;
    const i=p*4;
    if(!isBg(i))continue;
    d[i+3]=0;
    Q.push(x+1,y,x-1,y,x,y+1,x,y-1);
  }
  // soften the cut edge by one pixel
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const i=(y*w+x)*4;
    if(d[i+3]===0)continue;
    if(d[i-1]===0&&false)continue;
    if(d[i+3]>0&&(d[i-4+3]===0||d[i+4+3]===0||d[i-w*4+3]===0||d[i+w*4+3]===0))d[i+3]=Math.min(d[i+3],150);
  }
  ctx.putImageData(id,0,0);
  cm.pts=[];
  cmDraw();
}
function cmApplyLasso(){
  if(cm.pts.length<3){cm.pts=[];cmDraw();return}
  const k=cm.scale;
  const c=document.createElement('canvas');c.width=cm.work.width;c.height=cm.work.height;
  const x=c.getContext('2d');
  x.beginPath();x.moveTo(cm.pts[0][0]/k,cm.pts[0][1]/k);
  cm.pts.forEach(p=>x.lineTo(p[0]/k,p[1]/k));
  x.closePath();x.clip();
  x.drawImage(cm.work,0,0);
  cm.work=c;cm.pts=[];
  cmDraw();
}
cmCanvas.addEventListener('pointerdown',e=>{
  if(!cm.lasso)return;
  e.preventDefault();
  cm.drawing=true;cm.pts=[[e.offsetX,e.offsetY]];
  cmCanvas.setPointerCapture(e.pointerId);
});
cmCanvas.addEventListener('pointermove',e=>{
  if(!cm.drawing)return;
  cm.pts.push([e.offsetX,e.offsetY]);
  cmDraw();
});
cmCanvas.addEventListener('pointerup',()=>{
  if(!cm.drawing)return;
  cm.drawing=false;
  cmApplyLasso();
});
document.getElementById('cmRemoveBg').addEventListener('click',cmRemoveBg);
document.getElementById('cmLasso').addEventListener('click',()=>{
  cm.lasso=!cm.lasso;
  document.getElementById('cmLasso').classList.toggle('toggled',cm.lasso);
  cutmatEl.classList.toggle('lasso',cm.lasso);
});
document.getElementById('cmReset').addEventListener('click',()=>{
  cm.work=document.createElement('canvas');
  cm.work.width=cm.orig.width;cm.work.height=cm.orig.height;
  cm.work.getContext('2d').drawImage(cm.orig,0,0);
  cm.pts=[];cmDraw();
});
document.getElementById('cmCancel').addEventListener('click',()=>{cutmatEl.hidden=true});
document.getElementById('cmDone').addEventListener('click',()=>{
  const w=cm.work.width,h=cm.work.height;
  const d=cm.work.getContext('2d').getImageData(0,0,w,h).data;
  let minx=w,miny=h,maxx=-1,maxy=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(d[(y*w+x)*4+3]>10){
      if(x<minx)minx=x;if(x>maxx)maxx=x;
      if(y<miny)miny=y;if(y>maxy)maxy=y;
    }
  }
  if(maxx<0){cutmatEl.hidden=true;return}
  const c=document.createElement('canvas');
  c.width=maxx-minx+1;c.height=maxy-miny+1;
  c.getContext('2d').drawImage(cm.work,-minx,-miny);
  if(cm.target==='decor')
    spawn(`<div class="item decor upload"><img src="${c.toDataURL()}" alt="custom decor"></div>`);
  else
    spawn(`<div class="item sticker upload"><img src="${c.toDataURL()}" alt="custom sticker"></div>`);
  cutmatEl.hidden=true;
});
document.getElementById('decorFile').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{
    const img=new Image();
    img.onload=()=>openCutmat(img,'decor');
    img.src=rd.result;
  };
  rd.readAsDataURL(f);
  e.target.value='';
});

/* ---- the darkroom: photos & gifs become polaroids, with a filter ---- */
const FILTERS={
  natural:'',
  golden:'saturate(1.25) contrast(1.05) sepia(.22) brightness(1.05)',
  faded:'contrast(.85) brightness(1.12) saturate(.72)',
  'b&w':'grayscale(1) contrast(1.08)',
  sepia:'sepia(.85) contrast(.95) brightness(1.03)',
  cool:'saturate(.85) hue-rotate(12deg) brightness(1.04)',
  pop:'saturate(1.65) contrast(1.18)'
};
const dk={src:null,filter:''};
function openDarkroom(src){
  dk.src=src;dk.filter='';
  const row=document.getElementById('dkFilters');
  row.innerHTML='';
  Object.entries(FILTERS).forEach(([name,f],i)=>{
    const ch=document.createElement('div');
    ch.className='chip fchip'+(i?'':' sel');
    ch.innerHTML=`<img src="${src}" alt="" style="filter:${f}"><span>${name}</span>`;
    ch.onclick=()=>{
      row.querySelectorAll('.chip').forEach(c=>c.classList.remove('sel'));
      ch.classList.add('sel');
      dk.filter=f;
      document.getElementById('dkImg').style.filter=f;
    };
    row.appendChild(ch);
  });
  const im=document.getElementById('dkImg');
  im.src=src;im.style.filter='';
  document.getElementById('dkCap').value='';
  document.querySelectorAll('.panel').forEach(p=>p.hidden=true);
  document.getElementById('darkroom').hidden=false;
}
document.getElementById('polFile').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>openDarkroom(rd.result);
  rd.readAsDataURL(f);
  e.target.value='';
});
document.getElementById('dkCancel').addEventListener('click',()=>{document.getElementById('darkroom').hidden=true});
document.getElementById('dkDone').addEventListener('click',()=>{
  const cap=(document.getElementById('dkCap').value.trim()||'◡̈').replace(/</g,'&lt;');
  spawn(`<div class="item polaroid grain">${pinHTML()}<div class="photo"><img src="${dk.src}" alt="" style="filter:${dk.filter}"></div><div class="cap" contenteditable="true" spellcheck="false">${cap}</div></div>`);
  document.getElementById('darkroom').hidden=true;
});

/* ================= decor: plants, lights, lantern ================= */
const DECOR={
  pothos:{x:828,y:-20,svg:`<svg viewBox="0 0 240 290" width="235" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dpg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8cc46e"/><stop offset=".55" stop-color="#4f9347"/><stop offset="1" stop-color="#2f6d33"/></linearGradient>
      <linearGradient id="dpg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fa452"/><stop offset="1" stop-color="#27572c"/></linearGradient>
      <linearGradient id="dpotg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b16a3e"/><stop offset="1" stop-color="#7c4424"/></linearGradient>
      <g id="dplf1"><path d="M0 0C-3-13 12-22 23-14 34-6 30 9 16 12 7 14 1 8 0 0Z" fill="url(#dpg1)"/><path d="M3 1C9-4 15-8 21-10" stroke="rgba(255,255,255,.4)" stroke-width="1.1" fill="none"/></g>
      <g id="dplf2"><path d="M0 0C-3-13 12-22 23-14 34-6 30 9 16 12 7 14 1 8 0 0Z" fill="url(#dpg2)"/><path d="M3 1C9-4 15-8 21-10" stroke="rgba(255,255,255,.26)" stroke-width="1.1" fill="none"/></g>
    </defs>
    <path d="M120 30C108 92 84 150 48 198" stroke="#3e7a3a" stroke-width="3.2" fill="none"/>
    <path d="M122 32C122 110 116 190 124 262" stroke="#447f3e" stroke-width="3.2" fill="none"/>
    <path d="M124 30C144 84 166 140 178 216" stroke="#3e7a3a" stroke-width="3" fill="none"/>
    <path d="M82 6h78l-9 30H91z" fill="url(#dpotg)"/>
    <ellipse cx="121" cy="8" rx="41" ry="8" fill="#8d5a39"/>
    <ellipse cx="121" cy="9" rx="33" ry="5.5" fill="#3c2a18"/>
    <use href="#dplf1" transform="translate(104 58) rotate(165)"/>
    <use href="#dplf2" transform="translate(96 92) rotate(195) scale(1.05)"/>
    <use href="#dplf1" transform="translate(76 122) rotate(150) scale(.92)"/>
    <use href="#dplf2" transform="translate(66 156) rotate(205) scale(1.08)"/>
    <use href="#dplf1" transform="translate(50 186) rotate(160) scale(.95)"/>
    <use href="#dplf2" transform="translate(42 198) rotate(235)"/>
    <use href="#dplf2" transform="translate(118 70) rotate(20) scale(.9)"/>
    <use href="#dplf1" transform="translate(112 112) rotate(185) scale(1.05)"/>
    <use href="#dplf2" transform="translate(120 150) rotate(-8) scale(.95)"/>
    <use href="#dplf1" transform="translate(116 196) rotate(192) scale(1.1)"/>
    <use href="#dplf2" transform="translate(122 238) rotate(12) scale(.98)"/>
    <use href="#dplf1" transform="translate(124 258) rotate(205) scale(.9)"/>
    <use href="#dplf2" transform="translate(146 64) rotate(25) scale(.95)"/>
    <use href="#dplf1" transform="translate(158 104) rotate(-12) scale(1.02)"/>
    <use href="#dplf2" transform="translate(166 142) rotate(28) scale(1.08)"/>
    <use href="#dplf1" transform="translate(174 180) rotate(-6) scale(.92)"/>
    <use href="#dplf2" transform="translate(178 208) rotate(30)"/>
  </svg>`},
  ivy:{x:70,y:-16,svg:`<svg viewBox="0 0 920 120" width="900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="divg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb965"/><stop offset="1" stop-color="#356b35"/></linearGradient>
      <linearGradient id="divg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a9c4d"/><stop offset="1" stop-color="#26512a"/></linearGradient>
      <g id="divl1"><path d="M0 0C-7-7-17-3-15 6-13 14-5 17 0 24 5 17 13 14 15 6 17-3 7-7 0 0Z" fill="url(#divg1)"/><path d="M0 3v17" stroke="rgba(255,255,255,.3)" stroke-width="1"/></g>
      <g id="divl2"><path d="M0 0C-7-7-17-3-15 6-13 14-5 17 0 24 5 17 13 14 15 6 17-3 7-7 0 0Z" fill="url(#divg2)"/><path d="M0 3v17" stroke="rgba(255,255,255,.22)" stroke-width="1"/></g>
    </defs>
    <path d="M0 26Q115 92 230 34Q345 92 460 32Q575 92 690 34Q805 90 920 26" stroke="#3c6e35" stroke-width="2.6" fill="none"/>
    <use href="#divl1" transform="translate(40 40) rotate(-30)"/>
    <use href="#divl2" transform="translate(95 66) rotate(10) scale(1.05)"/>
    <use href="#divl1" transform="translate(150 62) rotate(-15) scale(.85)"/>
    <use href="#divl2" transform="translate(205 40) rotate(20)"/>
    <use href="#divl1" transform="translate(260 42) rotate(-25) scale(.95)"/>
    <use href="#divl2" transform="translate(315 68) rotate(8) scale(1.1)"/>
    <use href="#divl1" transform="translate(370 62) rotate(-12) scale(.9)"/>
    <use href="#divl2" transform="translate(425 38) rotate(18) scale(.8)"/>
    <use href="#divl1" transform="translate(480 42) rotate(-22)"/>
    <use href="#divl2" transform="translate(535 68) rotate(6) scale(1.05)"/>
    <use href="#divl1" transform="translate(590 62) rotate(-14) scale(.9)"/>
    <use href="#divl2" transform="translate(645 40) rotate(24) scale(.85)"/>
    <use href="#divl1" transform="translate(700 42) rotate(-20)"/>
    <use href="#divl2" transform="translate(755 66) rotate(10) scale(1.08)"/>
    <use href="#divl1" transform="translate(810 58) rotate(-10) scale(.9)"/>
    <use href="#divl2" transform="translate(865 36) rotate(22) scale(.8)"/>
  </svg>`},
  cactus:{x:null,y:null,svg:`<svg viewBox="0 0 130 155" width="120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dcbg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fc06a"/><stop offset=".5" stop-color="#5f9c49"/><stop offset="1" stop-color="#3f7434"/></linearGradient>
      <linearGradient id="dcpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c47a4c"/><stop offset="1" stop-color="#8a4c2b"/></linearGradient>
    </defs>
    <rect x="20" y="42" width="15" height="34" rx="7.5" fill="url(#dcbg)"/>
    <rect x="27" y="62" width="24" height="13" rx="6" fill="url(#dcbg)"/>
    <rect x="95" y="30" width="15" height="40" rx="7.5" fill="url(#dcbg)"/>
    <rect x="80" y="56" width="22" height="13" rx="6" fill="url(#dcbg)"/>
    <path d="M65 14c-13 0-19 10-19 26v62h38V40c0-16-6-26-19-26z" fill="url(#dcbg)"/>
    <path d="M57 24v76M65 19v82M73 24v76" stroke="rgba(25,70,30,.3)" stroke-width="2"/>
    <g stroke="#f4f0d8" stroke-width="1.1" stroke-linecap="round" opacity=".85">
      <path d="M50 36l-5-2M52 56l-5 2M50 76l-5-1M78 32l5-2M80 52l5 2M78 74l5-1M27 48l-5-2M29 64l-5 2M103 40l5-2M101 58l5 2"/>
    </g>
    <circle cx="65" cy="13" r="7" fill="#e87da0"/><circle cx="65" cy="13" r="3" fill="#f7d774"/>
    <ellipse cx="65" cy="103" rx="28" ry="6" fill="#46321f"/>
    <rect x="32" y="98" width="66" height="13" rx="4" fill="#b06038"/>
    <path d="M38 111h54l-8 38H46z" fill="url(#dcpg)"/>
  </svg>`},
  lights:{x:55,y:-6,svg:`<svg viewBox="0 0 945 110" width="935" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="fbg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#fff7d8"/><stop offset=".6" stop-color="#ffd98e"/><stop offset="1" stop-color="#f7b35a"/></radialGradient></defs>
    <path d="M0 16C150 78 320 76 472 26C620 78 790 76 945 18" stroke="#46464e" stroke-width="2.4" fill="none"/>
    <g class="bulb" transform="translate(85 44) rotate(-18)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
    <g class="bulb" transform="translate(170 63) rotate(-8)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
    <g class="bulb" transform="translate(255 71) rotate(2)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
    <g class="bulb" transform="translate(340 62) rotate(10)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
    <g class="bulb" transform="translate(420 42) rotate(16)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
    <g class="bulb" transform="translate(530 46) rotate(-16)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
    <g class="bulb" transform="translate(610 64) rotate(-7)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
    <g class="bulb" transform="translate(690 70) rotate(3)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
    <g class="bulb" transform="translate(770 61) rotate(10)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
    <g class="bulb" transform="translate(860 41) rotate(16)"><rect x="-2.5" y="0" width="5" height="6.5" rx="1.2" fill="#2e2e34"/><path class="glass" fill="url(#fbg)" d="M0 6C5.5 9.5 5.5 17 0 20.5C-5.5 17 -5.5 9.5 0 6Z"/><circle cx="0" cy="12.5" r="2.2" fill="#fffbe8" opacity=".95"/></g>
  </svg>`},
  lantern:{x:null,y:null,pin:'brass',svg:`<svg viewBox="0 0 120 205" width="100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="dlgl" cx=".5" cy=".62" r=".75"><stop offset="0" stop-color="#ffe7ae"/><stop offset=".7" stop-color="#f3b95f"/><stop offset="1" stop-color="#d99a3e"/></radialGradient>
      <radialGradient id="dlhalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(255,214,140,.5)"/><stop offset="1" stop-color="rgba(255,214,140,0)"/></radialGradient>
    </defs>
    <ellipse cx="60" cy="100" rx="55" ry="62" fill="url(#dlhalo)"/>
    <path d="M42 38C42 12 78 12 78 38" stroke="#2a2a30" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M34 38h52l-6 14H40z" fill="#2e2e34"/>
    <rect x="38" y="52" width="44" height="84" rx="5" fill="url(#dlgl)" stroke="#26262c" stroke-width="3.5"/>
    <path d="M52 52v84M68 52v84" stroke="#26262c" stroke-width="3"/>
    <rect x="53" y="110" width="14" height="16" rx="2" fill="#f3e6c8"/>
    <path class="flame" d="M60 112c6-9 4-17 0-21-4 4-6 12 0 21z" fill="#ffd98a"/>
    <path class="flameIn" d="M60 110c3-4 2-9 0-11-2 2-3 7 0 11z" fill="#fff3c9"/>
    <path d="M32 136h56l7 13H25z" fill="#2a2a30"/>
    <path d="M40 149l-6 9M80 149l6 9" stroke="#2a2a30" stroke-width="4" stroke-linecap="round"/>
  </svg>`}
};
function spawnDecor(key){
  const d=DECOR[key];
  const pin=d.pin?pinHTML(d.pin):'';
  const x=d.x!=null?d.x+rnd(-18,18):undefined;
  const y=d.y!=null?d.y:undefined;
  const el=spawn(`<div class="item decor">${pin}${d.svg}</div>`,x,y);
  if(key==='lights'||key==='ivy')el.style.setProperty('--r',rnd(-1,1).toFixed(1)+'deg');
  return el;
}
document.querySelectorAll('#panel-decor .chip[data-decor]').forEach(ch=>{
  ch.addEventListener('click',()=>spawnDecor(ch.dataset.decor));
});

/* ================= music player ================= */
const DEVICES={
  cassette:label=>`<svg class="device" viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg" style="width:255px">
    <defs>
      <linearGradient id="dcasb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#52525e"/><stop offset=".06" stop-color="#3a3a45"/><stop offset=".5" stop-color="#2a2a33"/><stop offset="1" stop-color="#1d1d24"/></linearGradient>
      <linearGradient id="dcasl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f1de"/><stop offset="1" stop-color="#e8dfc4"/></linearGradient>
    </defs>
    <rect x="2" y="2" width="256" height="158" rx="12" fill="url(#dcasb)" stroke="#101015" stroke-width="2"/>
    <rect x="5" y="5" width="250" height="152" rx="10" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1.5"/>
    <g fill="#15151b" stroke="#4a4a56" stroke-width="1"><circle cx="14" cy="14" r="3.6"/><circle cx="246" cy="14" r="3.6"/><circle cx="14" cy="148" r="3.6"/><circle cx="246" cy="148" r="3.6"/></g>
    <g stroke="#5a5a66" stroke-width="1"><path d="M11.5 14h5M243.5 14h5M11.5 148h5M243.5 148h5"/></g>
    <rect x="22" y="14" width="216" height="64" rx="4" fill="url(#dcasl)"/>
    <path d="M22 18a4 4 0 0 1 4-4h208a4 4 0 0 1 4 4v8H22z" fill="#c75a4a"/>
    <rect x="22" y="68" width="216" height="3" fill="#7b9ec4"/>
    <text x="130" y="48" text-anchor="middle" font-family="Caveat,cursive" font-size="20" fill="#33333d">${label}</text>
    <text x="130" y="63" text-anchor="middle" font-family="Kalam,cursive" font-size="9.5" fill="#8a8273">side A — via spotify</text>
    <rect x="52" y="90" width="156" height="54" rx="9" fill="#0e0e13" stroke="#000" stroke-width="1.5"/>
    <rect x="55" y="93" width="150" height="48" rx="7" fill="#16161d"/>
    <circle cx="92" cy="117" r="17" fill="#4a3322"/><circle cx="168" cy="117" r="11" fill="#4a3322"/>
    <g class="reel"><circle cx="92" cy="117" r="10" fill="#23232c" stroke="#7a7a88" stroke-width="2.4"/><path d="M92 109v5M92 120v5M84 117h5M95 117h5" stroke="#c4c4d0" stroke-width="2"/></g>
    <g class="reel"><circle cx="168" cy="117" r="10" fill="#23232c" stroke="#7a7a88" stroke-width="2.4"/><path d="M168 109v5M168 120v5M160 117h5M171 117h5" stroke="#c4c4d0" stroke-width="2"/></g>
    <g class="eq" fill="#7fd6a3"><rect x="119" y="108" width="3.6" height="16"/><rect x="124.5" y="108" width="3.6" height="16"/><rect x="130" y="108" width="3.6" height="16"/><rect x="135.5" y="108" width="3.6" height="16"/></g>
    <path d="M55 93h44l-28 48h-16z" fill="rgba(255,255,255,.06)"/>
    <g fill="#101016"><circle cx="78" cy="152" r="2.6"/><circle cx="108" cy="152" r="2.6"/><circle cx="130" cy="152" r="2.6"/><circle cx="152" cy="152" r="2.6"/><circle cx="182" cy="152" r="2.6"/></g>
    <g class="playbtn"><circle cx="130" cy="166" r="12" fill="#d6453c" stroke="#8c241e" stroke-width="1.6"/><path d="M122 161a9 9 0 0 1 16 0" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/><path class="ic-play" d="M126 160v12l10-6z" fill="#fff6ea"/><g class="ic-pause" style="display:none"><rect x="125" y="161" width="3.6" height="10.5" fill="#fff6ea"/><rect x="131.5" y="161" width="3.6" height="10.5" fill="#fff6ea"/></g></g></svg>`,
  walkman:label=>`<svg class="device" viewBox="0 0 270 212" xmlns="http://www.w3.org/2000/svg" style="width:265px">
    <defs>
      <linearGradient id="dwmb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7e8ea0"/><stop offset=".45" stop-color="#55667a"/><stop offset="1" stop-color="#3b4856"/></linearGradient>
    </defs>
    <rect x="2" y="8" width="266" height="196" rx="16" fill="url(#dwmb)" stroke="#1e2630" stroke-width="2"/>
    <rect x="5" y="11" width="260" height="190" rx="14" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="1.2"/>
    <path d="M10 44h250M10 86h250M10 166h250" stroke="rgba(255,255,255,.04)" stroke-width="6"/>
    <text x="22" y="34" font-family="Kalam,cursive" font-size="12" fill="#e8eef4" letter-spacing="3">WALKMAN</text>
    <circle cx="246" cy="30" r="6" fill="#14181d" stroke="#0c0f12" stroke-width="2"/><circle cx="246" cy="30" r="2.4" fill="#000"/>
    <rect x="160" y="22" width="30" height="13" rx="4" fill="#d96a2a" stroke="#8a3c10"/>
    <rect x="197" y="22" width="22" height="13" rx="4" fill="#2a333f" stroke="#161d25"/>
    <rect x="36" y="48" width="198" height="66" rx="9" fill="#0e1116" stroke="#05070a" stroke-width="2"/>
    <rect x="40" y="52" width="190" height="58" rx="7" fill="#1a212a"/>
    <circle cx="100" cy="81" r="16" fill="#4a3322"/><circle cx="172" cy="81" r="11" fill="#4a3322"/>
    <g class="reel"><circle cx="100" cy="81" r="10" fill="#15191f" stroke="#7a8a9c" stroke-width="2.4"/><path d="M100 73v5M100 84v5M92 81h5M103 81h5" stroke="#bccada" stroke-width="2"/></g>
    <g class="reel"><circle cx="172" cy="81" r="10" fill="#15191f" stroke="#7a8a9c" stroke-width="2.4"/><path d="M172 73v5M172 84v5M164 81h5M175 81h5" stroke="#bccada" stroke-width="2"/></g>
    <g class="eq" fill="#f6a35c"><rect x="128" y="72" width="3.5" height="17"/><rect x="133.5" y="72" width="3.5" height="17"/><rect x="139" y="72" width="3.5" height="17"/><rect x="144.5" y="72" width="3.5" height="17"/></g>
    <path d="M40 52h52l-30 58h-22z" fill="rgba(255,255,255,.05)"/>
    <rect x="36" y="124" width="198" height="64" rx="9" fill="#46535f" stroke="#2c3640" stroke-width="2"/>
    <g fill="#222b34"><circle cx="44" cy="132" r="2"/><circle cx="226" cy="132" r="2"/><circle cx="44" cy="180" r="2"/><circle cx="226" cy="180" r="2"/></g>
    <text x="135" y="152" text-anchor="middle" font-family="Caveat,cursive" font-size="18" fill="#dce6ef">${label}</text>
    <text x="135" y="170" text-anchor="middle" font-family="Kalam,cursive" font-size="9.5" fill="#9fb0c0">♪ via spotify</text>
    <g class="playbtn"><circle cx="249" cy="186" r="13" fill="#e8833a" stroke="#9c4f16" stroke-width="1.6"/><path d="M241 181a9.5 9.5 0 0 1 16 0" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/><path class="ic-play" d="M244.5 179.5v13l11-6.5z" fill="#fff6ea"/><g class="ic-pause" style="display:none"><rect x="244" y="180" width="4" height="12" fill="#fff6ea"/><rect x="251" y="180" width="4" height="12" fill="#fff6ea"/></g></g></svg>`,
  discman:label=>`<svg class="device" viewBox="0 0 230 232" xmlns="http://www.w3.org/2000/svg" style="width:225px">
    <defs>
      <radialGradient id="ddmb" cx=".38" cy=".3" r="1"><stop offset="0" stop-color="#e8edf2"/><stop offset=".55" stop-color="#bcc6d0"/><stop offset="1" stop-color="#8a96a2"/></radialGradient>
      <radialGradient id="dcd" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f2f7fa"/><stop offset=".55" stop-color="#c7d3dd"/><stop offset=".8" stop-color="#aebdc9"/><stop offset="1" stop-color="#8e9da9"/></radialGradient>
    </defs>
    <circle cx="115" cy="118" r="106" fill="url(#ddmb)" stroke="#5e6a76" stroke-width="2.5"/>
    <path d="M34 62a104 104 0 0 1 56-40" stroke="rgba(255,255,255,.5)" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M196 174a104 104 0 0 1-50 38" stroke="rgba(30,40,50,.18)" stroke-width="9" fill="none" stroke-linecap="round"/>
    <circle cx="115" cy="118" r="92" fill="none" stroke="rgba(40,50,60,.35)" stroke-width="1.5"/>
    <rect x="72" y="16" width="86" height="22" rx="6" fill="#101418" stroke="#2a3138"/>
    <text x="106" y="31" text-anchor="middle" font-family="Kalam,cursive" font-size="10" fill="#7fd6a3">▸ ${label}</text>
    <g class="eq" fill="#7fd6a3"><rect x="138" y="22" width="2.6" height="11"/><rect x="142" y="22" width="2.6" height="11"/><rect x="146" y="22" width="2.6" height="11"/><rect x="150" y="22" width="2.6" height="11"/></g>
    <g class="reel">
      <circle cx="115" cy="122" r="68" fill="url(#dcd)" stroke="#7c8a96" stroke-width="1.5"/>
      <path d="M115 58a64 64 0 0 1 45 19" stroke="#ff9fb0" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>
      <path d="M115 54a68 68 0 0 1 48 20" stroke="#9fd8ff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>
      <path d="M62 142a64 64 0 0 1-9-28" stroke="#ffe9a8" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M115 122 70 72a68 68 0 0 1 58-15z" fill="rgba(255,255,255,.16)"/>
      <circle cx="115" cy="122" r="30" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1"/>
      <circle cx="115" cy="122" r="21" fill="#e6ebf0" stroke="#9aa8b4"/>
      <circle cx="115" cy="122" r="9" fill="#262b32"/>
    </g>
    <rect x="64" y="206" width="30" height="11" rx="5" fill="#3a444e"/>
    <rect x="136" y="206" width="30" height="11" rx="5" fill="#3a444e"/>
    <g class="playbtn"><circle cx="192" cy="188" r="14" fill="#3b6fd6" stroke="#1f4491" stroke-width="1.6"/><path d="M183 182a10.5 10.5 0 0 1 18 0" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/><path class="ic-play" d="M187 180.5v15l12.5-7.5z" fill="#fff6ea"/><g class="ic-pause" style="display:none"><rect x="186.5" y="182" width="4.2" height="12" fill="#fff6ea"/><rect x="194" y="182" width="4.2" height="12" fill="#fff6ea"/></g></g></svg>`,
  ipod:label=>`<svg class="device" viewBox="0 0 210 272" xmlns="http://www.w3.org/2000/svg" style="width:200px">
    <defs>
      <linearGradient id="dipb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#eef0f3"/><stop offset="1" stop-color="#d2d5db"/></linearGradient>
      <radialGradient id="dipw" cx=".42" cy=".36" r=".9"><stop offset="0" stop-color="#f6f8fb"/><stop offset="1" stop-color="#dde0e6"/></radialGradient>
      <radialGradient id="dipc" cx=".42" cy=".36" r=".9"><stop offset="0" stop-color="#fdfeff"/><stop offset="1" stop-color="#e2e5ea"/></radialGradient>
    </defs>
    <rect x="3" y="3" width="204" height="266" rx="26" fill="url(#dipb)" stroke="#aeb1b9" stroke-width="2"/>
    <rect x="6" y="6" width="198" height="260" rx="23" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.5"/>
    <path d="M9 40v196" stroke="rgba(0,0,0,.05)" stroke-width="5"/>
    <path d="M201 40v196" stroke="rgba(0,0,0,.08)" stroke-width="5"/>
    <rect x="26" y="24" width="158" height="100" rx="9" fill="#15171e" stroke="#2e323c" stroke-width="3"/>
    <rect x="31" y="29" width="148" height="90" rx="6" fill="#0d0f15"/>
    <text x="105" y="64" text-anchor="middle" font-family="Caveat,cursive" font-size="21" fill="#e8ecf4">${label}</text>
    <text x="105" y="82" text-anchor="middle" font-family="Kalam,cursive" font-size="10" fill="#8e96a8">♪ via spotify</text>
    <g class="eq" fill="#7fd6a3"><rect x="89" y="94" width="4" height="16"/><rect x="96" y="94" width="4" height="16"/><rect x="103" y="94" width="4" height="16"/><rect x="110" y="94" width="4" height="16"/></g>
    <path d="M31 29h148L61 119H31z" fill="rgba(255,255,255,.07)"/>
    <circle cx="105" cy="196" r="58" fill="url(#dipw)" stroke="#c6c9d0" stroke-width="1.5"/>
    <circle cx="105" cy="196" r="55" fill="none" stroke="rgba(0,0,0,.05)" stroke-width="4"/>
    <text x="105" y="152" text-anchor="middle" font-family="Helvetica,Arial" font-size="10.5" font-weight="bold" fill="#9aa0ab">MENU</text>
    <path d="M60 193l9-5.5v11zM150 193l-9-5.5v11z" fill="#9aa0ab"/>
    <g class="playbtn"><circle cx="105" cy="196" r="24" fill="url(#dipc)" stroke="#c2c5cc" stroke-width="1.5"/><path d="M89 188a17 17 0 0 1 32 0" stroke="rgba(255,255,255,.8)" stroke-width="3" fill="none"/><path class="ic-play" d="M99 186.5v19l16-9.5z" fill="#6a6f7a"/><g class="ic-pause" style="display:none"><rect x="97.5" y="188" width="5.5" height="16" fill="#6a6f7a"/><rect x="107" y="188" width="5.5" height="16" fill="#6a6f7a"/></g></g></svg>`
};

/* lo-fi WebAudio fallback when no Spotify link is set */
const lofi={
  ac:null,timer:null,crackle:null,master:null,step:0,
  chords:[[261.6,329.6,392,493.9],[220,277.2,329.6,415.3],[174.6,220,261.6,349.2],[196,246.9,293.7,392]],
  start(){
    this.ac=this.ac||new (window.AudioContext||window.webkitAudioContext)();
    const ac=this.ac;ac.resume();
    this.master=ac.createGain();this.master.gain.setValueAtTime(0.0001,ac.currentTime);
    const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=950;
    this.master.connect(lp);lp.connect(ac.destination);
    this.master.gain.exponentialRampToValueAtTime(.16,ac.currentTime+1.2);
    const len=2*ac.sampleRate,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=Math.random()<.0012?(Math.random()*2-1)*.6:0;
    const cr=ac.createBufferSource();cr.buffer=buf;cr.loop=true;
    const cg=ac.createGain();cg.gain.value=.3;cr.connect(cg);cg.connect(this.master);cr.start();
    this.crackle=cr;
    const chord=()=>{
      this.chords[this.step++%this.chords.length].forEach(f=>{
        const o=ac.createOscillator();o.type='triangle';o.frequency.value=f/2;
        o.detune.value=Math.random()*10-5;
        const g=ac.createGain();
        g.gain.setValueAtTime(0,ac.currentTime);
        g.gain.linearRampToValueAtTime(.055,ac.currentTime+.5);
        g.gain.linearRampToValueAtTime(0,ac.currentTime+2.7);
        o.connect(g);g.connect(this.master);
        o.start();o.stop(ac.currentTime+2.9);
      });
    };
    chord();this.timer=setInterval(chord,2900);
  },
  stop(){
    if(!this.ac)return;
    clearInterval(this.timer);
    this.master.gain.linearRampToValueAtTime(0,this.ac.currentTime+.4);
    const cr=this.crackle;setTimeout(()=>{try{cr.stop()}catch(e){}},500);
  }
};

/* Spotify iFrame API: a small embed slips out under the device and our button drives it */
let spotifyApiPromise=null;
function getSpotifyAPI(){
  if(!spotifyApiPromise){
    spotifyApiPromise=new Promise(res=>{
      window.onSpotifyIframeApiReady=api=>res(api);
      const s=document.createElement('script');
      s.src='https://open.spotify.com/embed/iframe-api/v1';s.async=true;
      document.head.appendChild(s);
    });
  }
  return spotifyApiPromise;
}
function parseSpotify(url){
  const m=(url||'').match(/open\.spotify\.com\/(?:embed\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/);
  return m?`spotify:${m[1]}:${m[2]}`:null;
}
async function attachSpotify(el,uri){
  const api=await getSpotifyAPI();
  const slip=document.createElement('div');slip.className='spotify-slip';
  const inner=document.createElement('div');slip.appendChild(inner);
  el.appendChild(slip);
  return new Promise(res=>{
    api.createController(inner,{uri,width:250,height:80},c=>{
      el._spotify=c;
      c.addListener('ready',()=>res(c));
    });
  });
}
function wirePlayer(el,spotifyUrl){
  const btn=el.querySelector('.playbtn');
  const uri=parseSpotify(spotifyUrl);
  if(uri)el._spotifyPending=attachSpotify(el,uri); // sticker shows on the device right away
  let on=false;
  btn.addEventListener('click',async()=>{
    on=!on;
    el.classList.toggle('playing',on);
    el.querySelector('.ic-play').style.display=on?'none':'';
    el.querySelector('.ic-pause').style.display=on?'':'none';
    if(uri){
      const c=await el._spotifyPending;
      if(c){c.togglePlay();return}
    }
    on?lofi.start():lofi.stop();
  });
}
function spawnPlayer(skin,label,spotifyUrl){
  const old=document.getElementById('player');
  let x=742,y=400,r='-3deg';
  if(old){x=parseFloat(old.style.left);y=parseFloat(old.style.top);r=old.style.getPropertyValue('--r')||r;
    if(old._spotify){try{old._spotify.destroy()}catch(e){}}
    old.remove();
  }
  const el=spawn(`<div class="item player skin-${skin}" id="player" style="--r:${r}">${pinHTML()}${DEVICES[skin](label)}</div>`,x,y);
  wirePlayer(el,spotifyUrl);
  return el;
}

/* music panel */
let musicSkin='cassette';
chipGroup('#panel-music .chip[data-skin]',ch=>musicSkin=ch.dataset.skin);
document.getElementById('musicAdd').addEventListener('click',()=>{
  const label=document.getElementById('musicLabel').value.trim()||'late nite tapes ♪';
  const url=document.getElementById('musicUrl').value.trim();
  spawnPlayer(musicSkin,label,url);
});

/* default player + decor on first load */
spawnPlayer('cassette','late nite tapes ♪','');
spawnDecor('pothos');
spawnDecor('lights');

/* ================= wall colour + fit ================= */
document.querySelectorAll('.sw').forEach(s=>{
  s.onclick=()=>document.documentElement.style.setProperty('--wall',s.dataset.c);
});
const wrap=document.getElementById('boardWrap');
function fit(){
  const s=Math.min(1,(innerWidth-36)/1110);
  wrap.style.transform=`scale(${s})`;
  wrap.style.marginBottom=s<1?-(board.offsetHeight+40)*(1-s)+'px':'0';
}
addEventListener('resize',fit);fit();
