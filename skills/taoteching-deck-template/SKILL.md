---
name: taoteching-deck-template
version: "1.0.0"
description: Single-file HTML slide-deck template for Tao Te Ching chapter decks — ink-style, 10-page narrative, hand-rolled engine, reusable CSS variables and animation classes
dependencies:
  skills: []
  mcps: []
---

# Tao Te Ching Deck Template Skill

This skill is the **HTML / CSS / JS source of truth** for the `taoteching-deck` squad. It documents the canonical 10-page deck skeleton, every reusable class, and every animation keyframe. Copy from here verbatim — do not re-derive.

This skill is dedicated to the *Tao Te Ching* deck format. Other classical-text projects should fork the squad rather than extend this skill.

## Architecture at a Glance

- **One file.** All CSS in a single `<style>` block, all JS in a single inline `<script>`. No `<link>`, no `<script src>`, no `@import`, no remote URL of any kind.
- **Engine.** ~60 lines of vanilla JS implements horizontal slide transitions via `transform: translateX(-cur*100vw)`, plus keyboard / wheel (800ms throttle) / touch (50px swipe) / dot navigation. No reveal.js, no impress.js.
- **10-page rhythm.** Cover (P1), concept overview (P2), original text (P3), five paragraph-by-paragraph analyses (P4–P8), key line (P9), chapter summary (P10).
- **CJK font stack only.** System 楷体 (KaiTi) + 宋体 (SimSun) fallback chain. No web fonts.
- **Three-colour palette.** Gold `#f5c97a` for highlights, red `#c53d43` for paragraph numbers and history (史) labels, green `#2d5a3d` for modern-case borders.
- **Background strategy.** Default = gradient placeholder + TODO comment. Optional = base64 image inlined per slide (file balloons to 4-5 MB).

> **Comment language note.** This skill's prose is in English. The HTML / CSS samples below preserve the Chinese sample copy and CSS comments verbatim because the deliverable is consumed by Chinese-speaking authors and readers. When operators write the actual deck, those Chinese strings (slide titles, chapter text, TODO image hints) stay Chinese.

## CSS Variables (canonical block)

```css
:root {
  --ink:   #1a1a2e;
  --ink2:  #12121f;
  --paper: #f0e6d3;
  --dim:   #b8a88a;
  --red:   #c53d43;
  --gold:  #d4a574;
  --green: #2d5a3d;
  --kai:   "楷体","KaiTi","STKaiti","华文楷体",serif;
  --song:  "宋体","SimSun","STSong",serif;
}
```

The brighter highlight gold used inside `<strong>` and the key-line `<em>` is the literal hex `#f5c97a` (do not promote to a variable; it is intentionally distinct from `--gold`).

## Engine

### Layout primitive

```css
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
html, body {
  height:100%;
  overflow:hidden;
  font-family: var(--song);
  background: var(--ink);
  color: var(--paper);
  -webkit-user-select: none;
  user-select: none;
}
.deck { display:flex; height:100vh; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); }
.slide {
  flex: 0 0 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 60px;
  overflow: hidden;
}
```

### Background halo (subtle ambient glow on every slide)

```css
.slide::before {
  content:''; position:absolute; top:-30%; right:-20%;
  width:60%; height:60%;
  background: radial-gradient(ellipse, rgba(45,90,61,0.1) 0%, transparent 70%);
  border-radius:50%; filter:blur(60px); pointer-events:none;
}
.slide::after {
  content:''; position:absolute; bottom:-20%; left:-15%;
  width:50%; height:50%;
  background: radial-gradient(ellipse, rgba(197,61,67,0.06) 0%, transparent 70%);
  border-radius:50%; filter:blur(80px); pointer-events:none;
}
```

When a slide carries its own opaque mask `::before` (cover, original-text, paragraph, key-line, summary), redeclare the mask on the slide-class selector to override the ambient halo (see per-slide CSS below).

### Slide-entry stagger (declarative, no JS)

```css
.slide .a    { opacity:0; transform: translateY(25px); transition: opacity 0.6s ease, transform 0.6s ease; }
.slide.on .a { opacity:1; transform: translateY(0); }
.slide.on .d1 { transition-delay: .10s; }
.slide.on .d2 { transition-delay: .25s; }
.slide.on .d3 { transition-delay: .40s; }
.slide.on .d4 { transition-delay: .55s; }
.slide.on .d5 { transition-delay: .70s; }
.slide.on .d6 { transition-delay: .85s; }
```

In HTML, write `class="a d2"` to give an element the entry animation with the second delay step. No JS needed.

### Navigation chrome

```css
.arr {
  position:fixed; top:50%; transform:translateY(-50%); z-index:100;
  width:46px; height:46px; display:flex; align-items:center; justify-content:center;
  border:1px solid rgba(240,230,211,0.15); border-radius:50%;
  background:rgba(26,26,46,0.6); backdrop-filter:blur(8px);
  cursor:pointer; transition:all .3s; color:var(--dim); font-size:18px;
}
.arr:hover { border-color:var(--gold); color:var(--gold); background:rgba(212,165,116,0.1); }
.arr-l { left:20px; } .arr-r { right:20px; }
.arr.hide { opacity:0; pointer-events:none; }

.dots {
  position:fixed; bottom:26px; left:50%; transform:translateX(-50%); z-index:100;
  display:flex; gap:10px; align-items:center;
}
.dot {
  width:8px; height:8px; border-radius:50%;
  background:rgba(240,230,211,0.15); cursor:pointer; transition:all .3s;
}
.dot.on { background:var(--gold); width:24px; border-radius:4px; }

.pn {
  position:fixed; top:26px; right:34px; z-index:100;
  font-family:var(--kai); font-size:14px; color:var(--dim);
  opacity:.5; letter-spacing:2px;
}
```

### JS engine (verbatim — copy into the deck)

