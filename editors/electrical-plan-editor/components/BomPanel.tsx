import { useMemo } from "react";
import { bomCsv, electricalBom, CIRCUIT_KIND_LABELS } from "../lib/engine.js";
import type { ElectricalPlanGlobalState } from "../lib/types.js";
import { downloadText, formatEuro, printHtml, safeFilename } from "../lib/ui.js";

const CATEGORY_LABELS: Record<string, string> = {
  outlet: "Sockets", switch: "Switches", lighting: "Lighting", appliance: "Appliances",
  data: "Data / network", safety: "Safety", hvac: "HVAC", knx: "KNX", distribution: "Distribution",
  cabinet: "Cabinet", cable: "Cable", other: "Other",
};

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function BomPanel({ state }: { state: ElectricalPlanGlobalState }) {
  const bom = useMemo(() => electricalBom(state), [state]);

  const print = () => {
    const rows = bom.lines.map((line) => `<tr><td>${escapeXml(line.article)}</td><td>${escapeXml(line.description)}</td><td>${escapeXml(CATEGORY_LABELS[line.category] ?? line.category)}</td><td>${line.quantity} ${line.unit}</td><td>${formatEuro(line.unitPrice)}</td><td>${formatEuro(line.total)}</td><td>${escapeXml(line.roomBreakdown.map((room) => `${room.name} (${room.quantity})`).join(", "))}</td></tr>`).join("");
    const circuits = bom.circuits.map((circuit) => `<tr><td>SK${circuit.skNumber}</td><td>${escapeXml(circuit.name)}</td><td>${circuit.load?.points ?? 0}</td><td>${Math.round(circuit.load?.watts ?? 0)} W</td></tr>`).join("");
    const rooms = bom.rooms.map((room) => `<tr><td>${escapeXml(room.unitName)}</td><td>${escapeXml(room.name)}</td><td>${room.areaM2.toFixed(1)} m²</td><td>${room.points}</td><td>${Math.round(room.watts)} W</td></tr>`).join("");
    printHtml("Bill of materials", `<h1>Bill of materials</h1><div class="meta">${escapeXml(state.name)} · ${bom.totals.symbols} symbols · ${bom.rooms.length} rooms · ${formatEuro(bom.totals.total)}</div><table><thead><tr><th>Article</th><th>Description</th><th>Category</th><th>Qty</th><th>Unit price</th><th>Total</th><th>Rooms</th></tr></thead><tbody>${rows}</tbody></table><h1 style="margin-top:24px">Room schedule</h1><table><thead><tr><th>Floor</th><th>Room</th><th>Area</th><th>Points</th><th>Load</th></tr></thead><tbody>${rooms}</tbody></table><h1 style="margin-top:24px">Circuit schedule</h1><table><thead><tr><th>SK</th><th>Name</th><th>Points</th><th>Load</th></tr></thead><tbody>${circuits}</tbody></table>`);
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Bill of materials</h2>
            <p className="text-xs text-slate-500">Derived from symbols, circuits, cabinet devices and cable lengths.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => downloadText(`${safeFilename(state.name)}-bom.csv`, bomCsv(bom), "text/csv")} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Export CSV</button>
            <button type="button" onClick={print} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">Print / PDF</button>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Positions</p><p className="mt-1 text-2xl font-semibold text-slate-900">{bom.totals.symbols}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Line items</p><p className="mt-1 text-2xl font-semibold text-slate-900">{bom.totals.lines}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rooms</p><p className="mt-1 text-2xl font-semibold text-slate-900">{bom.rooms.length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Material value</p><p className="mt-1 text-2xl font-semibold text-slate-900">{formatEuro(bom.totals.total)}</p></div>
        </div>

        {bom.groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-xs text-slate-400">Place symbols on the plan or add circuits to build the BOM.</div>
        ) : null}

        {bom.groups.map((group) => (
          <section key={group.category} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{CATEGORY_LABELS[group.category] ?? group.category}</h3>
              <span className="text-[10px] text-slate-500">{group.quantity} units · {formatEuro(group.total)}</span>
            </header>
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-slate-400">
                <tr><th className="px-4 py-2 font-medium">Article</th><th className="px-4 py-2 font-medium">Description</th><th className="px-4 py-2 font-medium">Rooms</th><th className="px-4 py-2 text-right font-medium">Qty</th><th className="px-4 py-2 text-right font-medium">Unit</th><th className="px-4 py-2 text-right font-medium">Total</th></tr>
              </thead>
              <tbody>
                {group.lines.map((line) => (
                  <tr key={line.key} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono text-[10px] text-slate-500">{line.article}</td>
                    <td className="px-4 py-2 text-slate-700">{line.description}</td>
                    <td className="px-4 py-2 text-[10px] text-slate-500">{line.roomBreakdown.map((room) => `${room.name} (${room.quantity})`).join(", ") || "—"}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{line.quantity} {line.unit}</td>
                    <td className="px-4 py-2 text-right text-slate-500">{formatEuro(line.unitPrice)}</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-800">{formatEuro(line.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Room schedule</h3><span className="text-[10px] text-slate-400">{bom.rooms.reduce((sum, room) => sum + room.areaM2, 0).toFixed(1)} m² total</span></header>
          {bom.rooms.length === 0 ? <p className="p-4 text-xs text-slate-400">No rooms yet. Draw a room polygon in the installation plan.</p> : (
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-2 font-medium">Floor</th><th className="px-4 py-2 font-medium">Room</th><th className="px-4 py-2 text-right font-medium">Area</th><th className="px-4 py-2 text-right font-medium">Points</th><th className="px-4 py-2 text-right font-medium">Load</th></tr></thead>
              <tbody>
                {bom.rooms.map((room) => (
                  <tr key={`${room.unitId}:${room.roomId}`} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-500">{room.unitName}</td>
                    <td className="px-4 py-2 text-slate-700">{room.name}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{room.areaM2.toFixed(1)} m²</td>
                    <td className="px-4 py-2 text-right text-slate-600">{room.points}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{Math.round(room.watts)} W</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <header className="border-b border-slate-200 bg-slate-50 px-4 py-2.5"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Circuit schedule</h3></header>
          {bom.circuits.length === 0 ? <p className="p-4 text-xs text-slate-400">No circuits yet.</p> : (
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-2 font-medium">SK</th><th className="px-4 py-2 font-medium">Circuit</th><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 text-right font-medium">Points</th><th className="px-4 py-2 text-right font-medium">Load</th><th className="px-4 py-2 text-right font-medium">BOM lines</th></tr></thead>
              <tbody>
                {bom.circuits.map((circuit) => {
                  const source = state.circuits.find((item) => item.id === circuit.circuitId);
                  return (
                    <tr key={circuit.circuitId} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-semibold text-slate-700">SK{circuit.skNumber}</td>
                      <td className="px-4 py-2 text-slate-700">{circuit.name}</td>
                      <td className="px-4 py-2 text-slate-500">{source ? ((CIRCUIT_KIND_LABELS as Record<string, string | undefined>)[source.kind] ?? source.kind) : "—"}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{circuit.load?.points ?? 0}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{Math.round(circuit.load?.watts ?? 0)} W</td>
                      <td className="px-4 py-2 text-right text-slate-500">{circuit.lines.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
