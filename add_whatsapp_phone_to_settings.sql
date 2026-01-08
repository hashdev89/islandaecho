-- Add WhatsApp phone number to settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT DEFAULT '94741415812';

COMMENT ON COLUMN settings.whatsapp_phone IS 'WhatsApp phone number (country code + number without + or spaces)';

