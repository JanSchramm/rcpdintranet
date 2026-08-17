-- seed_sample_officers.sql
-- Führe dieses SQL aus, um Beispiel-Officers zu erstellen.
-- Ersetze zuerst 'DEINE_USER_ID_HIER' durch echte Supabase Auth User IDs.
-- Du kannst User IDs aus der 'user' Tabelle oder vom Auth callback holen.

-- Beispiel für einen neuen Officer (ersetze die ID):
-- INSERT INTO public.user (id, firstname, lastname, badgenumber, rank, division, role, status, discipline_points)
-- VALUES ('echte-uuid-hier', 'Max', 'Mustermann', '4567', 'Sergeant', '{"Patrol"}', 'officer', 'approved', 0)
-- ON CONFLICT (id) DO NOTHING;

-- WICHTIG: Damit die Organigramm-Anzeige funktioniert, müssen die Officers
-- entweder einen rank_id haben (wenn Ränge in rank_definitions existieren)
-- oder einen rank-String, der mit einem Titel in rank_definitions übereinstimmt.
