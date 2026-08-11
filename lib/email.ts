import { Resend } from 'resend';
import { APP_NAME, APP_NAME_SHORT, getAppUrl, getMailFrom } from '@/lib/branding';

/**
 * Resend client – Key zur Laufzeit lesen, damit Env in Server Actions/Vercel sicher ankommt
 */
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || !key.trim()) {
    console.warn('[Resend] RESEND_API_KEY fehlt oder ist leer. E-Mail wird nicht versendet.');
    return null;
  }
  return new Resend(key);
}

/**
 * HTML-Escaping für alles, was in ein Mail-Template interpoliert wird.
 *
 * Nutzer bestimmen ihren Namen selbst, Admins Dienst/Ort/Titel. Ohne Escaping
 * landet dieses Markup ungefiltert in der Mail – am kritischsten in der
 * Admin-Benachrichtigung, die den vom Nutzer gewählten Namen an den Admin
 * zustellt und sich so für Phishing mit verifiziertem Absender missbrauchen ließe.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Button „Zur Dienstplan-App“ – entfällt vollständig, wenn keine Basis-URL
 * konfiguriert ist, damit in der Mail kein toter Link steht.
 */
function renderAppLinkButton(appUrl: string | null, label: string): string {
  if (!appUrl) return '';
  return `
      <div style="margin: 30px 0; text-align: center;">
        <a
          href="${escapeHtml(appUrl)}"
          style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;"
        >
          ${escapeHtml(label)}
        </a>
      </div>`;
}

/** URL zur Detailseite eines Termins, oder zur Startseite wenn keine ID vorliegt. */
function getMatchUrl(matchId?: number | string): string | null {
  if (matchId == null) return getAppUrl();
  return getAppUrl(`/match/${encodeURIComponent(String(matchId))}`);
}

/**
 * Email template for confirmation when user signs up
 */
export function getConfirmationEmailHTML(
  name: string,
  service: string,
  matchTitle: string,
  date: string,
  time: string,
  location?: string,
  matchId?: number | string
): string {
  const adminEmail = process.env.ADMIN_EMAIL || 'den Administratoren';
  const appUrl = getMatchUrl(matchId);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e293b; margin-bottom: 20px;">Hallo ${escapeHtml(name)},</h1>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
        Du bist eingetragen für <strong>${escapeHtml(service)}</strong> am <strong>${escapeHtml(date)}</strong>.
      </p>
      <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b; font-size: 18px;">
          ${escapeHtml(service)}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Spiel:</strong> ${escapeHtml(matchTitle)}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Datum:</strong> ${escapeHtml(date)}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Uhrzeit:</strong> ${escapeHtml(time)}
        </p>
        ${location ? `<p style="margin: 5px 0; color: #475569;"><strong>Ort:</strong> ${escapeHtml(location)}</p>` : ''}
      </div>
      <p style="color: #475569; line-height: 1.6;">
        Wir freuen uns auf deinen Einsatz! 🏆
      </p>${renderAppLinkButton(appUrl, 'Zur Dienstplan-App')}
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        Mit sportlichen Grüßen,<br>
        ${escapeHtml(APP_NAME_SHORT)}
      </p>
      <div style="border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 20px;">
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;">
          Falls du diese Mail fälschlicherweise erhalten hast und dich nicht zum Dienst registriert hast, melde dich bitte umgehend bei: <a href="mailto:${escapeHtml(adminEmail)}" style="color: #64748b; text-decoration: underline;">${escapeHtml(adminEmail)}</a>
        </p>
      </div>
    </div>
  `;
}

/**
 * Email template for cancellation when admin removes user
 */
export function getCancellationEmailHTML(
  name: string,
  service: string,
  matchTitle: string,
  date: string
): string {
  const adminEmail = process.env.ADMIN_EMAIL || 'den Administratoren';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e293b; margin-bottom: 20px;">Hallo ${escapeHtml(name)},</h1>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
        Du wurdest aus dem Dienst <strong>${escapeHtml(service)}</strong> ausgetragen.
      </p>
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b; font-size: 18px;">
          ${escapeHtml(service)}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Spiel:</strong> ${escapeHtml(matchTitle)}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Datum:</strong> ${escapeHtml(date)}
        </p>
      </div>
      <p style="color: #475569; line-height: 1.6;">
        Vielen Dank für dein Verständnis.
      </p>
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        Mit sportlichen Grüßen,<br>
        ${escapeHtml(APP_NAME_SHORT)}
      </p>
      <div style="border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 20px;">
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;">
          Falls du diese Mail fälschlicherweise erhalten hast und dich nicht zum Dienst registriert hast, melde dich bitte umgehend bei: <a href="mailto:${escapeHtml(adminEmail)}" style="color: #64748b; text-decoration: underline;">${escapeHtml(adminEmail)}</a>
        </p>
      </div>
    </div>
  `;
}

/**
 * Send confirmation email
 */
