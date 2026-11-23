const {settings,state,headers}=require('../lib/cms-auth.cjs');
module.exports=(req,res)=>{
  headers(res);if(req.method!=='GET')return res.status(405).end();
  try{const c=settings();if(req.query.provider&&req.query.provider!=='github')return res.status(400).end('Unsupported provider');if(req.query.site_id&&req.query.site_id!==new URL(c.origin).hostname)return res.status(400).end('Invalid site');const nonce=state(c.key);res.setHeader('Set-Cookie','__Host-tc_oauth='+nonce+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600');const url=new URL('https://github.com/login/oauth/authorize');url.search=new URLSearchParams({client_id:c.client,redirect_uri:c.origin+'/api/cms-callback',scope:'public_repo',state:nonce}).toString();return res.redirect(302,url.href);}catch{return res.status(503).end('CMS connection is not configured');}
};
