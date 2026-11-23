const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function url(value) {
  const raw = String(value || '').trim();
  if (!raw || /[\x00-\x20\\]/.test(raw) || raw.startsWith('//')) throw Error('Invalid link');
  if (/^(https:\/\/|mailto:|tel:)/i.test(raw)) return raw;
  if (/^[a-z0-9][a-z0-9_./#?%=&-]*$/i.test(raw) && !raw.includes('..')) return raw;
  if (/^#[a-z0-9-]+$/i.test(raw)) return raw;
  throw Error('Only HTTPS, email, telephone and site links are allowed');
}
function block(b) {
  switch (b.type) {
    case 'text': return (b.heading ? `<h3>${esc(b.heading)}</h3>` : '') + (b.body ? `<p>${esc(b.body).replace(/\n/g,'<br/>')}</p>` : '');
    case 'image': return `<img src="${esc(url(b.image))}" alt="${esc(b.alt)}" loading="lazy" style="max-width:100%;height:auto;max-height:560px;object-fit:contain;margin:20px auto"/>`;
    case 'button': return `<a class="btn btn-outline" href="${esc(url(b.url))}"${/^https:/i.test(b.url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(b.label)}</a>`;
    case 'list': { const tag = b.ordered ? 'ol' : 'ul'; return `<${tag}>${b.items.map(x=>`<li>${esc(x)}</li>`).join('')}</${tag}>`; }
    case 'table': return `<div class="table-scroll"><table><thead><tr>${b.columns.map(x=>`<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.cells.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    default: throw Error('Unsupported content block');
  }
}
function page(data) {
  if (!data.sections.length) return '<section class="tc-empty-content" aria-label="พื้นที่สำหรับเพิ่มเนื้อหา"></section>';
  return `<h1>${esc(data.title)}</h1>` + data.sections.map(s=>{
    if (!/^[a-z0-9-]+$/.test(s.anchor)) throw Error('Invalid section anchor');
    return `<section class="school-section" id="${esc(s.anchor)}"><h2>${esc(s.title)}</h2>${s.blocks.map(block).join('')}</section>`;
  }).join('');
}
module.exports = {esc,url,block,page};
