-- ============================================================
-- Admin RLS Policies
-- Run in Supabase SQL Editor ONCE
-- Allows authenticated users (admin) full CRUD access
-- ============================================================

-- Projects: authenticated users can read ALL (including drafts) + write
create policy "Authenticated full access projects"
  on projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Posts: authenticated users can read ALL (including drafts) + write
create policy "Authenticated full access posts"
  on posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- About: authenticated users can read + write
create policy "Authenticated full access about"
  on about for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
