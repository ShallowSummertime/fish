import { createHash, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
export const COOKIE = '__Host-wow_session';
export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;
export function secret() {
  const value = process.env.WOW_SESSION_SECRET;
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const bytes = Buffer.from(value, 'base64url');
  return bytes.length >= 32 && bytes.toString('base64url') === value ? bytes : null;
}
export function authConfigured() { return !!secret() && /^[0-9a-f]{64}$/i.test(process.env.WOW_FAMILY_CODE_SHA256 || ''); }
export function checkCode(code) {
  const hash = process.env.WOW_FAMILY_CODE_SHA256;
  if (!authConfigured()) return null;
  if (typeof code !== 'string' || Buffer.byteLength(code) < 1 || Buffer.byteLength(code) > 256) return false;
  return timingSafeEqual(createHash('sha256').update(code, 'utf8').digest(), Buffer.from(hash, 'hex'));
}
export async function createSession() {
  return new SignJWT({}).setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setIssuer('wow-family').setAudience('wow-family-english').setSubject('family').setIssuedAt().setExpirationTime(`${SESSION_DURATION_SECONDS}s`).sign(secret());
}
export const cookie = token => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}`;
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
export async function authenticated(req) {
  const key = secret(); if (!key) return null;
  const parts = (req.headers.get('cookie') || '').split(';').map(x => x.trim()).filter(x => x.startsWith(`${COOKIE}=`));
  if (parts.length !== 1) return false;
  try { const { payload } = await jwtVerify(parts[0].slice(COOKIE.length + 1), key, { algorithms: ['HS256'], issuer: 'wow-family', audience: 'wow-family-english', subject: 'family', requiredClaims: ['iat', 'exp', 'iss', 'aud', 'sub'], maxTokenAge: `${SESSION_DURATION_SECONDS}s` }); return Number.isInteger(payload.iat) && Number.isInteger(payload.exp) && payload.exp > payload.iat && payload.exp - payload.iat <= SESSION_DURATION_SECONDS && payload.iat <= Math.floor(Date.now()/1000); } catch { return false; }
}
