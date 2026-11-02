export function mediaUrl(base, key) {
  if (!base) return null;
  let url;
  try { url = new URL(base); } catch { throw new Error('Invalid media base'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !url.pathname.endsWith('/')) throw new Error('Invalid media base');
  if (typeof key !== 'string' || !key || key.startsWith('/') || key.includes('\\') || /[\x00-\x1f\x7f]/.test(key)) throw new Error('Invalid media key');
  const parts = key.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) throw new Error('Invalid media key');
  const resolved = new URL(parts.map(encodeURIComponent).join('/'), url);
  if (resolved.origin !== url.origin || !resolved.pathname.startsWith(url.pathname)) throw new Error('Invalid media key');
  return resolved.href;
}
