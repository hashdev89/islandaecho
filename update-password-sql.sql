-- Update password for admin user: hashanthawic@gmail.com
-- Password: Hash@2025
-- Run this in Supabase SQL Editor

UPDATE users 
SET password_hash = 'e51a1a7a5999fbf35afdfb91a34d55c8c7c13bc0d45b5ac7b844379af657ff17'
WHERE email = 'hashanthawic@gmail.com';

-- Verify the update
SELECT id, name, email, role, status, 
       CASE WHEN password_hash IS NOT NULL THEN 'Password set' ELSE 'No password' END as password_status
FROM users 
WHERE email = 'hashanthawic@gmail.com';
