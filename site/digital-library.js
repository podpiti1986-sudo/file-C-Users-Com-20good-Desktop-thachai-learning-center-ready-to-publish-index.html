(() => {
  'use strict';
  const root = document.getElementById('thachai-library');
  if (!root) return;
  const grid = root.querySelector('.pl-grid');
  const search = root.querySelector('#pl-search');
  const empty = root.querySelector('#pl-empty');
  const count = root.querySelector('#pl-count');
  const buttons = [...root.querySelectorAll('[data-age]')];
  const labels = {early:'เด็กเล็ก',school:'เด็กวัยเรียน',teen:'วัยรุ่น',adult:'วัยทำงาน',senior:'ผู้สูงอายุ'};
  let age = 'all';
  const text = (tag, className, value) => {
    const el = document.createElement(tag); el.className = className; el.textContent = value; return el;
  };
  const safeUrl = value => {
    const url = new URL(value, location.href);
    if (url.protocol !== 'https:' && url.origin !== location.origin) throw Error('ลิงก์ไม่ปลอดภัย');
    return url.href;
  };
  function filter() {
    const keyword = search.value.trim().toLocaleLowerCase('th');
    const cards = [...grid.querySelectorAll('.pl-card')];
    let shown = 0;
    cards.forEach(card => {
      const ages = (card.dataset.ages || '').split(' ');
      const match = (age === 'all' || ages.includes(age)) &&
        (card.textContent + ' ' + (card.dataset.search || '')).toLocaleLowerCase('th').includes(keyword);
      card.hidden = !match; if (match) shown++;
    });
    buttons.forEach(button => {
      const value = button.dataset.age;
      const total = cards.filter(card => value === 'all' || (card.dataset.ages || '').split(' ').includes(value)).length;
      button.textContent = (value === 'all' ? 'ทุกช่วงวัย' : labels[value]) + ' (' + total + ')';
      button.setAttribute('aria-pressed', String(value === age));
    });
    count.textContent = `แสดง ${shown} จาก ${cards.length} รายการ`;
    empty.style.display = shown ? 'none' : 'block';
  }
  buttons.forEach(button => button.addEventListener('click', () => { age = button.dataset.age; filter(); }));
  search.addEventListener('input', filter);
  filter();
  fetch('digital-library-books.json').then(response => {
    if (!response.ok) throw Error('โหลดรายการไม่สำเร็จ'); return response.json();
  }).then(data => {
    const fragment = document.createDocumentFragment();
    data.books.forEach(book => {
      const card = text('article','pl-card',''); card.dataset.ages = book.ages.join(' ');
      const cover = document.createElement('img'); cover.className='pl-cover'; cover.loading='lazy';
      cover.src = safeUrl(book.cover); cover.alt = `${book.coverLabel}: ${book.title}`;
      cover.addEventListener('error', () => {
        const fallback = text('div','pl-cover',`ไม่มีภาพปก — ${book.title}`);
        cover.replaceWith(fallback);
      }, {once:true});
      const info = text('div','pl-info','');
      info.append(text('span','pl-tag',book.format),text('h3','',book.title),
        text('span','pl-author','ผู้แต่ง / หน่วยงาน: '+book.author),
        text('span','pl-age',book.ages.map(value => labels[value]).join(' • ')),text('p','pl-desc',book.desc));
      const read = text('a','pl-button','📖 อ่านหนังสือฟรี'); read.href = safeUrl(book.url);
      read.target='_blank'; read.rel='noopener noreferrer';
      read.setAttribute('aria-label','อ่าน '+book.title+' ฟรี เปิดหน้าต่างใหม่');
      const source = text('div','pl-source','');
      const sourceLink = text('a','',book.source); sourceLink.href=safeUrl(book.sourceUrl);
      sourceLink.target='_blank'; sourceLink.rel='noopener noreferrer';
      source.append(document.createTextNode('ที่มา: '),sourceLink,text('p','',book.rights));
      info.append(read,source);card.append(cover,info);fragment.append(card);
    });
    grid.prepend(fragment);
    root.querySelector('#pl-load').hidden=true; filter();
  }).catch(() => { root.querySelector('#pl-load').textContent='โหลดหนังสือเพิ่มเติมไม่สำเร็จ กรุณารีเฟรชหน้าอีกครั้ง'; });
})();
