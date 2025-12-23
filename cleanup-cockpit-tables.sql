-- CLEANUP SCRIPT - gebruik dit ALLEEN als je opnieuw wilt beginnen
-- Dit verwijdert ALLE cockpit tabellen zodat je vanaf scratch kunt starten

-- Verwijder tabellen in de juiste volgorde (reverse dependencies)
DROP TABLE IF EXISTS weekly_reviews CASCADE;
DROP TABLE IF EXISTS kpi_snapshots CASCADE;
DROP TABLE IF EXISTS krs CASCADE;
DROP TABLE IF EXISTS okrs CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS experiments CASCADE;
DROP TABLE IF EXISTS assumptions CASCADE;

-- Verwijder functies
DROP FUNCTION IF EXISTS update_experiments_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_okrs_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_krs_updated_at() CASCADE;

-- Verificatie: deze query moet nu 0 rows returnen
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
  );
