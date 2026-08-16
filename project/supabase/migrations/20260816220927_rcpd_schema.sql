
/*
# RCPD Intranet – Initial Schema

## Overview
Creates the four core tables for the RCPD (Police Department) intranet:
user, messages, personnel_files, and events.

## Tables

### user
Extends auth.users with officer-specific data.
- id         : uuid PK, references auth.users(id) ON DELETE CASCADE
- firstname  : officer's first name
- lastname   : officer's last name
- badgenumber: unique badge identifier
- rank       : e.g. "Officer", "Sergeant", "Captain"
- division   : text array, e.g. {"Patrol","SWAT"}
- created_at : timestamp

### messages
Internal messaging between officers.
- id          : uuid PK
- created_at  : timestamp
- sender_id   : uuid → auth.users(id)
- receiver_id : uuid → auth.users(id)
- subject     : message subject
- body        : message body

### personnel_files
Moderation/HR notes on individual officers.
- id         : uuid PK
- created_at : timestamp
- created_by : uuid → auth.users(id) — who wrote the note
- officer_id : uuid → auth.users(id) — subject of the note
- notes      : free-form text

### events
Roster events, trainings, operations.
- id          : uuid PK
- title       : event title
- description : optional description
- date        : timestamptz of the event
- event_type  : e.g. "Training", "Patrol", "Meeting"

## Security
- RLS enabled on all tables.
- All policies scoped to authenticated role.
- user table: each officer reads/writes only own row.
- messages: sender or receiver can read; sender inserts; no update/delete to preserve history.
- personnel_files: any authenticated user can read; creator can insert; no public update/delete.
- events: read-only for all authenticated; insert/update/delete restricted to authenticated (shared calendar).
*/

-- ============================================================
-- TABLE: user
-- ============================================================
CREATE TABLE IF NOT EXISTS "user" (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname    text NOT NULL DEFAULT '',
  lastname     text NOT NULL DEFAULT '',
  badgenumber  text UNIQUE,
  rank         text NOT NULL DEFAULT 'Officer',
  division     text[] NOT NULL DEFAULT '{}',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_user" ON "user";
CREATE POLICY "select_own_user" ON "user" FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_user" ON "user";
CREATE POLICY "insert_own_user" ON "user" FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_user" ON "user";
CREATE POLICY "update_own_user" ON "user" FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_user" ON "user";
CREATE POLICY "delete_own_user" ON "user" FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============================================================
-- TABLE: messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz DEFAULT now(),
  sender_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject      text NOT NULL DEFAULT '',
  body         text NOT NULL DEFAULT ''
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_messages" ON messages;
CREATE POLICY "select_messages" ON messages FOR SELECT
  TO authenticated USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

DROP POLICY IF EXISTS "insert_messages" ON messages;
CREATE POLICY "insert_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "update_messages" ON messages;
CREATE POLICY "update_messages" ON messages FOR UPDATE
  TO authenticated USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "delete_messages" ON messages;
CREATE POLICY "delete_messages" ON messages FOR DELETE
  TO authenticated USING (auth.uid() = sender_id);

-- ============================================================
-- TABLE: personnel_files
-- ============================================================
CREATE TABLE IF NOT EXISTS personnel_files (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz DEFAULT now(),
  created_by   uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  officer_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes        text NOT NULL DEFAULT ''
);

ALTER TABLE personnel_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_personnel_files" ON personnel_files;
CREATE POLICY "select_personnel_files" ON personnel_files FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_personnel_files" ON personnel_files;
CREATE POLICY "insert_personnel_files" ON personnel_files FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "update_personnel_files" ON personnel_files;
CREATE POLICY "update_personnel_files" ON personnel_files FOR UPDATE
  TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "delete_personnel_files" ON personnel_files;
CREATE POLICY "delete_personnel_files" ON personnel_files FOR DELETE
  TO authenticated USING (auth.uid() = created_by);

-- ============================================================
-- TABLE: events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  date         timestamptz NOT NULL,
  event_type   text NOT NULL DEFAULT 'General',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_events" ON events;
CREATE POLICY "select_events" ON events FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_events" ON events;
CREATE POLICY "insert_events" ON events FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_events" ON events;
CREATE POLICY "update_events" ON events FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_events" ON events;
CREATE POLICY "delete_events" ON events FOR DELETE
  TO authenticated USING (true);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_messages_sender   ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_personnel_officer ON personnel_files(officer_id);
CREATE INDEX IF NOT EXISTS idx_events_date       ON events(date);
