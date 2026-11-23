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
console.log('Built public website and CMS interface; GitHub login requires configured OAuth credentials.');
