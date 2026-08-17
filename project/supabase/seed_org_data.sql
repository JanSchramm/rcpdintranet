-- seed_org_data.sql
-- Führe dieses SQL im Supabase SQL Editor aus, um Beispiel-Daten zu erstellen.

-- 1. Ränge erstellen
INSERT INTO public.rank_definitions (title, order_index, level, is_active) VALUES
  ('Chief', 1, 1, true),
  ('Deputy Chief', 2, 2, true),
  ('Captain', 3, 3, true),
  ('Lieutenant', 4, 4, true),
  ('Sergeant', 5, 5, true),
  ('Detective', 6, 6, true),
  ('Officer II', 7, 7, true),
  ('Officer I', 8, 7, true),
  ('Cadet', 9, 8, true)
ON CONFLICT DO NOTHING;

-- 2. Divisions erstellen
INSERT INTO public.divisions (name, description, is_active) VALUES
  ('Patrol', 'Patrol Division', true),
  ('Investigations', 'Criminal Investigations', true),
  ('Traffic', 'Traffic Division', true),
  ('SWAT', 'Special Weapons and Tactics', true),
  ('Narcotics', 'Narcotics Division', true),
  ('Administration', 'Administrative Division', true)
ON CONFLICT DO NOTHING;

-- 3. Beispiel-Officers erstellen (nur wenn noch keine existieren)
-- Hinweis: Dies sind nur Beispiele. Ersetze die UUIDs durch echte Supabase Auth User IDs.
-- Um echte Testdaten zu erstellen, melde dich zuerst mit Discord an und kopiere die User ID.

-- Beispiel: INSERT INTO public.user (id, firstname, lastname, badgenumber, rank, division, role, status, discipline_points) VALUES
--   ('echte-user-id-hier', 'John', 'Doe', '1234', 'Officer', '{"Patrol"}', 'officer', 'approved', 0);
