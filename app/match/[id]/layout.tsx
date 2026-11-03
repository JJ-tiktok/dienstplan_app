import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { getMatchDisplayDate } from "@/lib/utils";
import { getMatchPublicTitle, MATCH_WITH_CATEGORY_SELECT } from "@/lib/match-display";
import type { Match } from "@/types";

type Props = { params: Promise<{ id: string }> };

/** Titel und Beschreibung je Termin – die Seite selbst ist eine Client-Komponente. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isInteger(matchId) || matchId <= 0) {
    return { title: "Termin nicht gefunden", robots: { index: false } };
  }

  const { data } = await supabase
    .from("matches")
    .select(MATCH_WITH_CATEGORY_SELECT)
    .eq("id", matchId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) {
    return { title: "Termin nicht gefunden", robots: { index: false } };
  }

  const match = data as Match;
  const title = getMatchPublicTitle(match);
  const date = getMatchDisplayDate(match.match_date, match.date);
  const where = match.location?.trim() ? ` in ${match.location.trim()}` : "";
  const description = `${title} am ${date}${where}: Freie Dienste ansehen und direkt eintragen.`;

  return {
    title,
    description,
    alternates: { canonical: `/match/${matchId}` },
    openGraph: { title, description, url: `/match/${matchId}` },
    twitter: { title, description },
  };
}

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
