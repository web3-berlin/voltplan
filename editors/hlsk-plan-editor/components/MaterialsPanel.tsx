import type { Bom } from "../lib/engine.js";

interface Props {
  bom: Bom;
  onDownloadCsv: () => void;
  onPrintReport: () => void;
}

export function MaterialsPanel({ bom, onDownloadCsv, onPrintReport }: Props) {
  return (
    <div className="mx-auto max-w-5xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Materials and quantities
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Quantities come from the fixtures and routes on the plan. Lengths
            are measured along the drawn route.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDownloadCsv}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={onPrintReport}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Print report
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Fixtures
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {bom.totals.fixtures}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Pipe routes
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {bom.totals.pipes}
          </p>
          <p className="text-[11px] text-slate-500">
            {bom.totals.pipeLengthM.toFixed(1)} m
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Duct routes
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {bom.totals.ducts}
          </p>
          <p className="text-[11px] text-slate-500">
            {bom.totals.ductLengthM.toFixed(1)} m
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Risers
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {bom.totals.risers}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="border-b border-slate-200 px-3 py-2">Floor</th>
              <th className="border-b border-slate-200 px-3 py-2">Category</th>
              <th className="border-b border-slate-200 px-3 py-2">Item</th>
              <th className="border-b border-slate-200 px-3 py-2">Detail</th>
              <th className="border-b border-slate-200 px-3 py-2 text-right">
                Quantity
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-right">
                Length
              </th>
            </tr>
          </thead>
          <tbody>
            {bom.lines.map((line, index) => (
              <tr
                key={`${line.unit}-${line.category}-${line.item}-${index}`}
                className="odd:bg-white even:bg-slate-50/60"
              >
                <td className="border-b border-slate-100 px-3 py-2 text-slate-600">
                  {line.unit}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-slate-600">
                  {line.category}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-800">
                  {line.item}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-slate-500">
                  {line.detail}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-right tabular-nums text-slate-800">
                  {line.quantity}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-right tabular-nums text-slate-600">
                  {line.lengthM == null ? "—" : `${line.lengthM.toFixed(1)} m`}
                </td>
              </tr>
            ))}
            {bom.lines.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-xs text-slate-500"
                >
                  No materials yet. Add fixtures and routes on the floor plan.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
