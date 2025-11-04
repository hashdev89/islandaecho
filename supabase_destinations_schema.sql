-- Destinations Table Schema for Supabase
-- Run this in your Supabase SQL Editor

-- =============================================
-- DESTINATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations indexes
CREATE INDEX IF NOT EXISTS idx_destinations_status ON destinations(status);
CREATE INDEX IF NOT EXISTS idx_destinations_region ON destinations(region);
CREATE INDEX IF NOT EXISTS idx_destinations_created_at ON destinations(created_at);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Destinations policies
CREATE POLICY "Allow public read access" ON destinations
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage destinations" ON destinations
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- AUTO-UPDATE TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_destinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_destinations_updated_at 
  BEFORE UPDATE ON destinations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_destinations_updated_at();

-- Add comments to document the table structure
COMMENT ON TABLE destinations IS 'Destinations table with location data and metadata';
COMMENT ON COLUMN destinations.lat IS 'Latitude coordinate';
COMMENT ON COLUMN destinations.lng IS 'Longitude coordinate';
COMMENT ON COLUMN destinations.region IS 'Region or area where the destination is located';
COMMENT ON COLUMN destinations.status IS 'Whether the destination is active or inactive';

