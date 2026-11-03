import { basename, dirname } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { LEVEL_MEDIA_FOLDERS } from '../lib/english/media-folders.js';

const [input, output = 'english/data/catalog.json'] = process.argv.slice(2);
if (!input) throw new Error('Pass a local library manifest as the first argument.');
const source = JSON.parse(await readFile(input, 'utf8'));
const seen = new Set();
let subtitles = {};
try { subtitles = JSON.parse(await readFile('lib/english/subtitle-manifest.json', 'utf8')).lessons || {}; } catch (error) { if (error.code !== 'ENOENT') throw error; }
const levels = source.levels.map((level) => ({
  id: level.id, number: level.number, name: level.name,
  lessons: level.lessons.map((lesson) => {
    if (!/^[a-f0-9]+$/.test(lesson.id) || seen.has(lesson.id)) throw new Error('Invalid or duplicate lesson ID');
    seen.add(lesson.id);
    const expectedFolder = LEVEL_MEDIA_FOLDERS[level.id];
    const filename = basename(lesson.videoPath);
    if (!expectedFolder || level.sourceFolder !== expectedFolder || basename(dirname(lesson.videoPath)) !== expectedFolder || !filename.endsWith('.mp4')) throw new Error(`Invalid media mapping for ${level.id}`);
    const videoKey = `Wow/${expectedFolder}/${filename}`;
    return { id: lesson.id, title: lesson.title, type: lesson.type, unit: lesson.unit ?? null, number: lesson.number ?? null,
      videoKey, hasSubtitle: Boolean(subtitles[lesson.id]), hasChineseSubtitle: Boolean(subtitles[lesson.id]?.hasChinese) };
  }),
}));
if (!seen.size) throw new Error('Empty catalog');
await writeFile(output, JSON.stringify({ version: 1, totalLessons: seen.size, levels }, null, 2) + '\n');
console.log(`Generated ${seen.size} lessons`);
