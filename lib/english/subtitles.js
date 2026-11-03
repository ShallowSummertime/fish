import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { sign } from './cos.js';
import { LEVEL_MEDIA_FOLDERS } from './media-folders.js';

export function timestamp(seconds) {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
}
export function validCues(cues) {
  return Array.isArray(cues) && cues.length > 0 && cues.length <= 10000 && cues.every((cue, index) => cue.index === index && Number.isFinite(cue.start) && cue.start >= 0 && Number.isFinite(cue.end) && cue.end > cue.start && (index === 0 || cue.start >= cues[index - 1].start) && typeof cue.text === 'string' && cue.text.trim() && cue.text.length <= 10000 && (cue.chinese === undefined || typeof cue.chinese === 'string' && cue.chinese.trim() && cue.chinese.length <= 10000));
}
export function toVtt(cues, bilingual = false) {
  const text = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, ' ');
  return 'WEBVTT\n\n' + cues.map(cue => `${cue.index + 1}\n${timestamp(cue.start)} --> ${timestamp(cue.end)}\n${text(cue.text)}${bilingual && cue.chinese ? '\n' + text(cue.chinese) : ''}\n`).join('\n');
}
export function subtitleManifest() { return JSON.parse(readFileSync(new URL('./subtitle-manifest.json', import.meta.url), 'utf8')); }
export function createSubtitleStore({ manifest = subtitleManifest(), fetchImpl = fetch, signImpl = sign } = {}) {
  const expectedKey = `Wow/${LEVEL_MEDIA_FOLDERS['level-1']}/_learning/subtitles-${manifest.sha256}.json`;
  if (manifest.version !== 1 || !/^[a-f0-9]{64}$/.test(manifest.sha256) || manifest.key !== expectedKey || !Number.isSafeInteger(manifest.bytes) || manifest.bytes < 1 || manifest.bytes > 2 * 1024 * 1024 || !manifest.lessons || Object.keys(manifest.lessons).length !== manifest.lessonCount) throw new Error('Invalid subtitle manifest');
  let pending;
  const load = async () => {
    const { url } = await signImpl(manifest.key);
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(10000), redirect: 'error', cache: 'no-store' });
    if (!response.ok || !response.body || (response.headers.has('content-length') && Number(response.headers.get('content-length')) !== manifest.bytes)) throw new Error('Private subtitle read failed');
    const reader = response.body.getReader(), chunks = []; let size = 0;
    try {
      while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > manifest.bytes) throw new Error('Subtitle size mismatch'); chunks.push(Buffer.from(value)); }
    } finally { await reader.cancel().catch(() => {}); }
    const bytes = Buffer.concat(chunks);
    if (size !== manifest.bytes || createHash('sha256').update(bytes).digest('hex') !== manifest.sha256) throw new Error('Subtitle integrity mismatch');
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (data.version !== 1 || !data.lessons || Object.keys(data.lessons).length !== manifest.lessonCount) throw new Error('Invalid subtitle data');
    for (const [id, entry] of Object.entries(data.lessons)) {
      const expected = manifest.lessons[id];
      if (!/^[a-f0-9]{16}$/.test(id) || !expected || !validCues(entry.cues) || entry.cues.length !== expected.cueCount || entry.hasChinese !== expected.hasChinese || entry.hasChinese !== entry.cues.every(cue => typeof cue.chinese === 'string')) throw new Error('Invalid subtitle data');
    }
    return data.lessons;
  };
  // One bounded fetch per cold process, shared by concurrent requests. The immutable
  // version/hash makes success safe to retain in RAM. Failure is not cached.
  return async () => {
    if (!pending) pending = load().catch(() => { pending = undefined; throw new Error('Private subtitles unavailable'); });
    return pending;
  };
}
let store;
export function privateSubtitles() { if (!store) store = createSubtitleStore(); return store(); }
