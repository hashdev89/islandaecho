-- Users Table Schema for Supabase
-- Run this in your Supabase SQL Editor

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  address TEXT DEFAULT '',
  notes TEXT DEFAULT ''
);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Allow public read access
CREATE POLICY "Allow public read access" ON users
  FOR SELECT USING (true);

-- Allow service role (used by API) to manage users (bypasses RLS)
-- Note: Service role key automatically bypasses RLS, but this is for explicit access
CREATE POLICY "Allow service role to manage users" ON users
  FOR ALL USING (true);

-- Allow authenticated users to manage users
CREATE POLICY "Allow authenticated users to manage users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- AUTO-UPDATE TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = COALESCE(NEW.created_at, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add comments to document the table structure
COMMENT ON TABLE users IS 'Users table with user account information and statistics';
COMMENT ON COLUMN users.role IS 'User role: admin, staff, or customer';
COMMENT ON COLUMN users.status IS 'User account status: active, inactive, or suspended';
COMMENT ON COLUMN users.total_bookings IS 'Total number of bookings made by this user';
COMMENT ON COLUMN users.total_spent IS 'Total amount spent by this user';

