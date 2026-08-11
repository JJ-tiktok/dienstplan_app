# Veranstaltungsplaner Thomm

Next.js-App zur Planung von Veranstaltungen und zur Vergabe von Diensten: Helfer
tragen sich selbst in freie Dienste ein, bekommen eine Bestätigung per E-Mail und
zwei Tage vor dem Termin automatisch eine Erinnerung. Die Verwaltung von Terminen,
Dienstarten und Stornierungen läuft über einen geschützten Admin-Bereich.

Datenhaltung und Authentifizierung über [Supabase](https://supabase.com),
E-Mail-Versand über [Resend](https://resend.com), Deployment auf Vercel.

## Entwicklung

```bash
npm install
npm run dev
```

Die App läuft dann auf [http://localhost:3000](http://localhost:3000).

Weitere Skripte:

```bash
npm run build   # Produktions-Build
npm run lint    # ESLint
npx tsc --noEmit  # Typecheck
```

## Environment-Variablen

Lokal in einer `.env.local` ablegen, für Produktion in den Vercel Project Settings
hinterlegen. `.env.local` gehört **nicht** ins Repository.

### Erforderlich

| Variable | Zweck |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL des Supabase-Projekts. Wird auch im Browser verwendet. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Öffentlicher anon key. Zugriff wird über RLS-Policies begrenzt. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-Role-Key für Server Actions und Admin-API-Routen. **Niemals** im Browser verwenden oder mit `NEXT_PUBLIC_` präfixen. Fehlt er, fällt der Server-Client auf den anon key zurück und schreibende Aktionen scheitern an RLS (es wird beim Start gewarnt). |
| `RESEND_API_KEY` | API-Key für den E-Mail-Versand. Ohne ihn schlägt die Bestätigungs-Mail fehl. |
| `NEXT_PUBLIC_SITE_URL` | Öffentliche Basis-URL, z. B. `https://dienstplan.example.de`. Wird für `metadataBase` und für die Links in den E-Mails gebraucht. Fehlt sie, werden die Mails **ohne** Button verschickt, statt einen toten relativen Link zu enthalten. |
| `CRON_SECRET` | Schützt die Erinnerungs-Route. Ohne diese Variable antwortet `/api/cron/reminders` mit 401 und es werden **keine** Erinnerungen versendet. Vercel Cron sendet den passenden `Authorization`-Header automatisch, sobald die Variable gesetzt ist. |

### Optional

| Variable | Zweck |
| --- | --- |
| `EMAIL_FROM` | Absender, z. B. `Veranstaltungsplaner <noreply@eure-domain.de>`. Die Domain muss in Resend verifiziert sein. Ohne diesen Wert wird `onboarding@resend.dev` genutzt — das funktioniert nur im Test und liefert an fremde Adressen einen 403. |
| `RESEND_FROM` | Alternativer Name für `EMAIL_FROM`. |
| `ADMIN_EMAIL` | Empfänger der Stornierungs-Benachrichtigungen; erscheint außerdem als Kontaktadresse im Fußtext der Mails. |
| `ADMIN_API_SECRET` | Erlaubt den Zugriff auf die Admin-API per `x-admin-secret`-Header, ohne Login-Token. Nützlich für Skripte. |
| `GASTRO_PUBLIC_URL` | Historischer Vorgänger von `NEXT_PUBLIC_SITE_URL`; wird nur noch als Fallback gelesen. Für neue Setups nicht mehr nötig. |

## Datenbank

Das Basisschema wird in Supabase gepflegt. Die SQL-Dateien im Repository sind
Patches, die im Supabase-Dashboard unter SQL Editor ausgeführt werden:

- `supabase_allow_multiple_slots_per_match.sql` — erlaubt einer Person mehrere Dienste pro Termin.
- `supabase_request_cancellation_email_fix.sql` — E-Mail-Abgleich beim Austragen ohne Groß-/Kleinschreibung.
- `backfill_match_dates.sql` — einmaliger Backfill der Datumsfelder aus den alten Textspalten.

Buchen und Austragen laufen über die `SECURITY DEFINER`-Funktionen `book_slot`
und `request_cancellation`, damit anonyme Besucher Dienste belegen können, ohne
Schreibrechte auf der `slots`-Tabelle zu benötigen. Öffentliche Seiten lesen aus
der View `slots_public`, die die E-Mail-Adressen der Helfer nicht enthält.

## Cron

`vercel.json` registriert einen täglichen Lauf um 08:00 UTC auf
`/api/cron/reminders`. Die Route verschickt Erinnerungen für alle belegten Dienste,
deren Termin in genau zwei Tagen stattfindet, und setzt ein gesetztes `CRON_SECRET`
voraus.
