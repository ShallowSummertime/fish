import { parseRequest, error, reply } from '../../lib/english/http.js';
import { authenticated, authConfigured } from '../../lib/english/auth.js';
import { catalog } from '../../lib/english/catalog.js';
import { privateSubtitles, toVtt } from '../../lib/english/subtitles.js';

export function createSubtitleHandler({ loadSubtitles = privateSubtitles } = {}) {
return async function handler(req) {
  const result = await parseRequest(req, ['lessonId']); if (result.error) return result.error;
  if (!authConfigured()) return error(503, 'NOT_CONFIGURED');
  const session = await authenticated(req); if (session === null) return error(503, 'NOT_CONFIGURED'); if (!session) return error(401, 'UNAUTHENTICATED');
  try {
    const id = result.data.lessonId;
    if (typeof id !== 'string' || !catalog().has(id)) return error(404, 'LESSON_NOT_FOUND');
    const entry = (await loadSubtitles())[id]; if (!entry) return error(404, 'SUBTITLES_NOT_FOUND');
    return reply(200, { lessonId: id, cues: entry.cues, englishVtt: toVtt(entry.cues), bilingualVtt: entry.hasChinese ? toVtt(entry.cues, true) : null });
  } catch { return error(503, 'SUBTITLES_UNAVAILABLE'); }
}
}
export default { fetch: createSubtitleHandler() };