```html
<script>
!function(){
  var cur=0,dk=document.getElementById('dk'),ss=dk.querySelectorAll('.slide'),
      tot=ss.length,bl=document.getElementById('bl'),br=document.getElementById('br'),
      pn=document.getElementById('pn'),ds=document.getElementById('ds'),busy=0;

  for(var i=0;i<tot;i++){
    var d=document.createElement('div');
    d.className='dot'+(i?'':' on');
    d.setAttribute('data-i',i);
    d.onclick=function(){goTo(+this.getAttribute('data-i'))};
    ds.appendChild(d);
  }

  function goTo(n){
    if(n<0||n>=tot||n===cur||busy)return;
    busy=1;
    ss[cur].classList.remove('on');
    cur=n;
    dk.style.transform='translateX(-'+cur*100+'vw)';
    ui();
    setTimeout(function(){ss[cur].classList.add('on')},100);
    setTimeout(function(){busy=0},600);
  }

  function go(d){goTo(cur+d)}
  window.go=go;

  function ui(){
    bl.classList.toggle('hide',cur===0);
    br.classList.toggle('hide',cur===tot-1);
    pn.textContent=(cur+1)+' / '+tot;
    var dd=ds.querySelectorAll('.dot');
    for(var i=0;i<dd.length;i++)dd[i].classList.toggle('on',i===cur);
  }

  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' '){e.preventDefault();go(1)}
    else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();go(-1)}
  });

  var sx=0,sy=0;
  dk.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  dk.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>50)go(dx<0?1:-1);
  },{passive:true});

  var wt=null;
  // Wheel: full-document capture is intentional — the deck is a fullscreen kiosk, page scroll is never desired.
  document.addEventListener('wheel',function(e){
    e.preventDefault();
    if(wt)return;
    wt=setTimeout(function(){wt=null},800);
    go((Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)>0?1:-1);
  },{passive:false});

  ss[0].classList.add('on');
  ui();
}();
</script>
```

The slide count `tot` is derived from `document.querySelectorAll('.slide')` at runtime — adding or removing a slide requires no JS edit.

## Animation Library (verbatim keyframes)

These class+keyframe pairs power every animated SVG element on every slide. Reuse them; do not invent new keyframes per page.

```css
.an-pulse   { animation: kPulse 3s ease-in-out infinite; transform-origin:center; }
.an-pulse-d { animation-delay: .8s; }
@keyframes kPulse { 0%,100%{ opacity:.3; transform:scale(1); } 50%{ opacity:.7; transform:scale(1.08); } }

.an-glow    { animation: kGlow 4s ease-in-out infinite; }
.an-glow-d  { animation-delay: 1.2s; }
@keyframes kGlow  { 0%,100%{ opacity:.4; } 50%{ opacity:1; } }

.an-bob     { animation: kBob 3.5s ease-in-out infinite; }
.an-b1{animation-delay:0s} .an-b2{animation-delay:.6s}
.an-b3{animation-delay:1.2s} .an-b4{animation-delay:1.8s}
@keyframes kBob   { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-10px); } }

.an-ring    { animation: kRing 4s ease-in-out infinite; }
.an-r1{animation-delay:0s} .an-r2{animation-delay:.5s} .an-r3{animation-delay:1s}
@keyframes kRing  { 0%,100%{ opacity:.15; stroke-dashoffset:0; } 50%{ opacity:.5; stroke-dashoffset:12; } }

.an-drift   { animation: kDrift 5s ease-in-out infinite; }
.an-drift-r { animation: kDrift 5s ease-in-out infinite reverse; }
@keyframes kDrift { 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(6px,-6px); } }

.an-spin    { animation: kSpin 24s linear infinite; transform-origin: 100px 100px; }
.an-spin-r  { animation: kSpin 18s linear infinite reverse; transform-origin: 100px 100px; }
@keyframes kSpin  { from{ transform:rotate(0); } to{ transform:rotate(360deg); } }

.an-fade    { animation: kFade 5s ease-in-out infinite; }
.an-f1{animation-delay:0s} .an-f2{animation-delay:1.5s} .an-f3{animation-delay:3s}
@keyframes kFade  { 0%,100%{ opacity:.2; } 50%{ opacity:.85; } }
```

**Note (`.an-spin` rotation centre):** `transform-origin: 100px 100px` assumes the SVG uses `viewBox="0 0 200 200"` (the canonical 180×180 concept-diagram size in this template). If you author an SVG with a different viewBox, override `transform-origin` inline on the rotating `<g>` so the rotation pivots around the visual centre.

## Per-Slide CSS

### P1 — Cover (`.s-cover`)

```css
.s-cover {
  /* TODO: 替换为封面背景图 base64 — 推荐:山水云雾远景,混沌苍茫感 */
  background: linear-gradient(160deg, #1e1e35 0%, var(--ink) 50%, #0f0f1a 100%);
  background-size: cover;
  background-position: center;
}
.s-cover::before { content:''; position:absolute; inset:0; background:rgba(18,18,31,0.55); pointer-events:none; z-index:0; }
.s-cover > * { position:relative; z-index:1; }

.cv-line  { width:80px; height:1.5px; background: linear-gradient(90deg, transparent, var(--gold), transparent); margin-bottom:32px; }
.cv-title { font-family:var(--kai); font-size:clamp(3.2rem,7vw,5.5rem); font-weight:400; letter-spacing:.3em; text-shadow:0 0 40px rgba(240,230,211,0.1); margin-bottom:24px; }
.cv-sub   { font-family:var(--kai); font-size:clamp(1.1rem,2.5vw,1.5rem); color:var(--gold); letter-spacing:.6em; margin-bottom:16px; }
.cv-desc  { font-size:.9rem; color:var(--dim); letter-spacing:.2em; opacity:.6; }

.seal { display:flex; align-items:center; justify-content:center; width:76px; height:76px; border:2px solid var(--red); border-radius:6px; opacity:.55; margin-top:36px; }
.seal span { display:block; writing-mode:vertical-rl; font-family:var(--kai); font-size:1.2rem; color:var(--red); letter-spacing:.15em; line-height:1.7; height:2.8em; }

.mtn { position:absolute; bottom:0; left:0; right:0; height:180px; pointer-events:none; opacity:.04; }
.mtn::before { content:''; position:absolute; bottom:0; left:8%;  border-left:160px solid transparent; border-right:180px solid transparent; border-bottom:250px solid var(--paper); }
.mtn::after  { content:''; position:absolute; bottom:0; right:12%; border-left:120px solid transparent; border-right:140px solid transparent; border-bottom:200px solid var(--paper); }
```

