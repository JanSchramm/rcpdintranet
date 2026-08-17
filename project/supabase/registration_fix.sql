-- registration_fix.sql
-- Führe dieses SQL im Supabase SQL Editor aus.

-- 1. RLS für user-Tabelle sicherstellen
DROP POLICY IF EXISTS "Allow authenticated read all users" ON public.user;
CREATE POLICY "Allow authenticated read all users" ON public.user
  FOR SELECT TO authenticated USING (true);

-- 2. Sicherstellen, dass die Service Role alle Operationen durchführen kann
-- (Der Admin Client nutzt die Service Role, die RLS normalerweise umgeht)
-- Falls es trotzdem Probleme gibt, kann man die RLS für den Insert temporarily ausschalten:
-- ALTER TABLE public.user DISABLE ROW LEVEL SECURITY;

-- 3. Prüfe, ob die Sequenz für IDs korrekt konfiguriert ist
-- (Falls IDs von der Datenbank generiert werden, aber hier nutzen wir Supabase Auth UUIDs)

-- 4. Debug: Prüfe ob der User bereits existiert
-- SELECT * FROM public.user WHERE id = 'DEINE_USER_ID';
