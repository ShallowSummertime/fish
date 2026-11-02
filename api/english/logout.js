import { parseRequest, reply } from '../../lib/english/http.js';
import { clearCookie } from '../../lib/english/auth.js';
async function handler(req) { const result = await parseRequest(req, []); if (result.error) return result.error; return reply(200, { authenticated: false }, { 'Set-Cookie': clearCookie() }); }

export default { fetch: handler };
