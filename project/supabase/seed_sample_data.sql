-- seed_sample_data.sql
-- Führe dieses SQL im Supabase SQL Editor aus, um Beispiel-Daten zu erstellen.

-- 1. Stelle sicher, dass die Tabellen existieren
-- (führe zuerst org_structure_migration.sql aus)

-- 2. Ränge erstellen
INSERT INTO public.rank_definitions (title, order_index, level, is_active) VALUES
  ('Chief of Police', 1, 1, true),
  ('Deputy Chief', 2, 2, true),
  ('Captain', 3, 3, true),
  ('Lieutenant', 4, 4, true),
  ('Sergeant', 5, 5, true),
  ('Detective', 6, 6, true),
  ('Officer II', 7, 7, true),
  ('Officer I', 8, 7, true),
  ('Cadet', 9, 8, true)
ON CONFLICT DO NOTHING;

-- 3. Divisions erstellen
INSERT INTO public.divisions (name, description, is_active) VALUES
  ('Patrol', 'Patrol Division', true),
  ('Investigations', 'Criminal Investigations', true),
  ('Traffic', 'Traffic Division', true),
  ('SWAT', 'Special Weapons and Tactics', true),
  ('Narcotics', 'Narcotics Division', true),
  ('Administration', 'Administrative Division', true)
ON CONFLICT DO NOTHING;

-- 4. Hole die IDs der erstellten Ränge
-- (Diese Abfrage hilft dir, die IDs zu finden)
-- SELECT id, title, order_index, level FROM public.rank_definitions ORDER BY order_index;

-- 5. Beispiel-Officers
-- WICHTIG: Ersetze 'DEINE_USER_ID' durch echte Supabase Auth User IDs!
-- Du kannst User IDs aus der 'user' Tabelle holen oder aus dem Auth callback.

-- Beispiel:
-- INSERT INTO public.user (id, firstname, lastname, badgenumber, rank, division, role, status, discipline_points, rank_id)
-- VALUES (
--   'echte-uuid-hier',
--   'John',
--   'Doe',
--   '1001',
--   'Sergeant',
--   '{"Patrol", "SWAT"}',
--   'officer',
--   'approved',
--   0,
--   'sergeant-uuid-hier'
-- )
-- ON CONFLICT (id) DO NOTHING;

-- 6. Prüfe ob RLS Policies für die neuen Tabellen existieren
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('rank_definitions', 'divisions');
