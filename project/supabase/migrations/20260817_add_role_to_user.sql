-- Add role column to user table
-- This allows for user role management (admin, officer, etc.)

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'officer';

-- Add check constraint to ensure only valid roles
ALTER TABLE "user" ADD CONSTRAINT "valid_role" CHECK (role IN ('officer', 'admin', 'supervisor'));

-- Optional: Update RLS policies to account for admin privileges
-- Admins can read all user records (not just their own)
DROP POLICY IF EXISTS "select_own_user" ON "user";
CREATE POLICY "select_own_user_or_admin" ON "user" FOR SELECT
  TO authenticated USING (auth.uid() = id OR (SELECT role FROM "user" WHERE id = auth.uid()) = 'admin');

-- Admins can update other users' records
DROP POLICY IF EXISTS "update_own_user" ON "user";
CREATE POLICY "update_own_or_admin_user" ON "user" FOR UPDATE
  TO authenticated USING (
    auth.uid() = id OR (SELECT role FROM "user" WHERE id = auth.uid()) = 'admin'
  ) WITH CHECK (
    auth.uid() = id OR (SELECT role FROM "user" WHERE id = auth.uid()) = 'admin'
  );

-- Note: For deleting, only keep it restricted to own user for safety
-- Admins should use a separate procedure if needed

COMMENT ON COLUMN "user".role IS 'User role: officer, admin, or supervisor';