```html
<div class="slide s-cover on">
  <div class="mtn"></div>
  <div class="cv-line a d1"></div>
  <h1 class="cv-title a d2">道德经学用</h1>
  <p class="cv-sub a d3">第二十五章 · 道法自然</p>
  <p class="cv-desc a d4">有物混成，先天地生</p>
  <div class="seal a d5"><span>道法自然</span></div>
</div>
```

### P2 — Concept Overview (`.s-intro`)

```css
.s-intro {
  /* TODO: 替换为 P2 背景图 base64 — 推荐:深邃星空/混沌氤氲 */
  background: linear-gradient(150deg, #1a1a2e 0%, #0d0d18 100%);
  background-size: cover; background-position: center;
  padding: 60px 80px;
}
.s-intro::before { content:''; position:absolute; inset:0; background:rgba(10,10,20,0.9); z-index:0; }
.s-intro > * { position:relative; z-index:1; }

.sec-t  { font-family:var(--kai); font-size:clamp(2rem,4.5vw,2.8rem); letter-spacing:.25em; text-align:center; margin-bottom:16px; }
.sec-t::after { content:''; display:block; width:50px; height:1.5px; background:var(--red); margin:14px auto 0; }
.in-sub { font-family:var(--kai); font-size:clamp(1.05rem,2.2vw,1.3rem); color:#ffffffcc; text-align:center; letter-spacing:.1em; margin-bottom:44px; text-shadow:0 2px 8px rgba(0,0,0,0.8); }

.in-grid { display:grid; grid-template-columns:1fr 1px 1fr; gap:0 44px; max-width:1060px; width:100%; align-items:start; background:rgba(10,10,20,0.75); border:1px solid rgba(240,230,211,0.06); border-radius:14px; padding:36px 40px; }
.in-divider { background: linear-gradient(180deg, transparent, rgba(212,165,116,0.25), transparent); }
.in-block { padding:0 10px; }
.in-label { font-family:var(--kai); font-size:1.2rem; color:#f5c97a; letter-spacing:.15em; margin-bottom:18px; display:flex; align-items:center; gap:10px; text-shadow:0 2px 8px rgba(0,0,0,0.8); }
.in-label .ico { font-size:.95rem; color:var(--red); opacity:.7; }
.in-p { font-size:1.05rem; line-height:2; color:#ffffffee; letter-spacing:.04em; margin-bottom:14px; text-shadow:0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6); }
.in-p strong { color:#f5c97a; }
.in-quote { margin-top:10px; padding:16px 20px; background:rgba(212,165,116,0.08); border-left:2px solid var(--gold); border-radius:0 8px 8px 0; font-family:var(--kai); font-size:1rem; color:var(--gold); line-height:1.8; letter-spacing:.06em; opacity:.9; }
```

```html
<div class="slide s-intro">
  <h2 class="sec-t a d1">道德经第二十五章 · 道法自然</h2>
  <p class="in-sub a d2">什么是"道"？什么又是"法自然"？</p>
  <div class="in-grid">
    <div class="in-block a d3">
      <div class="in-label"><span class="ico">道</span> 何为"道"</div>
      <p class="in-p"><strong>"道"是先于天地的混成之物</strong>——寂静、空虚、独立不变、循环不息。</p>
      <p class="in-p">老子说"<strong>吾不知其名</strong>"，只能勉强用"道"来称呼。</p>
      <div class="in-quote">道生一，一生二，二生三，三生万物。<br>——《道德经》第四十二章</div>
    </div>
    <div class="in-divider"></div>
    <div class="in-block a d4">
      <div class="in-label"><span class="ico">法</span> 何为"法自然"</div>
      <p class="in-p"><strong>"法"</strong>即效法、遵循。</p>
      <p class="in-p"><strong>人法地，地法天，天法道，道法自然</strong>——层层递进。</p>
      <div class="in-quote">辅万物之自然，而不敢为。<br>——《道德经》第六十四章</div>
    </div>
  </div>
</div>
```

### P3 — Original Text (`.s-text`)

```css
.s-text {
  /* TODO: 替换为 P3 背景图 base64 — 推荐:古卷竹简/水墨留白 */
  background: linear-gradient(145deg, #1c1c30 0%, var(--ink) 60%, #0a0a14 100%);
  background-size: cover; background-position: center;
}
.s-text::before { content:''; position:absolute; inset:0; background:rgba(8,8,16,0.92); z-index:0; }
.s-text > * { position:relative; z-index:1; }
.tx-label { font-family:var(--kai); font-size:.95rem; color:#ffffffaa; letter-spacing:.4em; margin-bottom:36px; text-shadow:0 2px 8px rgba(0,0,0,0.8); }
.tx-deco { width:100px; height:1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
.tx-deco-t { margin-bottom:30px; } .tx-deco-b { margin-top:30px; }
.tx-body { text-align:center; background:rgba(8,8,16,0.8); border:1px solid rgba(240,230,211,0.06); border-radius:14px; padding:40px 60px; max-width:900px; }
.tx-body .ln { font-family:var(--kai); font-size:clamp(1.2rem,2.6vw,1.8rem); line-height:2.2; letter-spacing:.15em; display:block; color:#fff; text-shadow:0 2px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.6); }
```

