import { useMemo, useState } from "react";
import { autoPlanCabinet, cabinetCsv, cabinetRows, cabinetStats, cabinetSvg, layoutCabinet, newId } from "../lib/engine.js";
import type { CabinetDevice, ElectricalPlanGlobalState } from "../lib/types.js";
import { actions } from "document-models/electrical-plan";
import type { ElectricalPlanAction } from "document-models/electrical-plan/v1";
import { downloadText, printHtml, safeFilename } from "../lib/ui.js";

interface Props { state: ElectricalPlanGlobalState; dispatch: (action: ElectricalPlanAction) => void; }

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500";

const DEVICE_KINDS = [
  { id: "mcb", label: "MCB" },
  { id: "rcbo", label: "RCBO" },
  { id: "rcd", label: "RCD" },
  { id: "main_switch", label: "Main switch" },
  { id: "spd", label: "Surge protection" },
  { id: "meter", label: "Energy meter" },
  { id: "terminal", label: "Terminal block" },
  { id: "knx_actuator", label: "KNX actuator" },
  { id: "other", label: "Other" },
];

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function CabinetPanel({ state, dispatch }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(state.distributors.at(0)?.id ?? null);
  const [newKind, setNewKind] = useState("mcb");
  const [newLabel, setNewLabel] = useState("");
  const [newTe, setNewTe] = useState(1);
  const [newArticle, setNewArticle] = useState("");
  const distributor = state.distributors.find((item) => item.id === selectedId) ?? state.distributors.at(0);
  const devices = useMemo(() => distributor ? state.cabinetDevices.filter((device) => device.distributorId === distributor.id) : [], [state.cabinetDevices, distributor]);
  const stats = distributor ? cabinetStats(distributor, devices) : null;
  const rows = distributor ? cabinetRows(distributor, devices) : [];
  const unplaced = devices.filter((device) => device.row == null || device.startTe == null);
  const svg = distributor ? cabinetSvg(distributor, devices) : "";

  const addBoard = () => {
    const id = newId("dist");
    dispatch(actions.addDistributor({ distributor: { id, name: `Distribution ${state.distributors.length + 1}`, location: null, rows: 5, tePerRow: 12, reservePercent: 20 } }));
    setSelectedId(id);
  };

  const autoPlan = () => {
    if (!distributor) return;
    if (devices.length && !window.confirm("Replace the current cabinet layout with an auto-generated one?")) return;
    dispatch(actions.planCabinet({ distributorId: distributor.id, devices: autoPlanCabinet(state, distributor.id) }));
  };

  const updateDistributor = (patch: Parameters<typeof actions.updateDistributor>[0]) => dispatch(actions.updateDistributor(patch));

  const saveDevices = (next: CabinetDevice[]) => {
    if (!distributor) return;
    dispatch(actions.planCabinet({ distributorId: distributor.id, devices: layoutCabinet(distributor, next) }));
  };

  const addDevice = () => {
    if (!distributor) return;
    const kindLabel = DEVICE_KINDS.find((kind) => kind.id === newKind)?.label ?? newKind;
    const device: CabinetDevice = {
      id: newId("dev"), distributorId: distributor.id, circuitId: null, kind: newKind,
      label: newLabel.trim() || kindLabel, teWidth: Math.max(1, Math.min(12, newTe)),
      row: null, startTe: null, phases: null, article: newArticle.trim() || null, price: null,
    };
    saveDevices([...devices, device]);
    setNewLabel("");
    setNewArticle("");
    setNewTe(1);
  };

  const deleteDevice = (id: string) => {
    if (!distributor) return;
    saveDevices(devices.filter((device) => device.id !== id));
  };

  if (!distributor) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-sm font-semibold text-slate-800">No distribution board yet</h2>
          <p className="mt-1 text-xs text-slate-500">Create a board, then let Planvolt place main switch, SPD, RCDs, MCBs and terminal blocks.</p>
          <button type="button" onClick={addBoard} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">Create distribution board</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Distribution board</h2>
            <p className="text-xs text-slate-500">DIN rail layout in TE, with reserve check and BOM output.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={distributor.id} onChange={(event) => setSelectedId(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
              {state.distributors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <button type="button" onClick={addBoard} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">+ Board</button>
            <button type="button" onClick={autoPlan} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">Auto-plan</button>
            <button type="button" onClick={() => downloadText(`${safeFilename(distributor.name)}.svg`, svg, "image/svg+xml")} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">SVG</button>
            <button type="button" onClick={() => downloadText(`${safeFilename(distributor.name)}.csv`, cabinetCsv(distributor, devices), "text/csv")} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">CSV</button>
            <button type="button" onClick={() => printHtml(`${distributor.name} — Cabinet`, `<h1>${escapeHtml(distributor.name)}</h1><div class="meta">${escapeHtml(state.name)} · ${devices.length} devices</div>${svg}`)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Print</button>
          </div>
        </header>

        {stats && !stats.reserveOk ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">Reserve is {stats.reservePercent.toFixed(0)} % — below the configured {stats.requiredReserve} % target. Add rows or reduce devices.</div> : null}
        {stats ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rows × TE</p><p className="mt-1 text-xl font-semibold text-slate-900">{distributor.rows} × {distributor.tePerRow}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Used TE</p><p className="mt-1 text-xl font-semibold text-slate-900">{stats.usedTe}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Free TE</p><p className="mt-1 text-xl font-semibold text-slate-900">{stats.freeTe}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Reserve</p><p className={`mt-1 text-xl font-semibold ${stats.reserveOk ? "text-emerald-600" : "text-red-600"}`}>{stats.reservePercent.toFixed(0)} %</p><p className="text-[10px] text-slate-400">target {stats.requiredReserve} %</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Devices</p><p className="mt-1 text-xl font-semibold text-slate-900">{devices.length}</p><p className="text-[10px] text-slate-400">{stats.unplaced} unplaced</p></div>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">DIN rail preview</h3>
              <span className="text-[10px] text-slate-400">RCD = yellow · MCB = blue · main = red · KNX = green</span>
            </div>
            {devices.length ? <div className="overflow-x-auto [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">No cabinet devices. Use <strong>Auto-plan</strong> or add circuits first.</div>}
          </section>

          <aside className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Board settings</h3>
            <div className="space-y-3">
              <label><span className={labelClass}>Name</span><input key={`${distributor.id}-${distributor.name}`} defaultValue={distributor.name} className={inputClass} onBlur={(event) => { if (event.target.value.trim()) updateDistributor({ id: distributor.id, name: event.target.value.trim() }); }} /></label>
              <label><span className={labelClass}>Location</span><input key={`${distributor.id}-${distributor.location}`} defaultValue={distributor.location ?? ""} className={inputClass} onBlur={(event) => updateDistributor({ id: distributor.id, location: event.target.value })} /></label>
              <div className="grid grid-cols-2 gap-2">
                <label><span className={labelClass}>Rows</span><input key={`${distributor.id}-${distributor.rows}`} type="number" min={1} max={20} defaultValue={distributor.rows} className={inputClass} onBlur={(event) => updateDistributor({ id: distributor.id, rows: Math.max(1, Number(event.target.value) || 1) })} /></label>
                <label><span className={labelClass}>TE / row</span><input key={`${distributor.id}-${distributor.tePerRow}`} type="number" min={1} max={48} defaultValue={distributor.tePerRow} className={inputClass} onBlur={(event) => updateDistributor({ id: distributor.id, tePerRow: Math.max(1, Number(event.target.value) || 12) })} /></label>
              </div>
              <label><span className={labelClass}>Reserve (%)</span><input key={`${distributor.id}-${distributor.reservePercent}`} type="number" min={0} max={100} defaultValue={distributor.reservePercent} className={inputClass} onBlur={(event) => updateDistributor({ id: distributor.id, reservePercent: Math.max(0, Number(event.target.value) || 0) })} /></label>
            </div>
          </aside>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Add device manually</h3>
              <p className="text-[11px] text-slate-400">The board re-flows after adding or deleting a device.</p>
            </div>
            {unplaced.length ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700">{unplaced.length} unplaced</span> : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)_90px_minmax(0,1fr)_auto]">
            <label><span className={labelClass}>Kind</span>
              <select value={newKind} onChange={(event) => setNewKind(event.target.value)} className={inputClass}>
                {DEVICE_KINDS.map((kind) => <option key={kind.id} value={kind.id}>{kind.label}</option>)}
              </select>
            </label>
            <label><span className={labelClass}>Label</span><input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="e.g. SK2 · Kitchen" className={inputClass} /></label>
            <label><span className={labelClass}>TE</span><input type="number" min={1} max={12} value={newTe} onChange={(event) => setNewTe(Number(event.target.value) || 1)} className={inputClass} /></label>
            <label><span className={labelClass}>Article</span><input value={newArticle} onChange={(event) => setNewArticle(event.target.value)} placeholder="B16" className={inputClass} /></label>
            <button type="button" onClick={addDevice} className="h-[30px] self-end rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-700">Add</button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <header className="border-b border-slate-200 bg-slate-50 px-4 py-2.5"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Rows</h3></header>
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.row} className="flex items-start gap-3 px-4 py-2.5">
                <span className="mt-0.5 w-8 text-[10px] font-semibold text-slate-400">R{row.row + 1}</span>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {row.devices.length ? row.devices.map((device) => (
                    <span key={device.id} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600" title={`${device.teWidth} TE · ${device.article ?? ""}`}>
                      {device.label} <span className="text-slate-400">· {device.teWidth} TE</span>
                      <button type="button" title="Remove device" onClick={() => deleteDevice(device.id)} className="ml-1 text-slate-300 hover:text-red-500">×</button>
                    </span>
                  )) : <span className="text-[10px] text-slate-300">empty</span>}
                </div>
                <span className="text-[10px] text-slate-400">{row.freeTe} TE free</span>
              </div>
            ))}
          </div>
        </section>

        {unplaced.length ? (
          <section className="overflow-hidden rounded-xl border border-amber-200 bg-white">
            <header className="border-b border-amber-100 bg-amber-50 px-4 py-2.5"><h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">Unplaced devices</h3></header>
            <div className="flex flex-wrap gap-1.5 p-3">
              {unplaced.map((device) => (
                <span key={device.id} className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-800">
                  {device.label} · {device.teWidth} TE
                  <button type="button" title="Remove device" onClick={() => deleteDevice(device.id)} className="text-amber-400 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
