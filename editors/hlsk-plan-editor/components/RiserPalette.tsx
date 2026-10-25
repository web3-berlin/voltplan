import { RISER_KINDS } from "../lib/catalog.js";
import type { Riser } from "../lib/types.js";

interface Props {
  risers: Riser[];
  selectedRiserId: string | null;
  onPlace: (kind: string) => void;
  onSelect: (id: string) => void;
}

export function RiserPalette({
  risers,
  selectedRiserId,
  onPlace,
  onSelect,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Add a riser</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Pick a riser type, then click the shaft position on the plan. Risers
          show vertical connections between floors.
        </p>
      </div>
      <div className="space-y-2">
        {RISER_KINDS.map((kind) => (
          <button
            key={kind.id}
            type="button"
            onClick={() => onPlace(kind.id)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-blue-300 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: kind.color }}
              />
              <span className="text-xs font-semibold text-slate-800">
                {kind.name}
              </span>
            </span>
            <span className="mt-1 block text-[11px] leading-snug text-slate-500">
              {kind.description}
            </span>
          </button>
        ))}
      </div>
      <div className="border-t border-slate-200 pt-3">
        <h3 className="text-sm font-semibold text-slate-800">Placed risers</h3>
        {risers.length === 0 ? (
          <p className="mt-2 text-[11px] text-slate-500">
            No risers on this floor yet.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {risers.map((riser) => (
              <li key={riser.id}>
                <button
                  type="button"
                  onClick={() => onSelect(riser.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                    selectedRiserId === riser.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate font-medium text-slate-800">
                    {riser.label ?? kindLabel(riser.kind)}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-500">
                    {kindLabel(riser.kind)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function kindLabel(kind: string): string {
  return RISER_KINDS.find((item) => item.id === kind)?.name ?? kind;
}
