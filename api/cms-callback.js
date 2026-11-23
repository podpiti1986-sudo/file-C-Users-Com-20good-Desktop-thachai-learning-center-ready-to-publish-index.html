const crypto=require('node:crypto');
const {settings,valid,headers}=require('../lib/cms-auth.cjs');
module.exports=async(req,res)=>{
  headers(res);if(req.method!=='GET')return res.status(405).end();
  res.setHeader('Set-Cookie','__Host-tc_oauth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  try{
    const c=settings();const state=req.query.state;const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-tc_oauth='))?.slice('__Host-tc_oauth='.length);
    if(typeof state!=='string'||!cookie||state!==cookie||!valid(state,c.key)||typeof req.query.code!=='string')return res.status(400).end('Invalid or expired login. Please start again.');
    const response=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:c.client,client_secret:c.secret,code:req.query.code,redirect_uri:c.origin+'/api/cms-callback'}),signal:AbortSignal.timeout(15000)});
    const result=await response.json();if(!response.ok||typeof result.access_token!=='string')return res.status(401).end('GitHub login failed');
    const apiHeaders={Authorization:'Bearer '+result.access_token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Thachai-CMS'};
    const userResponse=await fetch('https://api.github.com/user',{headers:apiHeaders,signal:AbortSignal.timeout(15000)});const user=await userResponse.json();
    if(!userResponse.ok||String(user.login).toLowerCase()!==c.login)return res.status(403).end('This GitHub account is not an administrator of this website.');
    const repoResponse=await fetch('https://api.github.com/repos/'+c.repo,{headers:apiHeaders,signal:AbortSignal.timeout(15000)});const repo=await repoResponse.json();
    if(!repoResponse.ok||!repo.permissions?.push||repo.private)return res.status(403).end('The configured public repository is not writable by this account.');
    const nonce=crypto.randomBytes(24).toString('hex');const origin=JSON.stringify(c.origin);const message=JSON.stringify('authorization:github:success:'+JSON.stringify({token:result.access_token,provider:'github'})).replace(/</g,'\\u003c');
    res.setHeader('Content-Security-Policy',`default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'`);res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.status(200).end(`<!doctype html><meta charset="utf-8"><title>เข้าสู่ระบบท่าชัย</title><p>กำลังเชื่อมต่อหน้าจัดการ…</p><script nonce="${nonce}">const origin=${origin};function done(event){if(event.origin!==origin||event.source!==window.opener)return;window.opener.postMessage(${message},origin);window.removeEventListener('message',done);window.close();}window.addEventListener('message',done);if(window.opener)window.opener.postMessage('authorizing:github',origin);</script>`);
  }catch{return res.status(503).end('Unable to complete login. Please start again later.');}
};
