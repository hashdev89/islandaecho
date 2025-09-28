-- Simple fix: Drop and recreate bookings table
-- Run this in your Supabase SQL Editor

-- Drop the existing bookings table (this will delete all data!)
DROP TABLE IF EXISTS bookings CASCADE;

-- Create the bookings table with all required columns
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  tour_package_id TEXT,
  tour_package_name TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  start_date DATE,
  end_date DATE,
  guests INTEGER DEFAULT 1,
  total_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT DEFAULT '',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_tour_package_id ON bookings(tour_package_id);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage bookings" ON bookings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