export async function sendConfirmationEmail(
  to: string,
  name: string,
  service: string,
  matchTitle: string,
  date: string,
  time: string,
  location?: string,
  matchId?: number | string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    throw new Error('RESEND_API_KEY fehlt oder ist leer. E-Mails werden nicht versendet.');
  }

  const appUrl = getMatchUrl(matchId);
  if (!appUrl) {
    console.warn(
      '[Mail] Weder NEXT_PUBLIC_SITE_URL noch GASTRO_PUBLIC_URL gesetzt – Bestätigungs-Mail wird ohne Link zur App versendet.'
    );
  }

  try {
    const { error } = await resend.emails.send({
      from: getMailFrom(),
      to,
      subject: `Bestätigung: Dein Dienst — ${APP_NAME_SHORT}`,
      html: getConfirmationEmailHTML(name, service, matchTitle, date, time, location, matchId),
      text: `
Hallo ${name},

Du bist eingetragen für ${service} am ${date}.

Spiel: ${matchTitle}
Datum: ${date}
Uhrzeit: ${time}
${location ? `Ort: ${location}` : ''}

Wir freuen uns auf deinen Einsatz! 🏆
${appUrl ? `\nZur Dienstplan-App: ${appUrl}\n` : ''}
Mit sportlichen Grüßen,
${APP_NAME_SHORT}

---
Falls du diese Mail fälschlicherweise erhalten hast und dich nicht zum Dienst registriert hast, melde dich bitte umgehend bei: ${process.env.ADMIN_EMAIL || 'den Administratoren'}
      `.trim(),
    });
    if (error) {
      console.error('[Resend] Bestätigungs-Mail fehlgeschlagen:', error);
      throw new Error(error.message || 'Resend API Fehler');
    }
    console.info('[Resend] Bestätigungs-Mail gesendet an', to);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
}

/**
 * Send cancellation email
 */
export async function sendCancellationEmail(
  to: string,
  name: string,
  service: string,
  matchTitle: string,
  date: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  try {
    const { error } = await resend.emails.send({
      from: getMailFrom(),
      to,
      subject: `Stornierung: Dein Dienst — ${APP_NAME_SHORT}`,
      html: getCancellationEmailHTML(name, service, matchTitle, date),
      text: `
Hallo ${name},

Du wurdest aus dem Dienst ${service} ausgetragen.

Spiel: ${matchTitle}
Datum: ${date}

Vielen Dank für dein Verständnis.

Mit sportlichen Grüßen,
${APP_NAME_SHORT}

---
Falls du diese Mail fälschlicherweise erhalten hast und dich nicht zum Dienst registriert hast, melde dich bitte umgehend bei: ${process.env.ADMIN_EMAIL || 'den Administratoren'}
      `.trim(),
    });
    if (error) {
      console.error('[Resend] Stornierungs-Mail fehlgeschlagen:', error);
      throw new Error(error.message || 'Resend API Fehler');
    }
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    throw error;
  }
}

/**
 * Email template for admin cancellation notification
 */
export function getAdminCancellationNotificationHTML(
  userName: string,
  category: string,
  matchDate: string,
  matchOpponent: string,
  adminDashboardUrl: string | null
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc2626; margin-bottom: 20px;">⚠️ Stornierungsanfrage</h1>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
        <strong>${escapeHtml(userName)}</strong> möchte seinen Dienst stornieren.
      </p>
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b; font-size: 18px;">
          ${escapeHtml(category)}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Spiel:</strong> vs. ${escapeHtml(matchOpponent)}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Datum:</strong> ${escapeHtml(matchDate)}
        </p>
      </div>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
        Bitte prüfe die Anfrage im Admin-Dashboard und entferne den Nutzer, wenn die Stornierung bestätigt ist.
      </p>${renderAppLinkButton(adminDashboardUrl, 'Zum Admin-Dashboard')}
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        Mit sportlichen Grüßen,<br>
        ${escapeHtml(APP_NAME)}
      </p>
    </div>
  `;
}

/**
 * Send admin notification email when a user requests cancellation
 */
export async function sendAdminCancellationNotification(
  userName: string,
  category: string,
  matchDate: string,
  matchOpponent: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL environment variable is not set. Skipping admin notification.');
    return;
  }

  const resend = getResend();
  if (!resend) return;

  const adminDashboardUrl = getAppUrl('/admin');
  if (!adminDashboardUrl) {
    console.warn(
      '[Mail] Weder NEXT_PUBLIC_SITE_URL noch GASTRO_PUBLIC_URL gesetzt – Admin-Benachrichtigung wird ohne Dashboard-Link versendet.'
    );
  }

  try {
    const { error } = await resend.emails.send({
      from: getMailFrom(),
      to: adminEmail,
      subject: `⚠️ Stornierungsanfrage: ${userName}`,
      html: getAdminCancellationNotificationHTML(
        userName,
        category,
        matchDate,
        matchOpponent,
        adminDashboardUrl
      ),
      text: `
⚠️ Stornierungsanfrage

${userName} möchte seinen Dienst stornieren.

Dienst: ${category}
Spiel: vs. ${matchOpponent}
Datum: ${matchDate}

Bitte prüfe die Anfrage im Admin-Dashboard und entferne den Nutzer, wenn die Stornierung bestätigt ist.
${adminDashboardUrl ? `\nAdmin-Dashboard: ${adminDashboardUrl}\n` : ''}
Mit sportlichen Grüßen,
${APP_NAME}
      `.trim(),
    });
    if (error) {
      console.error('[Resend] Admin-Benachrichtigung fehlgeschlagen:', error);
      throw new Error(error.message || 'Resend API Fehler');
    }
  } catch (error) {
    console.error('Failed to send admin cancellation notification:', error);
    throw error;
  }
}

/**
 * Check if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
