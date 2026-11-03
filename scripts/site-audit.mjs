#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-expressions --
   `bedingung ? pass(...) : fail(...)` ist hier bewusst die lesbarste Form. */
/**
 * Wiederholbarer Site-Audit für den Veranstaltungsplaner.
 *
 * Prüft die Launch-Checkliste (docs/AUDIT.md) und die bekannten Sicherheitsfallen
 * automatisch, soweit sie sich aus Code oder laufender Seite ablesen lassen.
 *
 *   npm run audit:site                         # nur Code + Abhängigkeiten
 *   npm run audit:site -- https://deine-domain # zusätzlich die Live-Seite prüfen
 *
 * Exit-Code 1, sobald ein Pflichtpunkt (FAIL) verletzt ist – geeignet für CI.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const liveUrl = process.argv[2]?.replace(/\/+$/, '');

const results = [];
const record = (status, id, label, detail = '') => results.push({ status, id, label, detail });
const pass = (id, label, detail) => record('PASS', id, label, detail);
const fail = (id, label, detail) => record('FAIL', id, label, detail);
const warn = (id, label, detail) => record('WARN', id, label, detail);

const file = (rel) => path.join(root, rel);
const has = (rel) => existsSync(file(rel));
const read = (rel) => (has(rel) ? readFileSync(file(rel), 'utf8') : '');
const anyOf = (...rels) => rels.some(has);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Launch-Checkliste (Code)
// ---------------------------------------------------------------------------

anyOf('app/not-found.tsx', 'app/not-found.jsx')
  ? pass(1, 'Eigene 404-Seite')
  : fail(1, 'Eigene 404-Seite', 'app/not-found.tsx fehlt');

{
  const layout = read('app/layout.tsx');
  layout.includes('template')
    ? pass(3, 'Meta-Title pro Seite', 'Title-Template im Root-Layout')
    : fail(3, 'Meta-Title pro Seite', 'Kein title.template in app/layout.tsx');

  const segments = ['app/match/[id]', 'app/admin', 'app/login', 'app/legal/impressum', 'app/legal/datenschutz'];
  const missing = segments.filter((seg) => {
    const src = read(`${seg}/layout.tsx`) + read(`${seg}/page.tsx`);
    return !/export (const metadata|async function generateMetadata)/.test(src);
  });
  missing.length === 0
    ? pass(4, 'Meta-Description/Metadaten pro Seite')
    : warn(4, 'Meta-Description/Metadaten pro Seite', `ohne eigene Metadaten: ${missing.join(', ')}`);
}

anyOf('app/opengraph-image.tsx', 'app/opengraph-image.png', 'app/opengraph-image.jpg')
  ? pass(5, 'Open-Graph-Bild')
  : fail(5, 'Open-Graph-Bild', 'app/opengraph-image.* fehlt');

anyOf('app/favicon.ico', 'public/favicon.ico') && anyOf('app/icon.tsx', 'app/icon.png', 'public/thomm.png')
  ? pass(6, 'Favicon-Set')
  : fail(6, 'Favicon-Set', 'favicon.ico oder Icon fehlt');

anyOf('app/robots.ts', 'public/robots.txt')
  ? pass(7, 'robots.txt')
  : fail(7, 'robots.txt', 'app/robots.ts fehlt');

anyOf('app/sitemap.ts', 'public/sitemap.xml')
  ? pass(8, 'sitemap.xml')
  : fail(8, 'sitemap.xml', 'app/sitemap.ts fehlt');

{
  const offenders = [];
  for (const f of walk(file('app')).concat(walk(file('components')))) {
    const src = readFileSync(f, 'utf8');
    // <img ...> bzw. <Image ...> bis zum schließenden '>' (auch mehrzeilig)
    for (const tag of src.match(/<(img|Image)\b[\s\S]*?>/g) ?? []) {
      if (!/\balt=/.test(tag)) offenders.push(path.relative(root, f));
    }
  }
  offenders.length === 0
    ? pass(9, 'Alt-Text an jedem Bild')
    : fail(9, 'Alt-Text an jedem Bild', [...new Set(offenders)].join(', '));
}

has('app/legal/datenschutz/page.tsx')
  ? pass(15, 'Datenschutzseite')
  : fail(15, 'Datenschutzseite', 'app/legal/datenschutz fehlt');

{
  const ds = read('app/legal/datenschutz/page.tsx');
  const usesAnalytics = read('app/layout.tsx').includes('@vercel/analytics');
  if (usesAnalytics && !/Analytics/i.test(ds)) {
    fail(15, 'Datenschutz erwähnt eingesetzte Analytics', 'Vercel Analytics läuft, steht aber nicht in der Datenschutzerklärung');
  }
}

has('components/ui/CookieBanner.tsx')
  ? pass(17, 'Cookie-Hinweis')
  : warn(17, 'Cookie-Hinweis', 'kein Banner gefunden');

read('app/layout.tsx').includes('@vercel/analytics')
  ? pass(18, 'Analytics installiert', 'Vercel Web Analytics + Speed Insights')
  : warn(18, 'Analytics installiert');

{
  const imp = read('app/legal/impressum/page.tsx');
  if (!imp) fail(19, 'Echte Kontaktadresse / Impressum', 'Impressum fehlt');
  else if (/\bTMG\b|\bRStV\b/.test(imp))
    fail(19, 'Impressum rechtlich aktuell', 'verweist noch auf TMG/RStV – seit 2024 DDG/MStV');
  else if (!/\d{5}\s+\S+/.test(imp)) warn(19, 'Echte Kontaktadresse', 'keine PLZ + Ort im Impressum erkannt');
  else pass(19, 'Echte Kontaktadresse / Impressum (DDG/MStV)');
}

// ---------------------------------------------------------------------------
// Sicherheit (Code)
// ---------------------------------------------------------------------------

{
  // Server Actions sind öffentliche Endpunkte. Admin-Logik darf dort nicht liegen.
  const actionFiles = walk(file('app'))
    .concat(walk(file('lib')))
    .filter((f) => /^\s*['"]use server['"]/m.test(readFileSync(f, 'utf8')));
  const risky = [];
  for (const f of actionFiles) {
    const src = readFileSync(f, 'utf8');
    for (const [, name] of src.matchAll(/export\s+async\s+function\s+(\w+)/g)) {
      if (/^admin/i.test(name)) risky.push(`${path.relative(root, f)}#${name}`);
    }
  }
  risky.length === 0
    ? pass('S1', 'Keine Admin-Funktionen als öffentliche Server Action')
    : fail('S1', 'Admin-Funktionen als öffentliche Server Action', risky.join(', '));
}

{
  const routes = walk(file('app/api/admin')).filter((f) => f.endsWith('route.ts'));
  const unprotected = routes.filter((f) => !readFileSync(f, 'utf8').includes('requireAdmin('));
  unprotected.length === 0
    ? pass('S2', `Alle ${routes.length} Admin-API-Routen prüfen requireAdmin`)
    : fail('S2', 'Admin-API-Route ohne requireAdmin', unprotected.map((f) => path.relative(root, f)).join(', '));
}

{
  const auth = read('lib/admin-auth.ts');
  /TODO.*Role|TODO.*Admin/i.test(auth)
    ? warn('S3', 'requireAdmin: jeder eingeloggte User gilt als Admin', 'nur unkritisch, solange Supabase-Signup deaktiviert ist')
    : pass('S3', 'requireAdmin mit Rollen-/Allowlist-Prüfung');
}

{
  const cron = read('app/api/cron/reminders/route.ts');
  const failOpen = /if\s*\(\s*cronSecret\s*\)\s*\{/.test(cron);
  const querySecret = /searchParams\.get\(\s*['"]secret['"]\s*\)/.test(cron);
  if (failOpen) fail('S4', 'Cron-Route fail-open', 'ohne CRON_SECRET ungeschützt');
  else if (querySecret) warn('S4', 'Cron-Route akzeptiert Secret als Query-Parameter', 'Secrets landen in Logs');
  else pass('S4', 'Cron-Route fail-closed, Secret nur per Header');
}

{
  const email = read('lib/email.ts');
  email.includes('escapeHtml')
    ? pass('S5', 'Mail-Templates escapen interpolierte Werte')
    : fail('S5', 'Mail-Templates ohne HTML-Escaping', 'HTML-Injection über Nutzernamen möglich');
}

{
  const cfg = read('next.config.ts');
  const needed = ['frame-ancestors', 'X-Content-Type-Options', 'Referrer-Policy', 'Strict-Transport-Security'];
  const missing = needed.filter((h) => !cfg.includes(h));
  missing.length === 0
    ? pass('S6', 'Security-Header konfiguriert')
    : fail('S6', 'Security-Header fehlen', missing.join(', '));
}

{
  const leaks = [];
  for (const f of walk(file('app')).concat(walk(file('components')))) {
    const src = readFileSync(f, 'utf8');
    if (/^\s*['"]use client['"]/m.test(src) && /SERVICE_ROLE|supabase-admin|supabase-server/.test(src)) {
      leaks.push(path.relative(root, f));
    }
  }
  leaks.length === 0
    ? pass('S7', 'Kein Service-Role-Key in Client-Komponenten')
    : fail('S7', 'Service-Role-Client in Client-Komponente', leaks.join(', '));
}

{
  const tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n');
  const envFiles = tracked.filter((f) => /(^|\/)\.env(\.|$)/.test(f) && !f.endsWith('.example'));
  envFiles.length === 0
    ? pass('S8', 'Keine .env-Dateien im Git')
    : fail('S8', '.env-Datei eingecheckt', envFiles.join(', '));
}

try {
  const out = execSync('npm audit --omit=dev --json', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const meta = JSON.parse(out).metadata?.vulnerabilities ?? {};
  const serious = (meta.critical ?? 0) + (meta.high ?? 0);
  serious === 0
    ? pass('S9', 'Produktions-Abhängigkeiten ohne kritische/hohe Lücken', `moderate: ${meta.moderate ?? 0}`)
    : fail('S9', 'Produktions-Abhängigkeiten mit Lücken', `critical: ${meta.critical}, high: ${meta.high} → npm audit fix`);
} catch (err) {
  // npm audit beendet sich bei Funden mit Exit-Code != 0, liefert aber JSON
  try {
    const meta = JSON.parse(err.stdout).metadata?.vulnerabilities ?? {};
    const serious = (meta.critical ?? 0) + (meta.high ?? 0);
    serious === 0
      ? pass('S9', 'Produktions-Abhängigkeiten ohne kritische/hohe Lücken', `moderate: ${meta.moderate ?? 0}`)
      : fail('S9', 'Produktions-Abhängigkeiten mit Lücken', `critical: ${meta.critical ?? 0}, high: ${meta.high ?? 0} → npm audit fix`);
  } catch {
    warn('S9', 'npm audit nicht auswertbar', 'kein Netz oder kein package-lock.json');
  }
}

// ---------------------------------------------------------------------------
// Live-Prüfung (optional)
// ---------------------------------------------------------------------------

async function live() {
  const get = (p, init) => fetch(`${liveUrl}${p}`, { redirect: 'manual', ...init });

  const home = await get('/');
  const h = home.headers;
  const missingHeaders = ['content-security-policy', 'x-content-type-options', 'strict-transport-security'].filter((k) => !h.get(k));
  missingHeaders.length === 0
    ? pass('L1', 'Live: Security-Header ausgeliefert')
    : fail('L1', 'Live: Security-Header fehlen', missingHeaders.join(', '));

  const html = await home.text();
  /<meta property="og:image"/.test(html)
    ? pass('L2', 'Live: og:image gesetzt')
    : fail('L2', 'Live: og:image fehlt');
  /<meta name="description"/.test(html)
    ? pass('L3', 'Live: Meta-Description gesetzt')
    : fail('L3', 'Live: Meta-Description fehlt');

  const robots = await get('/robots.txt');
  robots.ok && (await robots.text()).includes('Disallow: /admin')
    ? pass('L4', 'Live: robots.txt sperrt /admin')
    : fail('L4', 'Live: robots.txt fehlt oder sperrt /admin nicht');

  const sitemap = await get('/sitemap.xml');
  const sitemapText = sitemap.ok ? await sitemap.text() : '';
  sitemapText.includes('<urlset')
    ? pass('L5', 'Live: sitemap.xml', `${(sitemapText.match(/<url>/g) ?? []).length} URLs`)
    : fail('L5', 'Live: sitemap.xml fehlt');

  const nf = await get('/__audit-gibt-es-nicht__');
  nf.status === 404 ? pass('L6', 'Live: 404 liefert Status 404') : fail('L6', `Live: 404-Seite liefert ${nf.status}`);

  const cron = await get('/api/cron/reminders');
  cron.status === 401 ? pass('L7', 'Live: Cron-Route ohne Secret gesperrt') : fail('L7', `Live: Cron-Route ohne Secret → ${cron.status}`);

  const admin = await get('/api/admin/slots/list', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  admin.status === 401 ? pass('L8', 'Live: Admin-API ohne Login gesperrt') : fail('L8', `Live: Admin-API ohne Login → ${admin.status}`);

  const adminPage = await get('/admin');
  /noindex/.test(adminPage.headers.get('x-robots-tag') ?? '')
    ? pass('L9', 'Live: /admin mit noindex')
    : warn('L9', 'Live: /admin ohne X-Robots-Tag noindex');
}

if (liveUrl) {
  try {
    await live();
  } catch (err) {
    fail('L0', `Live-Prüfung gegen ${liveUrl} fehlgeschlagen`, err.message);
  }
}

// ---------------------------------------------------------------------------
// Ausgabe
// ---------------------------------------------------------------------------

const icon = { PASS: '✅', WARN: '⚠️ ', FAIL: '❌' };
console.log(`\nSite-Audit ${new Date().toISOString().slice(0, 10)}${liveUrl ? ` · live: ${liveUrl}` : ''}\n`);
for (const r of results) {
  console.log(`${icon[r.status]} [${r.id}] ${r.label}${r.detail ? ` — ${r.detail}` : ''}`);
}
const count = (s) => results.filter((r) => r.status === s).length;
console.log(`\n${count('PASS')} ok · ${count('WARN')} Hinweise · ${count('FAIL')} Fehler`);
console.log('Manuelle Punkte (Mobile, Ladezustände, Formularfehler …): siehe docs/AUDIT.md\n');

process.exit(count('FAIL') > 0 ? 1 : 0);
