# Personalized Travel Itinerary Planner

Skill Wallet / SmartBridge capstone — **React + FastAPI + Supabase**.

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

Open http://localhost:5173 — API defaults to `http://localhost:8000`.

Optional: copy `.env.example` → `frontend/.env.local` and `backend/.env` when Supabase is ready.

## Supabase

**Project:** `travel-itinerary-planner` → `https://ysvrbkesdwmkmuqlrthd.supabase.co`  
Dashboard: https://supabase.com/dashboard/project/ysvrbkesdwmkmuqlrthd

1. Migration `001_initial` is applied (tables: `trips`, `trip_interests`, `itinerary_days`, `profiles`).
2. **Auth → URL configuration:** add `http://localhost:5173` to **Site URL** and **Redirect URLs** (add your Vercel URL when deployed).
3. **Authentication → Providers:** Email enabled (magic link).
4. Copy keys into `backend/.env` and `frontend/.env.local` (see `.env.example`). Backend uses **anon key + user JWT** for save/list (RLS-safe); service role is optional.

## Deploy

| Layer    | Host   | Notes                                      |
|----------|--------|--------------------------------------------|
| Frontend | Vercel | Root: `frontend`, set `VITE_*` env vars    |
| Backend  | Render | Use `backend/render.yaml` or manual web svc |

Set `CORS_ORIGINS` on the API to your Vercel URL.

## Features

- Preference form (destination, dates, budget, style, interests, group size)
- Day-by-day itinerary generation (Goa/Jaipur samples + template fallback)
- Markdown export
- Optional Supabase auth + trip save (when configured)
