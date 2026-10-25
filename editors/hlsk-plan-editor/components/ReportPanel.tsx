import type { Bom, CheckItem } from "../lib/engine.js";

interface Props {
  projectName: string;
  floors: number;
  bom: Bom;
  checks: CheckItem[];
  onPrintReport: () => void;
}

export function ReportPanel({
  projectName,
  floors,
  bom,
  checks,
  onPrintReport,
}: Props) {
  const warnings = checks.filter(
    (check) => check.severity === "warning",
  ).length;
  return (
    <div className="mx-auto max-w-5xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Project report
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            A printable summary with the floor plan, materials, quantities and
            plan checks.
          </p>
        </div>
        <button
          type="button"
          onClick={onPrintReport}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Print / save as PDF
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">
          {projectName}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {floors} floor{floors === 1 ? "" : "s"} · {bom.totals.fixtures}{" "}
          fixtures · {bom.totals.pipeLengthM.toFixed(1)} m pipes ·{" "}
          {bom.totals.ductLengthM.toFixed(1)} m ducts · {bom.totals.risers}{" "}
          risers
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Plan checks
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {warnings} warnings
            </p>
            <p className="text-[11px] text-slate-500">
              Review warnings before work starts.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Materials
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {bom.lines.length} line items
            </p>
            <p className="text-[11px] text-slate-500">
              Grouped by floor, trade and size.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Plan drawing
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Included
            </p>
            <p className="text-[11px] text-slate-500">
              The current floor is printed with labels.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800">
          What the PDF contains
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-slate-600">
          <li>Project summary and legend.</li>
          <li>Current floor plan with fixtures, pipes, ducts and risers.</li>
          <li>Materials and quantities per floor.</li>
          <li>Plain-language plan checks with suggested fixes.</li>
        </ol>
        <p className="mt-2 text-[11px] text-slate-500">
          The print dialog opens a new page; choose “Save as PDF” there if you
          need a file.
        </p>
      </div>
    </div>
  );
}
