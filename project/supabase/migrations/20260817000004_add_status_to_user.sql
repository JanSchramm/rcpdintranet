-- Add status column to user table for user approval management
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Add check constraint to ensure only valid statuses
ALTER TABLE "user" ADD CONSTRAINT "valid_status" CHECK (status IN ('pending', 'approved', 'rejected'));

COMMENT ON COLUMN "user".status IS 'User approval status: pending, approved, or rejected';
