-- add_message_read_status.sql
-- Führe dieses SQL im Supabase SQL Editor aus, um den Lese-Status für Nachrichten hinzuzufügen.

-- 1. Neue Spalte zur messages Tabelle hinzufügen
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT false;

-- 2. Index für bessere Performance bei ungelesenen Nachrichten
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON public.messages(receiver_id, read);

-- 3. Empfänger dürfen den Lesestatus ändern; Sender oder Empfänger dürfen löschen.
DROP POLICY IF EXISTS "update_messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated update messages" ON public.messages;
CREATE POLICY "Allow authenticated update messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "delete_messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated delete messages" ON public.messages;
CREATE POLICY "Allow authenticated delete messages" ON public.messages
  FOR DELETE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
