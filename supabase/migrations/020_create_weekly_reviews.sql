-- Create weekly reviews table
CREATE TABLE weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  highlights TEXT[],
  lowlights TEXT[],
  learnings TEXT[],
  decisions TEXT[],
  next_week_bets TEXT[],
  focus_assumption_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_weekly_reviews_date ON weekly_reviews(week_start DESC);

-- Add comment
COMMENT ON TABLE weekly_reviews IS 'Weekly reflection and planning sessions';
