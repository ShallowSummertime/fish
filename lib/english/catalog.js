import { readFileSync } from 'node:fs';
import { LEVEL_MEDIA_FOLDERS } from './media-folders.js';

function validVideoKey(lesson, levelId) {
  const key = lesson?.videoKey;
  if (typeof key !== 'string' || !key.endsWith('.mp4')) return false;
  const folder = LEVEL_MEDIA_FOLDERS[levelId];
  if (!folder) return false;
  const prefix = `Wow/${folder}/`;
  if (!key.startsWith(prefix)) return false;
  const filename = key.slice(prefix.length);
  return filename.length > 4 && filename.length <= 512 && !filename.includes('/') && !filename.includes('\\') && !/[\u0000-\u001f\u007f]/u.test(filename);
}

export function buildCatalog(catalog) {
  if (!catalog || !Array.isArray(catalog.levels)) throw new Error('Invalid catalog');
  const map = new Map();
  for (const level of catalog.levels) { if (!Array.isArray(level.lessons)) throw new Error('Invalid catalog'); for (const lesson of level.lessons) { if (!lesson || typeof lesson.id !== 'string' || !/^[a-f0-9]+$/.test(lesson.id) || !validVideoKey(lesson, level.id) || map.has(lesson.id)) throw new Error('Invalid catalog'); map.set(lesson.id, lesson.videoKey); } }
  if (!map.size || map.size !== catalog.totalLessons) throw new Error('Invalid catalog'); return map;
}
export function catalog() { return buildCatalog(JSON.parse(readFileSync(new URL('../../english/data/catalog.json', import.meta.url), 'utf8'))); }
