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

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_initial.sql` in the SQL editor.
3. Enable Email auth (magic link) if you want save/sign-in.
4. Set env vars (see `.env.example`).

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
