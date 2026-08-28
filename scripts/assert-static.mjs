import { readFile, stat, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const domain = 'https://howtofishwalkthrough.com';
const routes = ['/', '/beginner-guide', '/creatures', '/bosses', '/locations', '/locations/lighthouse', '/guides/reel-of-fortune', '/lures', '/bosses/spider-crab', '/achievements', '/about', '/contact', '/privacy', '/terms'];
const prerenderSource = await readFile('scripts/prerender.ts', 'utf8');
assert.match(prerenderSource, /renderToString\(React\.createElement\(App/, 'static pages must render the shared React App tree with the hydration-compatible API');
const clientSource = await readFile('src/client.tsx', 'utf8');
assert.match(clientSource, /hydrateRoot\(/, 'client entry must hydrate the server-rendered App');
const appSource = await readFile('src/main.tsx', 'utf8');
assert.match(appSource, /useState<string\[\]>\(\[\]\);const \[hydrated,setHydrated\]=useState\(false\)/, 'creature SSR and first client render must start with an empty checklist');
assert.match(appSource, /useEffect\(\(\)=>\{try\{const raw=JSON\.parse\(localStorage\.getItem\('htf-caught'\)/, 'creature checklist must restore validated local storage after mount');
assert.match(appSource, /if\(hydrated\)localStorage\.setItem\('htf-caught'/, 'creature checklist must not persist before restore completes');
assert.match(appSource, /set\('og:type',known\?'article':'website',true\)/, 'known client pages must use article Open Graph type');
assert.match(appSource, /index,follow,max-image-preview:large/, 'indexable pages must allow large image previews');
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
  assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large">/);
  assert.doesNotMatch(html, /<div id="root"><\/div>/);
}
const creatures = await readFile('dist/creatures/index.html', 'utf8');
assert.match(creatures, /All 49 How to Fish/);
assert.match(creatures, /Mutated Bowhead Whale/);
assert.match(creatures, /Creature encyclopedia overview/);
assert.match(creatures, /Drip variants/);
assert.match(creatures, /encyclopedia-overview\.webp/);
const home = await readFile('dist/index.html', 'utf8');
assert.match(home, /aria-label="Original How to Fish gameplay field images"/, 'homepage must expose the original-material carousel');
const homeImages = [...home.matchAll(/src="(\/images\/home\/[^"]+\.webp)"/g)].map(match => match[1]);
assert.equal(homeImages.length, 4, 'homepage carousel must include all four processed gameplay frames');
for (const src of homeImages) await access(`public${src}`);
assert.equal((await readFile('dist/ads.txt', 'utf8')).trim(), 'google.com, pub-5329936944958399, DIRECT, f08c47fec0942fa0', 'ads.txt must exactly match the authorized seller record');
const privacy = await readFile('dist/privacy/index.html', 'utf8');
for (const phrase of ['Google AdSense', 'local storage', 'Google-certified consent management platform', 'My Ad Center']) assert.match(privacy, new RegExp(phrase));
const about = await readFile('dist/about/index.html', 'utf8');
for (const path of ['/about','/contact','/privacy','/terms']) assert.match(about, new RegExp(`href="${path}"`));
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
    assert.match(html, /Owner-supplied gameplay was used as a private visual cross-check/, `${route} must state the private visual-evidence boundary`);
    assert.doesNotMatch(html, /douyin|xiaohongshu|modal_id|6a8aaf56000000001700b59b/i, `${route} must not expose social-platform identities or source IDs`);
  }
  for (const src of [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1])) await access(`public${src}`);
  assert.match(html, /class="article guide-article"/, `${route} must be server-rendered from the shared guide tree`);
};
await contentGate('/beginner-guide', { images: 9, sources: false, phrases: ['First 20 minutes', 'Bait and hotspots', 'Make more money', 'Prepare for Spider Crab', 'The complete five-location story route', 'Late-game firepower', 'If the route stalls', 'Empty Beer Can', 'Spider Crab Shell', 'VOLCANO'] });
const beginner = await readFile('dist/beginner-guide/index.html', 'utf8');
assert.doesNotMatch(beginner, /Claim sources|SOURCES \/ VERIFY/, '/beginner-guide must not render the removed claim-sources section');
await contentGate('/bosses/spider-crab', { images: 2, sources: true, phrases: ['Summon Spider Crab correctly', 'charge → stun → punish', 'Common mistakes and quick recoveries', 'Empty Beer Can', 'boat keys'] });
const lighthouse = await readFile('dist/locations/lighthouse/index.html', 'utf8');
assert.ok(textFrom(lighthouse).split(' ').length >= 900, '/locations/lighthouse must be a deep guide');
assert.ok((lighthouse.match(/<img /g) || []).length >= 10, '/locations/lighthouse must include the extracted gameplay sequence');
for (const phrase of ['Build the Clam-to-cash loop', 'Empty Beer Can', 'charge-and-punish', 'Boat Keys', 'FOLLOW THE GREEN FOREST MARKER']) assert.match(lighthouse, new RegExp(phrase));
for (const src of [...lighthouse.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1])) await access(`public${src}`);
const locationsGuide = await readFile('dist/locations/index.html', 'utf8');
assert.ok(textFrom(locationsGuide).split(' ').length >= 1000, '/locations must be a deep five-location route');
for (const phrase of ['FIVE-LOCATION STORY ROUTE','Giant Piranha Skeleton','Pufferfish Fin','Albatross Head','Mutated Bowhead Whale','Developer Island is optional','Patch 1.0.10']) assert.match(locationsGuide, new RegExp(phrase));
assert.match(locationsGuide, /five-location-route-hero\.png/);
await access('public/images/guides/locations/five-location-route-hero.png');
const reel = await readFile('dist/guides/reel-of-fortune/index.html', 'utf8');
assert.ok(textFrom(reel).split(' ').length >= 900, '/guides/reel-of-fortune must be a deep guide');
for (const phrase of ['Drip creature','cosmetic skin','Z or C','GOLD GOLD GOLD','no stat improvement','Claim sources and limits','Patch 1.0.10']) assert.match(reel, new RegExp(phrase, 'i'));
assert.match(reel, /reel-machine-hero\.png/);
assert.doesNotMatch(reel, /there is one machine (?:on|per) (?:each|every) island|skins? (?:are|is) shared (?:between|with) players|pity (?:counter|system) guarantees/i);
await access('public/images/guides/reel-of-fortune/reel-machine-hero.png');
const spiderText = textFrom(spider);
const beginnerText = textFrom(beginner);
const lighthouseText = textFrom(lighthouse);
const locationsText = textFrom(locationsGuide);
for (const [route, pageText] of [['/beginner-guide',beginnerText],['/locations/lighthouse',lighthouseText],['/bosses/spider-crab',spiderText],['/locations',locationsText]]) {
  assert.match(pageText, /Spider Crab Shell/, `${route} must name the current progression item`);
  assert.match(pageText, /Boat Keys/, `${route} must preserve the Shell to Boat Keys chain`);
  assert.doesNotMatch(pageText, /Spider Crab Meat|return (?:its|required )?Meat|hand in (?:the required )?Meat/i, `${route} must not contain the obsolete Meat hand-in`);
}
assert.match(spiderText, /white (?:bar is )?Spider Crab’s escape timer|white escape timer/i, 'Spider guide must identify the white bar as the boss escape timer');
assert.doesNotMatch(spiderText, /white bar (?:is|acts as) (?:a |the )?revive|downed-state bar/i, 'Spider guide must not mislabel the boss escape bar as a revive timer');
assert.match(locationsText, /five native catches[\s\S]*Fish Bucket[\s\S]*Bowhead Whale body[\s\S]*crater[\s\S]*Mutated Bowhead Whale[\s\S]*Whale Fin[\s\S]*military boat key/i, 'Volcano route must include the complete dependency chain');
assert.match(textFrom(reel), /catch[^.]*kill[^.]*carry[^.]*Drip body/i, 'Reel guide must explain the dead Drip body input');
assert.match(textFrom(reel), /confirm[^.]*dead|that it is dead/i, 'Reel troubleshooting must verify that the creature is dead');
for (const base of ['public/images/guides/locations/five-location-route-hero','public/images/guides/reel-of-fortune/reel-machine-hero']) {
  for (const width of [768,1280]) await access(`${base}-${width}.webp`);
}
for (const html of [locationsGuide,reel]) {
  assert.match(html, /<picture>/, 'generated guide heroes must use picture');
  assert.match(html, /-768\.webp 768w, [^" ]+-1280\.webp 1280w/, 'generated guide heroes must expose responsive WebP srcset');
  assert.match(html, /width="1536" height="1024"/, 'generated guide heroes must reserve intrinsic layout space');
  assert.match(html, /decoding="async" loading="eager" fetchPriority="high"/, 'generated guide heroes must expose loading hints');
}
const bossesPage = await readFile('dist/bosses/index.html', 'utf8');
for (const [route,html] of [['/bosses',bossesPage],['/bosses/spider-crab',spider]]) assert.match(html, /<meta property="og:image" content="https:\/\/howtofishwalkthrough\.com\/images\/guides\/island-1\/08-spider-crab\.jpg">/, `${route} must expose a rights-safe OG image`);
for (const route of ['/locations','/guides/reel-of-fortune']) {
  const html = await readFile(`dist${route}/index.html`, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1].replace(/&amp;/g,'&') || '';
  assert.ok(title.length <= 60, `${route} title must be at most 60 characters`);
}
const beginnerCardGenerator = await readFile('scripts/generate-beginner-cards.mjs', 'utf8');
const generatedRouteSvg = await readFile('public/images/guides/beginner/localized/07-island-route-en.svg', 'utf8');
const generatedBossSvg = await readFile('public/images/guides/beginner/localized/09-boss-clear-en.svg', 'utf8');
for (const [label, source] of [['generator source',beginnerCardGenerator],['07 route SVG',generatedRouteSvg],['09 boss SVG',generatedBossSvg]]) {
  assert.match(source, /return its Shell[^.]*Boat Keys/i, `${label} must preserve the Spider Crab Shell hand-in`);
  assert.doesNotMatch(source, /return its Meat|Spider Crab Meat/i, `${label} must not regenerate the obsolete Meat hand-in`);
  assert.match(source, /Five native catches[\s\S]*Fish Bucket[\s\S]*Bowhead body\/crater[\s\S]*Mutated[\s\S]*Bowhead[\s\S]*Whale Fin[\s\S]*scientist[\s\S]*military boat key/i, `${label} must preserve the complete Volcano dependency`);
}
console.log(`verified ${routes.length} crawlable static routes`);
