-- Complete Tours Table Schema for Supabase
-- This will update your existing tours table to include all fields

-- First, let's add the missing columns to the existing tours table
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS destinations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS key_experiences JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS inclusions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS exclusions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS accommodation JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS importantInfo JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS style TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS destinations_route TEXT,
ADD COLUMN IF NOT EXISTS including_all TEXT;

-- Update existing columns to allow NULL values where needed
ALTER TABLE tours 
ALTER COLUMN description DROP NOT NULL,
ALTER COLUMN transportation DROP NOT NULL,
ALTER COLUMN groupsize DROP NOT NULL,
ALTER COLUMN difficulty DROP NOT NULL,
ALTER COLUMN besttime DROP NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(featured);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_style ON tours(style);
CREATE INDEX IF NOT EXISTS idx_tours_createdat ON tours(createdat);

-- Add comments to document the table structure
COMMENT ON TABLE tours IS 'Complete tours table with all tour details including destinations, itinerary, and metadata';
COMMENT ON COLUMN tours.destinations IS 'Array of destination names';
COMMENT ON COLUMN tours.highlights IS 'Array of tour highlights';
COMMENT ON COLUMN tours.key_experiences IS 'Array of key experiences';
COMMENT ON COLUMN tours.itinerary IS 'Complete day-by-day itinerary';
COMMENT ON COLUMN tours.inclusions IS 'What is included in the tour';
COMMENT ON COLUMN tours.exclusions IS 'What is not included in the tour';
COMMENT ON COLUMN tours.accommodation IS 'Accommodation details';
COMMENT ON COLUMN tours.images IS 'Array of image URLs';
COMMENT ON COLUMN tours.importantInfo IS 'Important information like requirements and what to bring';
COMMENT ON COLUMN tours.style IS 'Tour style (e.g., Adventure, Cultural, etc.)';
COMMENT ON COLUMN tours.rating IS 'Tour rating (0-5)';
COMMENT ON COLUMN tours.reviews IS 'Number of reviews';
COMMENT ON COLUMN tours.destinations_route IS 'Destinations & Route information';
COMMENT ON COLUMN tours.including_all IS 'Including All information';

-- Enable Row Level Security (RLS) if needed
-- ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Create a policy for public read access (adjust as needed)
-- CREATE POLICY "Allow public read access" ON tours FOR SELECT USING (true);

-- Create a policy for authenticated users to insert/update (adjust as needed)
-- CREATE POLICY "Allow authenticated users to manage tours" ON tours FOR ALL USING (auth.role() = 'authenticated');
