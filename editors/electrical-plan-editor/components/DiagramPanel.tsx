import { useMemo, useState } from "react";
import { circuitDiagramPages } from "../lib/engine.js";
import type { ElectricalPlanGlobalState } from "../lib/types.js";
import { downloadText, printHtml, safeFilename } from "../lib/ui.js";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function DiagramPanel({ state }: { state: ElectricalPlanGlobalState }) {
  const pages = useMemo(() => circuitDiagramPages(state, state.name), [state]);
  const [page, setPage] = useState(1);
  const current = pages.find((item) => item.page === Math.min(page, pages.length)) ?? pages[0];

  if (!pages.length) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-sm font-semibold text-slate-800">No circuit diagram yet</h2>
          <p className="mt-1 text-xs text-slate-500">Add circuits and assign symbols to see a generated single-line diagram grouped by distribution board.</p>
        </div>
      </div>
    );
  }

  const downloadAll = () => {
    pages.forEach((item, index) => {
      setTimeout(() => downloadText(`${safeFilename(state.name)}-diagram-${item.page}.svg`, item.svg, "image/svg+xml"), index * 150);
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Circuit diagram</h2>
          <p className="text-[11px] text-slate-500">Generated single-line diagram · DIN EN 60617 inspired · {pages.length} pages</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={current.page} onChange={(event) => setPage(Number(event.target.value))} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
            {pages.map((item) => <option key={item.page} value={item.page}>Page {item.page} / {item.pages}</option>)}
          </select>
          <button type="button" onClick={() => downloadText(`${safeFilename(state.name)}-diagram-${current.page}.svg`, current.svg, "image/svg+xml")} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">SVG</button>
          {pages.length > 1 ? <button type="button" onClick={downloadAll} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">All SVG</button> : null}
          <button type="button" onClick={() => printHtml("Circuit diagram", `<h1>Circuit diagram</h1><div class="meta">${escapeXml(state.name)}</div>${pages.map((item) => `<div style="break-after: page">${item.svg}</div>`).join("")}`)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">Print / PDF</button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-5">
        <div className="mx-auto max-w-[1160px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: current.svg }} />
        <p className="mx-auto mt-3 max-w-[1160px] text-[11px] text-slate-400">The diagram is derived from circuit topology, not from cable routing. Busbars L1/L2/L3/N/PE and breaker symbols are schematic.</p>
      </div>
    </div>
  );
}
