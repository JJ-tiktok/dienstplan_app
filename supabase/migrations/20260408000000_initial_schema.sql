-- Dienstplan-App: vollständiges Schema für ein neues Supabase-Projekt
-- Rekonstruiert aus types/, App-Queries und den bestehenden SQL-Patches.
-- Ausführung: Supabase Dashboard → SQL Editor, oder: supabase db push / link

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------
CREATE TABLE public.matches (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  opponent text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  team text,
  deleted_at timestamptz,
  match_date date,
  kickoff_at timestamptz
);

CREATE TABLE public.service_types (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  default_count integer NOT NULL DEFAULT 1
);

CREATE TABLE public.service_type_members (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  service_type_id bigint NOT NULL REFERENCES public.service_types (id) ON DELETE CASCADE,
  name text NOT NULL,
  "order" integer NOT NULL DEFAULT 0
);

CREATE TABLE public.slots (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  match_id bigint NOT NULL REFERENCES public.matches (id) ON DELETE CASCADE,
  category text NOT NULL,
  time text NOT NULL,
  user_name text,
  user_contact text,
  cancellation_requested boolean NOT NULL DEFAULT false,
  helper_id text,
  duration_minutes integer
);

CREATE INDEX idx_slots_match_id ON public.slots (match_id);
CREATE INDEX idx_slots_helper_id ON public.slots (helper_id) WHERE helper_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Pseudonym helper_id: MD5 über normalisierte E-Mail (Kernfunktion md5, kein pgcrypto)
-- Gleiche Normalisierung wie book_slot: lower(trim(...))
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_slot_helper_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.user_contact IS NOT NULL AND length(trim(NEW.user_contact)) > 0 THEN
    NEW.helper_id := md5(lower(trim(NEW.user_contact)));
  ELSE
    NEW.helper_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_slots_helper_id ON public.slots;
CREATE TRIGGER trg_slots_helper_id
  BEFORE INSERT OR UPDATE OF user_contact ON public.slots
  FOR EACH ROW
  EXECUTE FUNCTION public.set_slot_helper_id();

-- ---------------------------------------------------------------------------
-- Öffentliche Sicht ohne E-Mail (verhindert Leaks trotz breiter Tabellen-RLS)
-- ---------------------------------------------------------------------------
CREATE VIEW public.slots_public
WITH (security_invoker = false)
AS
SELECT
  id,
  match_id,
  category,
  time,
  user_name,
  cancellation_requested,
  helper_id,
  duration_minutes
FROM public.slots;

-- ---------------------------------------------------------------------------
-- Leaderboard-Aggregat (entspricht Logik in lib/leaderboard.ts)
-- ---------------------------------------------------------------------------
CREATE VIEW public.leaderboard_base
WITH (security_invoker = false)
AS
SELECT
  s.helper_id,
  sum(coalesce(s.duration_minutes, 0))::bigint AS total_minutes,
  sum(floor(coalesce(s.duration_minutes, 0)::numeric / 10))::bigint AS total_points,
  count(*)::bigint AS total_slots,
  max(m.match_date)::date AS last_match_date
FROM public.slots s
JOIN public.matches m ON m.id = s.match_id
WHERE s.helper_id IS NOT NULL
  AND s.cancellation_requested = false
  AND coalesce(s.duration_minutes, 0) > 0
GROUP BY s.helper_id;

-- ---------------------------------------------------------------------------
-- RPCs (Buchung / Austragen)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.book_slot(
  p_slot_id bigint,
  p_name text,
  p_email text
)
RETURNS TABLE(success boolean, slot_id bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.slots
    WHERE id = p_slot_id
      AND (user_contact IS NOT NULL OR user_name IS NOT NULL)
  ) THEN
    success := false;
    slot_id := p_slot_id;
    RETURN NEXT;
    RETURN;
  END IF;

  UPDATE public.slots
  SET
    user_name = trim(p_name),
    user_contact = lower(trim(p_email))
  WHERE id = p_slot_id;

  success := true;
  slot_id := p_slot_id;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.request_cancellation(
  p_slot_id bigint,
  p_email text,
  p_clear_contact boolean DEFAULT false
)
RETURNS TABLE(success boolean, slot_id bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact text;
BEGIN
  SELECT s.user_contact INTO v_contact
  FROM public.slots s
  WHERE s.id = p_slot_id;

  IF v_contact IS NULL OR lower(trim(v_contact)) <> lower(trim(p_email)) THEN
    success := false;
    slot_id := p_slot_id;
    RETURN NEXT;
    RETURN;
  END IF;

  UPDATE public.slots
  SET cancellation_requested = true
  WHERE id = p_slot_id;

  success := true;
  slot_id := p_slot_id;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_slot(bigint, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.book_slot(bigint, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.book_slot(bigint, text, text) TO service_role;

GRANT EXECUTE ON FUNCTION public.request_cancellation(bigint, text, boolean) TO anon;
GRANT EXECUTE ON FUNCTION public.request_cancellation(bigint, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_cancellation(bigint, text, boolean) TO service_role;

-- ---------------------------------------------------------------------------
-- Rechte (Lesen für öffentliche App)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.matches TO anon;
GRANT SELECT ON public.service_types TO anon;
GRANT SELECT ON public.service_type_members TO anon;
GRANT SELECT ON public.slots_public TO anon;
GRANT SELECT ON public.leaderboard_base TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_type_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.slots TO authenticated;
GRANT SELECT ON public.slots_public TO authenticated;
GRANT SELECT ON public.leaderboard_base TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_type_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

-- matches: öffentlich nur nicht-gelöscht; Admins (authenticated) alles
CREATE POLICY matches_select_anon
  ON public.matches FOR SELECT
  TO anon
  USING (deleted_at IS NULL);

CREATE POLICY matches_select_authenticated
  ON public.matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY matches_insert_authenticated
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY matches_update_authenticated
  ON public.matches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY matches_delete_authenticated
  ON public.matches FOR DELETE
  TO authenticated
  USING (true);

-- Stammdaten Dienste: öffentlich lesbar; Schreiben nur authenticated
CREATE POLICY service_types_select_anon
  ON public.service_types FOR SELECT TO anon USING (true);

CREATE POLICY service_types_all_authenticated
  ON public.service_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY service_type_members_select_anon
  ON public.service_type_members FOR SELECT TO anon USING (true);

CREATE POLICY service_type_members_all_authenticated
  ON public.service_type_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- slots: nur authenticated (Server Actions nutzen service_role und umgehen RLS)
CREATE POLICY slots_all_authenticated
  ON public.slots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Realtime (Dashboard subscribed auf public.slots)
-- ---------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.slots;
