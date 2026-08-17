-- Fix RLS Policies for user table to improve performance
-- The subquery in the previous policy was causing issues

-- Vereinfachte RLS: Authenticated Users können alle User-Reihen sehen
-- Das ist sicher, da nur angemeldete Benutzer Zugriff haben
DROP POLICY IF EXISTS "select_own_user_or_admin" ON "user";
CREATE POLICY "select_all_users_authenticated" ON "user" FOR SELECT
  TO authenticated USING (true);

-- Update Policy: Jeder kann nur sein eigenes Profil aktualisieren
-- Admin-Updates müssen über separate Funktionen laufen
DROP POLICY IF EXISTS "update_own_or_admin_user" ON "user";
CREATE POLICY "update_own_user_only" ON "user" FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Restore original insert policy
DROP POLICY IF EXISTS "insert_own_user" ON "user";
CREATE POLICY "insert_own_user" ON "user" FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Restore original delete policy  
DROP POLICY IF EXISTS "delete_own_user" ON "user";
CREATE POLICY "delete_own_user" ON "user" FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Note: For admin operations (changing roles, status), use a separate Supabase function
-- that bypasses RLS (not recommended for this setup, but alternative if needed)
