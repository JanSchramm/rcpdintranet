/*
# Add created_by column to events table

## Changes
- Adds created_by (uuid) column with FK to user table
- Updates RLS policies to restrict edit/delete to creator or supervisor/admin
*/

-- Add created_by column
ALTER TABLE events ADD COLUMN created_by uuid REFERENCES "user"(id) ON DELETE SET NULL;

-- Update RLS policies for more restrictive access control
DROP POLICY IF EXISTS "update_events" ON events;
CREATE POLICY "update_events" ON events FOR UPDATE
  TO authenticated USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id = auth.uid() 
      AND role IN ('supervisor', 'admin')
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id = auth.uid() 
      AND role IN ('supervisor', 'admin')
    )
  );

DROP POLICY IF EXISTS "delete_events" ON events;
CREATE POLICY "delete_events" ON events FOR DELETE
  TO authenticated USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id = auth.uid() 
      AND role IN ('supervisor', 'admin')
    )
  );

-- Update INSERT policy to automatically set created_by
DROP POLICY IF EXISTS "insert_events" ON events;
CREATE POLICY "insert_events" ON events FOR INSERT
  TO authenticated WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- Add index for created_by lookups
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
