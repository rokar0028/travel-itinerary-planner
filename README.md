# Personalized Travel Itinerary Planner

Skill Wallet / SmartBridge capstone — **React + FastAPI + Supabase**.

**Docs:** [SUBMISSION_PLAN.md](./SUBMISSION_PLAN.md) · [SKILL_WALLET.md](./SKILL_WALLET.md) · [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) · [DEPLOY.md](./DEPLOY.md)

## Structure

```
frontend/          React (Vite + TypeScript) → Vercel
backend/           FastAPI → Render
supabase/          SQL migration + RLS
```

## Local development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — API defaults to `http://localhost:8000` (override with `VITE_API_URL`).

**Env files (never commit real keys):**

| File | Purpose |
|------|---------|
| `.env.example` | Template at repo root |
| `backend/.env` | `SUPABASE_*`, `CORS_ORIGINS`, optional `GROQ_API_KEY` / `OPENAI_API_KEY` |
| `frontend/.env.local` | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

Guests can generate and export trips without Supabase. Sign-in + save requires both frontend and backend Supabase vars.

## Supabase

**Project:** `travel-itinerary-planner` → `https://ysvrbkesdwmkmuqlrthd.supabase.co`  
Dashboard: https://supabase.com/dashboard/project/ysvrbkesdwmkmuqlrthd

1. Migration `001_initial` is applied (tables: `trips`, `trip_interests`, `itinerary_days`, `profiles`).
2. **Auth → URL configuration:** add `http://localhost:5173` to **Site URL** and **Redirect URLs** (add your Vercel URL when deployed).
3. **Authentication → Providers:** Email enabled (magic link).
4. Copy keys into `backend/.env` and `frontend/.env.local` (see `.env.example`). Backend uses **anon key + user JWT** for save/list (RLS-safe); service role is optional.

## Deploy

Step-by-step: **[DEPLOY.md](./DEPLOY.md)** (Render API first, then Vercel).

| Layer    | Host   | Notes                                      |
|----------|--------|--------------------------------------------|
| Backend  | Render | Root blueprint: `render.yaml` → `backend/` |
| Frontend | Vercel | Root Directory: `frontend`, `VITE_*` env   |

**Live (CLI deploy):**

| | URL |
|---|-----|
| Frontend | https://frontend-three-sage-86vb7v4ibz.vercel.app |
| API | https://travel-itinerary-api-vb27.onrender.com |

In [Render env](https://dashboard.render.com/web/srv-dbeispnb9u1s739sbhsg) set `CORS_ORIGINS` to your Vercel URL + `http://localhost:5173`, then redeploy. Add the Vercel URL to Supabase **Redirect URLs**.

## Features

- Preference form (destination, dates, budget, style, interests, group size)
- Day-by-day cards with **morning / afternoon / evening** slots
- **Goa & Jaipur** curated guides; other cities use a **smart template**
- Optional **Groq or OpenAI** on the API for non-curated cities (`GROQ_API_KEY` or `OPENAI_API_KEY` in `backend/.env`)
- Markdown export
- Optional Supabase magic-link auth + save/list trips (when configured)

## Production smoke test

```powershell
.\scripts\verify-production.ps1
```

## Wire production (Phase 2)

```powershell
# Optional: $env:RENDER_API_KEY, $env:SUPABASE_ACCESS_TOKEN for full automation
.\scripts\configure-phase2.ps1
```

## Backend tests

```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -q
```
