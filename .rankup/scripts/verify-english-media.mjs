import { readFile } from 'node:fs/promises';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const origin = args.get('--origin');
const catalogPath = args.get('--catalog') ?? 'english/data/catalog.json';
if (!origin || !/^https:\/\/[^/]+$/u.test(origin)) throw new Error('Pass --origin with an HTTPS origin.');

let code = '';
for await (const chunk of process.stdin) {
  code += chunk;
  if (code.length > 1024) throw new Error('Access code input is too long.');
}
if (!code) throw new Error('Pass the family access code through stdin.');

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const lessons = catalog.levels.flatMap((level) => level.lessons.map((lesson) => ({ ...lesson, levelId: level.id })));
if (lessons.length !== catalog.totalLessons) throw new Error('Catalog lesson count mismatch.');

const login = await fetch(`${origin}/api/english/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: origin },
  body: JSON.stringify({ code }),
});
code = '';
if (!login.ok) throw new Error(`Login failed with HTTP ${login.status}.`);
const sessionCookie = login.headers.get('set-cookie')?.split(';', 1)[0];
if (!sessionCookie) throw new Error('Login did not return a session cookie.');

const failures = [];
let nextIndex = 0;
let verified = 0;
async function worker() {
  while (nextIndex < lessons.length) {
    const lesson = lessons[nextIndex++];
    try {
      const playback = await fetch(`${origin}/api/english/playback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: sessionCookie, Origin: origin },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      if (!playback.ok) throw new Error(`playback HTTP ${playback.status}`);
      const { url } = await playback.json();
      const media = await fetch(url, { headers: { Range: 'bytes=0-0' } });
      const status = media.status;
      await media.body?.cancel();
      if (status !== 200 && status !== 206) throw new Error(`media HTTP ${status}`);
      verified += 1;
    } catch (error) {
      failures.push({ id: lesson.id, level: lesson.levelId, error: error.message });
    }
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()));
if (failures.length) {
  for (const failure of failures) console.error(`${failure.level}/${failure.id}: ${failure.error}`);
  throw new Error(`Media verification failed for ${failures.length} of ${lessons.length} lessons.`);
}
console.log(`Verified ${verified}/${lessons.length} private videos through authenticated playback and byte-range reads.`);
