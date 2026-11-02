import { cp, mkdir, writeFile } from 'node:fs/promises';
import { mediaUrl } from '../english/media.js';
const base = process.env.WOW_PUBLIC_MEDIA_BASE_URL || '';
if (base) mediaUrl(base, 'lessons/check.mp4');
await mkdir('dist/english', { recursive: true });
await cp('english', 'dist/english', { recursive: true });
await writeFile('dist/english/config.json', JSON.stringify({ mediaBaseUrl: base }) + '\n');
console.log('Built English static app');
