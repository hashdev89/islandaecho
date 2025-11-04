-- Add password field to users table
-- Run this in your Supabase SQL Editor

-- Add password_hash column to store hashed passwords
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add index for faster email lookups (already exists, but ensuring it)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Note: Passwords should be hashed using bcrypt before storing
-- The application will handle password hashing

