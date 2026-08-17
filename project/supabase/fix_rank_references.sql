-- fix_rank_references.sql
-- Führe dieses SQL im Supabase SQL Editor aus, um Rank-Referenzen zu korrigieren.

-- 1. Zeige zuerst die aktuellen Ränge
SELECT id, title, order_index, level FROM public.rank_definitions ORDER BY order_index;

-- 2. Update User ohne rank_id basierend auf ihrem rank-String
-- WICHTIG: Cast zu text, weil rank aktuell teilweise als smallint gespeichert sein kann.
UPDATE public.user u
SET rank_id = rd.id
FROM public.rank_definitions rd
WHERE u.rank_id IS NULL
  AND u.rank IS NOT NULL
  AND rd.title = u.rank::text
  AND rd.is_active = true;

-- 3. Wenn die rank-Definitionen anders heißen als die rank-Strings,
-- kannst du die Zuordnung hier manuell anpassen.
-- Beispiel:
-- UPDATE public.user SET rank_id = 'sergeant-uuid-hier' WHERE rank = 'Sergeant' AND rank_id IS NULL;

-- 4. Prüfe das Ergebnis
SELECT 
  u.id,
  u.firstname,
  u.lastname,
  u.rank as rank_string,
  u.rank_id,
  rd.title as rank_title
FROM public.user u
LEFT JOIN public.rank_definitions rd ON u.rank_id = rd.id
ORDER BY u.created_at DESC;
