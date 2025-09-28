-- Create tours table in Supabase
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(featured);
CREATE INDEX IF NOT EXISTS idx_tours_created_at ON tours(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON tours
  FOR SELECT USING (true);

-- Create policies for authenticated users to manage tours
CREATE POLICY "Allow authenticated users to manage tours" ON tours
  FOR ALL USING (auth.role() = 'authenticated');

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tours_updated_at 
  BEFORE UPDATE ON tours 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
