import { useEffect, useMemo, useState } from 'react'
import {
  exportItineraryMarkdown,
  fetchMeta,
  generateItinerary,
  saveTrip,
} from './api'
import { supabase, supabaseConfigured } from './lib/supabase'
import type { GenerateItineraryResponse, TravelStyle, TripPreferences } from './types'
import './App.css'

function defaultStartDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

function App() {
  const [interests, setInterests] = useState<string[]>([])
  const [styles, setStyles] = useState<string[]>([])
  const [prefs, setPrefs] = useState<TripPreferences>({
    destination: 'Goa',
    start_date: defaultStartDate(),
    days: 3,
    budget_inr: 15000,
    style: 'Balanced',
    interests: ['Food & street eats', 'History & culture'],
    group_size: 2,
  })
  const [plan, setPlan] = useState<GenerateItineraryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchMeta()
      .then((m) => {
        setInterests(m.interests)
        setStyles(m.styles)
      })
      .catch(() => {
        setInterests([
          'Food & street eats',
          'History & culture',
          'Nature & outdoors',
          'Shopping',
          'Nightlife',
          'Art & museums',
          'Adventure sports',
          'Relaxation / beaches',
        ])
        setStyles([
          'Budget backpacker',
          'Balanced',
          'Comfort / mid-range',
          'Luxury',
        ])
      })
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null)
      setUserEmail(data.session?.user.email ?? null)
      setAccessToken(data.session?.access_token ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null)
      setUserEmail(session?.user.email ?? null)
      setAccessToken(session?.access_token ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const canGenerate = useMemo(
    () => prefs.destination.trim().length > 0 && prefs.interests.length > 0,
    [prefs],
  )

  async function onGenerate() {
    setError(null)
    setSaveMsg(null)
    setLoading(true)
    try {
      const result = await generateItinerary(prefs)
      setPlan(result)
    } catch (e) {
      setPlan(null)
      setError(e instanceof Error ? e.message : 'Failed to generate')
    } finally {
      setLoading(false)
    }
  }

  async function onMagicLink(email: string) {
    if (!supabase) return
    setAuthBusy(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      if (authError) throw authError
      setSaveMsg('Check your email for the sign-in link.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
    } finally {
      setAuthBusy(false)
    }
  }

  async function onSaveTrip() {
    if (!userId || !accessToken || !plan) return
    setSaveMsg(null)
    setError(null)
    try {
      const { trip_id } = await saveTrip(prefs, accessToken)
      setSaveMsg(`Trip saved (${trip_id.slice(0, 8)}…).`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  function onExport() {
    if (!plan) return
    const md = exportItineraryMarkdown(plan)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${plan.destination.replace(/\s+/g, '-').toLowerCase()}-itinerary.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function toggleInterest(interest: string) {
    setPrefs((p) => {
      const has = p.interests.includes(interest)
      return {
        ...p,
        interests: has
          ? p.interests.filter((i) => i !== interest)
          : [...p.interests, interest],
      }
    })
  }

  return (
    <div className="layout">
      <header className="header">
        <div>
          <p className="eyebrow">Skill Wallet Capstone</p>
          <h1>Personalized Travel Itinerary Planner</h1>
          <p className="subtitle">
            React · FastAPI · Supabase — preferences in, day-by-day plan out.
          </p>
        </div>
        {supabaseConfigured && (
          <AuthPanel
            email={userEmail}
            busy={authBusy}
            onSignIn={onMagicLink}
            onSignOut={() => supabase?.auth.signOut()}
          />
        )}
      </header>

      <main className="main">
        <section className="panel form-panel">
          <h2>Trip preferences</h2>
          <label>
            Destination
            <input
              value={prefs.destination}
              onChange={(e) =>
                setPrefs({ ...prefs, destination: e.target.value })
              }
            />
          </label>
          <label>
            Start date
            <input
              type="date"
              value={prefs.start_date}
              onChange={(e) =>
                setPrefs({ ...prefs, start_date: e.target.value })
              }
            />
          </label>
          <label>
            Days ({prefs.days})
            <input
              type="range"
              min={1}
              max={10}
              value={prefs.days}
              onChange={(e) =>
                setPrefs({ ...prefs, days: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Total budget (INR)
            <input
              type="number"
              min={1000}
              step={500}
              value={prefs.budget_inr}
              onChange={(e) =>
                setPrefs({ ...prefs, budget_inr: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Travel style
            <select
              value={prefs.style}
              onChange={(e) =>
                setPrefs({ ...prefs, style: e.target.value as TravelStyle })
              }
            >
              {styles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Group size
            <input
              type="number"
              min={1}
              max={12}
              value={prefs.group_size}
              onChange={(e) =>
                setPrefs({ ...prefs, group_size: Number(e.target.value) })
              }
            />
          </label>
          <fieldset>
            <legend>Interests</legend>
            <div className="chips">
              {interests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={
                    prefs.interests.includes(interest) ? 'chip active' : 'chip'
                  }
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            className="primary"
            disabled={!canGenerate || loading}
            onClick={onGenerate}
          >
            {loading ? 'Generating…' : 'Generate itinerary'}
          </button>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel results-panel">
          {!plan ? (
            <div className="empty">
              <h2>Your plan appears here</h2>
              <p>Fill preferences and generate a personalized day-by-day itinerary.</p>
              <p className="hint">
                Rich samples for Goa & Jaipur; other cities use a smart template.
              </p>
            </div>
          ) : (
            <>
              <div className="results-head">
                <div>
                  <h2>
                    {plan.destination} · {plan.days} days
                  </h2>
                  <p>
                    {plan.style} · ~₹
                    {plan.budget_per_person_per_day_inr.toLocaleString('en-IN')}
                    /person/day
                  </p>
                </div>
                <div className="actions">
                  <button type="button" onClick={onExport}>
                    Export Markdown
                  </button>
                  {userId && (
                    <button type="button" className="primary" onClick={onSaveTrip}>
                      Save trip
                    </button>
                  )}
                </div>
              </div>
              {saveMsg && <p className="success">{saveMsg}</p>}
              <div className="days">
                {plan.itinerary.map((day) => (
                  <article key={day.day} className="day-card">
                    <h3>
                      Day {day.day} — {day.date}
                    </h3>
                    <div className="slots">
                      <div>
                        <strong>Morning</strong>
                        <p>{day.morning}</p>
                      </div>
                      <div>
                        <strong>Afternoon</strong>
                        <p>{day.afternoon}</p>
                      </div>
                      <div>
                        <strong>Evening</strong>
                        <p>{day.evening}</p>
                      </div>
                    </div>
                    <p className="tips">{day.tips}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

function AuthPanel({
  email,
  busy,
  onSignIn,
  onSignOut,
}: {
  email: string | null
  busy: boolean
  onSignIn: (email: string) => void
  onSignOut: () => void
}) {
  const [input, setInput] = useState('')
  if (email) {
    return (
      <div className="auth">
        <span>Signed in as {email}</span>
        <button type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    )
  }
  return (
    <div className="auth">
      <input
        type="email"
        placeholder="Email for magic link"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="button"
        disabled={busy || !input.includes('@')}
        onClick={() => onSignIn(input.trim())}
      >
        Sign in
      </button>
    </div>
  )
}

export default App
