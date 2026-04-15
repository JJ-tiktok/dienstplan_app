'use client';

import { useState } from 'react';
import { Plus, LayoutGrid, X } from 'lucide-react';
import type { EventCategory, EventUiProfile } from '@/types';

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'kategorie';
}

interface EventCategoryManagerProps {
  categories: EventCategory[];
  newName: string;
  newProfile: EventUiProfile;
  newColor: string;
  onNewNameChange: (v: string) => void;
  onNewProfileChange: (v: EventUiProfile) => void;
  onNewColorChange: (v: string) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onUpdateColor: (id: number, color: string) => void;
  onUpdateProfile: (id: number, profile: EventUiProfile) => void;
}

export default function EventCategoryManager({
  categories,
  newName,
  newProfile,
  newColor,
  onNewNameChange,
  onNewProfileChange,
  onNewColorChange,
  onAdd,
  onDelete,
  onUpdateColor,
  onUpdateProfile,
}: EventCategoryManagerProps) {
  const [colorDrafts, setColorDrafts] = useState<Record<number, string>>({});
  const [profileDrafts, setProfileDrafts] = useState<Record<number, EventUiProfile>>({});

  const normalizeHexColor = (input: string): string => {
    const value = input.trim().toUpperCase();
    if (!value.startsWith('#')) return `#${value}`;
    return value;
  };

  const isHexColor = (input: string): boolean => /^#[0-9A-F]{6}$/.test(input.trim().toUpperCase());

  const getDraftColor = (category: EventCategory): string =>
    colorDrafts[category.id] ?? category.color ?? '#64748B';
  const getDraftProfile = (category: EventCategory): EventUiProfile =>
    profileDrafts[category.id] ?? category.ui_profile;

  return (
    <div className="space-y-4 mb-10">
      <div className="px-1">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">
          Event-Kategorien
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Legt fest, ob ein Termin wie ein Sportspiel (Mannschaft, „vs.“) oder wie ein
          Gemeinde-Event (ohne Mannschaft) dargestellt wird.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex-1 min-w-[240px] bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center px-4">
          <LayoutGrid className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            value={newName}
            onChange={(e) => onNewNameChange(e.target.value)}
            placeholder="Name (z. B. Dorf-Kirmes)"
            className="w-full py-4 bg-transparent text-sm font-bold text-slate-900 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAdd();
            }}
          />
        </div>
        <select
          value={newProfile}
          onChange={(e) => onNewProfileChange(e.target.value as EventUiProfile)}
          className="bg-white rounded-2xl border border-slate-100 px-4 py-4 text-sm font-bold text-slate-800 shadow-sm shrink-0"
        >
          <option value="sport">Profil: Sport / Verein</option>
          <option value="community_event">Profil: Gemeinde / Fest</option>
        </select>
        <div className="bg-white rounded-2xl border border-slate-100 px-3 py-2 text-sm font-bold text-slate-800 shadow-sm flex items-center gap-2 shrink-0">
          <input
            type="color"
            value={newColor}
            onChange={(e) => onNewColorChange(e.target.value.toUpperCase())}
            className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
            aria-label="Farbe für neue Kategorie wählen"
          />
          <input
            value={newColor}
            onChange={(e) => onNewColorChange(normalizeHexColor(e.target.value))}
            className="w-24 bg-transparent text-xs font-bold text-slate-700 outline-none uppercase"
            aria-label="Hex-Farbwert für neue Kategorie"
            placeholder="#2563EB"
            maxLength={7}
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="bg-slate-900 text-white px-5 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors active:scale-[0.98] shrink-0 min-h-[52px]"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <div className="space-y-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-100 p-4 flex justify-between items-center gap-3"
          >
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-sm">{c.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {c.slug} ·{' '}
                {getDraftProfile(c) === 'sport' ? 'Sport / Verein' : 'Gemeinde / Fest'}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={getDraftProfile(c)}
                  onChange={(e) =>
                    setProfileDrafts((prev) => ({
                      ...prev,
                      [c.id]: e.target.value as EventUiProfile,
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-300"
                  aria-label={`Profil für ${c.name}`}
                >
                  <option value="sport">Sport / Verein</option>
                  <option value="community_event">Gemeinde / Fest</option>
                </select>
                <button
                  type="button"
                  onClick={() => onUpdateProfile(c.id, getDraftProfile(c))}
                  className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg"
                >
                  Profil speichern
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={getDraftColor(c)}
                  onChange={(e) =>
                    setColorDrafts((prev) => ({
                      ...prev,
                      [c.id]: e.target.value.toUpperCase(),
                    }))
                  }
                  className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent p-0"
                  aria-label={`Farbe für ${c.name}`}
                />
                <input
                  value={getDraftColor(c)}
                  onChange={(e) =>
                    setColorDrafts((prev) => ({
                      ...prev,
                      [c.id]: normalizeHexColor(e.target.value),
                    }))
                  }
                  className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 uppercase outline-none focus:border-blue-300"
                  placeholder="#2563EB"
                  maxLength={7}
                />
                <button
                  type="button"
                  onClick={() => {
                    const value = getDraftColor(c);
                    if (!isHexColor(value)) return;
                    onUpdateColor(c.id, value.trim().toUpperCase());
                  }}
                  disabled={!isHexColor(getDraftColor(c))}
                  className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Speichern
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDelete(c.id)}
              className="text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0"
              aria-label={`Kategorie ${c.name} löschen`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function buildEventCategorySlug(name: string, existingSlugs: Set<string>): string {
  let s = slugify(name);
  if (!existingSlugs.has(s)) return s;
  let n = 2;
  while (existingSlugs.has(`${s}-${n}`)) n += 1;
  return `${s}-${n}`;
}
