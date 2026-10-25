import type { CheckItem } from "../lib/engine.js";

interface Props {
  checks: CheckItem[];
  onGoToPlan: () => void;
}

export function ChecksPanel({ checks, onGoToPlan }: Props) {
  const warnings = checks.filter((check) => check.severity === "warning");
  const infos = checks.filter((check) => check.severity === "info");

  return (
    <div className="mx-auto max-w-5xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Plan checks</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            These are practical checks, not a final engineering design. Review
            them with the installer before work starts.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-800">
            {warnings.length} warning{warnings.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-800">
            {infos.length} note{infos.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {checks.map((check, index) => (
          <article
            key={`${check.title}-${index}`}
            className={`rounded-xl border p-4 ${check.severity === "warning" ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${check.severity === "warning" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"}`}
              >
                {check.severity === "warning" ? "!" : "i"}
              </span>
              <div className="min-w-0">
                <h3
                  className={`text-sm font-semibold ${check.severity === "warning" ? "text-amber-900" : "text-blue-900"}`}
                >
                  {check.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {check.message}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  {check.hint}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800">
          How to fix most warnings
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600">
          <li>
            Draw waste pipes with at least 1% fall and 50 mm diameter for
            toilets.
          </li>
          <li>
            Give every fixture a room so the schedule and plan stay clear.
          </li>
          <li>Add a riser for each vertical connection between floors.</li>
          <li>Set the airflow on each ventilation duct.</li>
        </ul>
        <button
          type="button"
          onClick={onGoToPlan}
          className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to floor plan
        </button>
      </div>
    </div>
  );
}
