import { readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';

const domain = 'https://howtofishwalkthrough.com';
const routes = ['/', '/beginner-guide', '/creatures', '/bosses', '/locations', '/lures', '/bosses/spider-crab', '/achievements'];
for (const route of routes) {
  const file = route === '/' ? 'dist/index.html' : `dist${route}/index.html`;
  await stat(file);
  const html = await readFile(file, 'utf8');
  assert.match(html, new RegExp(`<link rel="canonical" href="${domain}${route === '/' ? '/' : route}">`));
  assert.match(html, /<meta property="og:title"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /<div id="root"><\/div>/);
}
const creatures = await readFile('dist/creatures/index.html', 'utf8');
assert.match(creatures, /All 49 How to Fish/);
assert.match(creatures, /Mutated Bowhead Whale/);
const spider = await readFile('dist/bosses/spider-crab/index.html', 'utf8');
assert.match(spider, /Empty Beer Can/);
const textFrom = html => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const contentGate = async (route, requirements) => {
  const html = await readFile(`dist${route}/index.html`, 'utf8');
  assert.ok(textFrom(html).split(' ').length >= 700, `${route} must have at least 700 visible words`);
  assert.ok((html.match(/<img /g) || []).length >= requirements.images, `${route} must include original explanatory visuals`);
  for (const phrase of requirements.phrases) assert.match(html, new RegExp(phrase), `${route} missing required player-help content: ${phrase}`);
  assert.match(html, /WATCH \/ VERIFY/, `${route} must expose source links`);
  assert.match(html, /@type&quot;:&quot;HowTo|"@type":"HowTo"/, `${route} must expose HowTo structured data`);
};
await contentGate('/beginner-guide', { images: 2, phrases: ['First 20 minutes', 'Prepare for Spider Crab', 'If the route stalls', 'Empty Beer Can', 'Spider Crab shell'] });
await contentGate('/bosses/spider-crab', { images: 2, phrases: ['Summon Spider Crab correctly', 'charge → stun → punish', 'Common mistakes and quick recoveries', 'Empty Beer Can', 'boat keys'] });
console.log(`verified ${routes.length} crawlable static routes`);
