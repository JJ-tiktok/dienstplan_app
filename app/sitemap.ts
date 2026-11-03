import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/branding";
import { supabase } from "@/lib/supabase";
import { getMatchDateForComparison } from "@/lib/utils";

/** Stündlich neu erzeugen, damit neue Termine zeitnah auftauchen. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/legal/impressum`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/legal/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Nur kommende, nicht gelöschte Termine – vergangene haben keinen Suchwert.
  // Liest mit dem anon key, also unter denselben RLS-Regeln wie öffentliche Besucher.
  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, match_date, date")
    .is("deleted_at", null);

  if (error) {
    console.error("[sitemap] Termine konnten nicht geladen werden:", error.message);
    return entries;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (const match of matches ?? []) {
    const matchDate = getMatchDateForComparison(match.match_date, match.date);
    if (!matchDate || matchDate < today) continue;
    entries.push({
      url: `${siteUrl}/match/${match.id}`,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return entries;
}