```html
<div class="slide s-text">
  <p class="tx-label a d1">道德经 · 第二十五章 · 原文</p>
  <div class="tx-deco tx-deco-t a d2"></div>
  <div class="tx-body">
    <span class="ln a d2">有物混成，先天地生。</span>
    <span class="ln a d3">寂兮寥兮，独立而不改，周行而不殆，可以为天地母。</span>
    <span class="ln a d4">吾不知其名，字之曰道，强为之名曰大。</span>
    <span class="ln a d5">人法地，地法天，天法道，道法自然。</span>
  </div>
  <div class="tx-deco tx-deco-b a d6"></div>
</div>
```

### P4–P8 — Paragraph Analysis (`.s-para.s-pN`)

```css
.s-para { padding: 60px 80px; background-size: cover; background-position: center; }
.s-p4 { /* TODO: 第一段背景图 — 推荐:混沌一团/星云螺旋   */ background: linear-gradient(165deg, #1e1e35 0%, var(--ink) 100%); }
.s-p5 { /* TODO: 第二段背景图 — 推荐:雾中孤峰/无字碑     */ background: linear-gradient(165deg, #1e1e35 0%, var(--ink) 100%); }
.s-p6 { /* TODO: 第三段背景图 — 推荐:旋涡/年轮/循环图腾  */ background: linear-gradient(165deg, #1e1e35 0%, var(--ink) 100%); }
.s-p7 { /* TODO: 第四段背景图 — 推荐:四方天地/宫殿剪影   */ background: linear-gradient(165deg, #1e1e35 0%, var(--ink) 100%); }
.s-p8 { /* TODO: 第五段背景图 — 推荐:层叠山峦/层级递进   */ background: linear-gradient(165deg, #1e1e35 0%, var(--ink) 100%); }

.s-p4::before, .s-p5::before, .s-p6::before, .s-p7::before, .s-p8::before, .s-p9::before, .s-p10::before {
  content:''; position:absolute; inset:0; background:rgba(10,10,20,0.88); pointer-events:none; z-index:0;
}
.s-p4 > *, .s-p5 > *, .s-p6 > *, .s-p7 > *, .s-p8 > *, .s-p9 > *, .s-p10 > * { position:relative; z-index:1; }

.pa-container { display:flex; flex-direction:column; gap:22px; max-width:1100px; width:100%; }

.pa-wrap  { display:flex; align-items:center; gap:44px; width:100%; background:rgba(8,8,16,0.8); border:1px solid rgba(240,230,211,0.06); border-radius:14px; padding:28px 40px; }
.pa-left  { flex:0 0 200px; display:flex; align-items:center; justify-content:center; }
.pa-right { flex:1; }

.pa-num   { font-family:var(--kai); font-size:.85rem; color:var(--red); letter-spacing:.25em; margin-bottom:10px; opacity:.65; }
.pa-quote { font-family:var(--kai); font-size:clamp(1.2rem,2.4vw,1.7rem); color:#f5c97a; line-height:1.7; letter-spacing:.12em; margin-bottom:18px; padding-bottom:16px; border-bottom:1px solid rgba(240,230,211,0.08); text-shadow:0 2px 8px rgba(0,0,0,0.7); }
.pa-label { font-family:var(--kai); font-size:.9rem; color:var(--red); letter-spacing:.15em; margin-bottom:8px; text-shadow:0 1px 4px rgba(0,0,0,0.6); }
.pa-text  { font-size:.98rem; line-height:1.95; color:#ffffffdd; letter-spacing:.04em; text-shadow:0 2px 8px rgba(0,0,0,0.7); }
.pa-text strong { color:#f5c97a; }

.pa-svg { width:180px; height:180px; }

.pa-divider-row { display:flex; align-items:center; gap:16px; font-family:var(--kai); color:var(--gold); font-size:.85rem; letter-spacing:.4em; opacity:.75; }
.pa-divider-row::before, .pa-divider-row::after { content:''; flex:1; height:1px; background: linear-gradient(90deg, transparent, rgba(212,165,116,0.35), transparent); }

.pa-cases { display:grid; grid-template-columns:1fr 1fr; gap:18px; width:100%; }
.pa-case  { background:rgba(8,8,16,0.78); border:1px solid rgba(240,230,211,0.08); border-left:3px solid var(--gold); border-radius:10px; padding:18px 22px; display:flex; flex-direction:column; gap:8px; }
.pa-case.modern { border-left-color: var(--green); }
.pa-case-head   { display:flex; align-items:center; gap:10px; font-family:var(--kai); font-size:.9rem; color:var(--gold); letter-spacing:.2em; }
.pa-case.modern .pa-case-head { color:#6db58a; }
.pa-case-icon   { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; font-size:.85rem; border:1px solid currentColor; border-radius:4px; opacity:.8; }
.pa-case-title  { font-family:var(--kai); font-size:1.02rem; color:#f5c97a; letter-spacing:.08em; text-shadow:0 1px 4px rgba(0,0,0,0.6); }
.pa-case.modern .pa-case-title { color:#8fd0a8; }
.pa-case-text   { font-size:.85rem; line-height:1.85; color:#ffffffcc; letter-spacing:.02em; text-shadow:0 1px 4px rgba(0,0,0,0.6); }
.pa-case-text strong { color:#fff; }
```

