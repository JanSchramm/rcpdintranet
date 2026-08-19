-- add_message_read_status.sql
-- Führe dieses SQL im Supabase SQL Editor aus, um den Lese-Status für Nachrichten hinzuzufügen.

-- 1. Neue Spalte zur messages Tabelle hinzufügen
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT false;

-- 2. Index für bessere Performance bei ungelesenen Nachrichten
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON public.messages(receiver_id, read);

-- 3. RLS Policy anpassen, damit Admins/Supervisors Nachrichten als gelesen markieren können
DROP POLICY IF EXISTS "Allow authenticated update messages" ON public.messages;
CREATE POLICY "Allow authenticated update messages" ON public.messages
  FOR UPDATE TO authenticated USING (true);
