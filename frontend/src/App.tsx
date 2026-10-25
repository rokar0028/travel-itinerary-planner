import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  exportItineraryMarkdown,
  fetchMeta,
  generateItinerary,
  getTrip,
  listTrips,
  saveTrip,
  tripDetailToPlan,
  tripDetailToPrefs,
} from './api'
import { supabase, supabaseConfigured } from './lib/supabase'
import type {
  GenerateItineraryResponse,
  TravelStyle,
  TripPreferences,
  TripSummary,
} from './types'
import './App.css'

function defaultStartDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

function formatDayDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function engineLabel(engine: NonNullable<GenerateItineraryResponse['engine']>): string {
  switch (engine) {
    case 'curated':
      return 'Curated city guide'
    case 'llm':
      return 'AI-generated plan'
    default:
      return 'Smart template'
  }
}

type TripListState = {
  token: string | null
  loading: boolean
  error: string | null
  trips: TripSummary[]
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
  const [authError, setAuthError] = useState<string | null>(null)
  const [magicEmail, setMagicEmail] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [savedLabel, setSavedLabel] = useState<string | null>(null)
  const [tripList, setTripList] = useState<TripListState>({
    token: null,
    loading: false,
    error: null,
    trips: [],
  })
  const [activeTripId, setActiveTripId] = useState<string | null>(null)
  const [resultsAnnounce, setResultsAnnounce] = useState('')
  const resultsRef = useRef<HTMLElement>(null)
  const scrollToResults = useRef(false)

  const savedTrips =
    accessToken && tripList.token === accessToken ? tripList.trips : []
  const tripsLoading =
    Boolean(accessToken) && (tripList.token !== accessToken || tripList.loading)
  const tripsError =
    accessToken && tripList.token === accessToken ? tripList.error : null
  const visibleTripId = accessToken ? activeTripId : null

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
    const applySession = (session: Session | null) => {
      setUserId(session?.user.id ?? null)
      setUserEmail(session?.user.email ?? null)
      setAccessToken(session?.access_token ?? null)
      if (session?.user.email) setMagicEmail(null)
      if (!session) setActiveTripId(null)
    }
    supabase.auth.getSession().then(({ data }) => applySession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      applySession(session)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false
    listTrips(accessToken)
      .then((trips) => {
        if (!cancelled) {
          setTripList({ token: accessToken, loading: false, error: null, trips })
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setTripList({
            token: accessToken,
            loading: false,
            error: e instanceof Error ? e.message : 'Could not load saved trips.',
            trips: [],
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [accessToken])

  async function refreshTrips(silent = false) {
    if (!accessToken) return
    if (!silent) {
      setTripList((current) => ({ ...current, loading: true, error: null }))
    }
    try {
      const trips = await listTrips(accessToken)
      setTripList({ token: accessToken, loading: false, error: null, trips })
    } catch (e) {
      setTripList((current) => ({
        token: accessToken,
        loading: false,
        error: e instanceof Error ? e.message : 'Could not load saved trips.',
        trips: current.token === accessToken ? current.trips : [],
      }))
    }
  }

  useEffect(() => {
    if (!scrollToResults.current || !plan) return
    scrollToResults.current = false
    const node = resultsRef.current
    if (!node) return
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    node.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    node.focus({ preventScroll: true })
  }, [plan, resultsAnnounce])

  const canGenerate = useMemo(
    () => prefs.destination.trim().length > 0 && prefs.interests.length > 0,
    [prefs],
  )

  async function onGenerate() {
    setError(null)
    setSaveState('idle')
    setSavedLabel(null)
    setLoading(true)
    try {
      const result = await generateItinerary(prefs)
      setPlan(result)
      setActiveTripId(null)
      scrollToResults.current = true
      setResultsAnnounce(
        `${result.destination}, ${result.days}-day itinerary ready.`,
      )
    } catch (e) {
      setPlan(null)
      setError(
        e instanceof Error
          ? e.message
          : 'Could not reach the API. Is the backend running?',
      )
    } finally {
      setLoading(false)
    }
  }

  async function onMagicLink(email: string) {
    if (!supabase) return
    setAuthBusy(true)
    setAuthError(null)
    setMagicEmail(null)
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      if (authError) throw authError
      setMagicEmail(email)
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Sign-in failed')
    } finally {
      setAuthBusy(false)
    }
  }

  function onSaveSignedOut() {
    document.getElementById('magic-link-email')?.focus()
  }

  async function onSaveTrip() {
    if (!userId || !accessToken || !plan) return
    setSaveState('saving')
    setSavedLabel(null)
    setError(null)
    try {
      const { trip_id } = await saveTrip(prefs, accessToken)
      setActiveTripId(trip_id)
      setSavedLabel(plan.destination)
      setSaveState('saved')
    } catch (e) {
      setSaveState('idle')
      setError(e instanceof Error ? e.message : 'Save failed')
      return
    }
    await refreshTrips(true)
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

  async function onOpenTrip(tripId: string) {
    if (!accessToken) return
    setError(null)
    setSaveState('idle')
    setSavedLabel(null)
    setLoading(true)
    try {
      const detail = await getTrip(tripId, accessToken)
      setPrefs(tripDetailToPrefs(detail))
      setPlan(tripDetailToPlan(detail))
      setActiveTripId(tripId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load trip')
    } finally {
      setLoading(false)
    }
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
      <div className="shell">
        <header className="header">
          <div>
            <div className="brand-row">
              <BrandMark />
              <div>
                <p className="eyebrow">Skill Wallet Capstone</p>
                <h1>Personalized Travel Itinerary Planner</h1>
              </div>
            </div>
            <p className="subtitle">
              Set a destination, budget, and interests. Get a day-by-day plan you can
              export or save.
            </p>
          </div>
          {supabaseConfigured && (
            <AuthPanel
              email={userEmail}
              busy={authBusy}
              error={authError}
              notice={userEmail ? null : magicEmail}
              onSignIn={onMagicLink}
              onDismissNotice={() => setMagicEmail(null)}
              onSignOut={() => supabase?.auth.signOut()}
            />
          )}
        </header>

        <main className="main">
          <section className="panel form-panel">
            <h2>Trip preferences</h2>
            <p className="panel-lead">
              A few details are enough. Change them and generate again anytime.
            </p>
            <div className="field-grid">
              <label className="field field-span">
                <span className="field-label">Destination</span>
                <input
                  value={prefs.destination}
                  onChange={(e) =>
                    setPrefs({ ...prefs, destination: e.target.value })
                  }
                />
              </label>
              <label className="field">
                <span className="field-label">Start date</span>
                <input
                  type="date"
                  value={prefs.start_date}
                  onChange={(e) =>
                    setPrefs({ ...prefs, start_date: e.target.value })
                  }
                />
              </label>
              <label className="field">
                <span className="field-label">
                  Days
                  <span className="field-value">{prefs.days}</span>
                </span>
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
              <label className="field">
                <span className="field-label">Total budget (INR)</span>
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
              <label className="field">
                <span className="field-label">Group size</span>
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
              <label className="field field-span">
                <span className="field-label">Travel style</span>
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
              <fieldset>
                <legend>Interests</legend>
                <div className="chips">
                  {interests.map((interest) => {
                    const selected = prefs.interests.includes(interest)
                    return (
                      <button
                        key={interest}
                        type="button"
                        className={selected ? 'chip active' : 'chip'}
                        aria-pressed={selected}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </div>
            <button
              type="button"
              className="primary generate"
              disabled={!canGenerate || loading}
              onClick={onGenerate}
            >
              {loading ? 'Generating…' : 'Generate itinerary'}
            </button>
            {!canGenerate && (
              <p className="hint form-hint">
                Add a destination and at least one interest to continue.
              </p>
            )}
            {error && (
              <div className="alert alert-error" role="alert">
                <strong>Something went wrong</strong>
                <p>{error}</p>
                <button type="button" className="link-btn" onClick={onGenerate}>
                  Try again
                </button>
              </div>
            )}

            {accessToken ? (
              <div className="my-trips" aria-live="polite">
                <h3>My trips</h3>
                {tripsLoading ? (
                  <div className="trip-skeletons" aria-busy="true">
                    <p className="sr-only">Loading saved trips</p>
                    <div className="skeleton" />
                    <div className="skeleton" />
                    <div className="skeleton short" />
                  </div>
                ) : tripsError ? (
                  <div className="empty-inline" role="alert">
                    <p className="empty-title">Couldn’t load your trips</p>
                    <p>{tripsError}</p>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => refreshTrips()}
                    >
                      Try again
                    </button>
                  </div>
                ) : savedTrips.length === 0 ? (
                  <div className="empty-inline">
                    <p className="empty-title">No saved trips yet</p>
                    <p>Generate an itinerary, then save it to keep it here.</p>
                  </div>
                ) : (
                  <ul className="trip-list">
                    {savedTrips.map((trip) => (
                      <li key={trip.id}>
                        <button
                          type="button"
                          className={
                            visibleTripId === trip.id
                              ? 'trip-item active'
                              : 'trip-item'
                          }
                          onClick={() => onOpenTrip(trip.id)}
                        >
                          <strong>{trip.destination}</strong>
                          <span>
                            {trip.days} days · {formatDayDate(trip.start_date)} ·{' '}
                            {trip.style}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              supabaseConfigured && (
                <div className="empty-inline guest-note">
                  <p className="empty-title">Save trips across visits</p>
                  <p>
                    Sign in with the email link above. You can still generate and
                    export without an account.
                  </p>
                </div>
              )
            )}
          </section>

          <section
            ref={resultsRef}
            id="itinerary-results"
            className="panel results-panel"
            tabIndex={-1}
            aria-busy={loading}
          >
            <p className="sr-only" role="status" aria-live="polite">
              {resultsAnnounce}
            </p>
            {loading && !plan ? (
              <div className="loading-state">
                <div className="spinner" aria-hidden="true" />
                <h2>Building your itinerary…</h2>
                <p className="hint">
                  Morning, afternoon, and evening for each day.
                </p>
              </div>
            ) : !plan ? (
              <div className="empty">
                <div className="empty-mark" aria-hidden="true">
                  01
                </div>
                <h2>Your plan appears here</h2>
                <p>
                  Fill in preferences and generate a day-by-day itinerary you can
                  scan, export, or save.
                </p>
                <ul className="empty-points">
                  <li>Curated guides for Goa and Jaipur</li>
                  <li>A smart template for other cities, or AI when the API has it</li>
                  <li>Export as Markdown, or sign in to keep the trip</li>
                </ul>
              </div>
            ) : (
              <>
                {loading && (
                  <div className="loading-overlay">
                    <div className="spinner" aria-hidden="true" />
                    <span>Updating…</span>
                  </div>
                )}
                <div className="results-head">
                  <div>
                    <p className="eyebrow results-kicker">Itinerary</p>
                    <h2>{plan.destination}</h2>
                    <ul className="meta-row">
                      <li>{plan.days} days</li>
                      <li>{plan.style}</li>
                      <li>
                        ~₹
                        {plan.budget_per_person_per_day_inr.toLocaleString('en-IN')}
                        /person/day
                      </li>
                    </ul>
                    {plan.engine && (
                      <p className="engine-badge" data-engine={plan.engine}>
                        {engineLabel(plan.engine)}
                      </p>
                    )}
                  </div>
                  <div className="results-tools">
                    <div className="actions">
                      <button
                        type="button"
                        className="btn-export"
                        onClick={onExport}
                        disabled={loading}
                      >
                        <DownloadIcon />
                        Export Markdown
                      </button>
                      {(userId || supabaseConfigured) && (
                        <button
                          type="button"
                          className="primary compact"
                          onClick={userId ? onSaveTrip : onSaveSignedOut}
                          disabled={loading || saveState === 'saving'}
                          aria-describedby={
                            userId ? undefined : 'save-sign-in-prompt'
                          }
                        >
                          {saveState === 'saving' ? (
                            <>
                              <span className="btn-spinner" aria-hidden="true" />
                              Saving…
                            </>
                          ) : (
                            'Save trip'
                          )}
                        </button>
                      )}
                    </div>
                    {!userId && supabaseConfigured && (
                      <p className="save-prompt" id="save-sign-in-prompt">
                        <strong>Sign in to save</strong>
                        Use the email link above. You can still export this plan.
                      </p>
                    )}
                  </div>
                </div>
                {saveState === 'saved' && savedLabel && (
                  <div className="toast" role="status">
                    <span className="success-mark" aria-hidden="true">
                      ✓
                    </span>
                    <div>
                      <strong>Saved!</strong>
                      <p>{savedLabel} is in My trips.</p>
                    </div>
                  </div>
                )}
                <div className="days">
                  {plan.itinerary.map((day) => (
                    <article key={day.day} className="day-card">
                      <header className="day-card-head">
                        <span className="day-index">
                          {String(day.day).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="day-title">Day {day.day}</h3>
                          <time dateTime={day.date}>{formatDayDate(day.date)}</time>
                        </div>
                      </header>
                      <div className="slots">
                        <div className="slot slot-morning">
                          <span className="slot-label">Morning</span>
                          <p>{day.morning}</p>
                        </div>
                        <div className="slot slot-afternoon">
                          <span className="slot-label">Afternoon</span>
                          <p>{day.afternoon}</p>
                        </div>
                        <div className="slot slot-evening">
                          <span className="slot-label">Evening</span>
                          <p>{day.evening}</p>
                        </div>
                      </div>
                      <p className="tips">
                        <span className="tips-label">Tip</span>
                        <span>{day.tips}</span>
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

function BrandMark() {
  return (
    <svg
      className="brand-mark"
      width="36"
      height="36"
      viewBox="0 0 36 36"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="12" fill="#115e59" />
      <path
        d="M18 8.5l2.1 6.4L26.5 18l-6.4 2.1L18 26.5l-2.1-6.4L9.5 18l6.4-2.1L18 8.5z"
        fill="#f4efe6"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M8 2.25v7.5M5.25 7.25 8 10.25l2.75-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.25 13.25h9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function AuthPanel({
  email,
  busy,
  error,
  notice,
  onSignIn,
  onDismissNotice,
  onSignOut,
}: {
  email: string | null
  busy: boolean
  error: string | null
  notice: string | null
  onSignIn: (email: string) => void
  onDismissNotice: () => void
  onSignOut: () => void
}) {
  const [input, setInput] = useState('')
  if (email) {
    return (
      <div className="auth auth-signed-in">
        <div>
          <span className="auth-kicker">Signed in</span>
          <span className="auth-email">{email}</span>
        </div>
        <button type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    )
  }
  if (notice) {
    return (
      <div className="auth auth-confirm" role="status">
        <p className="auth-confirm-title">Check your email</p>
        <p>
          We sent a sign-in link to <strong>{notice}</strong>. Open it in this
          browser to finish signing in.
        </p>
        <button type="button" className="link-btn" onClick={onDismissNotice}>
          Use a different email
        </button>
      </div>
    )
  }
  return (
    <form
      className="auth"
      onSubmit={(event) => {
        event.preventDefault()
        const next = input.trim()
        if (next.includes('@')) onSignIn(next)
      }}
    >
      <label className="auth-field">
        <span className="sr-only">Email for magic link</span>
        <input
          id="magic-link-email"
          type="email"
          required
          placeholder="Email for magic link"
          value={input}
          autoComplete="email"
          onChange={(e) => setInput(e.target.value)}
        />
      </label>
      <button type="submit" disabled={busy || !input.includes('@')}>
        {busy ? 'Sending…' : 'Email me a link'}
      </button>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default App
