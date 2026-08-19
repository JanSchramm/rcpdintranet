-- fix_auth_and_rls.sql
-- Führe dieses SQL im Supabase SQL Editor aus, um Auth/Login-Probleme zu beheben.

-- ============================================
-- 1. RLS für user Tabelle sicherstellen
-- ============================================

-- RLS aktivieren
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- Alle eingeloggten User können alle Officers lesen
DROP POLICY IF EXISTS "Allow authenticated read all users" ON public.user;
CREATE POLICY "Allow authenticated read all users" ON public.user
  FOR SELECT TO authenticated USING (true);

-- Alle eingeloggten User können sich selbst aktualisieren
DROP POLICY IF EXISTS "Allow authenticated update self" ON public.user;
CREATE POLICY "Allow authenticated update self" ON public.user
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Admins und Supervisors können alle User verwalten
DROP POLICY IF EXISTS "Allow admin/supervisor manage users" ON public.user;
CREATE POLICY "Allow admin/supervisor manage users" ON public.user
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 2. RLS für messages Tabelle sicherstellen
-- ============================================

ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

-- Alle eingeloggten User können alle Messages lesen
DROP POLICY IF EXISTS "Allow authenticated read messages" ON public.messages;
CREATE POLICY "Allow authenticated read messages" ON public.messages
  FOR SELECT TO authenticated USING (true);

-- Alle eingeloggten User können Messages erstellen
DROP POLICY IF EXISTS "Allow authenticated insert messages" ON public.messages;
CREATE POLICY "Allow authenticated insert messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- 3. RLS für personnel_files Tabelle sicherstellen
-- ============================================

ALTER TABLE IF EXISTS public.personnel_files ENABLE ROW LEVEL SECURITY;

-- Alle eingeloggten User können lesen
DROP POLICY IF EXISTS "Allow authenticated read personnel_files" ON public.personnel_files;
CREATE POLICY "Allow authenticated read personnel_files" ON public.personnel_files
  FOR SELECT TO authenticated USING (true);

-- Alle eingeloggten User können erstellen
DROP POLICY IF EXISTS "Allow authenticated insert personnel_files" ON public.personnel_files;
CREATE POLICY "Allow authenticated insert personnel_files" ON public.personnel_files
  FOR INSERT TO authenticated WITH CHECK (true);

-- Nur Admins/Supervisors können ändern
DROP POLICY IF EXISTS "Allow admin/supervisor update personnel_files" ON public.personnel_files;
CREATE POLICY "Allow admin/supervisor update personnel_files" ON public.personnel_files
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'supervisor')
    )
  );

-- Nur Admins/Supervisors können löschen
DROP POLICY IF EXISTS "Allow admin/supervisor delete personnel_files" ON public.personnel_files;
CREATE POLICY "Allow admin/supervisor delete personnel_files" ON public.personnel_files
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 4. RLS für events Tabelle sicherstellen
-- ============================================

ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- Alle eingeloggten User können Events lesen
DROP POLICY IF EXISTS "Allow authenticated read events" ON public.events;
CREATE POLICY "Allow authenticated read events" ON public.events
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- 5. Prüfe alle Policies
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('user', 'messages', 'personnel_files', 'events', 'rank_definitions', 'divisions')
ORDER BY tablename, policyname;
