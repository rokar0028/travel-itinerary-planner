# Implementation Plan — Personalized Travel Itinerary Planner

Skill Wallet / SmartBridge capstone. Target stack: **React (Vercel)** · **FastAPI (Render)** · **Supabase** · **GitHub**.

## Progress summary

- [x] Monorepo layout (`frontend/`, `backend/`, `supabase/`)
- [x] Preference form + generate itinerary UI
- [x] FastAPI `meta` + `generate` endpoints
- [x] Goa/Jaipur curated day plans + template fallback (+ optional Groq/OpenAI)
- [x] Markdown export (UI)
- [x] Supabase migration SQL + save/list API (code)
- [x] Auth (magic link) + save trip button (UI; needs Supabase env)
- [x] Live Supabase project wired (env + migration applied locally)
- [x] My trips UI (list/open saved plans)
- [x] Production deploy (Vercel + Render) — CORS + Supabase redirect URLs configured
- [x] Final QA + Skill Wallet links — see **[SUBMISSION_PLAN.md](./SUBMISSION_PLAN.md)**

---

## Epic 1 — Vibe coding environment setup

**Goal:** Repeatable local dev and repo ready for submission links.

- [x] **1.1** Node 18+ and Python 3.10+ available on dev machine
- [x] **1.2a** Project scaffolding (React/Vite, FastAPI, folder structure)
- [x] **1.2b** `.gitignore` and `.env.example` in repo
- [x] **1.2c** Public GitHub repo: https://github.com/rokar0028/travel-itinerary-planner
- [x] **1.2d** GitHub URL added in Skill Wallet dashboard
- [x] **1.3** Local run documented; frontend production build passes (`npm run build`)

**Commands:**

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev
```

---

## Epic 2 — Supabase database setup

**Goal:** Persist trips per user with row-level security.

- [x] **2.1** Supabase project `travel-itinerary-planner` (ref `ysvrbkesdwmkmuqlrthd`)
- [x] **2.2a** Migration authored: `supabase/migrations/001_initial.sql`
- [x] **2.2b** Migration applied (`trips`, `trip_interests`, `itinerary_days`, `profiles`)
- [x] **2.3** Redirect URLs in dashboard: `http://localhost:5173` (+ Vercel when live)
- [x] **2.4** Backend `.env`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CORS_ORIGINS`
- [x] **2.5** Frontend `.env.local`: `VITE_SUPABASE_*`, `VITE_API_URL`
- [x] **2.6** Save trip verified end-to-end (sign in → generate → save)

**Tables:** `profiles`, `trips`, `trip_interests`, `itinerary_days` (RLS policies included in migration).

---

## Epic 3 — Preference collection & recommendation engine

**Goal:** Capture preferences and produce structured input for planning.

- [x] **3.1** Preference form (destination, dates, days, budget, style, interests, group size)
- [x] **3.2** Shared request shape: `GenerateItineraryRequest` + `TripPreferences`
- [x] **3.3** Rule-based engine v2 (curated Goa/Jaipur + interest template)
- [x] **3.4** *(Optional)* LLM for non-curated cities (`GROQ_API_KEY` / `OPENAI_API_KEY` → `llm_itinerary.py`)

**API (implemented):**

- [x] `GET /api/meta`
- [x] `POST /api/itinerary/generate`

---

## Epic 4 — Itinerary generation & personalization

**Goal:** Day-by-day plan tuned to style and interests.

- [x] **4.1** Daily builder (morning / afternoon / evening) + day cards in UI
- [ ] **4.2** *(Stretch)* Route/time ordering or Maps API
- [x] **4.3** Style + interest-aware copy (budget line, interest picks)
- [x] **4.4** Regenerate via **Generate itinerary** with same or updated preferences

**Logic:** `backend/app/services/itinerary.py` · optional LLM: `llm_itinerary.py`

---

## Epic 5 — Productization

**Goal:** Save, manage, and share trips.

- [x] **5.1a** `POST /api/trips` + **Save trip** in UI (after sign-in)
- [x] **5.1b** Verified row persisted in live Supabase
- [x] **5.2a** `GET /api/trips` backend endpoint
- [x] **5.2b** **My trips** UI (list + open saved itinerary)
- [x] **5.2c** `GET /api/trips/{trip_id}` for full itinerary load
- [x] **5.3a** Markdown export download implemented
- [ ] **5.3b** Export manually tested in browser
- [x] **5.4a** Errors + loading states (retry, invalid form hints, generate disabled)
- [ ] **5.4b** Full edge-case pass in production (API down, 401 on save without auth)

---

## Epic 6 — Deployment

**Goal:** Live demo URL + API for evaluators.

Per course pre-requisites: **frontend → Vercel**, **backend → Render**.

- [x] **6.0** Root `render.yaml` + `frontend/vercel.json` + [DEPLOY.md](./DEPLOY.md)
- [x] **6.1** Backend on Render — https://travel-itinerary-api-vb27.onrender.com/health
- [x] **6.2** Frontend on Vercel — https://frontend-three-sage-86vb7v4ibz.vercel.app
- [x] **6.3** `CORS_ORIGINS` on Render includes Vercel URL (set in dashboard → redeploy)
- [x] **6.4** Service role key only on backend; anon key on frontend (by design)
- [x] **6.5** Demo link + GitHub link on Skill Wallet dashboard

---

## Epic 7 — Final testing & documentation

**Goal:** Submission-ready quality.

- [x] **7.1** End-to-end: preferences → generate → export → save (with auth)
- [ ] **7.2** RLS verified (user A cannot read user B’s trips)
- [x] **7.3** `README.md` (structure, local run, deploy overview)
- [ ] **7.4** *(Optional)* Screen recording for submission

**Smoke checklist:**

- [x] Generate for Goa (curated copy in code; [ ] manual browser check)
- [x] Generate for Jaipur (curated copy in code; [ ] manual browser check)
- [x] Generate for a third city (template / LLM; [ ] manual browser check)
- [x] Invalid input blocked (empty destination / no interests) — UI `canGenerate`
- [x] Production build (`npm run build`)
- [ ] API `/health` reachable from deployed frontend URL

---

## Suggested order & effort

| Week | Focus |
|------|--------|
| 1 | Epic 2 (live Supabase) + Epic 5.2 (My trips UI) |
| 2 | Epic 6 deploy + Epic 7 testing |

Stretch: Epic 4.2 (maps/routing).

Rough effort: **~2–3 focused days** remaining (Supabase redirect + save E2E, CORS, Skill Wallet links, QA).

---

## Definition of done (capstone)

- [x] Public GitHub repository — https://github.com/rokar0028/travel-itinerary-planner
- [x] Live React app (Vercel) — see Epic 6.2
- [x] Live FastAPI (Render) — see Epic 6.1
- [x] Supabase schema applied + RLS; authenticated save verified in browser
- [x] Personalized multi-day itinerary from preferences
- [x] Export (Markdown); saved trips API + **My trips** UI
- [x] Links added in Skill Wallet

---

## File map (reference)

```
SUBMISSION_PLAN.md         ← submit checklist (phases 0–4)
IMPLEMENTATION_PLAN.md     ← this document
README.md                  ← run & deploy instructions
DEPLOY.md                  ← Render + Vercel steps
backend/app/main.py        ← API routes
backend/app/services/      ← itinerary, llm_itinerary, supabase_store
backend/tests/             ← pytest (itinerary smoke)
frontend/src/App.tsx       ← main UI
supabase/migrations/       ← database SQL
```
