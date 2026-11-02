import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { mediaUrl } from '../../english/media.js';

test('COS URLs use a validated public base and encoded object keys', () => {
 assert.equal(mediaUrl('', 'lessons/abc.mp4'), null);
 assert.equal(mediaUrl('https://cdn.test/base/', 'lessons/a b.mp4'), 'https://cdn.test/base/lessons/a%20b.mp4');
 for (const base of ['http://cdn.test/', 'https://user:pass@cdn.test/', 'https://cdn.test/base', 'https://cdn.test/?secret=x']) assert.throws(() => mediaUrl(base,'lessons/a.mp4'));
 for (const key of ['/a', '../a', 'a/../b', 'a//b', 'a\\b']) assert.throws(() => mediaUrl('https://cdn.test/base/',key));
});
test('catalog, plan, deep link, completion and bilingual UI work without old requests', async () => {
 const catalog = JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom = new JSDOM('<main id="app"></main>', { url:'https://site.test/english/' });
 for (const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true, writable: true });
 const requests=[]; globalThis.fetch = async url => { requests.push(url); return { ok:true, json:async () => url.endsWith('catalog.json') ? catalog : {mediaBaseUrl:''} }; };
 await import('../../english/app.js');
 assert.equal(document.querySelectorAll('[data-open]').length,catalog.totalLessons);
 const id = catalog.levels[0].lessons[0].id;
 document.querySelector(`[data-plan="${id}"]`).click();
 document.querySelector('[data-view="plan"]').click();
 assert.equal(document.querySelectorAll('[data-open]').length,1);
 document.querySelector(`[data-open="${id}"]`).click();
 assert.equal(new URL(location.href).searchParams.get('lesson'),id);
 assert.match(document.querySelector('[role="status"]').textContent,/视频尚未配置/);
 assert.equal(document.querySelector('video'),null);
 document.querySelector('#complete').click();
 assert.equal(JSON.parse(localStorage.getItem('wow-family-progress-v1')).completed[id],true);
 document.querySelector('#language').click();
 assert.match(document.querySelector('[role="status"]').textContent,/not configured/);
 assert.deepEqual(requests,['/english/data/catalog.json','/english/config.json']);
 dom.window.close();
});

