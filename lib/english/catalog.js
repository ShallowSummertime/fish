import { readFileSync } from 'node:fs';

const LEVEL_ONE_PREFIX = 'Wow/01.第一级 黄色Wow!Yellow（3-4岁）33集全/';

function validVideoKey(lesson) {
  const key = lesson?.videoKey;
  if (key === `lessons/${lesson.id}.mp4`) return true;
  if (typeof key !== 'string' || !key.startsWith(LEVEL_ONE_PREFIX) || !key.endsWith('.mp4')) return false;
  const filename = key.slice(LEVEL_ONE_PREFIX.length);
  return filename.length > 4 && filename.length <= 512 && !filename.includes('/') && !filename.includes('\\') && !/[\u0000-\u001f\u007f]/u.test(filename);
}

export function buildCatalog(catalog) {
  if (!catalog || !Array.isArray(catalog.levels)) throw new Error('Invalid catalog');
  const map = new Map();
  for (const level of catalog.levels) { if (!Array.isArray(level.lessons)) throw new Error('Invalid catalog'); for (const lesson of level.lessons) { if (!lesson || typeof lesson.id !== 'string' || !/^[a-f0-9]+$/.test(lesson.id) || !validVideoKey(lesson) || map.has(lesson.id)) throw new Error('Invalid catalog'); map.set(lesson.id, lesson.videoKey); } }
  if (!map.size || map.size !== catalog.totalLessons) throw new Error('Invalid catalog'); return map;
}
export function catalog() { return buildCatalog(JSON.parse(readFileSync(new URL('../../english/data/catalog.json', import.meta.url), 'utf8'))); }
