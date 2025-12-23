-- Create OKRs table
CREATE TABLE okrs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT NOT NULL,
  objective TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  owner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_okrs_status ON okrs(status);
CREATE INDEX idx_okrs_period ON okrs(period);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_okrs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_okrs_updated_at
  BEFORE UPDATE ON okrs
  FOR EACH ROW
  EXECUTE FUNCTION update_okrs_updated_at();

-- Add comment
COMMENT ON TABLE okrs IS 'Quarterly/monthly objectives';
