-- Create evidence table
CREATE TABLE evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assumption_id UUID REFERENCES assumptions(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES experiments(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('qualitative', 'quantitative', 'observation', 'metric')),
  content TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_evidence_assumption ON evidence(assumption_id);
CREATE INDEX idx_evidence_experiment ON evidence(experiment_id);
CREATE INDEX idx_evidence_type ON evidence(type);

-- Add comment
COMMENT ON TABLE evidence IS 'Supporting data for assumptions and experiments';
