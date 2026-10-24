# Implementation Plan — Personalized Travel Itinerary Planner

Skill Wallet / SmartBridge capstone. Target stack: **React (Vercel)** · **FastAPI (Render)** · **Supabase** · **GitHub**.

## Progress summary

- [x] Monorepo layout (`frontend/`, `backend/`, `supabase/`)
- [x] Preference form + generate itinerary UI
- [x] FastAPI `meta` + `generate` endpoints
- [x] Goa/Jaipur sample engine + template fallback
- [x] Markdown export (UI)
- [x] Supabase migration SQL + save/list API (code)
- [x] Auth (magic link) + save trip button (UI; needs Supabase env)
- [x] Live Supabase project wired (env + migration applied locally)
- [ ] My trips UI (list/open saved plans)
- [ ] Production deploy (Vercel + Render)
- [ ] Final QA + Skill Wallet links

---

## Epic 1 — Vibe coding environment setup

**Goal:** Repeatable local dev and repo ready for submission links.

- [x] **1.1** Node 18+ and Python 3.10+ available on dev machine
- [x] **1.2a** Project scaffolding (React/Vite, FastAPI, folder structure)
- [x] **1.2b** `.gitignore` and `.env.example` in repo
- [x] **1.2c** Public GitHub repo: https://github.com/rokar0028/travel-itinerary-planner
- [ ] **1.2d** GitHub URL added in Skill Wallet dashboard
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
- [ ] **2.3** Redirect URLs in dashboard: `http://localhost:5173` (+ Vercel when live)
- [x] **2.4** Backend `.env`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CORS_ORIGINS`
- [x] **2.5** Frontend `.env.local`: `VITE_SUPABASE_*`, `VITE_API_URL`
- [ ] **2.6** Save trip verified end-to-end (sign in → generate → save)

**Tables:** `profiles`, `trips`, `trip_interests`, `itinerary_days` (RLS policies included in migration).

---

## Epic 3 — Preference collection & recommendation engine

**Goal:** Capture preferences and produce structured input for planning.

- [x] **3.1** Preference form (destination, dates, days, budget, style, interests, group size)
- [x] **3.2** Shared request shape: `GenerateItineraryRequest` + `TripPreferences`
- [x] **3.3** Rule-based engine v1 (`SAMPLE` + template fallback)
- [ ] **3.4** *(Optional)* LLM engine for unknown cities (Gemini/OpenAI/Groq)

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

**Logic:** `backend/app/services/itinerary.py`

---

## Epic 5 — Productization

**Goal:** Save, manage, and share trips.

- [x] **5.1a** `POST /api/trips` + **Save trip** in UI (after sign-in)
- [ ] **5.1b** Verified row persisted in live Supabase
- [x] **5.2a** `GET /api/trips?user_id=` backend endpoint
- [ ] **5.2b** **My trips** UI (list + open saved itinerary)
- [x] **5.3a** Markdown export download implemented
- [ ] **5.3b** Export manually tested in browser
- [x] **5.4a** Basic errors (API failures, disabled generate when invalid)
- [ ] **5.4b** Full edge-case pass (API down, auth required messaging)

---

## Epic 6 — Deployment

**Goal:** Live demo URL + API for evaluators.

Per course pre-requisites: **frontend → Vercel**, **backend → Render**.

- [x] **6.0** `backend/render.yaml` deploy template
- [ ] **6.1** Backend on Render; public `/health`
- [ ] **6.2** Frontend on Vercel; app loads from production URL
- [ ] **6.3** `CORS_ORIGINS` includes Vercel URL; generate works in prod
- [x] **6.4** Service role key only on backend; anon key on frontend (by design)
- [ ] **6.5** Demo link + GitHub link on Skill Wallet dashboard (GitHub ready to paste)

---

## Epic 7 — Final testing & documentation

**Goal:** Submission-ready quality.

- [ ] **7.1** End-to-end: preferences → generate → export → save (with auth)
- [ ] **7.2** RLS verified (user A cannot read user B’s trips)
- [x] **7.3** `README.md` (structure, local run, deploy overview)
- [ ] **7.4** *(Optional)* Screen recording for submission

**Smoke checklist:**

- [ ] Generate for Goa (rich sample content)
- [ ] Generate for Jaipur (rich sample content)
- [ ] Generate for a third city (template fallback)
- [ ] Invalid input blocked (empty destination / no interests)
- [x] Production build (`npm run build`)
- [ ] API `/health` reachable from deployed frontend URL

---

## Suggested order & effort

| Week | Focus |
|------|--------|
| 1 | Epic 2 (live Supabase) + Epic 5.2 (My trips UI) |
| 2 | Epic 6 deploy + Epic 7 testing |

Stretch: Epic 3.4 (LLM), Epic 4.2 (maps/routing).

Rough effort: **~8–10 focused days** remaining (mostly Supabase wiring, My trips, deploy, QA).

---

## Definition of done (capstone)

- [x] Public GitHub repository — https://github.com/rokar0028/travel-itinerary-planner
- [ ] Live React app (Vercel)
- [ ] Live FastAPI (Render)
- [x] Supabase schema applied + RLS; [ ] authenticated save verified in browser
- [x] Personalized multi-day itinerary from preferences
- [x] Export (Markdown); saved trips API/UI partial (save yes, list UI no)
- [ ] Links added in Skill Wallet

---

## File map (reference)

```
IMPLEMENTATION_PLAN.md     ← this document
README.md                  ← run & deploy instructions
backend/app/main.py        ← API routes
backend/app/services/      ← itinerary + Supabase store
frontend/src/App.tsx       ← main UI
supabase/migrations/       ← database SQL
```
