ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_messages_receiver_read
  ON public.messages(receiver_id, read);

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
