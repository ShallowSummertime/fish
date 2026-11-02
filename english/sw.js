const CACHE = 'wow-family-english-shell-v3';
const SHELL = ['/english/', '/english/index.html', '/english/styles.css', '/english/app.js', '/english/player.js', '/english/state.js', '/english/training-state.js', '/english/flashcard-state.js', '/english/viewing-reminder.js', '/english/data/catalog.json', '/english/manifest.webmanifest', '/english/icon.svg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('wow-family-english-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !SHELL.includes(url.pathname)) return;
  event.respondWith(fetch(event.request).then(response => { if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone())); return response; }).catch(() => caches.match(event.request, { ignoreSearch: true })));
});
