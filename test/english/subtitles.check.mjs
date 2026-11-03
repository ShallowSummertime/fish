import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { createSubtitleHandler } from '../../api/english/subtitles.js';
import { createSession, cookie } from '../../lib/english/auth.js';
import { subtitleManifest, createSubtitleStore, validCues, toVtt } from '../../lib/english/subtitles.js';
import { mountSubtitles } from '../../english/subtitles.js';

const id = '616d50ebbf266515', origin = 'https://site.test';
const fixture = { version: 1, lessons: { [id]: { hasChinese: true, cues: [{ index: 0, start: 1.5, end: 3.2, text: 'A test sentence.', chinese: '测试句。' }] } } };
const subtitleData = () => fixture.lessons;
const subtitles = { fetch: createSubtitleHandler({ loadSubtitles: async () => subtitleData() }) };
test('241 metadata entries match catalog without needing private corpus in Git or build', async () => {
  const catalog = JSON.parse(await readFile('english/data/catalog.json', 'utf8'));
  const manifest = subtitleManifest(); assert.equal(Object.keys(manifest.lessons).length, 241);
  for (const lesson of catalog.levels.flatMap(level => level.lessons)) { const entry = manifest.lessons[lesson.id]; assert(entry.cueCount > 0); assert.equal(lesson.hasSubtitle, true); assert.equal(lesson.hasChineseSubtitle, entry.hasChinese); }
  assert.equal(manifest.lessons[id].cueCount, 37); assert(manifest.lessons[id].hasChinese);
  assert.equal(toVtt([{ index: 0, start: 0, end: 1, text: '<b> & -->' }]).includes('&lt;b&gt; &amp; --&gt;'), true);
});
test('private COS reads are pinned, bounded, shared and reject corruption without leaking URLs', async () => {
  const bytes = Buffer.from(JSON.stringify(fixture));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const manifest = { ...subtitleManifest(), sha256, bytes: bytes.length, lessonCount: 1, lessons: { [id]: { cueCount: 1, hasChinese: true } } };
  manifest.key = manifest.key.replace(/[a-f0-9]{64}(?=\.json$)/, sha256);
  let fetches = 0, signs = 0;
  const signImpl = async key => { assert.equal(key, manifest.key); signs++; return { url: 'https://cos.test/private?signature=fixture' }; };
  const store = createSubtitleStore({ manifest, signImpl, fetchImpl: async (_url, options) => { fetches++; assert.equal(options.redirect, 'error'); assert.equal(options.cache, 'no-store'); return new Response(bytes); } });
  const results = await Promise.all([store(), store(), store()]); assert.deepEqual(results[0], fixture.lessons); assert.equal(fetches, 1); assert.equal(signs, 1);
  for (const response of [() => new Response(Buffer.alloc(bytes.length + 1)), () => new Response(Buffer.alloc(bytes.length)), () => new Response('denied', { status: 403 })]) {
    const broken = createSubtitleStore({ manifest, signImpl, fetchImpl: async () => response() });
    await assert.rejects(broken(), error => error.message === 'Private subtitles unavailable');
  }
  assert.throws(() => createSubtitleStore({ manifest: { ...manifest, key: '../other' }, signImpl }), /Invalid subtitle manifest/);
});
test('subtitle endpoint authenticates, rejects paths, keeps text private and preserves cue times', async () => {
  Object.assign(process.env, { WOW_APP_ORIGIN: origin, WOW_FAMILY_CODE_SHA256: createHash('sha256').update('fixture').digest('hex'), WOW_SESSION_SECRET: Buffer.alloc(32, 9).toString('base64url') });
  const request = (lessonId, session = '', method = 'POST') => subtitles.fetch(new Request(origin + '/api/english/subtitles', { method, headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: session }, ...(method === 'POST' ? { body: JSON.stringify({ lessonId }) } : {}) }));
  assert.equal((await request(id)).status, 401);
  const session = cookie(await createSession()).split(';')[0];
  assert.equal((await request('../data', session)).status, 404);
  assert.equal((await request(id, session, 'GET')).status, 405);
  const response = await request(id, session); assert.equal(response.status, 200); assert.match(response.headers.get('cache-control'), /private, no-store/);
  const data = await response.json(); assert.equal(data.lessonId, id); assert.deepEqual(data.cues, subtitleData()[id].cues); assert(data.bilingualVtt); assert(data.englishVtt.startsWith('WEBVTT'));
});
test('caption UI uses authenticated same-origin data, toggles tracks, locates sentences and cleans up', async () => {
  const dom = new JSDOM('<video></video><div id="panel"></div>'); const prior = globalThis.document; globalThis.document = dom.window.document;
  const video = document.querySelector('video'), panel = document.querySelector('#panel');
  let calls = [], played = 0; video.play = async () => { played++; }; video.pause = () => {};
  const cues = [{ index: 0, start: 1.5, end: 3.2, text: 'Hello!', chinese: '你好！' }];
  const post = async (path, body) => { calls.push({ path, body }); return { lessonId: id, cues, englishVtt: toVtt(cues), bilingualVtt: toVtt(cues, true) }; };
  let cleanup;
  try {
    cleanup = mountSubtitles({ video, container: panel, lessonId: id, language: 'zh', post, isCurrent: () => true });
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.deepEqual(calls, [{ path: '/api/english/subtitles', body: { lessonId: id } }]);
    assert.equal(video.querySelector('track').srclang, 'zh'); assert.match(video.querySelector('track').src, /^blob:/);
    const select = panel.querySelector('select'); select.value = 'off'; select.dispatchEvent(new dom.window.Event('change')); assert.equal(video.querySelector('track'), null);
    select.value = 'en'; select.dispatchEvent(new dom.window.Event('change')); assert.equal(video.querySelector('track').srclang, 'en');
    panel.querySelector('li button').click(); assert.equal(video.currentTime, 1.5); assert.equal(played, 1);
    cleanup(); assert.equal(video.querySelector('track'), null); assert.equal(panel.children.length, 0);
  } finally { cleanup?.(); globalThis.document = prior; dom.window.close(); }
});
test('subtitle failure leaves video source alone and retry/disposal prevents late stale tracks', async () => {
  const dom = new JSDOM('<video src="https://media.test/video.mp4"></video><div></div>'); const prior = globalThis.document; globalThis.document = dom.window.document;
  const video = document.querySelector('video'), panel = document.querySelector('div'); let settle;
  try {
    let cleanup = mountSubtitles({ video, container: panel, lessonId: id, language: 'en', post: async () => { throw new Error('offline'); }, isCurrent: () => true });
    await new Promise(resolve => setTimeout(resolve, 0)); assert.equal(panel.querySelector('button').hidden, false); assert.match(panel.textContent, /could not load/); assert.equal(video.getAttribute('src'), 'https://media.test/video.mp4'); cleanup();
    cleanup = mountSubtitles({ video, container: panel, lessonId: id, language: 'en', post: () => new Promise(resolve => { settle = resolve; }), isCurrent: () => true }); cleanup();
    settle({ lessonId: id, cues: subtitleData()[id].cues, englishVtt: toVtt(subtitleData()[id].cues) }); await new Promise(resolve => setTimeout(resolve, 0)); assert.equal(video.querySelector('track'), null); assert.equal(panel.children.length, 0);
  } finally { globalThis.document = prior; dom.window.close(); }
});
