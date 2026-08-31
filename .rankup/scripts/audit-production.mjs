#!/usr/bin/env node
// Verified 2026-08-31: crawls the live sitemap, SEO metadata, internal links, images and a real 404.

import { writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
const value = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const baseInput = value("--base");
if (!baseInput) throw new Error("Usage: audit-production.mjs --base https://example.com [--out report.json]");
const base = new URL(baseInput);
const out = value("--out");
const decode = (text = "") => text
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "");
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const fetchPage = async (url) => {
  const start = performance.now();
  const response = await fetch(url, { redirect: "follow", headers: { "user-agent": "HowToFishWalkthroughProductionAudit/1.0" } });
  return { response, html: await response.text(), elapsedMs: Math.round(performance.now() - start) };
};

const sitemapUrl = new URL("/sitemap.xml", base).href;
const sitemap = await fetchPage(sitemapUrl);
if (!sitemap.response.ok) throw new Error(`Sitemap returned ${sitemap.response.status}`);
const urls = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1]));
const pages = [];
const imageUrls = new Set();
for (const url of urls) {
  const { response, html, elapsedMs } = await fetchPage(url);
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "");
  const descriptionTag = html.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i)?.[0] ?? "";
  const canonicalTag = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ?? "";
  const robotsTag = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*>/i)?.[0] ?? "";
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => text(match[1]));
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) => decode(match[1]));
  for (const tag of imgs) {
    const src = attr(tag, "src");
    if (src) imageUrls.add(new URL(src, url).href);
  }
  pages.push({
    url, status: response.status, elapsedMs, bytes: Buffer.byteLength(html), title,
    titleLength: [...title].length, description: attr(descriptionTag, "content"),
    descriptionLength: [...attr(descriptionTag, "content")].length,
    canonical: attr(canonicalTag, "href"), robots: attr(robotsTag, "content"),
    h1s, wordCount: text(main).split(/\s+/).filter(Boolean).length,
    imageCount: imgs.length, imageMissingAlt: imgs.filter((tag) => !attr(tag, "alt")).length,
    imageMissingDimensions: imgs.filter((tag) => !attr(tag, "width") || !attr(tag, "height")).length,
    internalLinks: links.filter((href) => href.startsWith("/") || href.startsWith(base.origin)).length,
    hasOgImage: /<meta\s+[^>]*property=["']og:image["']/i.test(html),
    hasJsonLd: /application\/ld\+json/i.test(html),
  });
}
const images = [];
for (const url of imageUrls) {
  const response = await fetch(url, { method: "HEAD", redirect: "follow" });
  images.push({ url, status: response.status, bytes: Number(response.headers.get("content-length")) || null, type: response.headers.get("content-type") });
}
const titleCounts = pages.reduce((groups, page) => {
  (groups[page.title] ??= []).push(page);
  return groups;
}, {});
const duplicateTitles = Object.entries(titleCounts).filter(([title, group]) => title && group.length > 1).map(([title, group]) => ({ title, urls: group.map((page) => page.url) }));
const unknown = await fetchPage(new URL(`/audit-missing-${Date.now()}`, base).href);
const robots = await fetchPage(new URL("/robots.txt", base).href);
const ads = await fetchPage(new URL("/ads.txt", base).href);
const report = {
  checkedAt: new Date().toISOString(), base: base.href, sitemapUrl, pageCount: pages.length,
  pages, duplicateTitles, images,
  brokenImages: images.filter((item) => item.status !== 200),
  unknownStatus: unknown.response.status,
  robots: { status: robots.response.status, body: robots.html.trim() },
  adsTxt: { status: ads.response.status, present: /google\.com,\s*pub-\d+,\s*DIRECT/i.test(ads.html) },
};
const serialized = JSON.stringify(report, null, 2);
if (out) await writeFile(out, serialized + "\n");
console.log(JSON.stringify({
  pageCount: report.pageCount,
  badPages: pages.filter((page) => page.status !== 200 || page.h1s.length !== 1 || page.canonical !== page.url || !page.hasJsonLd),
  thinPages: pages.filter((page) => page.wordCount < 500).map((page) => ({ url: page.url, wordCount: page.wordCount })),
  missingOgImage: pages.filter((page) => !page.hasOgImage).map((page) => page.url),
  duplicateTitles, brokenImages: report.brokenImages, unknownStatus: report.unknownStatus,
  adsTxt: report.adsTxt, maxHtmlMs: Math.max(...pages.map((page) => page.elapsedMs)),
}, null, 2));