```html
<div class="slide s-para s-p4">
  <div class="pa-container">
    <div class="pa-wrap">
      <div class="pa-left a d1">
        <!-- SVG concept diagram goes here — see SVG Patterns below -->
      </div>
      <div class="pa-right">
        <div class="pa-num   a d2">第一段 · 道之体</div>
        <div class="pa-quote a d3">有物混成，先天地生。寂兮寥兮，独立而不改，周行而不殆。</div>
        <div class="pa-label a d4">解析</div>
        <div class="pa-text  a d4">在天地形成之前，就有一个浑然一体的存在……<strong>"混成"二字</strong>点出"道"未分化的原始状态。</div>
      </div>
    </div>

    <div class="pa-divider-row a d5"><span>✦ 古今印证 ✦</span></div>

    <div class="pa-cases">
      <div class="pa-case a d5">
        <div class="pa-case-head"><span class="pa-case-icon">史</span> 历史镜鉴</div>
        <div class="pa-case-title">盘古开天 · 浑天说</div>
        <div class="pa-case-text">古代神话讲<strong>"天地混沌如鸡子，盘古生其中"</strong>——朴素地直觉到万物的源头是一种<strong>未分化的整体状态</strong>。</div>
      </div>
      <div class="pa-case modern a d5">
        <div class="pa-case-head"><span class="pa-case-icon">今</span> 现代镜鉴</div>
        <div class="pa-case-title">大爆炸 · 宇宙奇点</div>
        <div class="pa-case-text">现代物理学的<strong>"奇点"</strong>——体积无限小、密度无限大、时空尚未分化的混然存在——与"有物混成"<strong>跨越两千年遥相呼应</strong>。</div>
      </div>
    </div>
  </div>
</div>
```

### P9 — Key Line (`.s-key.s-p9`)

```css
.s-key { /* TODO: P9 背景图 — 推荐:辽阔自然景观/晨曦 */
  background: linear-gradient(135deg, #2d5a3d22 0%, var(--ink) 40%, #1e1e35 100%);
  background-size: cover; background-position: center;
}
.s-p9 { padding: 60px; }

.kk-box  { text-align:center; max-width:880px; }
.kk-pre  { font-family:var(--kai); font-size:1rem; color:var(--dim); letter-spacing:.35em; margin-bottom:36px; opacity:.7; }
.kk-deco { width:60px; height:1px; background:var(--gold); margin:0 auto 36px; opacity:.6; }
.kk-main { font-family:var(--kai); font-size:clamp(2.4rem,5.5vw,4.2rem); color:var(--paper); letter-spacing:.35em; line-height:1.6; margin-bottom:28px; text-shadow:0 0 50px rgba(212,165,116,0.2), 0 2px 12px rgba(0,0,0,0.8); }
.kk-main em { font-style:normal; color:#f5c97a; }
.kk-sub  { font-family:var(--kai); font-size:clamp(1rem,1.8vw,1.2rem); color:#ffffffcc; letter-spacing:.15em; line-height:2; margin-top:36px; text-shadow:0 2px 8px rgba(0,0,0,0.8); }
.kk-sub strong { color:#f5c97a; }
```

```html
<div class="slide s-key s-p9">
  <div class="kk-box">
    <div class="kk-pre a d1">本章金句</div>
    <div class="kk-deco a d1"></div>
    <div class="kk-main a d2">人法地，地法天，<br>天法<em>道</em>，<em>道</em>法<em>自然</em>。</div>
    <div class="kk-sub a d4">
      最高的"道"，效法的是"<strong>自己如此、本来如此</strong>"的状态。<br>
      这是中国哲学最深邃的一句话——一切的根本，是<strong>顺其本性</strong>。
    </div>
  </div>
</div>
```

### P10 — Summary (`.s-sum.s-p10`)

```css
.s-sum { /* TODO: P10 背景图 — 推荐:山水合一/云海日出 */
  background: linear-gradient(140deg, #1e1e35 0%, var(--ink) 40%, #1a2030 100%);
  background-size: cover; background-position: center;
}
.sm-box { max-width:760px; text-align:center; padding:50px; background:rgba(8,8,16,0.85); border:1px solid rgba(212,165,116,0.15); border-radius:16px; position:relative; z-index:1; }
.sm-t   { font-family:var(--kai); font-size:clamp(1.6rem,3.5vw,2.2rem); color:var(--gold); letter-spacing:.35em; margin-bottom:28px; }
.sm-p   { font-size:.95rem; line-height:2.2; color:#ffffffdd; letter-spacing:.05em; text-shadow:0 2px 8px rgba(0,0,0,0.7); }
.sm-p strong { color:#f5c97a; }
```

```html
<div class="slide s-sum s-p10">
  <div class="sm-box">
    <div class="sm-t a d1">本章总结</div>
    <div class="sm-p a d2">本章是老子<strong>宇宙观的总纲</strong>……</div>
    <div class="sm-p a d3" style="margin-top:20px"><strong>"道法自然"是道家思想的最高纲领</strong>——不是顺从自然界，而是顺应万物本来如此的状态。</div>
    <div class="seal a d4" style="margin:28px auto 0"><span>道法自然</span></div>
  </div>
</div>
```

## Responsive Block

```css
@media (max-width:1100px){
  .s-intro{ padding:50px 40px }
  .in-grid{ gap:0 24px }
  .s-para{  padding:50px 40px }
}
@media (max-width:900px){
  .slide{   padding:50px 30px }
  .s-intro{ padding:50px 24px }
  .in-grid{ grid-template-columns:1fr; gap:28px 0 }
  .in-divider{ display:none }
  .s-para{  padding:40px 24px }
  .pa-wrap{ flex-direction:column; gap:18px; text-align:center; padding:24px 20px }
  .pa-left{ flex:0 0 auto }
  .pa-svg{  width:130px; height:130px }
  .pa-cases{ grid-template-columns:1fr; gap:12px }
  .pa-case{ padding:14px 18px }
  .arr{ width:40px; height:40px; font-size:15px }
  .arr-l{ left:10px } .arr-r{ right:10px }
  .sm-box{ padding:30px 20px }
  .tx-body{ padding:30px 24px }
}
@media (max-width:500px){
  .cv-title{ letter-spacing:.15em }
  .slide{   padding:40px 16px }
  .s-para{  padding:40px 16px }
  .arr{ width:36px; height:36px; font-size:13px }
  .arr-l{ left:6px } .arr-r{ right:6px }
  .kk-main{ letter-spacing:.2em }
}
```

## SVG Concept Diagrams (180×180, one per analysis page)

These five patterns covered the 25-chapter reference. Reuse them for analogous concepts in any chapter; remix labels and animation classes freely.

