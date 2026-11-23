const fs = require('node:fs');
const path = require('node:path');
const {esc,url,page} = require('./render.cjs');
const root = path.resolve(__dirname,'..'), out = path.join(root,'dist');
if (out !== path.resolve(root,'dist')) throw Error('Invalid build directory');
fs.mkdirSync(out,{recursive:true});
fs.cpSync(path.join(root,'site'),out,{recursive:true});
fs.cpSync(path.join(root,'admin'),path.join(out,'admin'),{recursive:true});
const pages = require('./pages.json');
for (const [key,meta] of Object.entries(pages)) {
  const data = JSON.parse(fs.readFileSync(path.join(root,'content',key+'.json'),'utf8'));
  const target = path.join(out,meta.file); let html = fs.readFileSync(target,'utf8');
  const start = html.indexOf('<div class="wrap">',html.indexOf('<main'));
  const end = html.indexOf('</main>',start);
  if (start < 0 || end < 0) throw Error('Content container missing: '+meta.file);
  const jumps = key==='school' ? `<nav class="section-jump" aria-label="หัวข้อข้อมูลสถานศึกษา">${data.sections.map(s=>`<a href="#${esc(s.anchor)}">${esc(s.title)}</a>`).join('')}</nav>` : '';
  html = html.slice(0,start)+`<div class="wrap"><div class="crumb"><a href="index.html">หน้าแรก</a> / ${esc(data.title)}</div>${jumps}${page(data)}</div>`+html.slice(end);
  fs.writeFileSync(target,html);
}
const settings = require('../content/settings.json'), defaults = require('./default-settings.json');
if (!/^[0-9+ ()-]{8,24}$/.test(settings.phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) throw Error('Invalid contact details');
for (const key of ['facebook','padlet']) url(settings[key]);
for (const name of fs.readdirSync(out).filter(x=>x.endsWith('.html'))) {
  const target=path.join(out,name);let html=fs.readFileSync(target,'utf8');
  for (const key of ['center','teacher','phone','email','facebook','padlet']) html=html.split(esc(defaults[key])).join(esc(settings[key]));
  html=html.split('tel:'+defaults.phone.replace(/\D/g,'')).join('tel:'+settings.phone.replace(/\D/g,''));
  fs.writeFileSync(target,html);
}

// News on the homepage and news page share the same CMS content.
const {block} = require('./render.cjs');
const newsData = JSON.parse(fs.readFileSync(path.join(root,'content/news.json'),'utf8'));
function gallery(images, label) {
  return '<div class="tc-news-gallery" role="region" aria-roledescription="สไลด์ภาพ" aria-label="'+esc(label)+'">'+
    images.map((b,i)=>'<figure class="tc-news-slide"'+(i?' hidden':'')+'><a href="'+esc(url(b.image))+'" target="_blank" rel="noopener noreferrer" aria-label="ดูภาพเต็ม '+(i+1)+'"><img src="'+esc(url(b.image))+'" alt="'+esc(b.alt||label)+'" loading="'+(i?'lazy':'eager')+'" decoding="async"/></a></figure>').join('')+
    (images.length>1?'<div class="tc-news-controls"><button type="button" data-news-prev aria-label="ภาพก่อนหน้า">‹</button><span data-news-count aria-live="off">1 / '+images.length+'</span><button type="button" data-news-next aria-label="ภาพถัดไป">›</button><button type="button" data-news-pause aria-pressed="false">หยุดเล่น</button></div><p class="tc-news-hint">เปลี่ยนภาพทุก 5 วินาที · แตะภาพเพื่อดูขนาดเต็ม</p>':'')+'</div>';
}
const newsStyle = '<style>.tc-news-gallery{padding:16px;min-width:0}.tc-news-slide{margin:0!important}.tc-news-slide[hidden]{display:none!important}.tc-news-slide img{display:block;width:100%;height:560px;max-height:72vh;object-fit:contain;background:#edf5fc;border-radius:12px;margin:0 auto!important}.tc-news-controls{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:14px}.tc-news-controls button{min-width:44px;min-height:44px;padding:8px 14px;border:1px solid #b9d1e8;border-radius:24px;background:white;color:#163c68;cursor:pointer;font:inherit;font-weight:700}.tc-news-controls button:focus-visible{outline:3px solid #1674cf;outline-offset:3px}.tc-news-hint{text-align:center;font-size:13px;color:#42658a;margin:10px 0 0}.tc-news-home-title{padding:0 20px;margin:8px 0;color:#163c68}.tc-news-home-link{display:block;margin:12px 20px 20px}.tc-news-slide:not([hidden]){animation:tcNewsFade .5s ease}@keyframes tcNewsFade{from{opacity:.3}to{opacity:1}}@media(max-width:600px){.tc-news-slide img{height:440px;max-height:68vh}.tc-news-gallery{padding:10px}.tc-news-controls{gap:8px}}@media(prefers-reduced-motion:reduce){.tc-news-slide:not([hidden]){animation:none}}</style>';
function initNewsSlides() {
  document.querySelectorAll('.tc-news-gallery').forEach(function(box){
    var slides=Array.from(box.querySelectorAll('.tc-news-slide'));
    if(slides.length<2)return;
    var current=0,timer=null,paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches,hover=false,focused=false;
    var pause=box.querySelector('[data-news-pause]'),count=box.querySelector('[data-news-count]');
    function show(n){current=(n+slides.length)%slides.length;slides.forEach(function(s,i){s.hidden=i!==current;});count.textContent=(current+1)+' / '+slides.length;}
    function schedule(){clearInterval(timer);timer=null;if(!paused&&!hover&&!focused&&!document.hidden)timer=setInterval(function(){show(current+1);},5000);}
    function update(){pause.textContent=paused?'เล่นต่อ':'หยุดเล่น';pause.setAttribute('aria-pressed',String(paused));schedule();}
    box.querySelector('[data-news-prev]').addEventListener('click',function(){show(current-1);schedule();});
    box.querySelector('[data-news-next]').addEventListener('click',function(){show(current+1);schedule();});
    pause.addEventListener('click',function(){paused=!paused;update();});
    box.addEventListener('mouseenter',function(){hover=true;schedule();});
    box.addEventListener('mouseleave',function(){hover=false;schedule();});
    box.addEventListener('focusin',function(){focused=true;schedule();});
    box.addEventListener('focusout',function(e){focused=box.contains(e.relatedTarget);schedule();});
    box.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(current+(e.key==='ArrowLeft'?-1:1));schedule();}});
    document.addEventListener('visibilitychange',schedule);show(0);update();
  });
}
const newsScript = '<script>('+initNewsSlides.toString()+')();</script>';
const latestSection = [...newsData.sections].reverse().find(s=>s.blocks.some(b=>b.type==='image'));
const homePath = path.join(out,'index.html');
let homeHtml = fs.readFileSync(homePath,'utf8');
const homePattern = /<article class="panel"><div class="panel-heading">📢 ข่าวประชาสัมพันธ์[\s\S]*?<\/article>/;
if (!homePattern.test(homeHtml)) throw Error('Homepage news panel missing');
const homePanel = latestSection ? '<article class="panel"><div class="panel-heading">📢 ข่าวประชาสัมพันธ์ <small>ข่าวล่าสุด</small></div><h3 class="tc-news-home-title">'+esc(latestSection.title)+'</h3>'+gallery(latestSection.blocks.filter(b=>b.type==='image'),latestSection.title)+'<a class="text-link tc-news-home-link" href="news.html#'+esc(latestSection.anchor)+'">อ่านข่าวและกิจกรรมทั้งหมด →</a></article>' : '<article class="panel"><div class="panel-heading">📢 ข่าวประชาสัมพันธ์</div><p style="padding:20px">ยังไม่มีข่าวประชาสัมพันธ์</p></article>';
homeHtml=homeHtml.replace(homePattern,()=>homePanel).replace('</head>',newsStyle+'</head>').replace('</body>',newsScript+'</body>');
fs.writeFileSync(homePath,homeHtml);
const newsPath=path.join(out,'news.html');let newsHtml=fs.readFileSync(newsPath,'utf8');
const newsStart=newsHtml.indexOf('<div class="wrap">',newsHtml.indexOf('<main')),newsEnd=newsHtml.indexOf('</main>',newsStart);
if(newsStart<0||newsEnd<0)throw Error('News content container missing');
const newsSections=[...newsData.sections].reverse().map(function(s){
  if(!/^[a-z0-9-]+$/.test(s.anchor))throw Error('Invalid news section anchor');
  const images=s.blocks.filter(b=>b.type==='image');
  const body=images.length>1?gallery(images,s.title)+s.blocks.filter(b=>b.type!=='image').map(block).join(''):s.blocks.map(block).join('');
  return '<section class="school-section" id="'+esc(s.anchor)+'"><h2>'+esc(s.title)+'</h2>'+body+'</section>';
}).join('');
newsHtml=newsHtml.slice(0,newsStart)+'<div class="wrap"><div class="crumb"><a href="index.html">หน้าแรก</a> / '+esc(newsData.title)+'</div><h1>'+esc(newsData.title)+'</h1>'+newsSections+'</div>'+newsHtml.slice(newsEnd);
newsHtml=newsHtml.replace('</head>',newsStyle+'</head>').replace('</body>',newsScript+'</body>');
fs.writeFileSync(newsPath,newsHtml);

console.log('Built website with CMS news and five-second slideshows.');
