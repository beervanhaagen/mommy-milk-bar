-- Create assumptions table
CREATE TABLE assumptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Desirability', 'Usability', 'Retention', 'Monetization', 'Compliance')),
  risk TEXT NOT NULL CHECK (risk IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'untested' CHECK (status IN ('untested', 'testing', 'validated', 'invalidated', 'monitoring')),
  confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  owner TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_assumptions_status ON assumptions(status);
CREATE INDEX idx_assumptions_risk ON assumptions(risk);
CREATE INDEX idx_assumptions_category ON assumptions(category);
CREATE INDEX idx_assumptions_code ON assumptions(code);

-- Add comment
COMMENT ON TABLE assumptions IS 'Core beliefs to validate about the product';
