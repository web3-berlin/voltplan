import { DISCIPLINES, FIXTURES } from "../lib/catalog.js";
import type { Discipline } from "../lib/types.js";
import { FixtureGlyph } from "./FixtureGlyph.js";

interface Props {
  disciplines: Discipline[];
  selectedDefId: string | null;
  onSelect: (id: string) => void;
}

export function FixturePalette({
  disciplines,
  selectedDefId,
  onSelect,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Add fixtures</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Pick a fixture, then click the floor plan where it belongs. Press Esc
          to stop.
        </p>
      </div>
      {DISCIPLINES.filter((discipline) =>
        disciplines.includes(discipline.id),
      ).map((discipline) => {
        const items = FIXTURES.filter(
          (fixture) => fixture.discipline === discipline.id,
        );
        return (
          <section key={discipline.id}>
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: discipline.color }}
              />
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {discipline.name}
              </h4>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              {discipline.description}
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {items.map((fixture) => {
                const selected = fixture.id === selectedDefId;
                return (
                  <button
                    key={fixture.id}
                    type="button"
                    onClick={() => onSelect(fixture.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-300"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <svg
                      viewBox="-26 -26 52 52"
                      className="h-9 w-9 shrink-0"
                      aria-hidden="true"
                    >
                      <FixtureGlyph
                        parts={fixture.parts}
                        color={fixture.color}
                      />
                    </svg>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">
                        {fixture.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                        {fixture.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
