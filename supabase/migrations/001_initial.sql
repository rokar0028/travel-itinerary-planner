-- Run in Supabase SQL Editor or via CLI

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination text not null,
  start_date date not null,
  days int not null check (days between 1 and 14),
  budget_inr int not null check (budget_inr >= 1000),
  style text not null,
  group_size int not null check (group_size between 1 and 12),
  created_at timestamptz not null default now()
);

create table if not exists public.trip_interests (
  id bigint generated always as identity primary key,
  trip_id uuid not null references public.trips (id) on delete cascade,
  interest text not null
);

create table if not exists public.itinerary_days (
  id bigint generated always as identity primary key,
  trip_id uuid not null references public.trips (id) on delete cascade,
  day_number int not null,
  plan_date date not null,
  morning text not null,
  afternoon text not null,
  evening text not null,
  tips text not null
);

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_interests enable row level security;
alter table public.itinerary_days enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "trips_all_own" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "trip_interests_via_trip" on public.trip_interests
  for all using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );

create policy "itinerary_days_via_trip" on public.itinerary_days
  for all using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );
