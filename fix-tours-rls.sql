-- Fix RLS policies for tours table to allow service role to insert/update
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage tours" ON tours;
DROP POLICY IF EXISTS "Allow public read access" ON tours;

-- Create policy for service role (bypasses RLS)
-- Service role has full access
CREATE POLICY "Allow service role full access" ON tours
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Also allow public read access
CREATE POLICY "Allow public read access" ON tours
  FOR SELECT 
  USING (true);

-- Alternative: Disable RLS if you want full access (not recommended for production)
-- ALTER TABLE tours DISABLE ROW LEVEL SECURITY;

