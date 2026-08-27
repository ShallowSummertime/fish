# Static deployment notes

Upload the `dist/` directory. The build emits a real `index.html` for every
listed sitemap route, so normal static hosting serves deep links without
JavaScript. Do not configure a global SPA history fallback: unknown URLs should
return the hosting provider's real HTTP 404 response rather than a client-only
noindex page served with HTTP 200.
