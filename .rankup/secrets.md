# 密钥登记

| name | purpose | environment | provider/storage location | owner | access status | rotated at | next rotation |
|---|---|---|---|---|---|---|---|
| `WOW_FAMILY_CODE_SHA256` | Digest of high-entropy family access code | Production | Vercel project environment | project owner | rotated; new raw code stored only in macOS Keychain | 2026-11-02 | after disclosure or access rotation |
| `WOW_SESSION_SECRET` | Signs 30-day family sessions | Production | Vercel project environment | project owner | configured | 2026-11-02 | after disclosure; invalidates all sessions |
| `COS_SECRET_ID` | Restricted CAM identity for COS object reads | Production | Vercel project environment | project owner | configured | 2026-11-02 | per CAM policy or disclosure |
| `COS_SECRET_KEY` | Restricted CAM key for COS object reads | Production | Vercel project environment | project owner | configured | 2026-11-02 | per CAM policy or disclosure |

Non-secret server configuration `WOW_APP_ORIGIN`, `COS_BUCKET`, and `COS_REGION` is configured in Vercel Production. Optional `COS_MEDIA_DOMAIN` is not configured. Values and hashes are never recorded in this file. The CAM user has one earlier active key whose SecretKey was not retained; it was not deleted or disabled in this task.
