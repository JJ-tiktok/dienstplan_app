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
  const appUrl = getAppUrl(matchId != null ? `/match/${matchId}` : '');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e293b; margin-bottom: 20px;">Hallo ${name},</h1>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
        Du bist eingetragen für <strong>${service}</strong> am <strong>${date}</strong>.
      </p>
      <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b; font-size: 18px;">
          ${service}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Spiel:</strong> ${matchTitle}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Datum:</strong> ${date}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Uhrzeit:</strong> ${time}
        </p>
        ${location ? `<p style="margin: 5px 0; color: #475569;"><strong>Ort:</strong> ${location}</p>` : ''}
      </div>
      <p style="color: #475569; line-height: 1.6;">
        Wir freuen uns auf deinen Einsatz! 🏆
      </p>
      <div style="margin: 30px 0; text-align: center;">
        <a
          href="${appUrl}"
          style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;"
        >
          Zur Dienstplan-App
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        Mit sportlichen Grüßen,<br>
        ${APP_NAME_SHORT}
      </p>
      <div style="border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 20px;">
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;">
          Falls du diese Mail fälschlicherweise erhalten hast und dich nicht zum Dienst registriert hast, melde dich bitte umgehend bei: <a href="mailto:${adminEmail}" style="color: #64748b; text-decoration: underline;">${adminEmail}</a>
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
      <h1 style="color: #1e293b; margin-bottom: 20px;">Hallo ${name},</h1>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
        Du wurdest aus dem Dienst <strong>${service}</strong> ausgetragen.
      </p>
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b; font-size: 18px;">
          ${service}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Spiel:</strong> ${matchTitle}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Datum:</strong> ${date}
        </p>
      </div>
      <p style="color: #475569; line-height: 1.6;">
        Vielen Dank für dein Verständnis.
      </p>
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        Mit sportlichen Grüßen,<br>
        ${APP_NAME_SHORT}
      </p>
      <div style="border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 20px;">
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;">
          Falls du diese Mail fälschlicherweise erhalten hast und dich nicht zum Dienst registriert hast, melde dich bitte umgehend bei: <a href="mailto:${adminEmail}" style="color: #64748b; text-decoration: underline;">${adminEmail}</a>
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

  const appUrl = getAppUrl(matchId != null ? `/match/${matchId}` : '');

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

Zur Dienstplan-App: ${appUrl}

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
  adminDashboardUrl: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc2626; margin-bottom: 20px;">⚠️ Stornierungsanfrage</h1>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
        <strong>${userName}</strong> möchte seinen Dienst stornieren.
      </p>
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b; font-size: 18px;">
          ${category}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Spiel:</strong> vs. ${matchOpponent}
        </p>
        <p style="margin: 5px 0; color: #475569;">
          <strong>Datum:</strong> ${matchDate}
        </p>
      </div>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
        Bitte prüfe die Anfrage im Admin-Dashboard und entferne den Nutzer, wenn die Stornierung bestätigt ist.
      </p>
      <div style="margin: 30px 0; text-align: center;">
        <a 
          href="${adminDashboardUrl}" 
          style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;"
        >
          Zum Admin-Dashboard
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        Mit sportlichen Grüßen,<br>
        ${APP_NAME}
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

  const baseUrl = process.env.GASTRO_PUBLIC_URL || '';
  const adminDashboardUrl = baseUrl ? `${baseUrl}/admin` : '/admin';

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

Admin-Dashboard: ${adminDashboardUrl}

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
