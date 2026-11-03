# Site-Audit: Checkliste und Prüfprotokoll

Diese Datei ist die Grundlage für die regelmäßige Überprüfung der produktiven
Seite. Sie enthält die Launch-Checkliste, die Sicherheitsprüfungen und ein
Protokoll aller bisherigen Durchläufe.

## So wird geprüft

```bash
npm ci
npm run audit:site                              # Code + Abhängigkeiten
npm run audit:site -- https://<produktiv-domain> # zusätzlich die Live-Seite
```

Das Skript (`scripts/site-audit.mjs`) prüft alle mit 🤖 markierten Punkte
automatisch und endet mit Exit-Code 1, sobald ein Pflichtpunkt verletzt ist.
Die mit 👤 markierten Punkte brauchen einen Menschen mit Browser und Handy.

**Rhythmus:** monatlich, außerdem nach jedem größeren Feature und sobald
Dependabot eine Sicherheitsmeldung schickt.

## Launch-Checkliste

| # | Punkt | Prüfung | Stand 2026-11-03 |
|---|---|---|---|
| 1 | Eigene 404-Seite | 🤖 | ✅ `app/not-found.tsx` |
| 2 | CTA above the fold | 👤 | ⚠️ Der nächste Termin steht oben als komplett klickbare Karte („Noch X Helfer gesucht"), aber ohne sichtbaren Button-Text wie „Jetzt eintragen" – Verbesserungsidee |
| 3 | Meta-Title pro Seite | 🤖 | ✅ Template „Seite \| Veranstaltungsplaner Thomm", eigener Titel je Termin |
| 4 | Meta-Description pro Seite | 🤖 | ✅ Je Termin dynamisch (Titel, Datum, Ort), Rechtliches statisch |
| 5 | Open-Graph-Bild | 🤖 | ✅ `app/opengraph-image.tsx`, 1200×630 mit Wappen |
| 6 | Favicon-Set | 🤖 | ✅ `favicon.ico`, generiertes Icon, Apple-Touch-Icon |
| 7 | robots.txt | 🤖 | ✅ sperrt `/admin`, `/login`, `/api/` |
| 8 | sitemap.xml | 🤖 | ✅ Startseite, Rechtliches und alle kommenden Termine, stündlich aktualisiert |
| 9 | Alt-Text an jedem Bild | 🤖 | ✅ |
| 10 | Mobile Breakpoints | 👤 | ✅ Mobile-first-Layout (`max-w-md`); auf dem Desktop eine schmale Spalte – bewusst so |
| 11 | Sticky Mobile CTA | 👤 | ➖ Nicht sinnvoll: jeder Dienst hat seinen eigenen Eintragen-Button, das Formular ist ein Bottom-Sheet |
| 12 | Ladezustände | 👤 | ✅ Skeletons auf Start- und Terminseite, Button-Status beim Absenden |
| 13 | Formular-Fehlerzustände | 👤 | ✅ Inline-Hinweis bei ungültiger E-Mail, Längenbegrenzung, Fehlerdialoge |
| 14 | Danke-Seite | 👤 | ➖ Bestätigungsdialog + Bestätigungsmail statt eigener Seite – passt zum App-Ablauf |
| 15 | Datenschutzseite | 🤖 | ✅ Nennt konkrete Dienstleister, Analytics, Drittlandtransfer, öffentliche Namen |
| 16 | AGB/Nutzungsbedingungen | 👤 | ➖ Für ein unentgeltliches Gemeindeangebot nicht erforderlich |
| 17 | Cookie-Banner | 🤖 | ✅ Hinweis vorhanden; es werden keine Tracking-Cookies gesetzt |
| 18 | Analytics installiert | 🤖 | ✅ Vercel Web Analytics + Speed Insights (cookielos) |
| 19 | Echte Kontaktadresse | 🤖 | ✅ Impressum mit Anschrift, auf DDG/MStV aktualisiert |

## Sicherheit

| ID | Prüfung | Art | Stand 2026-11-03 |
|---|---|---|---|
| S1 | Keine Admin-Logik in öffentlichen Server Actions | 🤖 | ✅ behoben (siehe Protokoll) |
| S2 | Alle Admin-API-Routen rufen `requireAdmin` auf | 🤖 | ✅ 8/8 |
| S3 | `requireAdmin` prüft echte Admin-Rolle | 🤖 | ⚠️ offen – jeder eingeloggte Account gilt als Admin; unkritisch, **solange Signup in Supabase deaktiviert bleibt** |
| S4 | Cron-Route fail-closed | 🤖 | ✅ |
| S5 | HTML-Escaping in Mails | 🤖 | ✅ |
| S6 | Security-Header | 🤖 | ✅ frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy, HSTS |
| S7 | Kein Service-Role-Key im Browser | 🤖 | ✅ |
| S8 | Keine `.env` im Git | 🤖 | ✅ |
| S9 | Keine kritischen/hohen Lücken in Abhängigkeiten | 🤖 | ✅ 0 in Produktion |
| S10 | Supabase-RLS: `anon` darf `matches`, `event_categories`, `service_types`, `service_type_members` nicht schreiben | 👤 | ❓ **ungeprüft** – siehe unten |
| S11 | Supabase-Signup deaktiviert | 👤 | ✅ laut Betreiber |
| S12 | Rate-Limit beim Eintragen | 👤 | ⚠️ offen – jede Buchung löst eine Mail aus |

### S10 prüfen (Supabase-Dashboard, 2 Minuten)

Das Admin-Panel schreibt diese Tabellen direkt aus dem Browser. Ob das sicher
ist, entscheiden allein die RLS-Policies. Im SQL-Editor ausführen:

```sql
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('matches', 'event_categories', 'service_types', 'service_type_members', 'slots')
order by tablename, cmd;
```

Erwartung: `INSERT`, `UPDATE` und `DELETE` nur für `authenticated`, **nie** für
`anon` oder `public`. Ist eine Schreib-Policy für `anon`/`public` vorhanden,
kann jeder Besucher ohne Login Termine anlegen oder löschen.

## Protokoll

### 2026-11-03 – Erstprüfung

Ausgangslage: 9 Fehler, 2 Hinweise. Danach: 0 Fehler, 1 Hinweis.

- **Kritisch, behoben:** `adminRemoveUser` war eine öffentliche Server Action
  ohne Login-Prüfung, die mit dem Service-Role-Key arbeitete. Die Action-ID steht
  im ausgelieferten JavaScript der Admin-Seite; damit konnte jeder Besucher
  beliebige Helfer austragen und Stornierungsmails an sie auslösen. Jetzt über
  die geschützte Route `/api/admin/slots/remove-user`. Die zwei ungenutzten
  Admin-Actions wurden entfernt.
- **Kritisch, behoben:** Next.js mit kritischer Sicherheitslücke, dazu 5 hohe
  Lücken in Abhängigkeiten → `npm audit fix` (Next.js 16.2.2 → 16.4.4).
- Security-Header ergänzt, `X-Powered-By` entfernt, `noindex` für Admin/Login/API.
- 404-Seite, robots.txt, sitemap.xml, Open-Graph-Bild, Titel und Beschreibung pro Seite.
- Impressum: Verweise von TMG/RStV auf DDG/MStV aktualisiert.
- Datenschutz: konkrete Dienstleister statt „z. B.", Vercel Analytics,
  USA-Übermittlung, öffentliche Sichtbarkeit der Namen, zuständige
  Aufsichtsbehörde. **Juristisch gegenlesen lassen.**
- Cron-Route: Resend-Client wurde beim Modul-Laden erzeugt – ein fehlender Key
  hat den kompletten Build abgebrochen.
- Eintragen-Formular: Inline-Fehler bei ungültiger E-Mail, Längenbegrenzung
  im Formular und serverseitig.
- Offen: S3, S10, S12 sowie 4 Lint-Fehler mit Verhaltensänderung
  (`CookieBanner`, `MatchEditor`, `TimePicker`, Memoization in `app/page.tsx`).