### Pattern A — Concentric circles + central glyph (use for substance-of-the-Tao concepts; e.g., 道之体)

```html
<svg class="pa-svg" viewBox="0 0 200 200">
  <g class="an-spin">
    <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(212,165,116,0.15)" stroke-width="1" stroke-dasharray="3,8"/>
    <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(45,90,61,0.25)"  stroke-width="1" stroke-dasharray="2,10"/>
  </g>
  <g class="an-spin-r">
    <circle cx="100" cy="100" r="42" fill="none" stroke="rgba(197,61,67,0.3)" stroke-width="1" stroke-dasharray="4,6"/>
  </g>
  <circle cx="100" cy="100" r="28" fill="rgba(212,165,116,0.12)" stroke="rgba(212,165,116,0.5)" stroke-width="1" class="an-glow"/>
  <circle cx="100" cy="100" r="14" fill="rgba(212,165,116,0.25)" stroke="none" class="an-pulse"/>
  <text x="100" y="106" text-anchor="middle" fill="rgba(240,230,211,0.7)" font-size="20" font-family="KaiTi,serif">混</text>
</svg>
```

### Pattern B — Question mark + named opposites (use for naming-paradox concepts; e.g., 道之名)

```html
<svg class="pa-svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="58" fill="none" stroke="rgba(240,230,211,0.2)" stroke-width="1" stroke-dasharray="3,5" class="an-ring an-r1"/>
  <text x="100" y="112" text-anchor="middle" fill="rgba(240,230,211,0.35)" font-size="48" font-family="KaiTi,serif" class="an-fade an-f1">?</text>
  <text x="44"  y="158" text-anchor="middle" fill="rgba(212,165,116,0.6)"   font-size="22" font-family="KaiTi,serif" class="an-fade an-f2">道</text>
  <text x="156" y="158" text-anchor="middle" fill="rgba(197,61,67,0.6)"     font-size="22" font-family="KaiTi,serif" class="an-fade an-f3">大</text>
  <line x1="78"  y1="130" x2="56"  y2="148" stroke="rgba(212,165,116,0.25)" stroke-width="1" stroke-dasharray="2,3"/>
  <line x1="122" y1="130" x2="144" y2="148" stroke="rgba(197,61,67,0.25)"   stroke-width="1" stroke-dasharray="2,3"/>
</svg>
```

### Pattern C — Four-direction cycle (use for cyclic concepts; e.g., 道之运 — 大→逝→远→反)

```html
<svg class="pa-svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(212,165,116,0.25)" stroke-width="1" stroke-dasharray="4,6" class="an-spin"/>
  <circle cx="100" cy="40"  r="14" fill="rgba(197,61,67,0.2)"  stroke="rgba(197,61,67,0.6)"  stroke-width="1" class="an-bob an-b1"/>
  <circle cx="160" cy="100" r="14" fill="rgba(212,165,116,0.2)" stroke="rgba(212,165,116,0.6)" stroke-width="1" class="an-bob an-b2"/>
  <circle cx="100" cy="160" r="14" fill="rgba(45,90,61,0.25)"  stroke="rgba(45,90,61,0.65)"  stroke-width="1" class="an-bob an-b3"/>
  <circle cx="40"  cy="100" r="14" fill="rgba(240,230,211,0.15)" stroke="rgba(240,230,211,0.5)" stroke-width="1" class="an-bob an-b4"/>
  <text x="100" y="46"  text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="13" font-family="KaiTi,serif">大</text>
  <text x="160" y="106" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="13" font-family="KaiTi,serif">逝</text>
  <text x="100" y="166" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="13" font-family="KaiTi,serif">远</text>
  <text x="40"  y="106" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="13" font-family="KaiTi,serif">反</text>
  <circle cx="100" cy="100" r="6" fill="rgba(212,165,116,0.5)" class="an-pulse"/>
</svg>
```

### Pattern D — Concentric layered rings (use for hierarchy concepts; e.g., 四大 — 道 / 天 / 地 / 王)

```html
<svg class="pa-svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(212,165,116,0.45)" stroke-width="1.5" class="an-glow"/>
  <text x="100" y="28"  text-anchor="middle" fill="rgba(212,165,116,0.85)" font-size="14" font-family="KaiTi,serif">道</text>
  <circle cx="100" cy="100" r="64" fill="none" stroke="rgba(45,90,61,0.5)" stroke-width="1.2" class="an-glow an-glow-d"/>
  <text x="100" y="50"  text-anchor="middle" fill="rgba(45,90,61,0.95)"  font-size="13" font-family="KaiTi,serif">天</text>
  <circle cx="100" cy="100" r="42" fill="none" stroke="rgba(197,61,67,0.45)" stroke-width="1.2"/>
  <text x="100" y="74"  text-anchor="middle" fill="rgba(197,61,67,0.85)"  font-size="12" font-family="KaiTi,serif">地</text>
  <circle cx="100" cy="100" r="22" fill="rgba(212,165,116,0.2)" stroke="rgba(212,165,116,0.7)" stroke-width="1.5" class="an-pulse"/>
  <text x="100" y="106" text-anchor="middle" fill="rgba(255,255,255,0.95)" font-size="16" font-family="KaiTi,serif">王</text>
</svg>
```

### Pattern E — Descending arrow chain (use for sequential-dependency concepts; e.g., 效法链条 — 自然 → 道 → 天 → 地 → 人)

