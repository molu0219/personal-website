-- Run this in Supabase SQL editor

create table if not exists about (
  id uuid primary key default gen_random_uuid(),
  name text,
  title text,
  bio text,
  avatar_url text,
  skills text[],
  social_links jsonb default '{}',
  updated_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  content text,
  cover_url text,
  images text[],
  tags text[],
  url text,
  github_url text,
  featured boolean default false,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  cover_url text,
  tags text[],
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Enable row level security
alter table about enable row level security;
alter table projects enable row level security;
alter table posts enable row level security;

-- Public read for published content
create policy "Public read about" on about for select using (true);
create policy "Public read published projects" on projects for select using (published = true);
create policy "Public read published posts" on posts for select using (published = true);

-- Service role bypasses RLS by default (used by API routes with service key)

-- Storage bucket for media
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict do nothing;

create policy "Public read media" on storage.objects for select using (bucket_id = 'media');
create policy "Service upload media" on storage.objects for insert with check (bucket_id = 'media');
