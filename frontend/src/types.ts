export type TravelStyle =
  | 'Budget backpacker'
  | 'Balanced'
  | 'Comfort / mid-range'
  | 'Luxury'

export interface TripPreferences {
  destination: string
  start_date: string
  days: number
  budget_inr: number
  style: TravelStyle
  interests: string[]
  group_size: number
}

export interface DayPlan {
  day: number
  date: string
  morning: string
  afternoon: string
  evening: string
  tips: string
}

export interface GenerateItineraryResponse {
  destination: string
  days: number
  style: string
  budget_per_person_per_day_inr: number
  itinerary: DayPlan[]
}

export interface TripSummary {
  id: string
  destination: string
  start_date: string
  days: number
  budget_inr: number
  style: TravelStyle
  group_size: number
  created_at?: string | null
}

export interface TripDetail extends TripSummary {
  interests: string[]
  itinerary: DayPlan[]
  budget_per_person_per_day_inr: number
}

export interface MetaResponse {
  interests: string[]
  styles: string[]
}
