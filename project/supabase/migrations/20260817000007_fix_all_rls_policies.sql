/*
# Comprehensive RLS Policy Fix

## Problem
1. personnel_files: RLS policy blocking inserts despite trigger
2. events: RLS policy too restrictive for edit/delete

## Solution
- Rebuild all policies from scratch
- Use SECURITY DEFINER functions where needed
- Ensure trigger sets created_by before policy check
*/

-- ============================================================
-- FIX: personnel_files RLS
-- ============================================================

-- Ensure trigger function exists and is correct
CREATE OR REPLACE FUNCTION set_personnel_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all old policies
DROP POLICY IF EXISTS "select_personnel_files" ON personnel_files;
DROP POLICY IF EXISTS "insert_personnel_files" ON personnel_files;
DROP POLICY IF EXISTS "update_personnel_files" ON personnel_files;
DROP POLICY IF EXISTS "delete_personnel_files" ON personnel_files;

-- Create clean new policies
CREATE POLICY "personnel_files_select" ON personnel_files
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "personnel_files_insert" ON personnel_files
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "personnel_files_update" ON personnel_files
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "personnel_files_delete" ON personnel_files
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- Recreate trigger (with BEFORE INSERT timing)
DROP TRIGGER IF EXISTS set_personnel_created_by_trigger ON personnel_files;
CREATE TRIGGER set_personnel_created_by_trigger
BEFORE INSERT ON personnel_files
FOR EACH ROW
EXECUTE FUNCTION set_personnel_created_by();

-- ============================================================
-- FIX: events RLS with admin/supervisor bypass
-- ============================================================

-- Create function to check if user is admin or supervisor
CREATE OR REPLACE FUNCTION is_admin_or_supervisor()
RETURNS boolean AS $$
SELECT EXISTS (
  SELECT 1 FROM "user"
  WHERE id = auth.uid()
  AND role IN ('admin', 'supervisor')
);
$$ LANGUAGE sql SECURITY DEFINER;

-- Ensure trigger for events created_by
CREATE OR REPLACE FUNCTION set_events_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all old policies on events
DROP POLICY IF EXISTS "select_events" ON events;
DROP POLICY IF EXISTS "insert_events" ON events;
DROP POLICY IF EXISTS "update_events" ON events;
DROP POLICY IF EXISTS "delete_events" ON events;

-- Create clean new policies
CREATE POLICY "events_select" ON events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "events_insert" ON events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "events_update" ON events
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = created_by OR is_admin_or_supervisor()
  )
  WITH CHECK (
    auth.uid() = created_by OR is_admin_or_supervisor()
  );

CREATE POLICY "events_delete" ON events
  FOR DELETE TO authenticated
  USING (
    auth.uid() = created_by OR is_admin_or_supervisor()
  );

-- Recreate trigger for events
DROP TRIGGER IF EXISTS set_events_created_by_trigger ON events;
CREATE TRIGGER set_events_created_by_trigger
BEFORE INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION set_events_created_by();
