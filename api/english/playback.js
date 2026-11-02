import { parseRequest, error, reply } from '../../lib/english/http.js';
import { authenticated, authConfigured } from '../../lib/english/auth.js';
import { catalog } from '../../lib/english/catalog.js';
import { configured, sign } from '../../lib/english/cos.js';
async function handler(req) {
  const result = await parseRequest(req, ['lessonId']); if (result.error) return result.error;
  if (!authConfigured()) return error(503, 'NOT_CONFIGURED');
  const session = await authenticated(req); if (session === null) return error(503, 'NOT_CONFIGURED'); if (!session) return error(401, 'UNAUTHENTICATED');
  let map; try { map = catalog(); } catch { return error(503, 'NOT_CONFIGURED'); }
  if (typeof result.data.lessonId !== 'string' || !map.has(result.data.lessonId)) return error(404, 'LESSON_NOT_FOUND');
  if (!configured()) return error(503, 'NOT_CONFIGURED');
  try { return reply(200, await sign(map.get(result.data.lessonId))); } catch { return error(502, 'SIGNING_FAILED'); }
}

export default { fetch: handler };
