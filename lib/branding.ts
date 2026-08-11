/**
 * Zentrale, kundenneutrale Bezeichnungen für die App.
 */

export const APP_NAME = 'Veranstaltungsplaner Thomm';
export const APP_NAME_SHORT = 'Veranstaltungsplaner Thomm';

/** Für <title>, Alt-Texte, Kalender PRODID */
export const SITE_TITLE = APP_NAME;

/** Kurzbeschreibung für Meta-Tags (SEO, Freigabe-Vorschau) */
export const SITE_DESCRIPTION =
  'Termine einplanen, Dienste vergeben und Helfer per E-Mail informieren — der Veranstaltungsplaner Thomm für Vereine und Teams.';

/** Einheitliche Title-Struktur für Unterseiten: „Seite | Veranstaltungsplaner Thomm“ */
export const SITE_TITLE_TEMPLATE = `%s | ${APP_NAME}`;

/**
 * Resend-Absender — muss eine Adresse auf einer in Resend verifizierten Domain sein.
 * ADMIN_EMAIL allein zählt nicht; ohne diesen Wert wird onboarding@resend.dev genutzt (nur Test → 403 an Fremd-Adressen).
 *
 * .env: EMAIL_FROM="Name <noreply@eure-domain.de>" oder RESEND_FROM=…
 */
export function getMailFrom(): string {
  const from =
    process.env.EMAIL_FROM?.trim() || process.env.RESEND_FROM?.trim();
  if (from) return from;
  return `${APP_NAME} <onboarding@resend.dev>`;
}

/** Domain-ähnlicher Suffix für iCalendar-UIDs (kein echtes E-Mail-Postfach nötig) */
export const ICAL_UID_DOMAIN = 'veranstaltungsplaner-thomm.local';

/**
 * Öffentliche Basis-URL der App, z. B. für Links in E-Mails.
 * .env: NEXT_PUBLIC_SITE_URL (bevorzugt, auch für Metadata genutzt) oder GASTRO_PUBLIC_URL
 */
export function getAppUrl(path: string = ''): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.GASTRO_PUBLIC_URL || '').replace(/\/$/, '');
  if (!path) return base || '/';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalizedPath}` : normalizedPath;
}