```html
<svg class="pa-svg" viewBox="0 0 200 220">
  <text x="100" y="28"  text-anchor="middle" fill="rgba(255,255,255,0.95)" font-size="16" font-family="KaiTi,serif" class="an-fade an-f3">自然</text>
  <line x1="100" y1="38"  x2="100" y2="56"  stroke="rgba(212,165,116,0.6)" stroke-width="1" stroke-dasharray="2,3"/>
  <polygon points="96,52 104,52 100,58" fill="rgba(212,165,116,0.6)"/>
  <text x="100" y="74"  text-anchor="middle" fill="rgba(212,165,116,0.85)" font-size="15" font-family="KaiTi,serif" class="an-fade an-f3">道</text>
  <line x1="100" y1="84"  x2="100" y2="102" stroke="rgba(212,165,116,0.5)" stroke-width="1" stroke-dasharray="2,3"/>
  <polygon points="96,98 104,98 100,104" fill="rgba(212,165,116,0.5)"/>
  <text x="100" y="120" text-anchor="middle" fill="rgba(45,90,61,0.85)"   font-size="14" font-family="KaiTi,serif" class="an-fade an-f2">天</text>
  <line x1="100" y1="130" x2="100" y2="148" stroke="rgba(212,165,116,0.4)" stroke-width="1" stroke-dasharray="2,3"/>
  <polygon points="96,144 104,144 100,150" fill="rgba(212,165,116,0.4)"/>
  <text x="100" y="166" text-anchor="middle" fill="rgba(197,61,67,0.85)"   font-size="14" font-family="KaiTi,serif" class="an-fade an-f2">地</text>
  <line x1="100" y1="176" x2="100" y2="190" stroke="rgba(212,165,116,0.3)" stroke-width="1" stroke-dasharray="2,3"/>
  <polygon points="96,186 104,186 100,192" fill="rgba(212,165,116,0.3)"/>
  <text x="100" y="206" text-anchor="middle" fill="rgba(240,230,211,0.85)" font-size="13" font-family="KaiTi,serif" class="an-fade an-f1">人</text>
</svg>
```

## Assembly Outline

