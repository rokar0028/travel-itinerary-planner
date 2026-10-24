# Submission plan — Skill Wallet capstone

**Goal:** Grader opens live demo → generates itinerary → (optional) saves trip. No new features until this passes.

**Target stack:** [Vercel frontend](https://frontend-three-sage-86vb7v4ibz.vercel.app) · [Render API](https://travel-itinerary-api-vb27.onrender.com/health) · [Supabase](https://supabase.com/dashboard/project/ysvrbkesdwmkmuqlrthd) · [GitHub](https://github.com/rokar0028/travel-itinerary-planner)

**Estimated time:** ~1–2 hours if env is mostly correct; ~half day if debugging CORS/auth.

### You are here (next actions)

1. **[2C]** Set Supabase redirect URLs → [scripts/supabase-auth-urls.md](./scripts/supabase-auth-urls.md) (required for magic link).
2. **[3.2]** Incognito on Vercel: sign in → Save trip → My trips.
3. **[4]** Paste links from [SKILL_WALLET.md](./SKILL_WALLET.md) into Skill Wallet.

---

## Phase 0 — Baseline (5 min)

Run: `.\scripts\verify-production.ps1` (health, CORS, API version sniff).

- [x] **0.1** Confirm local `main` is pushed to GitHub (`git status` clean, `git push`).
- [x] **0.2** Wait for Render + Vercel deploys to finish after push.
- [x] **0.3** API health: open Render `/health` → `status: ok`.
- [x] **0.4** Note your **exact** Vercel production URL (copy from Vercel dashboard).

**Done when:** GitHub has latest commits; health URL responds.

---

## Phase 1 — Ship latest code (15 min)

- [x] **1.1** Commit any pending docs (`IMPLEMENTATION_PLAN.md`, this file) if desired.
- [x] **1.2** `git push origin main`
- [x] **1.3** Vercel: confirm deployment succeeded (commit matches GitHub).
- [x] **1.4** Render: confirm deployment succeeded.
- [x] **1.5** On Vercel site: generate **Goa** → see **Curated city guide** + full morning/afternoon/evening cards (not old short placeholders).

**Done when:** Live app matches your local improvements.

**CLI option (Windows):** see [DEPLOY.md](./DEPLOY.md) — `.\scripts\deploy-all.ps1` if auto-deploy is off.

**Phase 2 one-shot:** `.\scripts\configure-phase2.ps1` (Vercel env, Render CORS, optional Supabase auth via `SUPABASE_ACCESS_TOKEN`).

---

## Phase 2 — Production triangle (30 min)

Wire frontend → API → Supabase so generate and save work on the **deployed** URL.

### 2A — Vercel environment (redeploy after changes)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://travel-itinerary-api-vb27.onrender.com` (no trailing slash) |
| `VITE_SUPABASE_URL` | `https://ysvrbkesdwmkmuqlrthd.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon (public) |

- [x] **2A.1** All three set for **Production**
- [x] **2A.2** Redeploy frontend

**Verify:** Browser DevTools → Network → generate request host is `onrender.com`, not `localhost`.

### 2B — Render environment (redeploy after changes)

| Variable | Value |
|----------|--------|
| `SUPABASE_URL` | Same as above |
| `SUPABASE_ANON_KEY` | Same anon key |
| `CORS_ORIGINS` | `{VERCEL_URL},http://localhost:5173` (comma-separated, exact origins) |

- [x] **2B.1** `CORS_ORIGINS` includes **exact** Vercel production URL
- [x] **2B.2** Redeploy API

**Verify:** Generate from Vercel with no CORS errors in console.

### 2C — Supabase Auth URLs

Dashboard → **Authentication** → **URL configuration**

- [ ] **2C.1** **Redirect URLs:** `https://{VERCEL_HOST}/**` and `http://localhost:5173/**`
- [ ] **2C.2** **Site URL:** Vercel production URL (for production testing)

**Verify:** Magic link in email lands on your Vercel app and shows signed-in state.

**Done when:** Phase C demo steps 1–6 below pass (or 1–3 if skipping auth).

---

## Phase 3 — Live demo script (15 min)

Run in **incognito** on the **Vercel** URL. Record pass/fail.

| Step | Action | Pass criteria |
|------|--------|----------------|
| 1 | Load app | UI loads, no blank screen |
| 2 | Goa, 3 days, ≥1 interest → **Generate itinerary** | 3 day cards; engine badge **Curated city guide** |
| 3 | **Export Markdown** | `.md` file downloads |
| 4 | Sign in (magic link) | “Signed in as …” after clicking email link |
| 5 | Generate → **Save trip** | Success message (no 401/503) |
| 6 | Refresh → **My trips** | Trip listed; open → same itinerary |

- [x] **3.1** Steps 1–3 (guest path) — **required for minimum submit**
- [ ] **3.2** Steps 4–6 (auth + save) — **required for full capstone story**
- [x] **3.3** Optional: **Jaipur** + one other city — run `.\scripts\phase3-smoke.ps1` (API); confirm in UI if desired

**If save fails:** note status code and message → see [Troubleshooting](#troubleshooting) below.

**Done when:** Minimum = 3.1; ideal = 3.1 + 3.2.

---

## Phase 4 — Skill Wallet & repo (10 min)

Copy from **[SKILL_WALLET.md](./SKILL_WALLET.md)**.

- [ ] **4.1** Skill Wallet: paste **GitHub** repo URL
- [ ] **4.2** Skill Wallet: paste **Vercel demo** URL (from Phase 0.4)
- [ ] **4.3** README / IMPLEMENTATION_PLAN: mark **2.6**, **6.3**, **7.1** done if Phase 3 passed
- [ ] **4.4** Push doc updates to GitHub

**Done when:** Dashboard links work in a fresh browser.

---

## Phase 5 — Post-submit (optional, same week)

- [ ] **5.1** RLS: second account cannot open first user’s trip (Epic 7.2)
- [ ] **5.2** Render: optional `GROQ_API_KEY` for non-Goa/Jaipur AI plans
- [ ] **5.3** Screen recording for portfolio (Epic 7.4)

---

## Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| CORS error on generate | Render `CORS_ORIGINS` — exact Vercel URL, redeploy API |
| API calls go to `localhost` | Vercel `VITE_API_URL` missing/wrong → redeploy frontend |
| Magic link opens wrong site / error | Supabase Redirect URLs + Site URL |
| Save **401** | Sign in again; check `Authorization` on `/api/trips` |
| Save **503** | Render missing `SUPABASE_URL` / `SUPABASE_ANON_KEY` |
| Render slow / timeout | Free tier cold start — retry after ~30s |
| Auth UI missing | Frontend missing `VITE_SUPABASE_*` — guests can still generate |

---

## Definition of “submitted”

| Level | Criteria |
|-------|----------|
| **Minimum** | GitHub public + live Vercel + generate Goa/Jaipur + export |
| **Recommended** | Above + magic link + save + My trips on production |
| **Strong** | Above + RLS spot-check + IMPLEMENTATION_PLAN checkboxes updated |

---

## Quick command reference

```powershell
# Repo root
git status
git push origin main

# Local smoke (optional)
cd backend; uvicorn app.main:app --reload --port 8000
cd frontend; npm run dev
cd backend; python -m pytest tests/ -q
```

See also: [README.md](./README.md) · [DEPLOY.md](./DEPLOY.md) · [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
