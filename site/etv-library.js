(() => {
  'use strict';
  const root = document.getElementById('thachai-etv-library');
  if (!root) return;
  const query = root.querySelector('#etv-search');
  const curriculum = root.querySelector('#etv-curriculum');
  const subject = root.querySelector('#etv-subject');
  const level = root.querySelector('#etv-level');
  const grid = root.querySelector('#etv-grid');
  const categories = root.querySelector('#etv-categories');
  const count = root.querySelector('#etv-count');
  const pending = root.querySelector('#etv-pending');
  const empty = root.querySelector('#etv-empty');
  let lessons = [];
  curriculum.replaceChildren(...[['all','ทุกหลักสูตร'],['2551','หลักสูตร พ.ศ. 2551'],['2567','หลักสูตร พ.ศ. 2567']].map(([value,text]) => {
    const option = document.createElement('option'); option.value = value; option.textContent = text; return option;
  }));
  curriculum.value = root.dataset.defaultCurriculum || 'all';
  root.querySelectorAll('.etv-tabs a').forEach(a => {
    if (new URL(a.href).pathname === location.pathname) a.setAttribute('aria-current','page');
  });
  const normalize = text => String(text || '').normalize('NFKC').toLocaleLowerCase('th').replace(/\s+/g,' ').trim();
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function link(url, className, text) {
    const el = node('a',className,text);
    el.href = url; el.target = '_blank'; el.rel = 'noopener noreferrer';
    return el;
  }
  function card(item) {
    const el = node('article','etv-card');
    const cover = link(item.youtubeUrl,'etv-cover');
    cover.setAttribute('aria-label',`รับชม ${item.title} บน YouTube (เปิดแท็บใหม่)`);
    const img = node('img'); img.src = item.thumbnail; img.alt = `ภาพปก ${item.title}`; img.loading = 'lazy'; img.width = 320; img.height = 180;
    cover.append(img,node('span','etv-play','▶ รับชม'));
    const body = node('div','etv-body');
    const badges = node('div','etv-badges');
    badges.append(node('span','',`หลักสูตร ${item.curriculum}`),node('span','',item.levelName));
    body.append(badges,node('h2','',item.title),node('p','etv-lesson',item.lesson),node('p','etv-description',item.description));
    const source = node('p','etv-channel','ต้นทาง: ');
    source.append(link(item.sourceChannelUrl,'',item.sourceChannel));
    body.append(source,link(item.youtubeUrl,'etv-watch','▶ รับชมบทเรียน ↗'));
    el.append(cover,body); return el;
  }
  function render() {
    const terms = normalize(query.value).split(' ').filter(Boolean);
    const filtered = lessons.filter(x => (curriculum.value === 'all' || x.curriculum === curriculum.value) && (subject.value === 'all' || x.subject === subject.value) && (level.value === 'all' || x.level === level.value) && terms.every(term => normalize([x.title,x.subjectName,x.levelName,x.level === 'lower' ? 'ม.ต้น' : 'ม.ปลาย',x.curriculum,x.courseCode,x.lesson,x.description,x.sourceChannel].join(' ')).includes(term)));
    grid.replaceChildren(...filtered.map(card));
    count.textContent = `พบ ${filtered.length} รายการ จากสื่อที่ตรวจสอบแล้ว ${lessons.length} รายการ`;
    pending.hidden = curriculum.value !== '2567' && curriculum.value !== 'all';
    empty.hidden = filtered.length > 0 || (curriculum.value === '2567' && !query.value.trim());
    categories.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed',String(curriculum.value === b.dataset.curriculum && subject.value === b.dataset.subject && level.value === b.dataset.level)));
  }
  function buildCategories() {
    for (const c of ['2551','2567']) for (const s of ['english','social']) for (const l of ['lower','upper']) {
      const b = node('button','etv-category'); b.type = 'button';
      b.dataset.curriculum = c; b.dataset.subject = s; b.dataset.level = l;
      const label = s === 'english' ? 'ภาษาอังกฤษ' : c === '2567' ? 'สังคมศึกษา ประวัติศาสตร์ และหน้าที่พลเมือง' : 'สังคมศึกษา';
      const n = lessons.filter(x => x.curriculum === c && x.subject === s && x.level === l).length;
      b.append(node('small','',`หลักสูตร พ.ศ. ${c}`),node('strong','',`${s === 'english' ? '📘' : '🌏'} ${label}`),node('small','',l === 'lower' ? 'มัธยมศึกษาตอนต้น' : 'มัธยมศึกษาตอนปลาย'),node('span','',n ? `${n} รายการพร้อมรับชม` : '0 รายการ • อยู่ระหว่างรวบรวมสื่อการเรียนรู้'));
      b.addEventListener('click',() => {curriculum.value=c;subject.value=s;level.value=l;query.value='';render();root.querySelector('.etv-filters').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});});
      categories.append(b);
    }
  }
  for (const input of [query,curriculum,subject,level]) input.addEventListener(input === query ? 'input' : 'change',render);
  root.querySelector('#etv-reset').addEventListener('click',() => {query.value='';curriculum.value='all';subject.value='all';level.value='all';render();});
  fetch('etv-lessons.json').then(response => {if (!response.ok) throw new Error('catalog');return response.json();}).then(data => {
    const seen = new Set();
    lessons = data.lessons.filter(x => {
      const valid = x.verificationStatus === 'verified' && /^[A-Za-z0-9_-]{11}$/.test(x.videoId) && x.youtubeUrl === `https://www.youtube.com/watch?v=${x.videoId}` && x.thumbnail === `https://i.ytimg.com/vi/${x.videoId}/mqdefault.jpg` && x.sourceChannelUrl === 'https://www.youtube.com/@etv-youtube2' && ['2551','2567'].includes(x.curriculum) && ['english','social'].includes(x.subject) && ['lower','upper'].includes(x.level) && !seen.has(x.videoId);
      if (valid) seen.add(x.videoId);return valid;
    });
    buildCategories();render();
  }).catch(() => {count.textContent='ยังโหลดคลังสื่อไม่ได้ กรุณาลองโหลดหน้าใหม่ หรือเปิดช่อง ETV จากลิงก์ต้นทางด้านล่าง';});
})();
