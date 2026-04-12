-- Event-Kategorien (Stammdaten) + Zuordnung pro Termin (match)

CREATE TABLE public.event_categories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  ui_profile text NOT NULL CHECK (ui_profile IN ('sport', 'community_event')),
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO public.event_categories (name, slug, ui_profile, sort_order) VALUES
  ('Fußball', 'fussball', 'sport', 0),
  ('Gemeinde-Dienst', 'gemeinde', 'community_event', 1);

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS event_category_id bigint REFERENCES public.event_categories (id);

UPDATE public.matches m
SET event_category_id = (SELECT id FROM public.event_categories WHERE slug = 'fussball' LIMIT 1)
WHERE m.event_category_id IS NULL;

ALTER TABLE public.matches
  ALTER COLUMN event_category_id SET NOT NULL;

GRANT SELECT ON public.event_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_categories TO authenticated;
GRANT ALL ON public.event_categories TO service_role;

ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_categories_select_anon
  ON public.event_categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY event_categories_all_authenticated
  ON public.event_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
