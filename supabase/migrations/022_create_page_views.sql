-- Create page_views table for tracking website visits
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_page_views_page ON page_views(page);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous inserts" ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read (for dashboard)
CREATE POLICY "Allow authenticated reads" ON page_views
  FOR SELECT
  TO authenticated
  USING (true);