> **For most chapters, do not assemble from scratch.** Copy `templates/skeleton.html`, then fill in only the chapter-specific text and SVG content. The assembly outline below is for reference (or for understanding what's in the skeleton); the skeleton is the source of truth — see the "Placeholder Cheatsheet" at the end of this skill for the full `{{TOKEN}}` set the operator must replace.

The assembled deck is built by stitching the canonical sections from this skill into one HTML file. This outline shows where each section lands; it is **not** a runnable file by itself — fill in each placeholder by copying from the corresponding section earlier in this skill.

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>道德经学用 · 第N章 · 章名</title>
<style>
  /* 1) :root variables                                — see "CSS Variables (canonical block)" */
  /* 2) reset + html/body                              — see "Layout primitive" */
  /* 3) .deck / .slide / .slide::before / .slide::after / .slide.on entry transitions
                                                       — see "Layout primitive" + "Background halo" + "Slide-entry stagger" */
  /* 4) .arr / .dots / .pn navigation chrome           — see "Navigation chrome" */
  /* 5) animation library                              — see "Animation Library (verbatim keyframes)" */
  /* 6) per-slide CSS: .s-cover, .s-intro, .s-text,
        .s-para + .s-p4..s-p8, .s-key + .s-p9, .s-sum + .s-p10
                                                       — see each "Per-Slide CSS" subsection */
  /* 7) responsive @media (max-width:1100px), 900px, 500px
                                                       — see "Responsive Block" */
</style>
</head>
<body>

<div class="arr arr-l hide" id="bl" onclick="go(-1)">&#10094;</div>
<div class="arr arr-r"      id="br" onclick="go(1)">&#10095;</div>
<div class="pn" id="pn">1 / 10</div>
<div class="dots" id="ds"></div>

<div class="deck" id="dk">
  <!-- P1 cover         -->  <div class="slide s-cover on">  ...see "Per-Slide CSS — P1"...   </div>
  <!-- P2 overview      -->  <div class="slide s-intro">     ...see "Per-Slide CSS — P2"...   </div>
  <!-- P3 original text -->  <div class="slide s-text">      ...see "Per-Slide CSS — P3"...   </div>
  <!-- P4 paragraph     -->  <div class="slide s-para s-p4"> ...see "Per-Slide CSS — P4–P8".. </div>
  <!-- P5 paragraph     -->  <div class="slide s-para s-p5"> ...                            ..</div>
  <!-- P6 paragraph     -->  <div class="slide s-para s-p6"> ...                            ..</div>
  <!-- P7 paragraph     -->  <div class="slide s-para s-p7"> ...                            ..</div>
  <!-- P8 paragraph     -->  <div class="slide s-para s-p8"> ...                            ..</div>
  <!-- P9 key line      -->  <div class="slide s-key s-p9">  ...see "Per-Slide CSS — P9"...   </div>
  <!-- P10 summary      -->  <div class="slide s-sum s-p10"> ...see "Per-Slide CSS — P10"..   </div>
</div>

<script>
  /* JS engine — see "JS engine (verbatim — copy into the deck)" earlier in this skill */
</script>
</body>
</html>
```

A complete worked Chapter 25 deck (around 41 KB with gradient placeholders) is what every snippet in this skill was extracted from — operators authoring a new chapter can use those snippets as the worked example, then swap the chapter number, title, original text, paragraph commentary, case studies, and SVG label content while keeping every class name and CSS rule intact.

## Background Strategy Reference

| Mode | Trigger | File size | Use when |
|------|---------|-----------|----------|
| Gradient placeholder + TODO | Default | ~40-50 KB | User has not supplied images; deck will be regenerated later with imagery; offline distribution where size matters |
| Base64 inlined backgrounds | User supplies images or asks for the embedded-image variant (嵌图版) | ~4-5 MB | Final polished deliverable; recipient cannot host images separately |

When inlining base64, encode each image as `data:image/jpeg;base64,...` and place inside the slide-class CSS rule, replacing the gradient. Always pair with mask opacity 0.85-0.92 so the busy image does not wash out the text.

Recommended imagery menu by slide (the Chinese phrases are the search prompts an operator should use against any image source — they describe the look, not the page label):

| Slide | Imagery |
|-------|---------|
| P1 cover | 山水云雾远景, 混沌苍茫感 (distant mountain-and-water landscape with clouds; primordial vastness) |
| P2 overview | 深邃星空, 混沌氤氲 (deep starry sky; primordial vapour) |
| P3 original text | 古卷竹简, 水墨留白 (ancient bamboo scroll; ink-wash with white space) |
| P4 | per-chapter, e.g. 混沌一团 / 星云螺旋 (primordial mass / nebula spiral) |
| P5 | per-chapter, e.g. 雾中孤峰 / 无字碑 (lone misty peak / wordless stele) |
| P6 | per-chapter, e.g. 旋涡 / 年轮 / 循环图腾 (vortex / annual rings / cyclic totem) |
| P7 | per-chapter, e.g. 四方天地 / 宫殿剪影 (four-direction cosmos / palace silhouette) |
| P8 | per-chapter, e.g. 层叠山峦 / 层级递进 (layered mountain ranges / cascading hierarchy) |
| P9 key line | 辽阔自然景观, 晨曦, 自然万物 (vast natural landscape; sunrise; the living world) |
| P10 summary | 山水合一, 云海日出 (landscape harmony; sea of clouds at sunrise) |

## UTF-8 Safety (repeat warning)

The deck is heavy CJK content. **Never** generate it with bash heredoc (`cat << EOF`), `echo` redirection containing Chinese characters, or any shell-string concatenation that crosses an encoding boundary. Always write the file via `create` / `edit` tools or Python:

```python
with open("taoteching-33.html", "w", encoding="utf-8") as f:
    f.write(html_content)
```

A single corrupted multi-byte sequence breaks a glyph silently and the page looks fine in your editor but renders garbled in the browser.

## Placeholder Cheatsheet

`templates/skeleton.html` ships with double-brace `{{TOKEN}}` placeholders for every chapter-specific slot. The operator must replace every one before delivery; running `grep '{{' taoteching-{N}.html` after editing should return zero matches.

**Header / cover (P1)**

| Token | Where it lands | Example |
|-------|----------------|---------|
| `{{CHAPTER_NUM}}` | Arabic-numeral chapter number — used in `<title>`, file name, page numbering | `33` |
| `{{CHAPTER_NUM_CN}}` | Chinese numeral form — appears in `.cv-sub` and `.sec-t` | `三十三` |
| `{{CHAPTER_TITLE}}` | Chapter theme title — `.cv-sub` (after the chapter number), the seal, `.sec-t`, and `<title>` | `自知者明` |
| `{{CHAPTER_INCIPIT}}` | Opening line / mood phrase under the cover title (`.cv-desc`) | `知人者智，自知者明` |

**Concept overview (P2)**

| Token | Where it lands | Example |
|-------|----------------|---------|
| `{{P2_QUESTION}}` | The two-part question in `.in-sub` ("什么是 X？什么又是 Y？") | `什么是"知人"？什么又是"自知"？` |
| `{{CONCEPT_A_LABEL}}` | Left-column header glyph + label (`.in-label`) | `何为"知人"` |
| `{{CONCEPT_A_BODY}}` | Left column body — 2–3 `<p class="in-p">` paragraphs | `<p class="in-p">"知人"是…</p>` |
| `{{CONCEPT_A_QUOTE}}` | Left-column reinforcement quote (`.in-quote`) | `知人者智…<br>——《道德经》第三十三章` |
| `{{CONCEPT_B_LABEL}}` | Right-column header glyph + label | `何为"自知"` |
| `{{CONCEPT_B_BODY}}` | Right column body | (analogous) |
| `{{CONCEPT_B_QUOTE}}` | Right-column reinforcement quote | (analogous) |

**Original text (P3)**

| Token | Where it lands | Example |
|-------|----------------|---------|
| `{{ORIGINAL_TEXT_LINES}}` | One or more `<span class="ln a dN">…</span>` lines, the chapter verbatim | `<span class="ln a d2">知人者智，自知者明。</span>…` |

**Per-paragraph analysis (P4 – P8) — same eight tokens repeated for each of P4, P5, P6, P7, P8 (prefixed `P4_` … `P8_`)**

| Token | Where it lands |
|-------|----------------|
| `{{PN_TITLE}}` | `.pa-num` — paragraph label (e.g., `第一段 · 道之体`) |
| `{{PN_QUOTE}}` | `.pa-quote` — the paragraph quoted from the chapter's original text |
| `{{PN_ANALYSIS}}` | `.pa-text` — commentary HTML with `<strong>` highlights |
| `{{PN_SVG}}` | `.pa-left` SVG — copy one of Pattern A / B / C / D / E and remix the labels |
| `{{PN_HISTORY_TITLE}}` / `{{PN_HISTORY_CASE}}` | `.pa-case` (history mirror) — `.pa-case-title` + `.pa-case-text` |
| `{{PN_MODERN_TITLE}}` / `{{PN_MODERN_CASE}}` | `.pa-case.modern` — `.pa-case-title` + `.pa-case-text` |

(`PN` stands for `P4`, `P5`, `P6`, `P7`, or `P8` — replicate the cluster five times.)

**Key line (P9)**

| Token | Where it lands | Example |
|-------|----------------|---------|
| `{{KEY_LINE}}` | `.kk-main` — the standalone canonical key line, `<em>` for accent words | `知人者智，<br>自知者<em>明</em>。` |
| `{{KEY_LINE_INTERPRETATION}}` | `.kk-sub` — interpretation paragraph with `<strong>` highlights | `…顺其本性。` |

**Summary (P10)**

| Token | Where it lands | Example |
|-------|----------------|---------|
| `{{SUMMARY_PARA_1}}` | First `<div class="sm-p">` — chapter argument recap | `本章是老子…` |
| `{{SUMMARY_PARA_2}}` | Second `<div class="sm-p">` — closing exhortation, `<strong>` allowed | `…顺应万物本来如此的状态。` |

**Verification:** after editing the deck, run `grep '{{' taoteching-{N}.html`. The expected count is **zero**. If any token survives, an authoring slot was missed.
