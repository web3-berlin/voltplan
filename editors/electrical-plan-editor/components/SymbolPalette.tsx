import { useMemo, useState } from "react";
import { electricalCatalog, electricalCategoryColor } from "../lib/catalog.js";
import type { ElectricalCategoryId } from "../lib/types.js";
import { SymbolGlyph } from "./SymbolGlyph.js";

const CATEGORY_LABELS: { id: ElectricalCategoryId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "outlet", label: "Sockets" },
  { id: "switch", label: "Switches" },
  { id: "lighting", label: "Lighting" },
  { id: "appliance", label: "Appliances" },
  { id: "data", label: "Data" },
  { id: "safety", label: "Safety" },
  { id: "hvac", label: "HVAC" },
  { id: "knx", label: "KNX" },
  { id: "distribution", label: "Distribution" },
  { id: "other", label: "Other" },
];

export function SymbolPalette({ selectedDefId, onSelect }: { selectedDefId: string | null; onSelect: (id: string | null) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ElectricalCategoryId | "all">("all");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return electricalCatalog.filter((def) => {
      if (category !== "all" && def.category !== category) return false;
      if (!query) return true;
      return `${def.name} ${def.de} ${def.id} ${def.article ?? ""} ${def.tags?.join(" ") ?? ""}`.toLowerCase().includes(query);
    });
  }, [category, search]);

  return (
    <aside className="flex h-full min-h-0 w-[292px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Symbol library</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{electricalCatalog.length} DIN</span>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search socket, light, KNX…"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
        <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
          {CATEGORY_LABELS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium transition ${category === item.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? <p className="p-4 text-center text-xs text-slate-400">No symbol matches.</p> : null}
        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map((def) => {
            const active = selectedDefId === def.id;
            const color = electricalCategoryColor(def.category);
            return (
              <button
                key={def.id}
                type="button"
                title={`${def.name} · ${def.de} · ${def.widthCm}×${def.heightCm} cm${def.powerW != null ? ` · ${def.powerW} W` : ""}`}
                onClick={() => onSelect(active ? null : def.id)}
                className={`group flex min-h-[82px] flex-col items-center justify-between gap-1 rounded-lg border p-1.5 text-center transition ${active ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"}`}
              >
                <svg viewBox="-11 -11 22 22" className="h-10 w-10 shrink-0 text-slate-700" style={{ color }} aria-hidden="true">
                  <SymbolGlyph def={def} color={color} />
                </svg>
                <span className="line-clamp-2 text-[9px] font-medium leading-tight text-slate-600 group-hover:text-slate-900">{def.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {selectedDefId ? (
        <div className="border-t border-slate-200 p-2">
          <button type="button" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50" onClick={() => onSelect(null)}>
            Stop placing (Esc)
          </button>
        </div>
      ) : null}
    </aside>
  );
}
