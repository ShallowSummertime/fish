import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
test('plan empty state, contextual progress, search and selection pagination', async () => {
 const catalog = JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom = new JSDOM('<main id="app"></main>', { url:'https://site.test/english/' });
 for (const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 globalThis.fetch = async url => url.endsWith('catalog.json') ? {ok:true,json:async()=>catalog} : {ok:false,status:401,json:async()=>({})};
 await import('../../english/app.js?catalog-ui');
 document.querySelector('[data-view="plan"]').click();
 assert.match(document.querySelector('.hero-count strong').textContent,/^0$/); assert.equal(document.querySelector('#clear-plan'),null); assert(document.querySelector('.empty [data-view="library"]'));
 document.querySelector('.empty [data-view="library"]').click();
 assert.equal(document.querySelectorAll('.card').length,24);
 const search=document.querySelector('#search'); search.value='level 1'; search.setSelectionRange(2,4,'backward'); search.dispatchEvent(new dom.window.Event('input'));
 assert.equal(document.activeElement.id,'search'); assert.equal(document.activeElement.selectionStart,2); assert.equal(document.activeElement.selectionEnd,4); assert.equal(document.activeElement.selectionDirection,'backward');
 assert(document.querySelectorAll('.card').length>0); assert([...document.querySelectorAll('.badge')].every(el=>el.textContent.includes('Level 1')));
 document.querySelector('#toggle-select').click(); assert.equal(document.activeElement.id,'toggle-select'); document.querySelector('#select-visible').click(); assert.equal(document.activeElement.id,'select-visible');
 document.querySelector('#clear-selection').click(); assert.equal(document.activeElement.id,'clear-selection'); document.querySelector('#select-visible').click();
 assert.equal(document.querySelectorAll('[data-select]:checked').length,24); document.querySelector('#next').click(); assert.equal(document.activeElement.id,'previous');
 assert(document.querySelector('#add-selected').textContent.includes('24')); document.querySelector('#add-selected').click(); assert.equal(document.activeElement.id,'toggle-select');
 assert.match(document.querySelector('.feedback').textContent,/24/); assert.equal(document.querySelector('.selection-bar'),null);
 document.querySelector('[data-view="plan"]').click(); assert.equal(document.querySelector('.hero-count strong').textContent,'24'); assert.match(document.querySelector('.hero p').textContent,/0 \/ 24/);
 document.querySelector('[data-view="library"]').click(); document.querySelector('#toggle-select').click(); const weekly=document.querySelector('[data-select]'); weekly.checked=true; weekly.dispatchEvent(new dom.window.Event('change')); document.querySelector('#add-selected-week').click();
 assert.match(document.querySelector('.feedback').textContent,/本周计划/); document.querySelector('[data-view="week"]').click(); assert.equal(document.querySelector('.hero-count strong').textContent,'1'); assert.match(document.querySelector('.hero p').textContent,/本周已完成 0 \/ 1/); assert.equal(document.querySelectorAll('.plan-grid .card').length,1);
 dom.window.close();
});
test('catalog, plan, deep link, completion and bilingual UI work without old requests', async () => {
 const catalog = JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom = new JSDOM('<main id="app"></main>', { url:'https://site.test/english/' });
 for (const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true, writable: true });
 const requests=[]; globalThis.fetch = async url => { requests.push(url); return url.endsWith('catalog.json') ? {ok:true,json:async()=>catalog} : {ok:false,status:503,json:async()=>({error:{code:'NOT_CONFIGURED'}})}; };
 await import('../../english/app.js');
 assert.equal(document.querySelectorAll('[data-open]').length,24);
 const id = catalog.levels[0].lessons[0].id;
 document.querySelector(`[data-plan="${id}"]`).click();
 document.querySelector('[data-view="plan"]').click();
 assert.equal(document.querySelectorAll('[data-open]').length,1);
 document.querySelector(`[data-open="${id}"]`).click();
 assert.equal(new URL(location.href).searchParams.get('lesson'),id);
 await new Promise(resolve=>setTimeout(resolve,0)); assert.match(document.querySelector('[role="status"]').textContent,/视频尚未配置/);
 assert.equal(document.querySelector('video').hasAttribute('src'),false);
 assert.equal(document.querySelector('#learning-controls').hidden,true);
 document.querySelector('#language').click();
 await new Promise(resolve=>setTimeout(resolve,0)); assert.match(document.querySelector('[role="status"]').textContent,/not configured/);
 assert(requests.includes('/api/english/playback')); assert(!requests.some(x=>x.includes('config.json')));
 dom.window.close();
});

