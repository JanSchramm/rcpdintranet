-- personnel_system_migration.sql
-- Führe dieses SQL im Supabase SQL Editor aus.

-- 1. Disziplinarspunkte zur user-Tabelle hinzufügen
ALTER TABLE public.user
  ADD COLUMN IF NOT EXISTS discipline_points INTEGER DEFAULT 0
  CHECK (discipline_points >= 0 AND discipline_points <= 10);

-- 2. Titel zur personnel_files-Tabelle hinzufügen
ALTER TABLE public.personnel_files
  ADD COLUMN IF NOT EXISTS title TEXT;

-- 3. Bestehende Policies entfernen und neu erstellen
DROP POLICY IF EXISTS "Allow authenticated read personnel_files" ON personnel_files;
DROP POLICY IF EXISTS "Allow authenticated insert personnel_files" ON personnel_files;
DROP POLICY IF EXISTS "Allow admin/supervisor update personnel_files" ON personnel_files;
DROP POLICY IF EXISTS "Allow admin/supervisor delete personnel_files" ON personnel_files;

-- Alle eingeloggten User dürfen lesen
CREATE POLICY "Allow authenticated read personnel_files" ON personnel_files
  FOR SELECT TO authenticated USING (true);

-- Alle eingeloggten User dürfen Einträge erstellen
CREATE POLICY "Allow authenticated insert personnel_files" ON personnel_files
  FOR INSERT TO authenticated WITH CHECK (true);

-- Nur Admins/Supervisors dürfen Einträge ändern
CREATE POLICY "Allow admin/supervisor update personnel_files" ON personnel_files
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'supervisor')
    )
  );

-- Nur Admins/Supervisors dürfen Einträge löschen
CREATE POLICY "Allow admin/supervisor delete personnel_files" ON personnel_files
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'supervisor')
    )
  );

-- 4. RLS für user-Tabelle: Allen eingeloggten Usern das Lesen aller Officers erlauben
-- (falls noch nicht vorhanden)
DROP POLICY IF EXISTS "Allow authenticated read all users" ON public.user;
CREATE POLICY "Allow authenticated read all users" ON public.user
  FOR SELECT TO authenticated USING (true);
