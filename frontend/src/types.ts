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

export interface MetaResponse {
  interests: string[]
  styles: string[]
}
