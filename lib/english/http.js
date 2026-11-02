const headers = { 'Cache-Control': 'private, no-store', Pragma: 'no-cache', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' };
export function reply(status, body, extra = {}) { return new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } }); }
export function error(status, code, extra) { return reply(status, { error: { code } }, extra); }
export async function parseRequest(req, fields) {
  if (req.method !== 'POST') return { error: error(405, 'METHOD_NOT_ALLOWED', { Allow: 'POST' }) };
  const origin = process.env.WOW_APP_ORIGIN;
  let valid = false;
  try { const u = new URL(origin); valid = u.protocol === 'https:' && u.origin === origin && !u.username && !u.password; } catch {}
  if (!valid) return { error: error(503, 'NOT_CONFIGURED') };
  if (req.headers.get('origin') !== origin || (req.headers.has('sec-fetch-site') && req.headers.get('sec-fetch-site') !== 'same-origin')) return { error: error(403, 'FORBIDDEN_ORIGIN') };
  if (!/^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?\s*$/i.test(req.headers.get('content-type') || '')) return { error: error(415, 'UNSUPPORTED_MEDIA_TYPE') };
  if (Number(req.headers.get('content-length')) > 1024) return { error: error(413, 'BODY_TOO_LARGE') };
  let chunks = [], size = 0;
  try {
    if (req.body) { const reader = req.body.getReader(); while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 1024) { await reader.cancel(); return { error: error(413, 'BODY_TOO_LARGE') }; } chunks.push(value); } }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join(',') !== [...fields].sort().join(',')) throw new Error();
    return { data };
  } catch { return { error: error(400, 'INVALID_REQUEST') }; }
}
