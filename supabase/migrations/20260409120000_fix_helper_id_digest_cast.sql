-- Fix 42883: digest/encode aus pgcrypto bricht mit search_path oft ab (extensions-Schema).
-- Lösung: pg_catalog.md5(text) — keine Extension, gleiche Normalisierung wie book_slot.

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
