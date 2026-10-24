# Deploy guide (Render + Vercel)

Deploy **backend first**, then **frontend** (frontend needs the API URL).

## 1. Render — FastAPI

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Connect GitHub repo: `rokar0028/travel-itinerary-planner`.
3. Render reads root `render.yaml` and creates `travel-itinerary-api`.
4. Set environment variables on the service:

| Key | Value |
|-----|--------|
| `SUPABASE_URL` | `https://ysvrbkesdwmkmuqlrthd.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon (legacy JWT) |
| `CORS_ORIGINS` | Your Vercel URL, e.g. `https://travel-itinerary-planner.vercel.app` (comma-separate preview URL if needed) |

5. After deploy, copy the service URL, e.g. `https://travel-itinerary-api.onrender.com`.
6. Test: `https://YOUR-API.onrender.com/health` → `{"status":"ok","supabase":true,...}`.

## 2. Vercel — React

1. [Vercel](https://vercel.com/new) → Import `rokar0028/travel-itinerary-planner`.
2. **Root Directory:** `frontend`
3. Framework: Vite (auto-detected). Build: `npm run build`, Output: `dist`.
4. Environment variables:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | Render URL from step 1 (no trailing slash) |
| `VITE_SUPABASE_URL` | `https://ysvrbkesdwmkmuqlrthd.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Same anon key as Render |

5. Deploy → copy production URL.

## 3. Wire CORS + Supabase auth

1. **Render:** update `CORS_ORIGINS` to include the exact Vercel production URL → redeploy if needed.
2. **Supabase → Authentication → URL configuration:**
   - Add Vercel URL to **Redirect URLs** (`https://your-app.vercel.app/**`).
   - Optional: set **Site URL** to Vercel URL for production.

## 4. Skill Wallet

- **GitHub:** https://github.com/rokar0028/travel-itinerary-planner  
- **Demo:** your Vercel URL  

## CLI (Windows PowerShell)

### One-time setup

1. **Render billing:** add a payment method at [Render Billing](https://dashboard.render.com/billing) (required even for free tier — blueprint validation error `need_payment_info` until this is done).
2. **CLI tools:**
   ```powershell
   cd travel-itinerary-planner
   .\scripts\setup-cli.ps1
   .\.tools\render-v2\render.exe login
   cd frontend
   npx vercel login
   ```
3. Ensure `backend/.env` and `frontend/.env.local` exist (see `.env.example`).

### Deploy

```powershell
# API only (creates service or triggers redeploy)
.\scripts\deploy-render.ps1

# Frontend (set VITE_API_URL to your Render URL)
$env:VITE_API_URL = "https://travel-itinerary-api.onrender.com"
.\scripts\deploy-vercel.ps1

# Or interactive full flow
.\scripts\deploy-all.ps1
```

**Non-interactive CI:** set `RENDER_API_KEY` and `VERCEL_TOKEN` env vars; Render CLI uses the API key automatically.

After Vercel is live:

```powershell
.\scripts\update-render-cors.ps1 -VercelUrl "https://your-app.vercel.app"
.\scripts\deploy-render.ps1
```

Add the Vercel URL to Supabase **Redirect URLs**.
