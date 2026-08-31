#!/usr/bin/env node
// Verified 2026-08-31: compares visible <main> copy across a live sitemap using word trigrams.

const args = process.argv.slice(2);
const value = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const baseInput = value("--base");
if (!baseInput) {
  throw new Error(
    "Usage: analyze-content-overlap.mjs --base https://example.com [--focus /path,/other-path]",
  );
}

const base = new URL(baseInput);
const focus = new Set(
  (value("--focus") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
);

const decode = (input = "") =>
  input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const visibleText = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const trigrams = (input) => {
  const words = input.split(" ").filter(Boolean);
  const result = new Set();
  for (let index = 0; index + 2 < words.length; index += 1) {
    result.add(words.slice(index, index + 3).join(" "));
  }
  return { words: words.length, values: result };
};

const similarity = (left, right) => {
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  const union = left.size + right.size - intersection;
  return union ? intersection / union : 0;
};

const sitemapResponse = await fetch(new URL("/sitemap.xml", base));
if (!sitemapResponse.ok) throw new Error(`Sitemap returned ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1]));

const pages = [];
for (const url of urls) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const html = await response.text();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const text = visibleText(main);
  pages.push({ url, path: new URL(url).pathname, ...trigrams(text) });
}

const selected = focus.size ? pages.filter((page) => focus.has(page.path)) : pages;
const report = selected.map((page) => ({
  path: page.path,
  words: page.words,
  closest: pages
    .filter((candidate) => candidate.path !== page.path)
    .map((candidate) => ({
      path: candidate.path,
      trigramJaccard: Number(similarity(page.values, candidate.values).toFixed(4)),
    }))
    .sort((left, right) => right.trigramJaccard - left.trigramJaccard)
    .slice(0, 4),
}));

console.log(JSON.stringify(report, null, 2));
