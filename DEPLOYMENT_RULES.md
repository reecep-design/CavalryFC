# Deployment Rules

> [!IMPORTANT]
> **STRICT PROTOCOL: NO AUTOMATIC GIT PUSHING**

1.  **NEVER** run `git push` automatically.
2.  **ALWAYS** wait for explicit user permission to push code (e.g., "Okay push that", "Deploy it").
3.  **NEVER** assume a fix should be deployed immediately, even if it is critical.
4.  **ALWAYS** confirm: "I have fixed the code locally. Shall I push it?"

## Current Environment
- **Live Site:** `https://cavalryfc.org` (Hosted on Render)
- **Repo:** `github.com/reecep-design/CavalryFC`
- **Branch:** `master`

## Environment Variables
- **Production (Render):**
    - `FRONTEND_URL` = `https://cavalryfc.org`
    - `NODE_ENV` = `production`
