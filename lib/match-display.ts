import type { EventUiProfile, Match } from '@/types';

/** Supabase `.select()` für Match inkl. Kategorie-Embed. */
export const MATCH_WITH_CATEGORY_SELECT =
  '*, event_categories ( id, name, slug, ui_profile, sort_order )';

export function getEventUiProfile(match: Match): EventUiProfile {
  const p = match.event_categories?.ui_profile;
  if (p === 'community_event' || p === 'sport') return p;
  return 'sport';
}

export function isSportMatch(match: Match): boolean {
  return getEventUiProfile(match) === 'sport';
}

/** Label für das opponent-Feld (nur UI). */
export function getOpponentFieldLabel(match: Match): string {
  return isSportMatch(match) ? 'Gegner / Gegenüber' : 'Bezeichnung / Titel';
}

/**
 * Öffentlicher Titel für Karten, Mails, iCal-Summary (eine zentrale Stelle).
 */
export function getMatchPublicTitle(match: Match): string {
  const opponent = match.opponent?.trim() || '';
  if (!isSportMatch(match)) {
    return opponent || 'Termin';
  }
  if (match.team?.trim()) {
    return `${match.team.trim()} vs. ${opponent}`;
  }
  return `Heimspiel vs. ${opponent}`;
}

/** Kurzbeschreibung für Kalender-Beschreibung o.ä. */
export function getMatchCalendarSummaryLine(match: Match): string {
  const title = getMatchPublicTitle(match);
  return `Dienstplan: ${title}`;
}