test('batch plan changes and confirmed clear preserve learning history', async () => {
 const catalog = JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom = new JSDOM('<main id="app"></main>', { url:'https://site.test/english/' });
 for (const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 globalThis.fetch = async url => url.endsWith('catalog.json') ? {ok:true,json:async()=>catalog} : {ok:false,status:401,json:async()=>({})};
 const { freshState, dateKey, weekKey } = await import('../../english/state.js');
 const [a,b] = catalog.levels[0].lessons, initial = freshState(), today = dateKey(), week = weekKey();
 initial.plans.week = {key:week,lessonIds:[b.id],reviewLessonIds:[]};
 initial.planProgress[`week:${week}`] = [b.id]; initial.completed[a.id] = true; initial.completed[b.id] = true; initial.watched[a.id] = 17; initial.watched[b.id] = 42;
 localStorage.setItem('wow-family-progress-v1',JSON.stringify(initial));
 await import('../../english/app.js?batch');
 document.querySelector('[data-view="week"]').click(); assert.equal(document.querySelectorAll('.plan-grid .card').length,1); assert.equal(document.querySelector('#clear-plan').disabled,false, 'week-only plan can be cleared');
 document.querySelector('[data-view="library"]').click();
 document.querySelector('#toggle-select').click();
 for (const item of [a,b]) { const box=document.querySelector(`[data-select="${item.id}"]`); box.checked=true; box.dispatchEvent(new dom.window.Event('change')); }
 document.querySelector('#add-selected').click();
 let stored=JSON.parse(localStorage.getItem('wow-family-progress-v1'));
 assert.deepEqual(stored.plans.today.lessonIds,[a.id,b.id]);
 document.querySelector('[data-view="plan"]').click();
 const before=localStorage.getItem('wow-family-progress-v1'); window.confirm=()=>false; document.querySelector('#clear-plan').click();
 assert.equal(localStorage.getItem('wow-family-progress-v1'),before);
 window.confirm=()=>true; document.querySelector('#clear-plan').click();
 stored=JSON.parse(localStorage.getItem('wow-family-progress-v1'));
 assert.deepEqual(stored.plans.today.lessonIds,[]); assert.deepEqual(stored.plans.week.lessonIds,[]);
 assert.equal(stored.planProgress[`today:${today}`],undefined); assert.equal(stored.planProgress[`week:${week}`],undefined);
 assert.equal(stored.completed[a.id],true); assert.equal(stored.completed[b.id],true); assert.equal(stored.watched[a.id],17); assert.equal(stored.watched[b.id],42);
 assert.equal(document.querySelector('#clear-plan'),null);
 dom.window.close();
});

test('player decisions, fullscreen, mode persistence and replay', async () => {
 const { endDecision, restartIfEnded } = await import('../../english/player.js');
 assert.deepEqual(endDecision('auto-next',['a','b'],['a','b'],'a'),{type:'next',nextId:'b'});
 assert.equal(endDecision('auto-next',['a','b'],['a','b'],'b').type,'stop');
 assert.deepEqual(endDecision('repeat-one',['a','b'],[],'a'),{type:'repeat',nextId:'a'});
 assert.deepEqual(endDecision('loop-list',['a','b'],['a','b'],'b'),{type:'next',nextId:'a'});
 assert.equal(endDecision('loop-list',['a'],[],'a').type,'stop');
 const fake={currentTime:99,ended:false}; assert.equal(restartIfEnded(fake,true),true); assert.equal(fake.currentTime,0);
 const catalog=JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom=new JSDOM('<main id="app"></main>',{url:'https://site.test/english/'});
 for (const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 const signed=[]; globalThis.fetch=async (url,opts)=>url.endsWith('catalog.json')?{ok:true,json:async()=>catalog}:{ok:true,json:async()=>{ if(url.endsWith('playback')) signed.push(JSON.parse(opts.body).lessonId); return {url:'https://media.example.com/video?signature=test',expiresAt:new Date(Date.now()+300000).toISOString()}; }};
 let plays=0; dom.window.HTMLMediaElement.prototype.play=function(){ plays++; this.dispatchEvent(new dom.window.Event('play')); return Promise.resolve(); };
 let full=null; Object.defineProperty(document,'fullscreenElement',{get:()=>full,configurable:true});
 document.exitFullscreen=async()=>{full=null;document.dispatchEvent(new dom.window.Event('fullscreenchange'));};
 await import('../../english/app.js?player');
 const [a,b]=catalog.levels[0].lessons;
 document.querySelector('#toggle-select').click();
 for (const item of [a,b]) {const box=document.querySelector(`[data-select="${item.id}"]`);box.checked=true;box.dispatchEvent(new dom.window.Event('change'));}
 document.querySelector('#add-selected').click();document.querySelector(`[data-open="${a.id}"]`).click();
 await new Promise(resolve=>setTimeout(resolve,0)); const video=document.querySelector('video'), stage=document.querySelector('#video-stage');
 Object.defineProperty(video,'duration',{value:120,configurable:true}); video.currentTime=30; video.dispatchEvent(new dom.window.Event('timeupdate')); const seek=document.querySelector('#seek'); assert.equal(seek.getAttribute('aria-label'),'播放进度'); assert.equal(seek.getAttribute('aria-valuetext'),'0:30，共 2:00'); seek.value='500'; seek.dispatchEvent(new dom.window.Event('input')); assert.equal(seek.getAttribute('aria-valuetext'),'1:00，共 2:00');
 const centerToggle=document.querySelector('#center-toggle'); assert(centerToggle); video.dispatchEvent(new dom.window.Event('play')); assert.equal(centerToggle.textContent,'暂停'); video.dispatchEvent(new dom.window.Event('pause')); assert.equal(centerToggle.textContent,'播放');
 stage.requestFullscreen=async()=>{full=stage;document.dispatchEvent(new dom.window.Event('fullscreenchange'));};
 stage.dispatchEvent(new dom.window.Event('pointerdown')); assert(document.querySelector('#player-controls').classList.contains('visible'));
 document.querySelector('#fullscreen').click(); await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(document.querySelector('#fullscreen').getAttribute('aria-pressed'),'true'); assert.equal(plays,1);
 document.querySelector('#fullscreen').click(); await new Promise(resolve=>setTimeout(resolve,0)); assert.equal(document.querySelector('#fullscreen').getAttribute('aria-pressed'),'false');
 stage.requestFullscreen=undefined; let nativeFull=false, nativeEnters=0, nativeExits=0;
 Object.defineProperty(video,'webkitDisplayingFullscreen',{get:()=>nativeFull,configurable:true});
 video.webkitEnterFullscreen=()=>{nativeEnters++;nativeFull=true;video.dispatchEvent(new dom.window.Event('webkitbeginfullscreen'));};
 video.webkitExitFullscreen=()=>{nativeExits++;nativeFull=false;video.dispatchEvent(new dom.window.Event('webkitendfullscreen'));};
 document.querySelector('#fullscreen').click(); await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(nativeEnters,1); assert.equal(document.querySelector('#fullscreen').getAttribute('aria-pressed'),'true');
 document.querySelector('#fullscreen').click(); await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(nativeExits,1); assert.equal(document.querySelector('#fullscreen').getAttribute('aria-pressed'),'false');
 const mode=document.querySelector('#playback-mode'); mode.value='loop-list';mode.dispatchEvent(new dom.window.Event('change'));
 assert.equal(JSON.parse(localStorage.getItem('wow-family-progress-v1')).settings.playbackMode,'loop-list');
 video.dispatchEvent(new dom.window.Event('ended')); await new Promise(resolve=>setTimeout(resolve,0)); assert.equal(new URL(location.href).searchParams.get('lesson'),b.id);
 video.dispatchEvent(new dom.window.Event('ended')); await new Promise(resolve=>setTimeout(resolve,0)); assert.equal(new URL(location.href).searchParams.get('lesson'),a.id);
 mode.value='repeat-one';mode.dispatchEvent(new dom.window.Event('change'));video.currentTime=20;video.dispatchEvent(new dom.window.Event('ended')); await new Promise(resolve=>setTimeout(resolve,0)); assert.equal(signed.at(-1),a.id);
 mode.value='loop-list';mode.dispatchEvent(new dom.window.Event('change')); window.confirm=()=>true;
 // A current lesson outside the plan stops on end; a subsequent play must restart at zero.
 const saved=JSON.parse(localStorage.getItem('wow-family-progress-v1'));saved.plans.today.lessonIds=[];localStorage.setItem('wow-family-progress-v1',JSON.stringify(saved));
 // Remove the plan through the UI so the in-memory state is also updated.
 document.querySelector('[data-view="plan"]').click();document.querySelector('#clear-plan').click();document.querySelector('[data-view="library"]').click();document.querySelector(`[data-open="${a.id}"]`).click();
 await new Promise(resolve=>setTimeout(resolve,0)); const replay=document.querySelector('video'); replay.dispatchEvent(new dom.window.Event('ended')); assert.equal(replay.hasAttribute('src'),false); document.querySelector('#retry-video').click(); await new Promise(resolve=>setTimeout(resolve,0)); assert.equal(signed.at(-1),a.id);
 dom.window.close();
});

test('a failed automatic next lesson hides completion until its media is available', async () => {
 const catalog=JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom=new JSDOM('<main id="app"></main>',{url:'https://site.test/english/'});
 for(const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 const [a,b]=catalog.levels[0].lessons;
 globalThis.fetch=async (url,opts)=>url.endsWith('catalog.json')?{ok:true,json:async()=>catalog}:JSON.parse(opts.body).lessonId===a.id?{ok:true,json:async()=>({url:'https://media.test/a?sig=test',expiresAt:new Date(Date.now()+300000).toISOString()})}:{ok:false,status:503,json:async()=>({})};
 await import('../../english/app.js?failed-next'); document.querySelector(`[data-open="${a.id}"]`).click(); await new Promise(r=>setTimeout(r,0));
 assert.equal(document.querySelector('#learning-controls').hidden,false); document.querySelector('video').dispatchEvent(new dom.window.Event('ended')); await new Promise(r=>setTimeout(r,0));
 assert.equal(new URL(location.href).searchParams.get('lesson'),b.id); assert.equal(document.querySelector('#learning-controls').hidden,true); assert.equal(document.querySelector('#retry-video').hidden,false);
 assert.equal(JSON.parse(localStorage.getItem('wow-family-progress-v1')).completed[b.id],undefined); dom.window.close();
});

test('login, logout and stale playback responses stay scoped to current lesson', async () => {
 const catalog=JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom=new JSDOM('<main id="app"></main>',{url:'https://site.test/english/'});
 for (const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 dom.window.HTMLMediaElement.prototype.pause=function(){};
 const [a,b]=catalog.levels[0].lessons; let signedIn=false, pending; const calls=[];
 globalThis.fetch=async (url,options)=>{
  if(url.endsWith('catalog.json')) return {ok:true,json:async()=>catalog};
  calls.push({url,options});
  if(url.endsWith('/login')) { signedIn=true; return {ok:true,json:async()=>({authenticated:true})}; }
  if(url.endsWith('/logout')) { signedIn=false; return {ok:true,json:async()=>({authenticated:false})}; }
  if(!signedIn) return {ok:false,status:401,json:async()=>({error:{code:'UNAUTHENTICATED'}})};
  const id=JSON.parse(options.body).lessonId;
  if(id===a.id) return new Promise(resolve=>{pending=resolve;});
  return {ok:true,json:async()=>({url:'https://media.test/b?sig=test',expiresAt:new Date(Date.now()+300000).toISOString()})};
 };
 await import('../../english/app.js?authflow'); document.querySelector(`[data-open="${a.id}"]`).click(); await new Promise(r=>setTimeout(r,0));
 assert(document.querySelector('#login-form')); assert.equal(document.querySelector('#learning-controls').hidden,true); document.querySelector('#access-code').value='test access code'; document.querySelector('#login-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})); await new Promise(r=>setTimeout(r,0));
 assert(pending); document.querySelector('#back').click(); document.querySelector(`[data-open="${b.id}"]`).click(); await new Promise(r=>setTimeout(r,0));
 pending({ok:true,json:async()=>({url:'https://media.test/a?sig=test',expiresAt:new Date(Date.now()+300000).toISOString()})}); await new Promise(r=>setTimeout(r,0)); assert.match(document.querySelector('video').src,/\/b\?/); assert.equal(document.querySelector('#learning-controls').hidden,false); assert.equal(document.querySelector('video').hasAttribute('controls'),false);
 document.querySelector('#back').click(); assert(document.querySelector('#logout'),'logout stays in the global header on the library');
 document.querySelector('[data-view="plan"]').click(); assert(document.querySelector('#logout'),'logout stays in the global header on the plan');
 document.querySelector('[data-view="library"]').click(); document.querySelector(`[data-open="${b.id}"]`).click(); await new Promise(r=>setTimeout(r,0));
 document.querySelector('#logout').click(); await new Promise(r=>setTimeout(r,0)); assert(document.querySelector('#login-form')); assert.equal(document.querySelector('video'),null);
 for(const {options} of calls) { assert.equal(options.cache,'no-store'); assert.equal(options.credentials,'same-origin'); assert.equal(options.method,'POST'); }
 dom.window.close();
});

test('expired media triggers at most one automatic refresh until retry', async () => {
 const catalog=JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom=new JSDOM('<main id="app"></main>',{url:'https://site.test/english/'});
 for(const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 let count=0; globalThis.fetch=async url=>url.endsWith('catalog.json')?{ok:true,json:async()=>catalog}:{ok:true,json:async()=>({url:`https://media.test/a?signature=${++count}`,expiresAt:new Date(Date.now()-1000).toISOString()})};
 await import('../../english/app.js?expiry'); document.querySelector(`[data-open="${catalog.levels[0].lessons[0].id}"]`).click(); await new Promise(r=>setTimeout(r,0));
 const video=document.querySelector('video'); assert.equal(count,1); video.dispatchEvent(new dom.window.Event('error')); await new Promise(r=>setTimeout(r,0)); assert.equal(count,2);
 video.dispatchEvent(new dom.window.Event('error')); await new Promise(r=>setTimeout(r,0)); assert.equal(count,2); assert.equal(document.querySelector('#retry-video').hidden,false); dom.window.close();
});

test('renewal retains play intent through paused errors across successive signature cycles', async () => {
 const catalog=JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom=new JSDOM('<main id="app"></main>',{url:'https://site.test/english/'});
 for(const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 let count=0, plays=0; dom.window.HTMLMediaElement.prototype.play=function(){plays++; this.dispatchEvent(new dom.window.Event('play')); return Promise.resolve();};
 globalThis.fetch=async url=>url.endsWith('catalog.json')?{ok:true,json:async()=>catalog}:{ok:true,json:async()=>({url:`https://media.test/a?signature=${++count}`,expiresAt:new Date(Date.now()-1000).toISOString()})};
 await import('../../english/app.js?cycles'); document.querySelector(`[data-open="${catalog.levels[0].lessons[0].id}"]`).click(); await new Promise(r=>setTimeout(r,0));
 const video=document.querySelector('video'); Object.defineProperty(video,'duration',{value:120,configurable:true}); let mediaError=null; Object.defineProperty(video,'error',{get:()=>mediaError});
 video.dispatchEvent(new dom.window.Event('loadedmetadata')); video.dispatchEvent(new dom.window.Event('play')); video.currentTime=24;
 for(let cycle=0;cycle<2;cycle++) { mediaError={code:2}; assert.equal(video.paused,true); video.dispatchEvent(new dom.window.Event('pause')); video.dispatchEvent(new dom.window.Event('error')); await new Promise(r=>setTimeout(r,0)); assert.equal(count,cycle+2); mediaError=null; video.dispatchEvent(new dom.window.Event('loadedmetadata')); assert.equal(video.currentTime,24); assert.equal(plays,cycle+1); }
 dom.window.close();
});

test('failed refresh keeps resume state for retry and prevents repeated automatic requests', async () => {
 const catalog=JSON.parse(await readFile('english/data/catalog.json','utf8')); const dom=new JSDOM('<main id="app"></main>',{url:'https://site.test/english/'});
 for(const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 let calls=0, plays=0; dom.window.HTMLMediaElement.prototype.play=function(){plays++; this.dispatchEvent(new dom.window.Event('play')); return Promise.resolve();};
 globalThis.fetch=async url=>{ if(url.endsWith('catalog.json')) return {ok:true,json:async()=>catalog}; calls++; return calls===2?{ok:false,status:503,json:async()=>({})}:{ok:true,json:async()=>({url:`https://media.test/a?signature=${calls}`,expiresAt:new Date(Date.now()-1000).toISOString()})}; };
 await import('../../english/app.js?retry-resume'); document.querySelector(`[data-open="${catalog.levels[0].lessons[0].id}"]`).click(); await new Promise(r=>setTimeout(r,0));
 const video=document.querySelector('video'); Object.defineProperty(video,'duration',{value:120,configurable:true}); video.dispatchEvent(new dom.window.Event('loadedmetadata')); video.dispatchEvent(new dom.window.Event('play')); video.currentTime=37; video.dispatchEvent(new dom.window.Event('error')); await new Promise(r=>setTimeout(r,0));
 assert.equal(calls,2); video.currentTime=0; video.dispatchEvent(new dom.window.Event('error')); await new Promise(r=>setTimeout(r,0)); assert.equal(calls,2); document.querySelector('#retry-video').click(); await new Promise(r=>setTimeout(r,0)); video.dispatchEvent(new dom.window.Event('loadedmetadata')); assert.equal(video.currentTime,37); assert.equal(plays,1); dom.window.close();
});

test('expired session login preserves pending video position and play intent', async () => {
 const catalog=JSON.parse(await readFile('english/data/catalog.json','utf8')); const dom=new JSDOM('<main id="app"></main>',{url:'https://site.test/english/'});
 for(const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 let calls=0,plays=0; dom.window.HTMLMediaElement.prototype.play=function(){plays++; this.dispatchEvent(new dom.window.Event('play')); return Promise.resolve();};
 globalThis.fetch=async url=>{ if(url.endsWith('catalog.json')) return {ok:true,json:async()=>catalog}; if(url.endsWith('login')) return {ok:true,json:async()=>({})}; calls++; return calls===2?{ok:false,status:401,json:async()=>({})}:{ok:true,json:async()=>({url:`https://media.test/a?signature=${calls}`,expiresAt:new Date(Date.now()-1000).toISOString()})}; };
 await import('../../english/app.js?login-resume'); document.querySelector(`[data-open="${catalog.levels[0].lessons[0].id}"]`).click(); await new Promise(r=>setTimeout(r,0));
 let video=document.querySelector('video'); Object.defineProperty(video,'duration',{value:120,configurable:true}); video.dispatchEvent(new dom.window.Event('loadedmetadata')); video.dispatchEvent(new dom.window.Event('play')); video.currentTime=29; video.dispatchEvent(new dom.window.Event('error')); await new Promise(r=>setTimeout(r,0));
 assert(document.querySelector('#login-form')); document.querySelector('#access-code').value='test'; document.querySelector('#login-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})); await new Promise(r=>setTimeout(r,0)); video=document.querySelector('video'); Object.defineProperty(video,'duration',{value:120,configurable:true}); video.dispatchEvent(new dom.window.Event('loadedmetadata')); assert.equal(video.currentTime,29); assert.equal(plays,1); dom.window.close();
});
