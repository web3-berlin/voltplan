import { DUCT_KINDS, PIPE_KINDS } from "../lib/catalog.js";
import type { DrawMode } from "../lib/types.js";

interface Props {
  pipeKinds: string[];
  ductKinds: string[];
  drawMode: DrawMode | null;
  onDrawPipe: (kind: string) => void;
  onDrawDuct: (kind: string) => void;
}

export function RoutePalette({
  pipeKinds,
  ductKinds,
  drawMode,
  onDrawPipe,
  onDrawDuct,
}: Props) {
  const pipes = PIPE_KINDS.filter((kind) => pipeKinds.includes(kind.id));
  const ducts = DUCT_KINDS.filter((kind) => ductKinds.includes(kind.id));
  if (pipes.length === 0 && ducts.length === 0) return null;

  return (
    <div className="border-t border-slate-200 p-3">
      <h3 className="text-sm font-semibold text-slate-800">Draw routes</h3>
      <p className="mt-1 text-[11px] leading-snug text-slate-500">
        Pick a route type, then click at least two points on the plan. Click the
        first point or Finish to close the route.
      </p>
      {pipes.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {pipes.map((kind) => {
            const active =
              drawMode?.type === "pipe" && drawMode.kind === kind.id;
            return (
              <button
                key={kind.id}
                type="button"
                onClick={() => onDrawPipe(kind.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition ${
                  active
                    ? "border-blue-300 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-4 rounded-full"
                    style={{ background: kind.color }}
                  />
                  {kind.name}
                </span>
                <span className="text-slate-400">{kind.short}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {ducts.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {ducts.map((kind) => {
            const active =
              drawMode?.type === "duct" && drawMode.kind === kind.id;
            return (
              <button
                key={kind.id}
                type="button"
                onClick={() => onDrawDuct(kind.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition ${
                  active
                    ? "border-blue-300 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-4 rounded-sm"
                    style={{ background: kind.color }}
                  />
                  {kind.name}
                </span>
                <span className="text-slate-400">{kind.short}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
