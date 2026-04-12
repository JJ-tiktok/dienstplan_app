export default function ImpressumPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Impressum</h1>
        <p className="text-slate-600">
          Die folgenden Angaben sind durch den Betreiber dieser Dienstplan-App
          auszufüllen und rechtsverbindlich zu prüfen.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Angaben gemäß § 5 TMG</h2>
        <p>
          [Name der Organisation / des Vereins / des Anbieters]
          <br />
          [Straße und Hausnummer]
          <br />
          [Postleitzahl Ort]
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Vertreten durch</h2>
        <p>[Vertretungsberechtigte Person / Vorstand]</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Kontakt</h2>
        <p>
          E-Mail:{" "}
          <a
            href="mailto:kontakt@beispiel.de"
            className="text-blue-600 hover:underline"
          >
            kontakt@beispiel.de
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Registereintrag</h2>
        <p>
          [falls zutreffend: Registergericht, Registernummer – sonst Abschnitt
          entfernen]
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Umsatzsteuer-ID</h2>
        <p>
          [falls vorhanden: USt-IdNr. gemäß § 27 a Umsatzsteuergesetz – sonst
          Abschnitt entfernen]
        </p>
      </section>
    </div>
  );
}
