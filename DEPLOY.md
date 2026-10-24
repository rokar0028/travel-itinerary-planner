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

## CLI (optional)

```bash
# Frontend (from frontend/)
npx vercel --prod

# Backend: use Render dashboard or Blueprint (no CLI required)
```
