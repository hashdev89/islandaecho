-- Combined Supabase Schema for Tours and Bookings
-- Run this in your Supabase SQL Editor

-- =============================================
-- TOURS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tours (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  price TEXT NOT NULL,
  destinations TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  key_experiences TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  itinerary JSONB DEFAULT '[]',
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  important_info JSONB DEFAULT '{}',
  accommodation TEXT[] DEFAULT '{}',
  transportation TEXT DEFAULT '',
  group_size TEXT DEFAULT '',
  difficulty TEXT DEFAULT '',
  best_time TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tours indexes
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(featured);
CREATE INDEX IF NOT EXISTS idx_tours_created_at ON tours(created_at);

-- =============================================
-- BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
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

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_package_id ON bookings(tour_package_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Tours policies
CREATE POLICY "Allow public read access" ON tours
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage tours" ON tours
  FOR ALL USING (auth.role() = 'authenticated');

-- Bookings policies
CREATE POLICY "Allow public read access" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage bookings" ON bookings
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- AUTO-UPDATE TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tours trigger
CREATE TRIGGER update_tours_updated_at 
  BEFORE UPDATE ON tours 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Bookings trigger
CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
