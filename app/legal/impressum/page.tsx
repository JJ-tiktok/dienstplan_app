export default function ImpressumPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Impressum</h1>
        <p className="text-slate-600">
          Angaben gemäß § 5 TMG und Verantwortlichkeit für den Inhalt nach § 55 Abs. 2 RStV.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Angaben gemäß § 5 TMG</h2>
        <p>
          Ortsbürgermeister Mario Weber
          <br />
          Haus der Gemeinde (ehem. Pfarrhaus), Trierer Straße 1
          <br />
          54317 Thomm
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
        </h2>
        <p>Ortsbürgermeister Mario Weber</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Kontakt</h2>
        <p>
          Telefon: 06500 999 3 444 oder 06500 910 313
          <br />
          Sprechstunde: Mo. 18:00 bis 19:00 Uhr oder nach Vereinbarung
          <br />
          E-Mail:{" "}
          <a
            href="mailto:ortsbuergermeister@thomm-online.de"
            className="text-blue-600 hover:underline"
          >
            ortsbuergermeister@thomm-online.de
          </a>
        </p>
      </section>
    </div>
  );
}