test('batch plan changes and confirmed clear preserve learning history', async () => {
 const catalog = JSON.parse(await readFile('english/data/catalog.json','utf8'));
 const dom = new JSDOM('<main id="app"></main>', { url:'https://site.test/english/' });
 for (const name of ['window','document','navigator','location','history','localStorage']) Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
 globalThis.fetch = async url => ({ok:true,json:async () => url.endsWith('catalog.json') ? catalog : {mediaBaseUrl:''}});
 const { freshState, dateKey, weekKey } = await import('../../english/state.js');
 const [a,b] = catalog.levels[0].lessons, initial = freshState(), today = dateKey(), week = weekKey();
 initial.plans.week = {key:week,lessonIds:[b.id],reviewLessonIds:[]};
 initial.planProgress[`week:${week}`] = [b.id]; initial.completed[b.id] = true; initial.watched[b.id] = 42;
 localStorage.setItem('wow-family-progress-v1',JSON.stringify(initial));
 await import('../../english/app.js?batch');
 document.querySelector('[data-view="plan"]').click(); assert.equal(document.querySelector('#clear-plan').disabled,false, 'week-only plan can be cleared');
 document.querySelector('[data-view="library"]').click();
 for (const item of [a,b]) { const box=document.querySelector(`[data-select="${item.id}"]`); box.checked=true; box.dispatchEvent(new dom.window.Event('change')); }
 document.querySelector('#add-selected').click();
 let stored=JSON.parse(localStorage.getItem('wow-family-progress-v1'));
 assert.deepEqual(stored.plans.today.lessonIds,[a.id,b.id]);
 document.querySelector(`[data-open="${a.id}"]`).click(); document.querySelector('#complete').click();
 document.querySelector('[data-view="plan"]').click();
 const before=localStorage.getItem('wow-family-progress-v1'); window.confirm=()=>false; document.querySelector('#clear-plan').click();
 assert.equal(localStorage.getItem('wow-family-progress-v1'),before);
 window.confirm=()=>true; document.querySelector('#clear-plan').click();
 stored=JSON.parse(localStorage.getItem('wow-family-progress-v1'));
 assert.deepEqual(stored.plans.today.lessonIds,[]); assert.deepEqual(stored.plans.week.lessonIds,[]);
 assert.equal(stored.planProgress[`today:${today}`],undefined); assert.equal(stored.planProgress[`week:${week}`],undefined);
 assert.equal(stored.completed[a.id],true); assert.equal(stored.completed[b.id],true); assert.equal(stored.watched[b.id],42);
 assert.equal(document.querySelector('#clear-plan').disabled,true);
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
 globalThis.fetch=async url=>({ok:true,json:async()=>url.endsWith('catalog.json')?catalog:{mediaBaseUrl:'https://cdn.test/base/'}});
 let plays=0; dom.window.HTMLMediaElement.prototype.play=function(){ plays++; this.dispatchEvent(new dom.window.Event('play')); return Promise.resolve(); };
 let full=null; Object.defineProperty(document,'fullscreenElement',{get:()=>full,configurable:true});
 document.exitFullscreen=async()=>{full=null;document.dispatchEvent(new dom.window.Event('fullscreenchange'));};
 await import('../../english/app.js?player');
 const [a,b]=catalog.levels[0].lessons;
 for (const item of [a,b]) {const box=document.querySelector(`[data-select="${item.id}"]`);box.checked=true;box.dispatchEvent(new dom.window.Event('change'));}
 document.querySelector('#add-selected').click();document.querySelector(`[data-open="${a.id}"]`).click();
 const video=document.querySelector('video'), stage=document.querySelector('#video-stage');
 stage.requestFullscreen=async()=>{full=stage;document.dispatchEvent(new dom.window.Event('fullscreenchange'));};
 stage.dispatchEvent(new dom.window.Event('pointerdown')); assert(document.querySelector('#player-controls').classList.contains('visible'));
 document.querySelector('#fullscreen').click(); await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(document.querySelector('#fullscreen').getAttribute('aria-pressed'),'true'); assert.equal(plays,1);
 document.querySelector('#fullscreen').click(); await new Promise(resolve=>setTimeout(resolve,0)); assert.equal(document.querySelector('#fullscreen').getAttribute('aria-pressed'),'false');
 const mode=document.querySelector('#playback-mode'); mode.value='loop-list';mode.dispatchEvent(new dom.window.Event('change'));
 assert.equal(JSON.parse(localStorage.getItem('wow-family-progress-v1')).settings.playbackMode,'loop-list');
 video.dispatchEvent(new dom.window.Event('ended')); assert.equal(new URL(location.href).searchParams.get('lesson'),b.id);
 video.dispatchEvent(new dom.window.Event('ended')); assert.equal(new URL(location.href).searchParams.get('lesson'),a.id);
 mode.value='repeat-one';mode.dispatchEvent(new dom.window.Event('change'));video.currentTime=20;video.dispatchEvent(new dom.window.Event('ended'));assert.equal(video.currentTime,0);
 mode.value='loop-list';mode.dispatchEvent(new dom.window.Event('change')); window.confirm=()=>true;
 // A current lesson outside the plan stops on end; a subsequent play must restart at zero.
 const saved=JSON.parse(localStorage.getItem('wow-family-progress-v1'));saved.plans.today.lessonIds=[];localStorage.setItem('wow-family-progress-v1',JSON.stringify(saved));
 // Remove the plan through the UI so the in-memory state is also updated.
 document.querySelector('[data-view="plan"]').click();document.querySelector('#clear-plan').click();document.querySelector('[data-view="library"]').click();document.querySelector(`[data-open="${a.id}"]`).click();
 const replay=document.querySelector('video');replay.currentTime=20;replay.dispatchEvent(new dom.window.Event('ended'));replay.dispatchEvent(new dom.window.Event('play'));assert.equal(replay.currentTime,0);
 dom.window.close();
});
