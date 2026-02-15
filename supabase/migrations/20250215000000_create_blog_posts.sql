-- Blog posts table for persistent storage (required for Vercel; file storage is read-only there).
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste and run.
create table if not exists public.blog_posts (
  id bigserial primary key,
  title text not null,
  description text,
  excerpt text,
  author text,
  date date,
  read_time text,
  image text,
  video text,
  category text,
  status text default 'Draft',
  tags jsonb default '[]'::jsonb,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: enable RLS and allow service role full access (service role bypasses RLS by default)
-- alter table public.blog_posts enable row level security;
