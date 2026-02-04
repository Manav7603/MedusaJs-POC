# Final deployment checklist (last check before deploy)

Use this to verify everything is correct before deploying backend (Render) and frontend (Vercel).

---

## ✅ Code changes verified

### 1. Confirm password (register form)
- **File:** `MedusaJs-POC-frontend/src/modules/account/components/register/index.tsx`
- **Status:** Correct. Confirm password field is present; client-side validation blocks submit when passwords don’t match; error clears when user edits either password field.

### 2. Backend URL and images (frontend)
- **`MedusaJs-POC-frontend/src/lib/config.ts`**  
  Uses `MEDUSA_BACKEND_URL` (default `http://localhost:9000`). In production you must set this to your backend URL.
- **`MedusaJs-POC-frontend/next.config.js`**  
  Backend host from `MEDUSA_BACKEND_URL` is added to `images.remotePatterns`, so Next.js can load product images from your deployed backend (e.g. `https://medusajs-poc.onrender.com/static/...`).

### 3. Backend build and static
- **`MedusaJs-POC-backend/scripts/copy-admin-build.cjs`**  
  Present and correct: copies admin build to `public/admin` and checks that `static/` exists (with build log messages).
- **`MedusaJs-POC-backend/package.json`**  
  Build script: `npx medusa build && node scripts/copy-admin-build.cjs`. Start: `npx medusa start`.

### 4. Docs
- **`MedusaJs-POC-backend/RENDER_DEPLOY.md`**  
  Contains Render settings (root dir, build command, start command, memory) and a short section on static files and committing `static/`.

---

## Backend (Render) – what to set

| Setting | Value |
|--------|--------|
| **Root Directory** | `MedusaJs-POC-backend` |
| **Build Command** | `NODE_OPTIONS=--max-old-space-size=1024 npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Env vars** | `DATABASE_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `STRIPE_API_KEY` (if using Stripe). Add your **Vercel frontend URL** to `STORE_CORS` (e.g. `https://your-app.vercel.app`). |
| **Static images** | Ensure `static/` is committed so product images are present on Render. |

---

## Frontend (Vercel) – what to set

| Variable | Value |
|----------|--------|
| **MEDUSA_BACKEND_URL** | `https://medusajs-poc.onrender.com` (your Render backend URL; no trailing slash needed) |
| **NEXT_PUBLIC_TELECOM_BACKEND_URL** | Same as above (for buy SIM, recharge, etc.) |
| **NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY** | Your publishable key from Medusa Admin |
| **NEXT_PUBLIC_BASE_URL** | `https://your-app.vercel.app` (your Vercel app URL) |
| **NEXT_PUBLIC_DEFAULT_REGION** | e.g. `in` or `us` |
| **NEXT_PUBLIC_STRIPE_KEY** | If using Stripe checkout |
| **REVALIDATE_SECRET** | Any secret string (for on-demand revalidation) |

---

## After deploy

1. **Backend:** Open `https://medusajs-poc.onrender.com` (or your URL). Health/admin should load; `/static/` should serve images if `static/` is in the repo.
2. **Frontend:** Set `MEDUSA_BACKEND_URL` (and `NEXT_PUBLIC_TELECOM_BACKEND_URL`) to the same backend URL, then deploy. Store and product images should work.
3. **CORS:** Backend `STORE_CORS` must include your Vercel URL (e.g. `https://your-app.vercel.app`). Restart backend after changing.

---

## Quick verification commands (optional)

- **Frontend:** `cd MedusaJs-POC-frontend && npx tsc --noEmit && npm run build`
- **Backend:** `cd MedusaJs-POC-backend && npx tsc --noEmit && npm run build`

Both should complete without errors. Frontend build may log `fetch failed` / `ECONNREFUSED` if the backend is not running during static generation; that is expected and does not fail the build.
