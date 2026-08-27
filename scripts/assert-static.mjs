import { readFile, stat, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const domain = 'https://howtofishwalkthrough.com';
const routes = ['/', '/beginner-guide', '/creatures', '/bosses', '/locations', '/locations/lighthouse', '/lures', '/bosses/spider-crab', '/achievements'];
const prerenderSource = await readFile('scripts/prerender.ts', 'utf8');
assert.match(prerenderSource, /renderToString\(React\.createElement\(App/, 'static pages must render the shared React App tree with the hydration-compatible API');
const clientSource = await readFile('src/client.tsx', 'utf8');
assert.match(clientSource, /hydrateRoot\(/, 'client entry must hydrate the server-rendered App');
const appSource = await readFile('src/main.tsx', 'utf8');
assert.match(appSource, /useState<string\[\]>\(\[\]\);const \[hydrated,setHydrated\]=useState\(false\)/, 'creature SSR and first client render must start with an empty checklist');
assert.match(appSource, /useEffect\(\(\)=>\{try\{const raw=JSON\.parse\(localStorage\.getItem\('htf-caught'\)/, 'creature checklist must restore validated local storage after mount');
assert.match(appSource, /if\(hydrated\)localStorage\.setItem\('htf-caught'/, 'creature checklist must not persist before restore completes');
assert.match(appSource, /set\('og:type',known\?'article':'website',true\)/, 'known client pages must use article Open Graph type');
const stylesSource = await readFile('src/styles.css', 'utf8');
assert.match(stylesSource, /\.guide-visual\{margin:30px 0;overflow-x:auto/, 'mobile guide visuals must support horizontal scrolling');
assert.match(stylesSource, /Swipe or scroll the diagram horizontally/, 'mobile guide visuals must explain the scroll affordance');
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
  assert.match(html, /"@type":"Article"/, `${route} must expose Article structured data`);
  assert.match(html, /"@type":"BreadcrumbList"/, `${route} must expose BreadcrumbList structured data`);
  assert.equal((html.match(/id="ld-json"/g) || []).length, 1, `${route} must emit exactly one server JSON-LD node for client replacement`);
  if (requirements.sources) {
    assert.match(html, /SOURCES \/ VERIFY/, `${route} must expose source links`);
    assert.match(html, /pcgamer\.com\/games\/sim\/how-to-fish-spider-crab/, `${route} must cite PC Gamer`);
    assert.match(html, /gamesradar\.com\/games\/co-op\/how-to-fish-spider-crab/, `${route} must cite GamesRadar+`);
    assert.match(html, /steamcommunity\.com\/app\/4001890\/announcements/, `${route} must cite the official patch feed`);
    assert.match(html, /douyin\.com\/search\/%E6%B8%94%E5%8A%9B%E5%85%A8%E5%BC%80/, `${route} must cite the direct-frame Douyin review`);
    assert.match(html, /xiaohongshu\.com\/explore\/6a8aaf56000000001700b59b/, `${route} must cite the direct-frame Xiaohongshu review`);
    assert.match(html, /Evidence boundary: the Douyin and Xiaohongshu clips were directly frame-reviewed/, `${route} must state the visual-evidence boundary`);
  }
  for (const src of [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1])) await access(`public${src}`);
  assert.match(html, /class="article guide-article"/, `${route} must be server-rendered from the shared guide tree`);
};
await contentGate('/beginner-guide', { images: 9, sources: false, phrases: ['First 20 minutes', 'Bait and hotspots', 'Make more money', 'Prepare for Spider Crab', 'The complete five-location story route', 'Late-game firepower', 'If the route stalls', 'Empty Beer Can', 'Spider Crab Meat', 'VOLCANO'] });
const beginner = await readFile('dist/beginner-guide/index.html', 'utf8');
assert.doesNotMatch(beginner, /Claim sources|SOURCES \/ VERIFY/, '/beginner-guide must not render the removed claim-sources section');
await contentGate('/bosses/spider-crab', { images: 2, sources: true, phrases: ['Summon Spider Crab correctly', 'charge → stun → punish', 'Common mistakes and quick recoveries', 'Empty Beer Can', 'boat keys'] });
const lighthouse = await readFile('dist/locations/lighthouse/index.html', 'utf8');
assert.ok(textFrom(lighthouse).split(' ').length >= 900, '/locations/lighthouse must be a deep guide');
assert.ok((lighthouse.match(/<img /g) || []).length >= 10, '/locations/lighthouse must include the extracted gameplay sequence');
for (const phrase of ['Build the Clam-to-cash loop', 'Empty Beer Can', 'charge-and-punish', 'Boat Keys', 'FOLLOW THE GREEN FOREST MARKER']) assert.match(lighthouse, new RegExp(phrase));
for (const src of [...lighthouse.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1])) await access(`public${src}`);
console.log(`verified ${routes.length} crawlable static routes`);
