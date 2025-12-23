-- Check welke cockpit tabellen al bestaan
-- Run dit in Supabase SQL Editor om te zien wat er al aanwezig is

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'assumptions',
    'evidence',
    'experiments',
    'okrs',
    'krs',
    'kpi_snapshots',
    'weekly_reviews'
  )
ORDER BY table_name;
