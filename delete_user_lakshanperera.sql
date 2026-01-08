-- Delete user with email: lakshanperera2920@gmail.com
-- Run this in your Supabase SQL Editor

-- First, check if the user exists
SELECT id, name, email, role, status 
FROM users 
WHERE email = 'lakshanperera2920@gmail.com';

-- Delete the user (this will also handle any related data if there are foreign key constraints)
DELETE FROM users 
WHERE email = 'lakshanperera2920@gmail.com';

-- Verify deletion
SELECT id, name, email, role, status 
FROM users 
WHERE email = 'lakshanperera2920@gmail.com';
-- Should return no rows if deletion was successful

-- Also check if user exists in Supabase Auth (if using Supabase Auth)
-- Note: This requires admin access to auth.users table
-- DELETE FROM auth.users WHERE email = 'lakshanperera2920@gmail.com';

