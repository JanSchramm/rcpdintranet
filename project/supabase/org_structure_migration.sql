-- org_structure_migration.sql
-- Führe dieses SQL im Supabase SQL Editor aus.

-- 1. Ränge Tabelle
CREATE TABLE IF NOT EXISTS public.rank_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Divisions Tabelle
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Bestehende user Tabelle anpassen
-- rank_id als Foreign Key hinzufügen (optional, für spätere Migration)
ALTER TABLE public.user
  ADD COLUMN IF NOT EXISTS rank_id UUID REFERENCES public.rank_definitions(id) ON DELETE SET NULL;

-- 4. Indizes
CREATE INDEX IF NOT EXISTS idx_rank_definitions_order ON public.rank_definitions(order_index, level);
CREATE INDEX IF NOT EXISTS idx_rank_definitions_active ON public.rank_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_divisions_active ON public.divisions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_rank_id ON public.user(rank_id);

-- 5. RLS Policies
ALTER TABLE public.rank_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

-- Alle eingeloggten User können Ränge lesen
DROP POLICY IF EXISTS "Allow authenticated read rank_definitions" ON public.rank_definitions;
CREATE POLICY "Allow authenticated read rank_definitions" ON public.rank_definitions
  FOR SELECT TO authenticated USING (true);

-- Nur Admins/Supervisors können Ränge verwalten
DROP POLICY IF EXISTS "Allow admin manage rank_definitions" ON public.rank_definitions;
CREATE POLICY "Allow admin manage rank_definitions" ON public.rank_definitions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'supervisor')
    )
  );

-- Alle eingeloggten User können Divisions lesen
DROP POLICY IF EXISTS "Allow authenticated read divisions" ON public.divisions;
CREATE POLICY "Allow authenticated read divisions" ON public.divisions
  FOR SELECT TO authenticated USING (true);

-- Nur Admins/Supervisors können Divisions verwalten
DROP POLICY IF EXISTS "Allow admin manage divisions" ON public.divisions;
CREATE POLICY "Allow admin manage divisions" ON public.divisions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'supervisor')
    )
  );

-- 6. Trigger für updated_at
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
