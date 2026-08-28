/** Prerender the same React tree that the browser hydrates. */
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '../src/main';
import { homeFaqs, pageMeta } from '../src/data';

const domain = 'https://howtofishwalkthrough.com';
const articlePaths = new Set(['/beginner-guide', '/locations/lighthouse', '/locations/rocks', '/locations/volcano', '/guides/reel-of-fortune', '/bosses/spider-crab']);
const collectionPaths = new Set(['/creatures', '/bosses', '/locations', '/lures', '/achievements']);
const schemaType = (path: string) => path === '/' ? 'WebSite' : articlePaths.has(path) ? 'Article' : collectionPaths.has(path) ? 'CollectionPage' : path === '/about' ? 'AboutPage' : path === '/contact' ? 'ContactPage' : 'WebPage';
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const template = await readFile('dist/index.html', 'utf8');
for (const path of Object.keys(pageMeta)) {
  const meta = pageMeta[path];
  const canonical = `${domain}${path}`;
  const image = meta.image ? `${domain}${meta.image}` : undefined;
  if (meta.image) await stat(`public${meta.image}`);
  const type = schemaType(path);
  const primary = type === 'Article'
    ? { '@type': type, headline: meta.title, description: meta.description, mainEntityOfPage: canonical, image, dateModified: '2026-08-28', author: { '@type': 'Organization', name: 'How to Fish Walkthrough' }, about: { '@type': 'VideoGame', name: 'How to Fish' } }
    : { '@type': type, name: meta.title, description: meta.description, url: canonical };
  const graph: unknown[] = [
    primary,
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'How to Fish Walkthrough', item: domain }, { '@type': 'ListItem', position: 2, name: path === '/' ? 'Guides' : meta.title, item: canonical }] }
  ];
  if (path === '/') graph.push({ '@type': 'FAQPage', mainEntity: homeFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) });
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  const socialImage = image ? `<meta property="og:image" content="${image}"><meta name="twitter:image" content="${image}">` : '';
  const head = `<meta name="description" content="${escape(meta.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escape(meta.title)}"><meta property="og:description" content="${escape(meta.description)}"><meta property="og:type" content="${type === 'Article' ? 'article' : 'website'}"><meta property="og:url" content="${canonical}">${socialImage}<meta name="twitter:card" content="summary_large_image"><script id="ld-json" type="application/ld+json">${jsonLd}</script>`;
  const markup = renderToString(React.createElement(App, { initialPath: path }));
  const page = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(meta.title)}</title>`).replace(/<meta name="description"[^>]*>/, '').replace('</head>', `${head}</head>`).replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  const out = path === '/' ? 'dist/index.html' : join('dist', path.slice(1), 'index.html');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, page);
}
console.log(`prerendered ${Object.keys(pageMeta).length} route HTML files from the React app`);
