import type {
  GenerateItineraryResponse,
  MetaResponse,
  TripPreferences,
} from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string }
    return data.detail ?? res.statusText
  } catch {
    return res.statusText
  }
}

export async function fetchMeta(): Promise<MetaResponse> {
  const res = await fetch(`${API_BASE}/api/meta`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<MetaResponse>
}

export async function generateItinerary(
  prefs: TripPreferences,
): Promise<GenerateItineraryResponse> {
  const res = await fetch(`${API_BASE}/api/itinerary/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<GenerateItineraryResponse>
}

export async function saveTrip(
  prefs: TripPreferences,
  userId: string,
): Promise<{ trip_id: string }> {
  const res = await fetch(`${API_BASE}/api/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...prefs, user_id: userId }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<{ trip_id: string }>
}

export function exportItineraryMarkdown(
  plan: GenerateItineraryResponse,
): string {
  const lines = [
    `# ${plan.destination} — ${plan.days} days`,
    '',
    `Style: ${plan.style}`,
    `Budget: ~₹${plan.budget_per_person_per_day_inr.toLocaleString('en-IN')}/person/day`,
    '',
  ]
  for (const day of plan.itinerary) {
    lines.push(`## Day ${day.day} (${day.date})`)
    lines.push(`- **Morning:** ${day.morning}`)
    lines.push(`- **Afternoon:** ${day.afternoon}`)
    lines.push(`- **Evening:** ${day.evening}`)
    lines.push(`- _${day.tips}_`)
    lines.push('')
  }
  return lines.join('\n')
}
