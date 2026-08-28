import { readFile, stat, access } from "node:fs/promises";
import assert from "node:assert/strict";

const domain = "https://howtofishwalkthrough.com";
const routes = [
  "/",
  "/beginner-guide",
  "/creatures",
  "/bosses",
  "/locations",
  "/locations/lighthouse",
  "/locations/rocks",
  "/locations/volcano",
  "/guides/reel-of-fortune",
  "/lures",
  "/bosses/spider-crab",
  "/achievements",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];
const textFrom = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
const prerenderSource = await readFile("scripts/prerender.ts", "utf8");
assert.match(
  prerenderSource,
  /renderToString\([\s\S]{0,80}React\.createElement\(App/,
  "static pages must render the shared React App tree with the hydration-compatible API",
);
const clientSource = await readFile("src/client.tsx", "utf8");
assert.match(
  clientSource,
  /hydrateRoot\(/,
  "client entry must hydrate the server-rendered App",
);
const appSource = await readFile("src/main.tsx", "utf8");
assert.match(
  appSource,
  /useState<string\[\]>\(\[\]\)[\s\S]{0,120}useState\(false\)/,
  "creature SSR and first client render must start with an empty checklist",
);
assert.match(
  appSource,
  /localStorage\.getItem\(["']htf-caught["']\)/,
  "creature checklist must restore validated local storage after mount",
);
assert.match(
  appSource,
  /if \(hydrated\)[\s\S]{0,80}localStorage\.setItem\(["']htf-caught["']/,
  "creature checklist must not persist before restore completes",
);
assert.match(
  appSource,
  /articlePaths\.has\(path\)\s*\?\s*["']article["']\s*:\s*["']website["']/,
  "client Open Graph type must distinguish articles from other pages",
);
assert.match(
  appSource,
  /index,follow,max-image-preview:large/,
  "indexable pages must allow large image previews",
);
const stylesSource = await readFile("src/styles.css", "utf8");
assert.match(
  stylesSource,
  /\.guide-visual\{margin:30px 0;overflow-x:auto/,
  "mobile guide visuals must support horizontal scrolling",
);
assert.match(
  stylesSource,
  /Swipe or scroll the diagram horizontally/,
  "mobile guide visuals must explain the scroll affordance",
);
for (const route of routes) {
  const file = route === "/" ? "dist/index.html" : `dist${route}/index.html`;
  await stat(file);
  const html = await readFile(file, "utf8");
  assert.match(
    html,
    new RegExp(
      `<link rel="canonical" href="${domain}${route === "/" ? "/" : route}">`,
    ),
  );
  assert.match(html, /<meta property="og:title"/);
  assert.match(
    html,
    /<meta name="twitter:card" content="summary_large_image">/,
  );
  assert.match(html, /application\/ld\+json/);
  assert.match(
    html,
    /<meta name="robots" content="index,follow,max-image-preview:large">/,
  );
  assert.doesNotMatch(html, /<div id="root"><\/div>/);
  assert.doesNotMatch(
    html,
    /class="evidence"|Claim sources|SOURCES \/ VERIFY|How this route was verified|sources and evidence boundary/i,
    `${route} must not render a claim-sources section`,
  );
  const renderedTitle =
    html.match(/<title>(.*?)<\/title>/)?.[1].replace(/&amp;/g, "&") || "";
  assert.ok(
    renderedTitle.length <= 60,
    `${route} final rendered title must be at most 60 characters`,
  );
}
const creatures = await readFile("dist/creatures/index.html", "utf8");
assert.match(creatures, /All 49 How to Fish/);
assert.match(creatures, /Mutated Bowhead Whale/);
assert.match(creatures, /Lighthouse and early catches/);
assert.match(creatures, /Drip variants/);
assert.doesNotMatch(
  creatures,
  /encyclopedia-overview\.webp/,
  "creature page must not use the unrelated rod-over-ocean image",
);
assert.match(creatures, /encyclopedia-early\.webp/);
const home = await readFile("dist/index.html", "utf8");
assert.ok(
  textFrom(home).split(/\s+/).length >= 1200,
  "homepage must expose at least 1200 visible words in initial HTML",
);
assert.match(
  home,
  /<div id="root">[\s\S]*<h1>How to Fish[\s\S]*Walkthrough &amp; Guides/,
  "homepage H1 must exist inside the initial static root",
);
assert.match(
  home,
  /How the walkthrough works/i,
  "homepage must include the expanded route manual in initial HTML",
);
assert.match(
  home,
  /How to Fish Game FAQ/i,
  "homepage must include visible FAQ content in initial HTML",
);
assert.match(
  home,
  /"@type":"FAQPage"/,
  "homepage must expose FAQPage structured data that matches the visible FAQ",
);
assert.match(
  home,
  /aria-label="Original How to Fish gameplay field images"/,
  "homepage must expose the original-material carousel",
);
assert.match(
  home,
  /href="\/locations\/rocks"/,
  "homepage must link directly to the Rocks deep guide",
);
assert.match(
  home,
  /href="\/locations\/volcano"/,
  "homepage must link directly to the Volcano deep guide",
);
const homeImages = [
  ...home.matchAll(/src="(\/images\/home\/[^"]+\.webp)"/g),
].map((match) => match[1]);
assert.equal(
  homeImages.length,
  4,
  "homepage carousel must include all four processed gameplay frames",
);
for (const src of homeImages) await access(`public${src}`);
assert.equal(
  (await readFile("dist/ads.txt", "utf8")).trim(),
  "google.com, pub-5329936944958399, DIRECT, f08c47fec0942fa0",
  "ads.txt must exactly match the authorized seller record",
);
const privacy = await readFile("dist/privacy/index.html", "utf8");
for (const phrase of [
  "Google AdSense",
  "local storage",
  "Email communications",
  "email providers",
  "Google-certified consent management platform",
  "My Ad Center",
])
  assert.match(privacy, new RegExp(phrase));
const contact = await readFile("dist/contact/index.html", "utf8");
for (const phrase of [
  "Private contact",
  "mailto:likaichina1995@gmail.com",
  "GitHub issues are public",
  "Do not send passwords",
])
  assert.match(contact, new RegExp(phrase));
const terms = await readFile("dist/terms/index.html", "utf8");
assert.match(terms, /Rights and takedown requests/);
assert.match(terms, /privately by email/);
const about = await readFile("dist/about/index.html", "utf8");
for (const path of ["/about", "/contact", "/privacy", "/terms"])
  assert.match(about, new RegExp(`href="${path}"`));
const spider = await readFile("dist/bosses/spider-crab/index.html", "utf8");
assert.match(spider, /Empty Beer Can/);
const contentGate = async (route, requirements) => {
  const html = await readFile(`dist${route}/index.html`, "utf8");
  assert.ok(
    textFrom(html).split(" ").length >= 700,
    `${route} must have at least 700 visible words`,
  );
  assert.ok(
    (html.match(/<img /g) || []).length >= requirements.images,
    `${route} must include original explanatory visuals`,
  );
  for (const phrase of requirements.phrases)
    assert.match(
      html,
      new RegExp(phrase),
      `${route} missing required player-help content: ${phrase}`,
    );
  assert.match(
    html,
    /"@type":"Article"/,
    `${route} must expose Article structured data`,
  );
  assert.match(
    html,
    /"@type":"BreadcrumbList"/,
    `${route} must expose BreadcrumbList structured data`,
  );
  assert.equal(
    (html.match(/id="ld-json"/g) || []).length,
    1,
    `${route} must emit exactly one server JSON-LD node for client replacement`,
  );
  for (const src of [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(
    (match) => match[1],
  ))
    await access(`public${src}`);
  assert.match(
    html,
    /class="article guide-article"/,
    `${route} must be server-rendered from the shared guide tree`,
  );
};
await contentGate("/beginner-guide", {
  images: 9,
  phrases: [
    "First 20 minutes",
    "Bait and hotspots",
    "Make more money",
    "Prepare for Spider Crab",
    "The complete five-location story route",
    "Late-game firepower",
    "If the route stalls",
    "Empty Beer Can",
    "Spider Crab Shell",
    "VOLCANO",
  ],
});
const beginner = await readFile("dist/beginner-guide/index.html", "utf8");
assert.doesNotMatch(
  beginner,
  /Claim sources|SOURCES \/ VERIFY/,
  "/beginner-guide must not render the removed claim-sources section",
);
const beginnerImages = [
  ...beginner.matchAll(
    /<img[^>]+src="(\/images\/guides\/beginner\/localized\/[^"]+)"[^>]*>/g,
  ),
];
assert.equal(
  beginnerImages.length,
  9,
  "beginner carousel must include exactly nine visual steps",
);
assert.ok(
  beginnerImages.every((match) => match[1].endsWith(".webp")),
  "beginner carousel must use optimized WebP assets",
);
assert.match(
  beginnerImages[0][0],
  /loading="eager"[^>]*fetchPriority="high"/,
  "first beginner image must be prioritized",
);
for (const match of beginnerImages.slice(1))
  assert.match(
    match[0],
    /loading="lazy"/,
    "off-screen beginner slides must load lazily",
  );
let beginnerImageBytes = 0;
for (const match of beginnerImages)
  beginnerImageBytes += (await stat(`public${match[1]}`)).size;
assert.ok(
  beginnerImageBytes < 1_500_000,
  "all nine beginner WebP assets must stay below 1.5 MB total",
);
await contentGate("/bosses/spider-crab", {
  images: 2,
  phrases: [
    "Summon Spider Crab correctly",
    "charge → stun → punish",
    "Common mistakes and quick recoveries",
    "Empty Beer Can",
    "boat keys",
  ],
});
const lighthouse = await readFile(
  "dist/locations/lighthouse/index.html",
  "utf8",
);
assert.ok(
  textFrom(lighthouse).split(" ").length >= 900,
  "/locations/lighthouse must be a deep guide",
);
assert.ok(
  (lighthouse.match(/<img /g) || []).length >= 10,
  "/locations/lighthouse must include the extracted gameplay sequence",
);
for (const phrase of [
  "Build the Clam-to-cash loop",
  "Empty Beer Can",
  "charge-and-punish",
  "Boat Keys",
  "FOLLOW THE GREEN FOREST MARKER",
])
  assert.match(lighthouse, new RegExp(phrase));
for (const src of [...lighthouse.matchAll(/<img[^>]+src="([^"]+)"/g)].map(
  (match) => match[1],
))
  await access(`public${src}`);
const locationsGuide = await readFile("dist/locations/index.html", "utf8");
assert.ok(
  textFrom(locationsGuide).split(" ").length >= 1000,
  "/locations must be a deep five-location route",
);
for (const phrase of [
  "FIVE-LOCATION STORY ROUTE",
  "Giant Piranha Skeleton",
  "Pufferfish Fin",
  "Albatross Head",
  "Mutated Bowhead Whale",
  "Developer Island is optional",
  "Patch 1.0.10",
])
  assert.match(locationsGuide, new RegExp(phrase));
assert.match(locationsGuide, /five-location-route-hero\.png/);
await access("public/images/guides/locations/five-location-route-hero.png");
const rocks = await readFile("dist/locations/rocks/index.html", "utf8");
assert.ok(
  textFrom(rocks).split(" ").length >= 1200,
  "/locations/rocks must be a deep island guide",
);
assert.ok(
  (rocks.match(/<img /g) || []).length >= 3,
  "/locations/rocks must include owner-provided gameplay references",
);
for (const phrase of [
  "ISLAND 4",
  "Professional Boss Lure",
  "Pufferfish Fin",
  "Tuna body",
  "Albatross Head",
  "Volcano coordinates",
  "Rocks troubleshooting",
  "OWNER-PROVIDED GAMEPLAY",
])
  assert.match(rocks, new RegExp(phrase, "i"));
for (const name of [
  "Bass",
  "Eel",
  "Red Snapper",
  "Sengarat",
  "Halibut",
  "Tigerfish",
  "Flying Fish",
  "Voxelfish",
  "Parrotfish",
  "Dripper",
])
  assert.match(rocks, new RegExp(name));
for (const src of [...rocks.matchAll(/<img[^>]+src="([^"]+)"/g)].map(
  (match) => match[1],
))
  await access(`public${src}`);
assert.match(rocks, /href="\/locations"/);
assert.match(rocks, /href="\/creatures"/);
assert.match(rocks, /href="\/lures"/);
assert.doesNotMatch(
  rocks,
  /game8\/20-tuna|game8\/21-albatross/i,
  "reference-only Game8 images must not be published on Rocks",
);
for (const phrase of [
  "1.50×",
  "escape timer",
  "falling projectiles",
  "GAMEPLAY RECONSTRUCTION",
  "Meat Chunks",
  "complete Volcano Island 5 walkthrough",
])
  assert.match(rocks, new RegExp(phrase, "i"));
const volcano = await readFile("dist/locations/volcano/index.html", "utf8");
assert.ok(
  textFrom(volcano).split(" ").length >= 1800,
  "/locations/volcano must be a deep final-island guide",
);
assert.ok(
  (volcano.match(/<img /g) || []).length >= 4,
  "/locations/volcano must include reconstructed gameplay and owner-provided encyclopedia visuals",
);
for (const phrase of [
  "ISLAND 5",
  "Scientific Lure",
  "Scientist’s fish request",
  "Fish Bucket",
  "Bowhead Whale",
  "whole body",
  "Mutated Bowhead Whale",
  "Whale Fin",
  "military-boat key",
  "Volcano troubleshooting",
  "GAMEPLAY RECONSTRUCTION",
  "OWNER-PROVIDED GAMEPLAY",
])
  assert.match(volcano, new RegExp(phrase, "i"));
for (const name of [
  "Blobfish",
  "Oarfish",
  "Anglerfish",
  "Stonefish",
  "Superdwarf Fish",
  "Goblin Shark",
])
  assert.match(volcano, new RegExp(name));
for (const src of [...volcano.matchAll(/<img[^>]+src="([^"]+)"/g)].map(
  (match) => match[1],
))
  await access(`public${src}`);
for (const href of [
  "/locations/rocks",
  "/locations",
  "/creatures",
  "/bosses",
  "/lures",
])
  assert.match(volcano, new RegExp(`href="${href}"`));
assert.doesNotMatch(
  volcano,
  /research\/video-analysis|frame-\d+\.jpg|douyin|xiaohongshu|版本 1\.0\.5/i,
  "research-only frames and social identities must not be published on Volcano",
);
assert.match(
  volcano,
  /source disagreement[\s\S]*any five fish[\s\S]*five native Volcano catches/i,
  "Volcano guide must disclose the five-fish counter source conflict",
);
const reel = await readFile("dist/guides/reel-of-fortune/index.html", "utf8");
assert.ok(
  textFrom(reel).split(" ").length >= 900,
  "/guides/reel-of-fortune must be a deep guide",
);
for (const phrase of [
  "Drip creature",
  "cosmetic skin",
  "Z or C",
  "GOLD GOLD GOLD",
  "does not increase damage",
  "Patch 1.0.10",
])
  assert.match(reel, new RegExp(phrase, "i"));
assert.match(reel, /reel-machine-hero\.png/);
assert.doesNotMatch(
  reel,
  /there is one machine (?:on|per) (?:each|every) island|skins? (?:are|is) shared (?:between|with) players|pity (?:counter|system) guarantees/i,
);
await access("public/images/guides/reel-of-fortune/reel-machine-hero.png");
const spiderText = textFrom(spider);
const beginnerText = textFrom(beginner);
const lighthouseText = textFrom(lighthouse);
const locationsText = textFrom(locationsGuide);
for (const [route, pageText] of [
  ["/beginner-guide", beginnerText],
  ["/locations/lighthouse", lighthouseText],
  ["/bosses/spider-crab", spiderText],
  ["/locations", locationsText],
]) {
  assert.match(
    pageText,
    /Spider Crab Shell/,
    `${route} must name the current progression item`,
  );
  assert.match(
    pageText,
    /Boat Keys/,
    `${route} must preserve the Shell to Boat Keys chain`,
  );
  assert.doesNotMatch(
    pageText,
    /Spider Crab Meat|return (?:its|required )?Meat|hand in (?:the required )?Meat/i,
    `${route} must not contain the obsolete Meat hand-in`,
  );
}
assert.match(
  spiderText,
  /white (?:bar is )?Spider Crab’s escape timer|white escape timer/i,
  "Spider guide must identify the white bar as the boss escape timer",
);
assert.doesNotMatch(
  spiderText,
  /white bar (?:is|acts as) (?:a |the )?revive|downed-state bar/i,
  "Spider guide must not mislabel the boss escape bar as a revive timer",
);
assert.match(
  locationsText,
  /five native catches[\s\S]*Fish Bucket[\s\S]*Bowhead Whale body[\s\S]*crater[\s\S]*Mutated Bowhead Whale[\s\S]*Whale Fin[\s\S]*military boat key/i,
  "Volcano route must include the complete dependency chain",
);
assert.match(
  textFrom(reel),
  /catch[^.]*kill[^.]*carry[^.]*Drip body/i,
  "Reel guide must explain the dead Drip body input",
);
assert.match(
  textFrom(reel),
  /confirm[^.]*dead|that it is dead/i,
  "Reel troubleshooting must verify that the creature is dead",
);
for (const base of [
  "public/images/guides/locations/five-location-route-hero",
  "public/images/guides/reel-of-fortune/reel-machine-hero",
  "public/images/guides/rocks/albatross-cover-guide",
  "public/images/guides/volcano/01-volcano-arrival",
  "public/images/guides/volcano/02-bowhead-to-crater",
  "public/images/guides/volcano/03-mutated-bowhead-fight",
]) {
  for (const width of [768, 1280]) await access(`${base}-${width}.webp`);
}
for (const html of [locationsGuide, reel]) {
  assert.match(html, /<picture>/, "generated guide heroes must use picture");
  assert.match(
    html,
    /-768\.webp 768w, [^" ]+-1280\.webp 1280w/,
    "generated guide heroes must expose responsive WebP srcset",
  );
  assert.match(
    html,
    /width="1536" height="1024"/,
    "generated guide heroes must reserve intrinsic layout space",
  );
  assert.match(
    html,
    /decoding="async" loading="eager" fetchPriority="high"/,
    "generated guide heroes must expose loading hints",
  );
}
const bossesPage = await readFile("dist/bosses/index.html", "utf8");
assert.ok(
  textFrom(bossesPage).split(/\s+/).length >= 900,
  "/bosses must provide deep fight, reward, and recovery guidance",
);
for (const phrase of [
  "Fight plan",
  "Reward / next step",
  "If it goes wrong",
  "Spider Crab",
  "Mutated Bowhead Whale",
])
  assert.match(bossesPage, new RegExp(phrase));
assert.match(
  bossesPage,
  /"@type":"CollectionPage"/,
  "/bosses must use CollectionPage schema",
);
const luresPage = await readFile("dist/lures/index.html", "utf8");
assert.ok(
  textFrom(luresPage).split(/\s+/).length >= 750,
  "/lures must be a substantive field guide",
);
for (const phrase of [
  "Confirmed targets",
  "Named bait and story dependencies",
  "Beginner Lure",
  "Scientific Lure",
  "Fish Bucket",
])
  assert.match(luresPage, new RegExp(phrase));
assert.match(luresPage, /encyclopedia-scientific\.webp/);
assert.match(luresPage, /"@type":"CollectionPage"/);
const achievementsPage = await readFile("dist/achievements/index.html", "utf8");
assert.ok(
  textFrom(achievementsPage).split(/\s+/).length >= 1200,
  "/achievements must explain all 28 routes",
);
assert.equal(
  (achievementsPage.match(/class="official-condition"/g) || []).length,
  28,
  "all 28 achievements need official conditions",
);
assert.equal(
  (achievementsPage.match(/class="achievement-icon"/g) || []).length,
  28,
  "all 28 achievements need official icons",
);
assert.equal(
  (achievementsPage.match(/GLOBAL RATE/g) || []).length,
  28,
  "all 28 achievements need dated global-rate context",
);
for (const phrase of [
  "Official condition",
  "Practical route",
  "Current-build caution",
  "Bean",
  "Handyman",
  "Search name, condition, location, or route",
  "MARKED COMPLETE",
  "August 28, 2026",
])
  assert.match(achievementsPage, new RegExp(phrase));
assert.match(achievementsPage, /"@type":"CollectionPage"/);
assert.match(achievementsPage, /"@type":"ItemList"/);
assert.match(achievementsPage, /"numberOfItems":28/);
assert.match(
  appSource,
  /localStorage\.getItem\(["']htf-achievements-done["']\)/,
  "achievement checklist must restore browser-local progress",
);
assert.match(
  appSource,
  /if \(hydrated\)\s+localStorage\.setItem\(["']htf-achievements-done["']/,
  "achievement checklist must not persist before restore completes",
);
for (const src of [
  ...achievementsPage.matchAll(
    /<img[^>]+src="(\/images\/achievements\/[^"]+\.webp)"/g,
  ),
].map((match) => match[1]))
  await access(`public${src}`);
for (const [route, type] of [
  ["/", "WebSite"],
  ["/about", "AboutPage"],
  ["/contact", "ContactPage"],
  ["/privacy", "WebPage"],
]) {
  const html = await readFile(
    route === "/" ? "dist/index.html" : `dist${route}/index.html`,
    "utf8",
  );
  assert.match(
    html,
    new RegExp(`"@type":"${type}"`),
    `${route} must use ${type} schema`,
  );
}
for (const html of [home, beginner, bossesPage, luresPage, achievementsPage])
  assert.doesNotMatch(
    html,
    /adsbygoogle|pagead2\.googlesyndication\.com/,
    "AdSense runtime must remain disabled until a certified CMP is configured",
  );
for (const [route, html] of [
  ["/bosses", bossesPage],
  ["/bosses/spider-crab", spider],
])
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/howtofishwalkthrough\.com\/images\/guides\/island-1\/08-spider-crab\.jpg">/,
    `${route} must expose a rights-safe OG image`,
  );
for (const route of [
  "/locations",
  "/locations/rocks",
  "/locations/volcano",
  "/guides/reel-of-fortune",
]) {
  const html = await readFile(`dist${route}/index.html`, "utf8");
  const title =
    html.match(/<title>(.*?)<\/title>/)?.[1].replace(/&amp;/g, "&") || "";
  assert.ok(title.length <= 60, `${route} title must be at most 60 characters`);
}
const beginnerCardGenerator = await readFile(
  "scripts/generate-beginner-cards.mjs",
  "utf8",
);
const generatedRouteSvg = await readFile(
  "public/images/guides/beginner/localized/07-island-route-en.svg",
  "utf8",
);
const generatedBossSvg = await readFile(
  "public/images/guides/beginner/localized/09-boss-clear-en.svg",
  "utf8",
);
for (const [label, source] of [
  ["generator source", beginnerCardGenerator],
  ["07 route SVG", generatedRouteSvg],
  ["09 boss SVG", generatedBossSvg],
]) {
  assert.match(
    source,
    /return its Shell[^.]*Boat Keys/i,
    `${label} must preserve the Spider Crab Shell hand-in`,
  );
  assert.doesNotMatch(
    source,
    /return its Meat|Spider Crab Meat/i,
    `${label} must not regenerate the obsolete Meat hand-in`,
  );
  assert.match(
    source,
    /Five native catches[\s\S]*Fish Bucket[\s\S]*Bowhead body\/crater[\s\S]*Mutated[\s\S]*Bowhead[\s\S]*Whale Fin[\s\S]*scientist[\s\S]*military boat key/i,
    `${label} must preserve the complete Volcano dependency`,
  );
}
console.log(`verified ${routes.length} crawlable static routes`);
