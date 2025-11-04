-- Direct SQL to insert users into Supabase
-- Copy and paste this into Supabase SQL Editor and run it

-- First, ensure the table structure is correct
-- (This should already be done, but just in case)

-- Insert or update users
INSERT INTO users (id, name, email, phone, role, status, total_bookings, total_spent, address, notes, created_at, last_login)
VALUES 
  (
    '6', 
    'Admin User', 
    'admin@isleandecho.com', 
    '+94-11-234-5678', 
    'admin', 
    'active', 
    0, 
    0, 
    '', 
    '', 
    '2024-01-01 00:00:00+00'::timestamptz, 
    '2024-12-20 08:00:00+00'::timestamptz
  ),
  (
    '7', 
    'Hashantha Bandara', 
    'hashanthawic@gmail.com', 
    '0769212943', 
    'admin', 
    'active', 
    0, 
    0, 
    '', 
    '', 
    '2025-11-04 05:55:15.388+00'::timestamptz, 
    '2025-11-04 05:55:15.387+00'::timestamptz
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  total_bookings = EXCLUDED.total_bookings,
  total_spent = EXCLUDED.total_spent,
  address = EXCLUDED.address,
  notes = EXCLUDED.notes,
  last_login = EXCLUDED.last_login,
  created_at = EXCLUDED.created_at;

-- Verify the insert
SELECT id, name, email, role, status FROM users ORDER BY created_at;

