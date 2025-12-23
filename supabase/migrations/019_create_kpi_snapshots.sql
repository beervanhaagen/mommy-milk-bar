-- Create KPI snapshots table
CREATE TABLE kpi_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  metric TEXT NOT NULL,
  value DECIMAL(10,4) NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, metric)
);

-- Create indexes
CREATE INDEX idx_kpi_snapshots_date ON kpi_snapshots(date DESC);
CREATE INDEX idx_kpi_snapshots_metric ON kpi_snapshots(metric);
CREATE INDEX idx_kpi_snapshots_date_metric ON kpi_snapshots(date DESC, metric);

-- Add comment
COMMENT ON TABLE kpi_snapshots IS 'Daily/weekly KPI measurements for historical tracking';
