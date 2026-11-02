import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { SignJWT } from 'jose';
import login from '../../api/english/login.js';
import logout from '../../api/english/logout.js';
import playback from '../../api/english/playback.js';
import { buildCatalog } from '../../lib/english/catalog.js';
const origin = 'https://site.test';
const code = 'test-only-access-code-with-strong-randomness';
const key = Buffer.alloc(32, 7);
Object.assign(process.env, { WOW_APP_ORIGIN: origin, WOW_FAMILY_CODE_SHA256: createHash('sha256').update(code).digest('hex'), WOW_SESSION_SECRET:key.toString('base64url'), COS_SECRET_ID:'test-id', COS_SECRET_KEY:'test-key', COS_BUCKET:'english-1257786947', COS_REGION:'ap-hongkong' });
const request = (body, headers={}, method='POST') => new Request(origin+'/api/english/test', { method, headers:{ Origin:origin, 'Content-Type':'application/json', ...headers }, ...(method === 'GET' ? {} : {body:typeof body === 'string' ? body : JSON.stringify(body)}) });
const call = (handler, body, headers, method) => handler.fetch(request(body,headers,method));
const token = async (claims={}) => new SignJWT({}).setProtectedHeader({alg:'HS256'}).setIssuer('wow-family').setAudience('wow-family-english').setSubject('family').setIssuedAt(claims.iat ?? Math.floor(Date.now()/1000)).setExpirationTime(claims.exp ?? Math.floor(Date.now()/1000)+60).sign(key);
const cookie = t => `__Host-wow_session=${t}`;
test('login, cookie, logout and offline COS signing', async () => {
 let r = await call(login,{code}); assert.equal(r.status,200); assert.match(r.headers.get('cache-control'),/no-store/); const c=r.headers.get('set-cookie'); assert.match(c,/Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200/);
 r=await call(playback,{lessonId:'616d50ebbf266515'},{Cookie:c.split(';')[0]}); assert.equal(r.status,200); const data=await r.json(), u=new URL(data.url); assert.equal(u.host,'english-1257786947.cos.ap-hongkong.myqcloud.com'); assert.equal(decodeURIComponent(u.pathname),'/Wow/01.第一级 黄色Wow!Yellow（3-4岁）33集全/001.Wow!Yellow Unit 1 hello video_story.mp4'); const [start,end]=u.searchParams.get('q-sign-time').split(';').map(Number); assert.equal(end-start,300); assert.equal(u.searchParams.get('q-header-list'),'host'); assert(Date.parse(data.expiresAt)<=end*1000);
 process.env.COS_MEDIA_DOMAIN='https://media.example.com'; r=await call(playback,{lessonId:'616d50ebbf266515'},{Cookie:c.split(';')[0]}); assert.equal(new URL((await r.json()).url).host,'media.example.com'); delete process.env.COS_MEDIA_DOMAIN;
 r=await call(logout,{}); assert.equal(r.status,200); assert.match(r.headers.get('set-cookie'),/Max-Age=0/);
});
test('request validation, malformed bodies and no configuration', async () => {
 assert.equal((await call(login,{code},{},'GET')).status,405);
 for (const h of [{Origin:'https://evil.test'},{Origin:'null'},{'Sec-Fetch-Site':'cross-site'}]) assert.equal((await call(login,{code},h)).status,403);
 const noOrigin=request({code}); noOrigin.headers.delete('origin'); assert.equal((await login.fetch(noOrigin)).status,403);
 assert.equal((await call(login,{code},{'Content-Type':'text/plain'})).status,415);
 assert.equal((await call(login,'x'.repeat(1025))).status,413);
 for(const body of ['{','[]','null',JSON.stringify({code,extra:1})]) assert.equal((await call(login,body)).status,400);
 assert.equal((await call(login,{code:'wrong'})).status,401); assert.equal((await call(login,{code:''})).status,401);
 const previous=process.env.WOW_APP_ORIGIN; delete process.env.WOW_APP_ORIGIN; assert.equal((await call(login,{code})).status,503); process.env.WOW_APP_ORIGIN=previous;
 const old=process.env.WOW_SESSION_SECRET; process.env.WOW_SESSION_SECRET='bad'; assert.equal((await call(login,{code})).status,503); process.env.WOW_SESSION_SECRET=old;
 const hash=process.env.WOW_FAMILY_CODE_SHA256; process.env.WOW_FAMILY_CODE_SHA256='bad'; assert.equal((await call(login,{code})).status,503); assert.equal((await call(playback,{lessonId:'616d50ebbf266515'},{Cookie:cookie(await token())})).status,503); process.env.WOW_FAMILY_CODE_SHA256=hash;
});
test('session expiry, integrity, scope, and exact catalog authorization', async () => {
 const lessonId='616d50ebbf266515'; assert.equal((await call(playback,{lessonId})).status,401);
 const good=await token(); for (const t of [good+'x', await token({iat:1,exp:2}), await new SignJWT({}).setProtectedHeader({alg:'HS256'}).setIssuer('wrong').setAudience('wow-family-english').setSubject('family').setIssuedAt().setExpirationTime('1h').sign(key)]) assert.equal((await call(playback,{lessonId},{Cookie:cookie(t)})).status,401);
 assert.equal((await call(playback,{lessonId},{Cookie:`${cookie(good)}; ${cookie(good)}`})).status,401);
 for (const id of ['../x','not-in-catalog','lessons/616d50ebbf266515.mp4',null]) assert.equal((await call(playback,{lessonId:id},{Cookie:cookie(good)})).status,404);
 assert.equal((await call(playback,{lessonId,key:'x'},{Cookie:cookie(good)})).status,400);
 const old=process.env.COS_SECRET_KEY; delete process.env.COS_SECRET_KEY; assert.equal((await call(playback,{lessonId},{Cookie:cookie(good)})).status,503); process.env.COS_SECRET_KEY=old;
 process.env.COS_MEDIA_DOMAIN='http://bad.test'; assert.equal((await call(playback,{lessonId},{Cookie:cookie(good)})).status,503); delete process.env.COS_MEDIA_DOMAIN;
 assert.throws(()=>buildCatalog({totalLessons:2,levels:[{lessons:[{id:'a',videoKey:'lessons/a.mp4'},{id:'a',videoKey:'lessons/a.mp4'}]}]}));
 assert.throws(()=>buildCatalog({totalLessons:1,levels:[{lessons:[{id:'a',videoKey:'../a'}]}]}));
 assert.throws(()=>buildCatalog({totalLessons:1,levels:[{lessons:[{id:'a',videoKey:'Wow/01.第一级 黄色Wow!Yellow（3-4岁）33集全/../secret.mp4'}]}]}));
 assert.throws(()=>buildCatalog({totalLessons:1,levels:[{lessons:[{id:'a',videoKey:'Wow/02.第二级 蓝色Wow!Blue(4-6岁) 33集全/a.mp4'}]}]}));
 assert.equal(buildCatalog({totalLessons:1,levels:[{lessons:[{id:'a',videoKey:"Wow/01.第一级 黄色Wow!Yellow（3-4岁）33集全/012.Wow!Yellow Unit 4 'toys' - part 2 video_story.mp4"}]}]}).get('a'),"Wow/01.第一级 黄色Wow!Yellow（3-4岁）33集全/012.Wow!Yellow Unit 4 'toys' - part 2 video_story.mp4");
});

test('streamed body limit and SDK signing errors fail closed without disclosure', async () => {
 const stream = new ReadableStream({start(controller) { controller.enqueue(new TextEncoder().encode('x'.repeat(700))); controller.enqueue(new TextEncoder().encode('y'.repeat(400))); controller.close(); }});
 const req=new Request(origin+'/api/english/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:stream,duplex:'half'});
 assert.equal((await login.fetch(req)).status,413);
 const {default:COS}=await import('cos-nodejs-sdk-v5'); const original=COS.prototype.getObjectUrl;
 try { COS.prototype.getObjectUrl=function(_options,callback) { callback(new Error('sensitive diagnostic')); }; const r=await call(playback,{lessonId:'616d50ebbf266515'},{Cookie:cookie(await token())}); assert.equal(r.status,502); assert.equal((await r.json()).error.code,'SIGNING_FAILED'); assert.match(r.headers.get('cache-control'),/no-store/); }
 finally { COS.prototype.getObjectUrl=original; }
});
