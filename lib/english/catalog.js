import { readFileSync } from 'node:fs';
export function buildCatalog(catalog) {
  if (!catalog || !Array.isArray(catalog.levels)) throw new Error('Invalid catalog');
  const map = new Map();
  for (const level of catalog.levels) { if (!Array.isArray(level.lessons)) throw new Error('Invalid catalog'); for (const lesson of level.lessons) { if (!lesson || typeof lesson.id !== 'string' || !/^[a-f0-9]+$/.test(lesson.id) || lesson.videoKey !== `lessons/${lesson.id}.mp4` || map.has(lesson.id)) throw new Error('Invalid catalog'); map.set(lesson.id, lesson.videoKey); } }
  if (!map.size || map.size !== catalog.totalLessons) throw new Error('Invalid catalog'); return map;
}
export function catalog() { return buildCatalog(JSON.parse(readFileSync(new URL('../../english/data/catalog.json', import.meta.url), 'utf8'))); }
