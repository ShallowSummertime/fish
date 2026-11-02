import { basename } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const [input, output = 'english/data/catalog.json'] = process.argv.slice(2);
if (!input) throw new Error('Pass a local library manifest as the first argument.');
const source = JSON.parse(await readFile(input, 'utf8'));
const seen = new Set();
const LEVEL_ONE_FOLDER = '01.第一级 黄色Wow!Yellow（3-4岁）33集全';
const levels = source.levels.map((level) => ({
  id: level.id, number: level.number, name: level.name,
  lessons: level.lessons.map((lesson) => {
    if (!/^[a-f0-9]+$/.test(lesson.id) || seen.has(lesson.id)) throw new Error('Invalid or duplicate lesson ID');
    seen.add(lesson.id);
    const videoKey = level.id === 'level-1'
      ? `Wow/${LEVEL_ONE_FOLDER}/${basename(lesson.videoPath)}`
      : `lessons/${lesson.id}.mp4`;
    if (level.id === 'level-1' && (level.sourceFolder !== LEVEL_ONE_FOLDER || !videoKey.endsWith('.mp4'))) throw new Error('Invalid Level 1 media mapping');
    return { id: lesson.id, title: lesson.title, type: lesson.type, unit: lesson.unit ?? null, number: lesson.number ?? null,
      videoKey, hasSubtitle: false, hasChineseSubtitle: false };
  }),
}));
if (!seen.size) throw new Error('Empty catalog');
await writeFile(output, JSON.stringify({ version: 1, totalLessons: seen.size, levels }, null, 2) + '\n');
console.log(`Generated ${seen.size} lessons`);
