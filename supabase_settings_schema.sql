-- Settings Table Schema for Supabase
-- Run this in your Supabase SQL Editor

-- =============================================
-- SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  -- General Settings
  site_name TEXT DEFAULT 'Isle & Echo Travel',
  site_description TEXT DEFAULT 'Your gateway to Sri Lankan adventures',
  site_url TEXT DEFAULT 'https://isleandecho.com',
  admin_email TEXT DEFAULT 'admin@isleandecho.com',
  timezone TEXT DEFAULT 'Asia/Colombo',
  language TEXT DEFAULT 'en',
  
  -- Contact Information
  contact_email TEXT DEFAULT 'info@isleandecho.com',
  contact_phone TEXT DEFAULT '+94 11 234 5678',
  contact_address TEXT DEFAULT '123 Galle Road, Colombo 03, Sri Lanka',
  business_hours TEXT DEFAULT 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
  
  -- Email Settings
  smtp_host TEXT DEFAULT 'smtp.gmail.com',
  smtp_port TEXT DEFAULT '587',
  smtp_username TEXT DEFAULT '',
  smtp_password TEXT DEFAULT '',
  from_email TEXT DEFAULT 'noreply@isleandecho.com',
  from_name TEXT DEFAULT 'Isle & Echo Travel',
  
  -- Notification Settings (stored as JSONB for arrays)
  email_notifications BOOLEAN DEFAULT true,
  booking_notifications BOOLEAN DEFAULT true,
  payment_notifications BOOLEAN DEFAULT true,
  maintenance_notifications BOOLEAN DEFAULT false,
  
  -- Security Settings
  session_timeout INTEGER DEFAULT 30,
  password_min_length INTEGER DEFAULT 8,
  require_two_factor BOOLEAN DEFAULT false,
  allowed_file_types TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
  
  -- Payment Settings
  currency TEXT DEFAULT 'LKR',
  payment_methods TEXT[] DEFAULT ARRAY['credit_card', 'bank_transfer', 'cash'],
  tax_rate DECIMAL(5,2) DEFAULT 15.00,
  booking_deposit DECIMAL(5,2) DEFAULT 20.00,
  
  -- Appearance Settings
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  logo_url TEXT DEFAULT '/logoisle&echo.png',
  favicon_url TEXT DEFAULT '/favicon.ico',
  theme TEXT DEFAULT 'light',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_settings_id ON settings(id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON settings
  FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON settings
  FOR ALL USING (true);

-- =============================================
-- AUTO-UPDATE TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings
INSERT INTO settings (id) VALUES ('main')
ON CONFLICT (id) DO NOTHING;

