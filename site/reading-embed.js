(() => {
 const frame=document.getElementById('reading-frame');if(!frame)return;
 fetch('reading-config.json').then(r=>{if(!r.ok)throw Error('config');return r.json();}).then(c=>{
  if(!c.webAppUrl)return;
  const u=new URL(c.webAppUrl);if(u.protocol!=='https:'||u.hostname!=='script.google.com'||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u.pathname)||u.search||u.hash)throw Error('invalid app URL');
  if(c.mode!=='live')return;
  frame.src=u.href;document.getElementById('reading-open').href=u.href;document.getElementById('reading-state').textContent='เชื่อมหน้า Google Apps Script แล้ว • การบันทึกจริงสำเร็จต่อเมื่อเซิร์ฟเวอร์ยืนยัน';
 }).catch(()=>{document.getElementById('reading-state').textContent='ยังไม่เชื่อมระบบจริง • เปิดตัวอย่างทดลองได้ ข้อมูลไม่ได้ส่งเข้า Google Sheets';});
})();
