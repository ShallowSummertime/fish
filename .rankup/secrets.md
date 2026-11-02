# 密钥登记

| name | purpose | environment | provider/storage location | owner | access status | rotated at | next rotation |
|---|---|---|---|---|---|---|---|
| `WOW_FAMILY_CODE_SHA256` | Digest of high-entropy family access code | Production | Vercel project environment | project owner | not-configured | never | after disclosure or access rotation |
| `WOW_SESSION_SECRET` | Signs 12-hour family sessions | Production | Vercel project environment | project owner | not-configured | never | after disclosure; invalidates all sessions |
| `COS_SECRET_ID` | Restricted CAM identity for COS object reads | Production | Vercel project environment | project owner | not-configured | never | per CAM policy or disclosure |
| `COS_SECRET_KEY` | Restricted CAM key for COS object reads | Production | Vercel project environment | project owner | not-configured | never | per CAM policy or disclosure |

Non-secret server configuration still required: `WOW_APP_ORIGIN`, `COS_BUCKET`, `COS_REGION`, and optional `COS_MEDIA_DOMAIN`. Values and hashes are never recorded in this file.
