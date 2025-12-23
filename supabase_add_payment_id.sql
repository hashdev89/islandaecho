-- Add payment_id column to bookings table for PayHere integration
-- Run this in your Supabase SQL Editor

-- Add payment_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN payment_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON bookings(payment_id);
    END IF;
END $$;

-- Add payment_method column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE bookings ADD COLUMN payment_method TEXT;
    END IF;
END $$;

