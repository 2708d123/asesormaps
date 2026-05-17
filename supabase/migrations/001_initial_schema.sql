create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'buyer' check (role in ('buyer','advisor','agency','admin')),
  full_name text,
  email text,
  phone text,
  avatar_url text,
  city text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.advisor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  slug text unique,
  display_name text,
  bio text,
  whatsapp text,
  email_public text,
  city text,
  zone_specialty text,
  years_experience int,
  profile_photo_url text,
  facebook_url text,
  instagram_url text,
  website_url text,
  verification_status text default 'not_started' check (verification_status in ('not_started','pending','approved','rejected')),
  verified boolean default false,
  status text default 'pending' check (status in ('pending','active','rejected','suspended')),
  rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid references public.advisor_profiles(id) on delete cascade,
  title text not null,
  slug text unique,
  description text,
  operation_type text check (operation_type in ('venta','renta')),
  property_type text,
  price numeric,
  currency text default 'MXN',
  price_mxn numeric,
  price_usd numeric,
  city text,
  neighborhood text,
  zone text,
  address_approx text,
  lat double precision,
  lng double precision,
  bedrooms int,
  bathrooms numeric,
  half_bathrooms int,
  parking_spaces int,
  land_m2 numeric,
  construction_m2 numeric,
  floors int,
  age_years int,
  furnished boolean default false,
  pets_allowed boolean default false,
  maintenance_fee numeric,
  amenities text[],
  exclusive boolean default false,
  commission_shared boolean default false,
  video_url text,
  virtual_tour_url text,
  status text default 'pending' check (status in ('draft','pending','active','paused','rejected','deleted')),
  rejection_reason text,
  views_count int default 0,
  leads_count int default 0,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  is_cover boolean default false,
  created_at timestamptz default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  advisor_id uuid references public.advisor_profiles(id) on delete set null,
  buyer_user_id uuid references public.profiles(id) on delete set null,
  name text,
  phone text,
  email text,
  message text,
  source text,
  created_at timestamptz default now()
);

create table public.property_reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  reason text,
  details text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text,
  price_mxn numeric,
  max_active_properties int,
  features text[],
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid references public.advisor_profiles(id) on delete cascade,
  plan_id uuid references public.plans(id),
  status text,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table public.property_views (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  viewer_user_id uuid references public.profiles(id) on delete set null,
  ip_hash text,
  user_agent text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.advisor_profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.favorites enable row level security;
alter table public.leads enable row level security;
alter table public.property_reports enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.property_views enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "public active advisors" on public.advisor_profiles for select using (status = 'active' or user_id = auth.uid() or public.is_admin());
create policy "advisor own insert" on public.advisor_profiles for insert with check (user_id = auth.uid());
create policy "advisor own update" on public.advisor_profiles for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "public active properties" on public.properties for select using (status = 'active' or public.is_admin() or exists (select 1 from public.advisor_profiles a where a.id = advisor_id and a.user_id = auth.uid()));
create policy "advisor create own properties" on public.properties for insert with check (exists (select 1 from public.advisor_profiles a where a.id = advisor_id and a.user_id = auth.uid()));
create policy "advisor update own properties" on public.properties for update using (public.is_admin() or exists (select 1 from public.advisor_profiles a where a.id = advisor_id and a.user_id = auth.uid())) with check (public.is_admin() or exists (select 1 from public.advisor_profiles a where a.id = advisor_id and a.user_id = auth.uid()));

create policy "public images for active properties" on public.property_images for select using (exists (select 1 from public.properties p where p.id = property_id and p.status = 'active') or public.is_admin());
create policy "advisor manage own images" on public.property_images for all using (public.is_admin() or exists (select 1 from public.properties p join public.advisor_profiles a on a.id = p.advisor_id where p.id = property_id and a.user_id = auth.uid()));

create policy "favorites owner select" on public.favorites for select using (user_id = auth.uid());
create policy "favorites owner insert" on public.favorites for insert with check (user_id = auth.uid());
create policy "favorites owner delete" on public.favorites for delete using (user_id = auth.uid());

create policy "public create leads" on public.leads for insert with check (true);
create policy "advisor and admin read leads" on public.leads for select using (public.is_admin() or exists (select 1 from public.advisor_profiles a where a.id = advisor_id and a.user_id = auth.uid()));

create policy "public create reports" on public.property_reports for insert with check (true);
create policy "admin read reports" on public.property_reports for select using (public.is_admin());
create policy "admin update reports" on public.property_reports for update using (public.is_admin());

create policy "public read active plans" on public.plans for select using (is_active = true or public.is_admin());
create policy "admin manage plans" on public.plans for all using (public.is_admin());

create policy "advisor own subscriptions" on public.subscriptions for select using (public.is_admin() or exists (select 1 from public.advisor_profiles a where a.id = advisor_id and a.user_id = auth.uid()));
create policy "admin manage subscriptions" on public.subscriptions for all using (public.is_admin());

create policy "public insert property views" on public.property_views for insert with check (true);
create policy "advisor read property views" on public.property_views for select using (public.is_admin() or exists (select 1 from public.properties p join public.advisor_profiles a on a.id = p.advisor_id where p.id = property_id and a.user_id = auth.uid()));
