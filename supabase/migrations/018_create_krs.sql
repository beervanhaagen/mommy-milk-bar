-- Create Key Results table
CREATE TABLE krs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  okr_id UUID REFERENCES okrs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target DECIMAL(10,2) NOT NULL,
  current DECIMAL(10,2) DEFAULT 0,
  unit TEXT NOT NULL,
  confidence INTEGER DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_krs_okr ON krs(okr_id);
CREATE INDEX idx_krs_due_date ON krs(due_date);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_krs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_krs_updated_at
  BEFORE UPDATE ON krs
  FOR EACH ROW
  EXECUTE FUNCTION update_krs_updated_at();

-- Add comment
COMMENT ON TABLE krs IS 'Key Results for each OKR';
