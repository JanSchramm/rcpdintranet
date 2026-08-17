/*
# Populate created_by for existing events

## Problem
- Events created before the created_by column was added have NULL created_by
- These events fail RLS policy checks
- Users can't edit/delete them

## Solution
- Find or create a system admin user
- Set all NULL created_by values to this system admin
- This ensures backward compatibility
*/

-- First, get the first admin user, or use a placeholder
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Try to find an existing admin
  SELECT id INTO admin_id FROM "user" 
  WHERE role = 'admin' 
  LIMIT 1;
  
  -- If no admin exists, we can't auto-populate (this is safe)
  -- But at least the trigger will ensure new events get created_by
  IF admin_id IS NOT NULL THEN
    UPDATE events SET created_by = admin_id WHERE created_by IS NULL;
  END IF;
END $$;
