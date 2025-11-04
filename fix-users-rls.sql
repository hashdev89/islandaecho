-- Fix RLS policies for users table to allow service role inserts
-- Run this in your Supabase SQL Editor

-- IMPORTANT: The service_role key SHOULD bypass RLS automatically,
-- but if inserts are failing, run this to ensure policies are correct

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Allow public read access" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to manage users" ON users;
DROP POLICY IF EXISTS "Allow service role to manage users" ON users;
DROP POLICY IF EXISTS "Allow service role full access" ON users;

-- Allow public read access (for API GET requests)
CREATE POLICY "Allow public read access" ON users
  FOR SELECT USING (true);

-- Allow service role full access (for API POST/PUT/DELETE with service_role key)
-- Note: Service role key automatically bypasses RLS, but this makes it explicit
CREATE POLICY "Allow service role full access" ON users
  FOR ALL USING (true);

-- Verify RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- After running this, try inserting users again via the API or migration endpoint

