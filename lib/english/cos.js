import COS from 'cos-nodejs-sdk-v5';
export function configured() {
  const { COS_SECRET_ID: id, COS_SECRET_KEY: key, COS_BUCKET: bucket, COS_REGION: region, COS_MEDIA_DOMAIN: domain } = process.env;
  if (!id || !key || bucket !== 'english-1257786947' || region !== 'ap-hongkong') return false;
  if (domain) { try { const u = new URL(domain); if (u.protocol !== 'https:' || u.origin !== domain || u.username || u.password) return false; } catch { return false; } }
  return true;
}
export async function sign(key) {
  const client = new COS({ SecretId: process.env.COS_SECRET_ID, SecretKey: process.env.COS_SECRET_KEY });
  const options = { Bucket: process.env.COS_BUCKET, Region: process.env.COS_REGION, Key: key, Sign: true, Expires: 300, Method: 'GET', Protocol: 'https:' };
  if (process.env.COS_MEDIA_DOMAIN) options.Domain = new URL(process.env.COS_MEDIA_DOMAIN).host;
  const url = await new Promise((resolve, reject) => client.getObjectUrl(options, (err, data) => err ? reject(err) : resolve(data.Url)));
  const parsed = new URL(url); const expectedHost = process.env.COS_MEDIA_DOMAIN ? new URL(process.env.COS_MEDIA_DOMAIN).host : `${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com`;
  if (parsed.protocol !== 'https:' || parsed.host !== expectedHost || !parsed.search) throw new Error('Invalid signature result');
  return { url, expiresAt: new Date(Date.now() + 295000).toISOString() };
}
