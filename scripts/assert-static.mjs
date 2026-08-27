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
console.log(`verified ${routes.length} crawlable static routes`);
