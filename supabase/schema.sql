-- GENECT Marketplace MVP schema
create extension if not exists "pgcrypto";

create type seller_status as enum ('pending','verified','rejected');
create type listing_status as enum ('draft','pending_review','published','paused','archived');
create type order_status as enum ('pending','paid','processing','shipped','completed','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text default 'buyer' check (role in ('buyer','seller','admin')),
  created_at timestamptz default now()
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  display_name text not null,
  bio text,
  location text,
  seller_status seller_status default 'pending',
  verification_note text,
  created_at timestamptz default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  category_id uuid references public.categories(id),
  title text not null,
  description text,
  price_jpy integer,
  listing_type text default 'product' check (listing_type in ('product','service')),
  status listing_status default 'draft',
  stock integer default 1,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  sort_order integer default 0
);

create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key(user_id, listing_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id),
  status order_status default 'pending',
  total_jpy integer default 0,
  created_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  listing_id uuid not null references public.listings(id),
  seller_id uuid not null references public.sellers(id),
  quantity integer default 1,
  unit_price_jpy integer not null
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete set null,
  receiver_id uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  body text not null,
  created_at timestamptz default now()
);

insert into public.categories(name,slug) values
('Made by seniors','made-by-seniors'),
('Skills & services','skills-services'),
('For seniors','for-seniors'),
('Local experiences','local-experiences')
on conflict do nothing;

-- Enable RLS
alter table profiles enable row level security;
alter table sellers enable row level security;
alter table categories enable row level security;
alter table listings enable row level security;
alter table listing_images enable row level security;
alter table favorites enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table messages enable row level security;

-- Public discovery: only published listings.
create policy "published listings are public"
on listings for select using (status = 'published');

create policy "categories are public"
on categories for select using (true);

create policy "seller profiles are public when verified"
on sellers for select using (seller_status = 'verified');

-- Logged-in users manage their own favorites.
create policy "users read own favorites"
on favorites for select using (auth.uid() = user_id);

create policy "users add own favorites"
on favorites for insert with check (auth.uid() = user_id);

create policy "users remove own favorites"
on favorites for delete using (auth.uid() = user_id);

-- Sellers can create/update their own listings.
create policy "seller creates own listings"
on listings for insert with check (
  exists(select 1 from sellers s where s.id = seller_id and s.user_id = auth.uid())
);

create policy "seller updates own listings"
on listings for update using (
  exists(select 1 from sellers s where s.id = seller_id and s.user_id = auth.uid())
);

-- Messaging: only participants can read/write their conversations.
create policy "participants read messages"
on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "sender creates messages"
on messages for insert with check (auth.uid() = sender_id);
