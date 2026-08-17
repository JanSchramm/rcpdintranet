-- check_rank_references.sql
-- Führe dieses SQL im Supabase SQL Editor aus, um die Rank-Referenzen zu prüfen.

-- 1. Zeige alle Users mit ihren Rang-Informationen
SELECT 
  u.id,
  u.firstname,
  u.lastname,
  u.rank as rank_string,
  u.rank_id,
  rd.title as rank_definition_title,
  rd.order_index,
  rd.level
FROM public.user u
LEFT JOIN public.rank_definitions rd ON u.rank_id = rd.id
ORDER BY rd.order_index ASC NULLS LAST, u.lastname ASC;

-- 2. Zeige Users ohne rank_id
SELECT 
  id,
  firstname,
  lastname,
  rank as rank_string
FROM public.user
WHERE rank_id IS NULL
ORDER BY created_at DESC;

-- 3. Zeige alle verfügbaren Ränge
SELECT 
  id,
  title,
  order_index,
  level,
  is_active
FROM public.rank_definitions
ORDER BY order_index ASC;
