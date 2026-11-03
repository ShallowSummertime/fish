import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validCues } from '../lib/english/subtitles.js';

const [manifestFile, translationFile] = process.argv.slice(2);
if (!manifestFile || !translationFile) throw new Error('Pass the local manifest and Chinese translation JSON.');
const source = JSON.parse(await readFile(manifestFile, 'utf8'));
const translations = JSON.parse(await readFile(translationFile, 'utf8')).lessons || {};
const catalog = JSON.parse(await readFile('english/data/catalog.json', 'utf8'));
const target = new Map(catalog.levels.flatMap(level => level.lessons).map(lesson => [lesson.id, lesson]));
const data = { version: 1, lessons: {} };
for (const lesson of source.levels.flatMap(level => level.lessons)) {
  if (!target.has(lesson.id) || data.lessons[lesson.id]) throw new Error('Catalog/source identity mismatch');
  const raw = await readFile(lesson.subtitlePath, 'utf8');
  const cues = [];
  for (const block of raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim().split(/\n{2,}/)) {
    const lines = block.split('\n').map(line => line.trim());
    const at = lines.findIndex(line => /^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})\s+-->\s+(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})(?:\s+.*)?$/.test(line));
    if (at < 0) continue;
    const m = lines[at].match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})\s+-->\s+(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})/);
    const seconds = offset => Number(m[offset]) * 3600 + Number(m[offset + 1]) * 60 + Number(m[offset + 2]) + Number(m[offset + 3]) / 1000;
    const text = lines.slice(at + 1).join(' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (Number(m[2]) > 59 || Number(m[3]) > 59 || Number(m[6]) > 59 || Number(m[7]) > 59 || seconds(5) <= seconds(1) || !text) continue;
    cues.push({ index: cues.length, start: seconds(1), end: seconds(5), text });
  }
  if (!validCues(cues)) throw new Error(`Invalid English cues for ${lesson.id}`);
  const translation = translations[lesson.id];
  const hasChinese = translation?.sourceSha256 === createHash('sha256').update(raw).digest('hex') && Array.isArray(translation.cues) && translation.cues.length === cues.length && translation.cues.every(text => typeof text === 'string' && text.trim());
  if (hasChinese) cues.forEach((cue, i) => { cue.chinese = translation.cues[i]; });
  data.lessons[lesson.id] = { hasChinese: Boolean(hasChinese), cues };
  Object.assign(target.get(lesson.id), { hasSubtitle: true, hasChineseSubtitle: Boolean(hasChinese) });
}
if (Object.keys(data.lessons).length !== target.size) throw new Error('Missing subtitle lesson');
const bytes = Buffer.from(JSON.stringify(data) + '\n');
const sha256 = createHash('sha256').update(bytes).digest('hex');
const manifest = { version: 1, sha256, bytes: bytes.length, lessonCount: target.size, key: `Wow/${source.levels[0].sourceFolder}/_learning/subtitles-${sha256}.json`, lessons: Object.fromEntries(Object.entries(data.lessons).map(([id, entry]) => [id, { cueCount: entry.cues.length, hasChinese: entry.hasChinese }])) };
await writeFile('lib/english/subtitle-data.json', bytes);
await writeFile('lib/english/subtitle-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
await writeFile('english/data/catalog.json', JSON.stringify(catalog, null, 2) + '\n');
console.log(`Prepared ${target.size} private subtitle lessons; no video copied.`);
