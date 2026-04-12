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
  onNewNameChange: (v: string) => void;
  onNewProfileChange: (v: EventUiProfile) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
}

export default function EventCategoryManager({
  categories,
  newName,
  newProfile,
  onNewNameChange,
  onNewProfileChange,
  onAdd,
  onDelete,
}: EventCategoryManagerProps) {
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
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center px-4">
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
          className="bg-white rounded-2xl border border-slate-100 px-4 py-4 text-sm font-bold text-slate-800 shadow-sm"
        >
          <option value="sport">Profil: Sport / Verein</option>
          <option value="community_event">Profil: Gemeinde / Fest</option>
        </select>
        <button
          type="button"
          onClick={onAdd}
          className="bg-slate-900 text-white px-5 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors active:scale-[0.98] shrink-0"
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
            <div>
              <div className="font-bold text-slate-800 text-sm">{c.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {c.slug} ·{' '}
                {c.ui_profile === 'sport' ? 'Sport / Verein' : 'Gemeinde / Fest'}
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
