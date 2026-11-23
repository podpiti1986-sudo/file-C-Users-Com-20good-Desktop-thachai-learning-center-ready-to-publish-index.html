const crypto=require('node:crypto');
function settings(env=process.env){
  const repo=env.CMS_GITHUB_REPO, origin=env.CMS_ORIGIN||'https://thachai-learning-center.vercel.app';
  if(!repo||!/^podpiti1986-sudo\/[A-Za-z0-9_.-]+$/.test(repo)||!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET||!env.CMS_SESSION_SECRET||env.CMS_SESSION_SECRET.length<32)throw Error('CMS is not configured');
  const parsed=new URL(origin);if(parsed.protocol!=='https:'||parsed.origin!==origin)throw Error('Invalid CMS origin');
  return {repo,origin,client:env.GITHUB_CLIENT_ID,secret:env.GITHUB_CLIENT_SECRET,key:env.CMS_SESSION_SECRET,login:'podpiti1986-sudo'};
}
function sign(value,key){return crypto.createHmac('sha256',key).update(value).digest('base64url');}
function state(key,now=Date.now()){
  const value=Buffer.from(JSON.stringify({nonce:crypto.randomBytes(32).toString('hex'),expires:now+600000})).toString('base64url');
  return value+'.'+sign(value,key);
}
function valid(value,key,now=Date.now()){
  try{const [payload,sig,...extra]=value.split('.');if(extra.length||!payload||!sig)return false;const expected=sign(payload,key);if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return /^[a-f0-9]{64}$/.test(data.nonce)&&data.expires>now&&data.expires<=now+600000;}catch{return false;}
}
function headers(res){res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');}
module.exports={settings,state,valid,headers};
