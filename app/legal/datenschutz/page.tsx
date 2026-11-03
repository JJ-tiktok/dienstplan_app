import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Welche Daten der Veranstaltungsplaner Thomm bei der Übernahme von Diensten verarbeitet und welche Rechte Sie haben.",
};

export default function DatenschutzPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Datenschutzinformation</h1>
        <p>
          Diese Hinweise gelten für die Nutzung des Veranstaltungsplaners Thomm (Termine,
          Buchung von Diensten, E-Mail-Benachrichtigungen).
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          1. Datenschutzrechtlich Verantwortlicher
        </h2>
        <p>
          Verantwortlich: Ortsbürgermeister Mario Weber, Haus der Gemeinde
          (ehem. Pfarrhaus), Trierer Straße 1, 54317 Thomm.
          <br />
          Telefon: 06500 999 3 444 oder 06500 910 313
          <br />
          Sprechstunde: Mo. 18:00 bis 19:00 Uhr oder nach Vereinbarung
          <br />
          Datenschutzanfragen richten Sie bitte an:{" "}
          <a
            href="mailto:ortsbuergermeister@thomm-online.de"
            className="text-blue-600 hover:underline"
          >
            ortsbuergermeister@thomm-online.de
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          2. Zwecke und Rechtsgrundlagen der Verarbeitung
        </h2>
        <p>Wir verarbeiten personenbezogene Daten insbesondere zu folgenden Zwecken:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Bereitstellung der App:</strong> Art. 6 Abs. 1 lit. b DS-GVO
            (Durchführung der Buchung von Diensten bzw. vorvertragliche
            Maßnahmen auf Ihre Anfrage).
          </li>
          <li>
            <strong>Technischer Betrieb und Sicherheit:</strong> Art. 6 Abs. 1
            lit. f DS-GVO (betriebssichere Bereitstellung, Missbrauchsabwehr,
            Logfiles soweit erforderlich).
          </li>
          <li>
            <strong>Reichweitenmessung und Ladezeit-Optimierung</strong> ohne
            Cookies: Art. 6 Abs. 1 lit. f DS-GVO (Verbesserung des Angebots).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          3. Welche Daten werden verarbeitet?
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Bei Buchung eines Dienstes: Name, Kontakt (z. B. E-Mail), Zuordnung
            zum Termin/Dienst.
          </li>
          <li>
            Bei Nennung einer E-Mail für Benachrichtigungen: E-Mail-Adresse
            sowie Inhalt der jeweiligen Transaktionsmail.
          </li>
          <li>
            Technische Daten beim Aufruf der Website (z. B. IP-Adresse,
            Zeitpunkt, Browser) im Rahmen des Hostings.
          </li>
          <li>
            Anonymisierte Nutzungs- und Leistungsdaten (aufgerufene Seite,
            Ladezeiten, Gerätetyp, Land) über Vercel Web Analytics und Vercel
            Speed Insights. Dabei werden keine Cookies gesetzt und keine
            seitenübergreifenden Profile gebildet.
          </li>
        </ul>
        <p>
          <strong>Öffentliche Sichtbarkeit:</strong> Der bei der Buchung
          angegebene Name ist für alle Besucher in der Dienstliste des
          jeweiligen Termins sowie in der Übersicht der aktivsten Helfer
          sichtbar. Die E-Mail-Adresse ist nicht öffentlich; sie ist nur für
          die Verwaltung einsehbar und wird für Bestätigungs-, Erinnerungs- und
          Stornierungsmails verwendet.
        </p>
        <p>
          <strong>Lokale Speicherung im Browser:</strong> Ihre Bestätigung des
          Hinweisbanners wird im lokalen Speicher Ihres Browsers abgelegt,
          damit es nicht bei jedem Besuch erneut erscheint. Diese Information
          wird nicht an uns übertragen.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. Dienstleister</h2>
        <p>
          Für den Betrieb setzen wir folgende Auftragsverarbeiter ein, mit
          denen Vereinbarungen nach Art. 28 DS-GVO bestehen:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Vercel Inc.</strong> (USA) – Hosting der Website sowie
            Web Analytics und Speed Insights.
          </li>
          <li>
            <strong>Supabase Inc.</strong> (USA) – Datenbank für Termine,
            Dienste und Buchungen.
          </li>
          <li>
            <strong>Resend</strong> (Plus Five Five, Inc., USA) – Versand der
            E-Mails.
          </li>
        </ul>
        <p>
          Bei diesen Anbietern kann eine Übermittlung in die USA erfolgen. Sie
          stützt sich auf das EU-US Data Privacy Framework (Art. 45 DS-GVO),
          soweit der Anbieter zertifiziert ist, und ansonsten auf
          EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DS-GVO).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. Speicherdauer</h2>
        <p>
          Daten werden gelöscht, sobald der Zweck entfällt und keine
          gesetzlichen Aufbewahrungsfristen entgegenstehen. Termin- und
          Buchungsdaten richten sich nach den Erfordernissen des Betreibers
          (z. B. laufende Saison, Archivierung). Wenn Sie aus einem Dienst
          ausgetragen werden, werden Name und E-Mail-Adresse aus diesem
          Dienst entfernt.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">6. Ihre Rechte</h2>
        <p>
          Sie haben nach Maßgabe der DS-GVO Rechte auf Auskunft, Berichtigung,
          Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie
          Widerspruch, soweit anwendbar. Kontakt:{" "}
          <a
            href="mailto:ortsbuergermeister@thomm-online.de"
            className="text-blue-600 hover:underline"
          >
            ortsbuergermeister@thomm-online.de
          </a>
        </p>
        <p>
          Sie haben zudem das Recht, sich bei einer Aufsichtsbehörde zu
          beschweren, insbesondere beim Landesbeauftragten für den
          Datenschutz und die Informationsfreiheit Rheinland-Pfalz.
        </p>
      </section>
    </div>
  );
}
