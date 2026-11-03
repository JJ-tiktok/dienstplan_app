import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Fehler 404</p>
      <h1 className="mt-2 text-2xl font-black text-slate-900">Seite nicht gefunden</h1>
      <p className="mt-3 text-slate-500">
        Diesen Termin oder diese Seite gibt es nicht (mehr). Vielleicht wurde der Termin
        verschoben oder gelöscht.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
      >
        <ArrowLeft className="h-4 w-4" />
        Zu allen Terminen
      </Link>
    </div>
  );
}
