-- Add missing consent_timestamp column to profiles table
-- This column should have been added in migration 003 but wasn't applied to remote DB

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE;

-- Update existing records to have a timestamp
UPDATE profiles
SET consent_timestamp = created_at
WHERE consent_timestamp IS NULL;
