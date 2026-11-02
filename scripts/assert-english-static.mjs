import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const root = 'dist/english';
async function files(dir) { return (await Promise.all((await readdir(dir, { withFileTypes:true })).map(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]))).flat(); }
const all = await files(root);
assert(!all.some(f => /\.(mp4|srt|mp3|wav|pdf)$/i.test(f)), 'Media or source subtitle in build');
for (const file of all) {
 const contents = await readFile(file,'utf8');
 assert(!/\/Users\/|\/home\/|[A-Za-z]:\\\\|\/media\/|WOW_PUBLIC_MEDIA_BASE_URL|mediaBaseUrl|cos\.ap-hongkong\.myqcloud\.com/.test(contents), `Private path or public media fallback in ${file}`);
 for (const endpoint of contents.match(/\/api\/[a-zA-Z0-9_\/-]+/g) || []) assert(['/api/english/login','/api/english/logout','/api/english/playback'].includes(endpoint), `Unexpected endpoint ${endpoint}`);
}
const catalog = JSON.parse(await readFile(`${root}/data/catalog.json`));
const lessons = catalog.levels.flatMap(l => l.lessons); const ids = new Set();
const levelOnePrefix = 'Wow/01.第一级 黄色Wow!Yellow（3-4岁）33集全/';
assert.equal(lessons.length,catalog.totalLessons); assert(lessons.length > 0);
for (const level of catalog.levels) {
 assert.deepEqual(Object.keys(level).sort(), ['id','lessons','name','number']);
 for (const lesson of level.lessons) {
  assert.deepEqual(Object.keys(lesson).sort(), ['hasChineseSubtitle','hasSubtitle','id','number','title','type','unit','videoKey']);
  assert.match(lesson.id,/^[a-f0-9]+$/); assert(!ids.has(lesson.id)); ids.add(lesson.id);
  if (level.id === 'level-1') {
   assert(lesson.videoKey.startsWith(levelOnePrefix)); assert(lesson.videoKey.endsWith('.mp4'));
   assert(!lesson.videoKey.slice(levelOnePrefix.length).includes('/'));
  } else assert.equal(lesson.videoKey,`lessons/${lesson.id}.mp4`);
  assert.equal(lesson.hasSubtitle,false); assert.equal(lesson.hasChineseSubtitle,false);
 }
}
assert.equal(catalog.levels.find(level => level.id === 'level-1').lessons.length,33);
const manifest=JSON.parse(await readFile(`${root}/manifest.webmanifest`));
assert.equal(manifest.scope,'/english/'); assert.equal(manifest.start_url,'/english/'); assert.equal(manifest.id,'/english/');
console.log(`English static assertions passed: ${lessons.length} lessons`);
