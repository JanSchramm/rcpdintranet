-- Add created_at column to user table if it doesn't exist
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

COMMENT ON COLUMN "user".created_at IS 'Timestamp when the user was created';
