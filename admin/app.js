(async()=>{
  const status=document.getElementById('status'), message=document.getElementById('message');
  try {
    const schemaResponse=await fetch('schema.json');if(!schemaResponse.ok)throw Error('schema');
    const config=await schemaResponse.json();
    const demo=new URLSearchParams(location.search).get('demo')==='1'&&['localhost','127.0.0.1'].includes(location.hostname);
    if(demo){
      const fields=config.collections[0].files.find(x=>x.name==='news').fields;
      config.backend={name:'test-repo'};
      config.collections=[{name:'demo_news',label:'ทดลองเพิ่มข่าว (ไม่เผยแพร่จริง)',folder:'demo-news',create:true,extension:'json',format:'json',fields}];
      const note=document.createElement('div');note.className='cms-demo';note.textContent='โหมดทดลอง — ไม่บันทึกลง GitHub และไม่เปลี่ยนเว็บไซต์จริง';document.body.append(note);
    }else{
      const response=await fetch('/api/cms-config',{cache:'no-store'});
      if(!response.ok)throw Error('not-connected');
      Object.assign(config,await response.json());
    }
    if(!window.CMS)throw Error('cms-unavailable');
    CMS.init({config,load_config_file:false});status.hidden=true;
  }catch(error){message.textContent=error.message==='cms-unavailable'?'โหลดหน้าจัดการไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตและรีเฟรช':'ระบบหลังบ้านยังไม่เปิดใช้งานจริง ต้องเชื่อม GitHub และตั้งค่าการเข้าสู่ระบบก่อน';}
})();
