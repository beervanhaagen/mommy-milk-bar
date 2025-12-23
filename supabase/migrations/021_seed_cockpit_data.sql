-- Seed 5 initial assumptions
INSERT INTO assumptions (code, title, category, risk, status, confidence, owner, notes) VALUES
  ('A1', 'Borstvoedende moeders ervaren stress/onzekerheid na 1-2 drankjes', 'Desirability', 'critical', 'testing', 70, 'Beer', 'Core value proposition - kern van waarom MMB bestaat'),
  ('A2', 'Onzekerheid zit vooral in timing: wanneer weer veilig', 'Desirability', 'high', 'testing', 60, 'Beer', 'Differentiator vs simple timer apps - we helpen met planning'),
  ('B1', 'Gebruikers snappen zonder uitleg wat ze moeten doen', 'Usability', 'medium', 'untested', 40, 'Beer', 'Key UX bet - visual timeline moet intuïtief zijn'),
  ('B2', 'Countdown/indicatie voelt logisch en geruststellend', 'Usability', 'medium', 'untested', 50, 'Beer', 'Brand differentiator - Mimi creates emotional connection'),
  ('E1', '''Geen medisch advies'' framing wordt begrepen en geaccepteerd', 'Compliance', 'critical', 'testing', 55, 'Beer', 'Legal requirement vs conversion tension - critical balance');

-- Seed 1 OKR with 4 KRs
INSERT INTO okrs (period, objective, status, owner) VALUES
  ('Q1 2025', 'Prove demand & usability for MMB in NL market', 'active', 'Beer');

-- Get the OKR ID we just inserted
WITH inserted_okr AS (
  SELECT id FROM okrs WHERE period = 'Q1 2025'
)
INSERT INTO krs (okr_id, name, target, current, unit, confidence, due_date)
SELECT
  id,
  'Activation rate (complete onboarding)',
  70.00,
  0.00,
  '%',
  50,
  '2025-03-31'::DATE
FROM inserted_okr
UNION ALL
SELECT
  id,
  'D7 retention rate',
  20.00,
  0.00,
  '%',
  40,
  '2025-03-31'::DATE
FROM inserted_okr
UNION ALL
SELECT
  id,
  'Average app rating',
  4.60,
  0.00,
  'rating',
  30,
  '2025-03-31'::DATE
FROM inserted_okr
UNION ALL
SELECT
  id,
  'Qualitative feedback items collected',
  50.00,
  0.00,
  'items',
  60,
  '2025-03-31'::DATE
FROM inserted_okr;

-- Add a sample evidence item for A1
WITH assumption_a1 AS (
  SELECT id FROM assumptions WHERE code = 'A1'
)
INSERT INTO evidence (assumption_id, type, content, source)
SELECT
  id,
  'qualitative',
  'User quote from onboarding survey: "I was so stressed about not knowing when it was safe to breastfeed again after having wine with dinner."',
  'Onboarding Survey - Dec 2024'
FROM assumption_a1;

-- Note to user:
-- You can manually add more evidence, experiments, and weekly reviews via the admin panel once it's deployed.
