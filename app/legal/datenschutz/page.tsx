export default function DatenschutzPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Datenschutzinformation</h1>
        <p>
          Diese Hinweise gelten für die Nutzung der Dienstplan-App (Termine,
          Buchung von Diensten, E-Mail-Benachrichtigungen). Den
          datenschutzrechtlich Verantwortlichen und die konkreten
          Kontaktdaten trägt der jeweilige Betreiber ein (siehe Impressum).
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          1. Datenschutzrechtlich Verantwortlicher
        </h2>
        <p>
          Verantwortlich ist der Betreiber der Anwendung (siehe Impressum).
          Datenschutzanfragen richten Sie bitte an:{" "}
          <a
            href="mailto:datenschutz@beispiel.de"
            className="text-blue-600 hover:underline"
          >
            datenschutz@beispiel.de
          </a>{" "}
          (Platzhalter – durch die reale Adresse ersetzen).
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
            lit. f DS-GVO (betriebsichere Bereitstellung, Missbrauchsabwehr,
            Logfiles soweit erforderlich).
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
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. Dienstleister</h2>
        <p>
          Je nach Einrichtung des Betreibers können eingesetzt werden:
          Hosting (z. B. Vercel), Datenbank (z. B. Supabase), E-Mail-Versand
          (z. B. Resend). Es gelten die Datenschutzhinweise der jeweiligen
          Anbieter; mit Auftragsverarbeitern werden Vereinbarungen nach Art.
          28 DS-GVO geschlossen, soweit erforderlich.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. Speicherdauer</h2>
        <p>
          Daten werden gelöscht, sobald der Zweck entfällt und keine
          gesetzlichen Aufbewahrungsfristen entgegenstehen. Termin- und
          Buchungsdaten richten sich nach den Erfordernissen des Betreibers
          (z. B. laufende Saison, Archivierung).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">6. Ihre Rechte</h2>
        <p>
          Sie haben nach Maßgabe der DS-GVO Rechte auf Auskunft, Berichtigung,
          Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie
          Widerspruch, soweit anwendbar. Kontakt:{" "}
          <a
            href="mailto:datenschutz@beispiel.de"
            className="text-blue-600 hover:underline"
          >
            datenschutz@beispiel.de
          </a>{" "}
          (Platzhalter).
        </p>
        <p>
          Sie haben zudem das Recht, sich bei einer Aufsichtsbehörde zu
          beschweren.
        </p>
      </section>
    </div>
  );
}
