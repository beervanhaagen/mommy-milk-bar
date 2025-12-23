-- Create experiments table
CREATE TABLE experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  assumption_codes TEXT[] NOT NULL,
  hypothesis TEXT NOT NULL,
  method TEXT NOT NULL,
  metric_primary TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'completed', 'paused', 'cancelled')),
  result TEXT CHECK (result IN ('success', 'fail', 'inconclusive')),
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_assumptions ON experiments USING GIN(assumption_codes);
CREATE INDEX idx_experiments_dates ON experiments(start_date, end_date);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_experiments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_experiments_updated_at
  BEFORE UPDATE ON experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_experiments_updated_at();

-- Add comment
COMMENT ON TABLE experiments IS 'Tests to validate assumptions';
