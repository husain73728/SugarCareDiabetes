-- Supabase schema for SugarCareDiabetes
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    age integer,
    height_cm numeric,
    weight_kg numeric,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.predictions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    pregnancies integer,
    glucose numeric,
    blood_pressure numeric,
    skin_thickness numeric,
    insulin numeric,
    bmi numeric,
    diabetes_pedigree numeric,
    age integer,
    risk_score integer,
    risk_level text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_predictions_user_created_at
    on public.predictions(user_id, created_at desc);

alter table public.user_profiles enable row level security;
alter table public.predictions enable row level security;

drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
    on public.user_profiles
    for select
    using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.user_profiles;
create policy "profiles_insert_own"
    on public.user_profiles
    for insert
    with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own"
    on public.user_profiles
    for update
    using (auth.uid() = id);

drop policy if exists "predictions_select_own" on public.predictions;
create policy "predictions_select_own"
    on public.predictions
    for select
    using (auth.uid() = user_id);

drop policy if exists "predictions_insert_own" on public.predictions;
create policy "predictions_insert_own"
    on public.predictions
    for insert
    with check (auth.uid() = user_id);

drop policy if exists "predictions_delete_own" on public.predictions;
create policy "predictions_delete_own"
    on public.predictions
    for delete
    using (auth.uid() = user_id);

drop policy if exists "predictions_update_own" on public.predictions;
create policy "predictions_update_own"
    on public.predictions
    for update
    using (auth.uid() = user_id);
