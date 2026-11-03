import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminSupabase } from '@/lib/supabase-admin';
import { getMatchDisplayDate } from '@/lib/utils';
import { getMatchPublicTitle, MATCH_WITH_CATEGORY_SELECT } from '@/lib/match-display';
import type { Match } from '@/types';
import { sendCancellationEmail, isValidEmail } from '@/lib/email';

/**
 * Admin trägt einen Nutzer aus einem Slot aus und benachrichtigt ihn per Mail.
 *
 * Ersetzt die frühere Server Action `adminRemoveUser`: Server Actions sind
 * öffentliche POST-Endpunkte, deren ID im Client-Bundle steht – ohne Auth-Prüfung
 * konnte damit jeder Besucher beliebige Helfer austragen. Hier greift requireAdmin.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await request.json();
    const slotId = Number(body?.slotId ?? body?.id);
    if (!slotId) {
      return NextResponse.json({ success: false, error: 'Slot-ID fehlt' }, { status: 400 });
    }

    const { data: slot, error: slotError } = await adminSupabase
      .from('slots')
      .select(`
        id,
        category,
        user_name,
        user_contact,
        match_id,
        match:matches(${MATCH_WITH_CATEGORY_SELECT})
      `)
      .eq('id', slotId)
      .single();

    if (slotError || !slot) {
      return NextResponse.json({ success: false, error: 'Slot nicht gefunden' }, { status: 404 });
    }

    if (!slot.user_name) {
      return NextResponse.json({ success: false, error: 'Dieser Slot ist nicht belegt' }, { status: 400 });
    }

    const userName = slot.user_name || 'Helfer';
    const userContact = slot.user_contact ? slot.user_contact.trim().toLowerCase() : null;
    const matchRaw = Array.isArray(slot.match) ? slot.match[0] : slot.match;
    const match = matchRaw as Match | null | undefined;

    const { error: updateError } = await adminSupabase
      .from('slots')
      .update({
        user_name: null,
        user_contact: null,
        cancellation_requested: false,
      })
      .eq('id', slotId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Fehler beim Entfernen. Bitte erneut versuchen.' },
        { status: 500 }
      );
    }

    if (match && userContact && isValidEmail(userContact)) {
      try {
        const formattedDate = getMatchDisplayDate(match.match_date, match.date);
        const matchTitle = getMatchPublicTitle(match);
        await sendCancellationEmail(userContact, userName, slot.category, matchTitle, formattedDate);
      } catch (emailError) {
        // Austragung war erfolgreich – Mail-Fehler nur loggen
        console.error('[remove-user] Stornierungs-Mail fehlgeschlagen:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Ungültige Anfrage' }, { status: 400 });
  }
}
