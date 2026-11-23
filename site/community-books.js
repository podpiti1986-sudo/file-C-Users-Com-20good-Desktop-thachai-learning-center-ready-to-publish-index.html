(() => {
 'use strict';
 const root=document.getElementById('thachai-community-books'),poster=document.getElementById('cb-poster');
 if(!root&&!poster)return;
 const places={health:{title:'มุมอ่านสร้างสุขภาพ ณ รพ.สต.',short:'มุมอ่านสร้างสุขภาพ',path:'community-books-health.html',slogan:'รอรับบริการ อ่านความรู้ ดูแลสุขภาพ'},massage:{title:'มุมอ่านภูมิปัญญาไทย ณ กลุ่มนวดแผนไทย',short:'มุมอ่านภูมิปัญญาไทย',path:'community-books-massage.html',slogan:'อ่านเพลิน เรียนรู้การนวด สืบสานภูมิปัญญาไทย'}};
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeUrl=url=>{const u=new URL(url,location.href);if(!['https:','http:'].includes(u.protocol))throw Error('ลิงก์ไม่ถูกต้อง');return u.href;};
 const placeUrl=key=>new URL(places[key].path,location.href).href;
 const qr=async(url,width=768)=>{const c=document.createElement('canvas');await window.PangiewCommunityQR.toCanvas(c,safeUrl(url),{width,margin:4,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#ffffff'}});c.removeAttribute('style');c.setAttribute('role','img');c.setAttribute('aria-label','QR Code สำหรับเปิด '+url);c.dataset.url=safeUrl(url);return c;};
 let items=[];
 const download=async(item)=>{const c=await qr(item.url);const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='thachai-qr-'+item.id+'.png';a.click();};
 const print=async(item)=>{const sheet=document.createElement('section');sheet.className='cb-print-only';sheet.innerHTML='<h1>'+escape(item.title)+'</h1><p>ศกร.ระดับตำบลท่าชัย</p>';sheet.append(await qr(item.url));const p=document.createElement('p');p.textContent=item.url;sheet.append(p);document.body.append(sheet);document.body.classList.add('cb-print-qr');const cleanup=()=>{document.body.classList.remove('cb-print-qr');sheet.remove();};window.addEventListener('afterprint',cleanup,{once:true});try{window.print();}catch(e){cleanup();throw e;}};
 const dialog=document.getElementById('cb-dialog');
 const show=async(item)=>{dialog.querySelector('h2').textContent=item.title;dialog.querySelector('.cb-qr').replaceChildren(await qr(item.url));const link=dialog.querySelector('.cb-url');link.href=item.url;link.textContent=item.url;dialog.querySelector('[data-cb-download]').onclick=()=>download(item).catch(report);dialog.querySelector('[data-cb-print]').onclick=()=>print(item).catch(report);dialog.showModal();};
 const report=e=>{const status=document.getElementById('cb-feedback')||document.getElementById('cb-poster-feedback');if(status)status.textContent='ยังดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง';console.error(e);};
 if(dialog){dialog.querySelector('.cb-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
 const render=()=>{
  const text=root.querySelector('#cb-search').value.trim().toLocaleLowerCase('th');const category=root.querySelector('#cb-category').value;
  const found=items.filter(b=>(category==='all'||b.category===category)&&[b.title,b.source,b.desc].join(' ').toLocaleLowerCase('th').includes(text));
  root.querySelector('.cb-count').textContent='พบ '+found.length+' รายการ จากหนังสือและเอกสารทั้งหมด '+items.length+' รายการ';
  root.querySelector('.cb-grid').innerHTML=found.map(b=>'<article class="cb-card"><div class="cb-cover">'+(b.cover?'<img src="'+escape(b.cover)+'" alt="'+escape(b.coverLabel+' '+b.title)+'" loading="lazy" width="350" height="500"/>':'<div class="cb-fallback">'+escape(b.title)+'<small>ปกสำรอง</small></div>')+'</div><div class="cb-cover-label">'+escape(b.coverLabel)+'</div><div class="cb-body"><span class="cb-tag">'+escape((b.category==='health'?'สุขภาพและผู้สูงอายุ':'ภูมิปัญญาและการนวดไทย')+' • '+b.format)+'</span><h3>'+escape(b.title)+'</h3><p class="cb-source">'+escape(b.source)+'</p><p class="cb-desc">'+escape(b.desc)+'</p><div class="cb-status '+(b.id===4?'pending':'')+'">'+escape(b.verification)+'<br/>'+escape(b.mobileStatus)+(b.note?'<br/>'+escape(b.note):'')+'</div><div class="cb-actions"><a class="cb-button cb-primary" href="'+escape(safeUrl(b.url))+'" target="_blank" rel="noopener noreferrer">อ่านหนังสือออนไลน์ ↗</a><button data-action="show" data-book="'+b.id+'">แสดง QR Code</button><button data-action="download" data-book="'+b.id+'">ดาวน์โหลด QR</button><button data-action="print" data-book="'+b.id+'">พิมพ์ QR Code</button><a class="cb-button" href="'+escape(safeUrl(b.sourceUrl))+'" target="_blank" rel="noopener noreferrer">แหล่งเผยแพร่ ↗</a></div></div></article>').join('')||'<p class="cb-error">ไม่พบหนังสือที่ค้นหา ลองเปลี่ยนคำค้นหรือหมวดหมู่</p>';
  root.querySelectorAll('[data-category]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.category===category)));
  root.querySelectorAll('.cb-cover img').forEach(img=>img.addEventListener('error',()=>{const b=items.find(x=>x.cover===img.getAttribute('src'));const d=document.createElement('div');d.className='cb-fallback';d.textContent=b.title+' — ปกสำรอง';img.replaceWith(d);},{once:true}));
 };
 const drawPoster=async()=>{
  const key=poster.dataset.place,p=places[key];const list=poster.querySelector('.cb-poster-list');
  for(const b of items.filter(b=>b.category===key)){
   const row=document.createElement('article');row.className='cb-poster-row';row.append(await qr(b.url,768));const info=document.createElement('div');info.innerHTML='<h2>'+escape(b.title)+'</h2><p>'+escape(b.source)+'</p>'+(b.id===4?'<p>ต้นทางยังเปิดบนมือถือจำลองไม่สำเร็จ</p>':'');row.append(info);list.append(row);
  }
  const collection=poster.querySelector('.cb-poster-collection');collection.prepend(await qr(placeUrl(key),768));poster.querySelector('.cb-poster-foot').textContent='คลังหนังสือ: '+placeUrl(key)+' • ตรวจต้นทาง 11 ตุลาคม 2569';
  document.getElementById('cb-print-poster').disabled=false;
 };
 fetch('community-books.json').then(r=>{if(!r.ok)throw Error('โหลดข้อมูลไม่สำเร็จ');return r.json();}).then(async data=>{
  items=data.books;
  if(poster){await drawPoster();return;}
  const select=root.querySelector('#cb-category');select.innerHTML='<option value="all">ทุกหมวด ('+items.length+')</option>'+Object.entries(places).map(([k,p])=>'<option value="'+k+'">'+escape(p.short)+' ('+items.filter(b=>b.category===k).length+')</option>').join('');select.value=root.dataset.place||'all';
  root.querySelectorAll('[data-category]').forEach(btn=>{btn.textContent=btn.dataset.category==='all'?'ทั้งหมด ('+items.length+')':places[btn.dataset.category].short+' ('+items.filter(b=>b.category===btn.dataset.category).length+')';btn.onclick=()=>{select.value=btn.dataset.category;render();};});
  root.querySelector('#cb-search').addEventListener('input',render);select.addEventListener('change',render);
  root.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const item=button.dataset.place?{id:button.dataset.place,title:places[button.dataset.place].title,url:placeUrl(button.dataset.place)}:items.find(b=>String(b.id)===button.dataset.book);if(!item)return;({show,download,print}[button.dataset.action])(item).catch(report);});render();
 }).catch(e=>{report(e);const area=root?.querySelector('.cb-grid');if(area)area.innerHTML='<p class="cb-error">ยังโหลดคลังหนังสือไม่ได้ กรุณารีเฟรชหน้า</p>';});
 if(poster)document.getElementById('cb-print-poster').onclick=()=>window.print();
})();
