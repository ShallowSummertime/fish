import { parseRequest, error, reply } from '../../lib/english/http.js';
import { checkCode, createSession, cookie } from '../../lib/english/auth.js';
async function handler(req) { const result = await parseRequest(req, ['code']); if (result.error) return result.error; const valid = checkCode(result.data.code); if (valid === null) return error(503, 'NOT_CONFIGURED'); if (!valid) return error(401, 'INVALID_CREDENTIALS'); return reply(200, { authenticated: true }, { 'Set-Cookie': cookie(await createSession()) }); }

export default { fetch: handler };
