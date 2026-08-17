-- org_structure_setup.sql
-- Dieses SQL ist kompatibel mit der aktuellen Datenbank.
-- Führe es im Supabase SQL Editor aus.

-- ============================================
-- 1. Neue Tabellen erstellen
-- ============================================

-- Ränge
CREATE TABLE IF NOT EXISTS public.rank_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Divisions
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. Spalten zur user Tabelle hinzufügen
-- ============================================

-- rank_id hinzufügen (falls noch nicht vorhanden)
ALTER TABLE public.user
  ADD COLUMN IF NOT EXISTS rank_id UUID;

-- ============================================
-- 3. Foreign Key hinzufügen
-- ============================================

-- Foreign Key für rank_id (falls noch nicht vorhanden)
-- Hinweis: Falls der Foreign Key schon existiert, wird dieser Befehl ignoriert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_rank_id_fkey'
      AND conrelid = 'public.user'::regclass
  ) THEN
    ALTER TABLE public.user
      ADD CONSTRAINT user_rank_id_fkey
      FOREIGN KEY (rank_id) REFERENCES public.rank_definitions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 4. Indizes erstellen
-- ============================================

CREATE INDEX IF NOT EXISTS idx_rank_definitions_order ON public.rank_definitions(order_index, level);
CREATE INDEX IF NOT EXISTS idx_rank_definitions_active ON public.rank_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_divisions_active ON public.divisions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_rank_id ON public.user(rank_id);

-- ============================================
-- 5. Trigger für updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_rank_definitions_updated_at ON public.rank_definitions;
CREATE TRIGGER update_rank_definitions_updated_at
  BEFORE UPDATE ON public.rank_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_divisions_updated_at ON public.divisions;
CREATE TRIGGER update_divisions_updated_at
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. RLS aktivieren
-- ============================================

ALTER TABLE public.rank_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS Policies
-- ============================================

-- Ränge: Alle eingeloggten User können lesen
DROP POLICY IF EXISTS "Allow authenticated read rank_definitions" ON public.rank_definitions;
CREATE POLICY "Allow authenticated read rank_definitions" ON public.rank_definitions
  FOR SELECT TO authenticated USING (true);

-- Ränge: Nur Admins/Supervisors können verwalten
DROP POLICY IF EXISTS "Allow admin manage rank_definitions" ON public.rank_definitions;
CREATE POLICY "Allow admin manage rank_definitions" ON public.rank_definitions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'supervisor')
    )
  );

-- Divisions: Alle eingeloggten User können lesen
DROP POLICY IF EXISTS "Allow authenticated read divisions" ON public.divisions;
CREATE POLICY "Allow authenticated read divisions" ON public.divisions
  FOR SELECT TO authenticated USING (true);

-- Divisions: Nur Admins/Supervisors können verwalten
DROP POLICY IF EXISTS "Allow admin manage divisions" ON public.divisions;
CREATE POLICY "Allow admin manage divisions" ON public.divisions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- 8. Beispiel-Daten einfügen
-- ============================================

-- Ränge
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

-- Divisions
INSERT INTO public.divisions (name, description, is_active) VALUES
  ('Patrol', 'Patrol Division', true),
  ('Investigations', 'Criminal Investigations', true),
  ('Traffic', 'Traffic Division', true),
  ('SWAT', 'Special Weapons and Tactics', true),
  ('Narcotics', 'Narcotics Division', true),
  ('Administration', 'Administrative Division', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. Prüfe ob die Policies korrekt erstellt wurden
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('rank_definitions', 'divisions')
ORDER BY tablename, policyname;
