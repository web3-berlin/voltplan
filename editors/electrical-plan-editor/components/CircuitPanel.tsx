import { useMemo } from "react";
import { getElectricalDef } from "../lib/catalog.js";
import {
  CIRCUIT_KIND_LABELS,
  cableAmpacity,
  circuitColor,
  circuitRouteLengthM,
  circuitLoads,
  circuitWarnings,
  duplicateCircuitNumbers,
  newId,
  recommendedBreaker,
  INSTALLATION_METHODS,
  recommendedCable,
  routeLengthM,
  voltageDropPercent,
} from "../lib/engine.js";
import type { ElectricalCircuit, ElectricalPlanGlobalState, ElectricalUnit } from "../lib/types.js";
import { actions } from "document-models/electrical-plan";
import type { ElectricalPlanAction } from "document-models/electrical-plan/v1";
import { round1 } from "../lib/ui.js";

interface Props {
  state: ElectricalPlanGlobalState;
  activeUnit: ElectricalUnit;
  dispatch: (action: ElectricalPlanAction) => void;
  selectedCircuitId: string | null;
  onSelectCircuit: (id: string | null) => void;
  selectedSymbolId: string | null;
  routeDrawing: boolean;
  onDrawRoute: (circuitId?: string) => void;
}

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelClass = "text-[10px] font-semibold uppercase tracking-wide text-slate-500";

function WarningMark({ count }: { count: number }) {
  if (!count) return null;
  return <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[9px] font-bold text-amber-700" title={`${count} warning${count === 1 ? "" : "s"}`}>{count}</span>;
}

export function CircuitPanel({ state, activeUnit, dispatch, selectedCircuitId, onSelectCircuit, selectedSymbolId, routeDrawing, onDrawRoute }: Props) {
  const loads = useMemo(() => circuitLoads(state), [state]);
  const selected = state.circuits.find((circuit) => circuit.id === selectedCircuitId) ?? state.circuits.at(0);
  const duplicateWarnings = useMemo(() => duplicateCircuitNumbers(state.circuits), [state.circuits]);
  const selectedSymbol = activeUnit.symbols.find((symbol) => symbol.id === selectedSymbolId);
  const selectedSymbolDef = selectedSymbol ? getElectricalDef(selectedSymbol.defId) : undefined;
  const selectedAmpacity = selected ? cableAmpacity(selected) : null;
  const selectedRoutes = selected ? (state.routes ?? []).filter((route) => route.circuitId === selected.id) : [];
  const selectedRouteLength = selected ? circuitRouteLengthM(state, selected.id) : 0;

  const addCircuit = () => {
    const skNumber = state.nextCircuitNumber;
    const id = newId("circuit");
    dispatch(actions.addCircuit({
      circuit: {
        id,
        skNumber,
        name: `Circuit ${skNumber}`,
        kind: "sockets",
        distributorId: state.distributors[0]?.id ?? null,
        color: circuitColor(state.circuits.length),
        notes: "",
        phases: ["L1"],
        breaker: { characteristic: "B", ratingA: 16, poles: 1, rcbo: false, rcdMa: 30 },
        cable: { type: "NYM-J 3x1,5", crossSectionMm2: 1.5, lengthM: 0 },
        installationMethod: "B2",
        ambientTempC: 30,
        groupedCircuits: 1,
      },
    }));
    onSelectCircuit(id);
  };

  const update = (patch: Parameters<typeof actions.updateCircuit>[0]) => dispatch(actions.updateCircuit(patch));

  const autoSize = (circuit: ElectricalCircuit) => {
    const load = loads.get(circuit.id);
    const ratingA = recommendedBreaker(load?.watts ?? 0, circuit.breaker.poles);
    const cable = recommendedCable(ratingA, circuit.breaker.poles);
    update({
      id: circuit.id,
      ratingA,
      cableType: cable.type,
      crossSectionMm2: cable.crossSectionMm2,
      rcdMa: circuit.kind === "sockets" || circuit.kind === "appliance" ? 30 : circuit.breaker.rcdMa,
    });
  };

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[340px_minmax(0,1fr)] overflow-hidden bg-slate-50">
      <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Circuits</h2>
            <p className="text-[10px] text-slate-400">Load, breaker and cable sizing</p>
          </div>
          <button type="button" onClick={addCircuit} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">+ Add</button>
        </div>
        {duplicateWarnings.length ? (
          <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-[11px] text-red-700">
            {duplicateWarnings.map((message) => <p key={message}>{message}</p>)}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {state.circuits.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              <p className="mb-2 font-medium text-slate-500">No circuits yet.</p>
              <p>Create a circuit, then place sockets and lights on the plan.</p>
            </div>
          ) : null}
          {[...state.circuits].sort((a, b) => a.skNumber - b.skNumber).map((circuit) => {
            const load = loads.get(circuit.id);
            const warnings = circuitWarnings(circuit, load);
            const active = selected?.id === circuit.id;
            const ratio = circuit.breaker.ratingA > 0 ? Math.min(100, ((load?.currentA ?? 0) / circuit.breaker.ratingA) * 100) : 0;
            return (
              <button
                key={circuit.id}
                type="button"
                onClick={() => onSelectCircuit(circuit.id)}
                className={`w-full border-b border-slate-100 px-4 py-3 text-left transition ${active ? "bg-blue-50" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: circuit.color ?? circuitColor(circuit.skNumber) }} />
                  <span className="text-xs font-semibold text-slate-800">SK{circuit.skNumber} · {circuit.name || "Unnamed"}</span>
                  <span className="ml-auto"><WarningMark count={warnings.length} /></span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{(CIRCUIT_KIND_LABELS as Record<string, string | undefined>)[circuit.kind] ?? circuit.kind} · {load?.points ?? 0} points · {Math.round(load?.watts ?? 0)} W</span>
                  <span className={ratio >= 100 ? "font-semibold text-red-600" : ratio >= 80 ? "font-semibold text-amber-600" : ""}>{round1(load?.currentA ?? 0)} / {circuit.breaker.ratingA} A</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${ratio >= 100 ? "bg-red-500" : ratio >= 80 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${Math.max(2, ratio)}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-h-0 overflow-y-auto p-5">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-center text-xs text-slate-400">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-500">Select or create a circuit.</p>
              <p>Circuits collect symbols and drive the BOM, cabinet and diagram.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold text-white">SK{selected.skNumber}</span>
                  <h2 className="text-lg font-semibold text-slate-900">{selected.name}</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">{selected.breaker.characteristic}{selected.breaker.ratingA} A · {selected.breaker.poles}P · {selected.cable.type} · {selected.breaker.rcdMa ? "RCD 30 mA" : "No RCD"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => onDrawRoute(selected.id)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${routeDrawing ? "bg-blue-700 text-white" : "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50"}`}>{routeDrawing ? "Drawing route…" : "Draw route"}</button>
                <button type="button" onClick={() => autoSize(selected)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Auto-size</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Delete SK${selected.skNumber}? Assigned symbols will be unassigned.`)) return;
                    dispatch(actions.removeCircuit({ id: selected.id }));
                    onSelectCircuit(null);
                  }}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >Delete</button>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className={labelClass}>Load</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{Math.round(loads.get(selected.id)?.watts ?? 0)} W</p>
                <p className="text-[10px] text-slate-400">{loads.get(selected.id)?.points ?? 0} points</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className={labelClass}>Current</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{round1(loads.get(selected.id)?.currentA ?? 0)} A</p>
                <p className="text-[10px] text-slate-400">of {selected.breaker.ratingA} A</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className={labelClass}>Cable</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selected.cable.type}</p>
                <p className="text-[10px] text-slate-400">{selected.cable.crossSectionMm2} mm² · {selected.cable.lengthM ?? 0} m</p>
                <p className="text-[10px] text-slate-400">{selected.installationMethod ?? "B2"} · {selected.ambientTempC ?? 30} °C · {selected.groupedCircuits ?? 1}× · {selectedAmpacity == null ? "—" : `${selectedAmpacity.toFixed(1)} A`}</p>
                <p className="text-[10px] text-blue-600">{selectedRoutes.length ? `Route ${selectedRouteLength.toFixed(1)} m incl. 10 % reserve` : "No cable route drawn"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className={labelClass}>Voltage drop</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{voltageDropPercent(selected, loads.get(selected.id)) == null ? "—" : `${round1(voltageDropPercent(selected, loads.get(selected.id)) ?? 0)} %`}</p>
                <p className="text-[10px] text-slate-400">3 % target · 5 % max</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className={labelClass}>Protection</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selected.breaker.rcdMa ? `${selected.breaker.rcdMa} mA` : "—"}</p>
                <p className="text-[10px] text-slate-400">{selected.breaker.rcbo ? "RCBO" : "MCB"}</p>
              </div>
            </div>

            {circuitWarnings(selected, loads.get(selected.id)).length ? (
              <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3">
                {circuitWarnings(selected, loads.get(selected.id)).map((warning) => (
                  <p key={warning.code} className={`text-[11px] ${warning.severity === "error" ? "font-medium text-red-700" : "text-amber-800"}`}>
                    {warning.severity === "error" ? "Error" : warning.severity === "warning" ? "Warning" : "Info"}: {warning.message}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Circuit settings</h3>
              <div className="grid grid-cols-2 gap-3">
                <label><span className={labelClass}>Name</span><input key={`${selected.id}-${selected.name}`} defaultValue={selected.name} className={inputClass} onBlur={(event) => { if (event.target.value.trim()) update({ id: selected.id, name: event.target.value.trim() }); }} /></label>
                <label><span className={labelClass}>Type</span>
                  <select value={selected.kind} className={inputClass} onChange={(event) => update({ id: selected.id, kind: event.target.value })}>
                    {Object.entries(CIRCUIT_KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label><span className={labelClass}>Colour</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={selected.color ?? "#2563eb"} onChange={(event) => update({ id: selected.id, color: event.target.value })} className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-white p-0.5" />
                    <span className="text-[10px] text-slate-400">Plan badges and diagram</span>
                  </div>
                </label>
                <label><span className={labelClass}>Distribution board</span>
                  <select value={selected.distributorId ?? ""} className={inputClass} onChange={(event) => update({ id: selected.id, distributorId: event.target.value || null })}>
                    <option value="">Unassigned</option>
                    {state.distributors.map((distributor) => <option key={distributor.id} value={distributor.id}>{distributor.name}</option>)}
                  </select>
                </label>
                <label><span className={labelClass}>Breaker rating (A)</span>
                  <select value={selected.breaker.ratingA} className={inputClass} onChange={(event) => update({ id: selected.id, ratingA: Number(event.target.value) })}>
                    {[6, 10, 13, 16, 20, 25, 32, 40, 50, 63].map((rating) => <option key={rating} value={rating}>{rating} A</option>)}
                  </select>
                </label>
                <label><span className={labelClass}>Characteristic</span>
                  <select value={selected.breaker.characteristic} className={inputClass} onChange={(event) => update({ id: selected.id, characteristic: event.target.value })}>
                    {["B", "C", "D"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label><span className={labelClass}>Poles</span>
                  <select value={selected.breaker.poles} className={inputClass} onChange={(event) => {
                    const poles = Number(event.target.value);
                    update({ id: selected.id, poles, phases: poles === 3 ? ["L1", "L2", "L3"] : [selected.phases?.[0] ?? "L1"] });
                  }}>
                    <option value={1}>1P</option><option value={3}>3P</option>
                  </select>
                </label>
                <label><span className={labelClass}>Phase</span>
                  <select value={selected.phases?.[0] ?? "L1"} disabled={selected.breaker.poles === 3} className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`} onChange={(event) => update({ id: selected.id, phases: [event.target.value] })}>
                    {["L1", "L2", "L3"].map((phase) => <option key={phase}>{phase}</option>)}
                  </select>
                </label>
                <label><span className={labelClass}>RCD</span>
                  <select value={selected.breaker.rcdMa ?? 0} className={inputClass} onChange={(event) => update({ id: selected.id, rcdMa: Number(event.target.value) || null })}>
                    <option value={0}>None</option><option value={30}>30 mA</option><option value={300}>300 mA</option>
                  </select>
                </label>
                <label className="flex items-end gap-2 pb-1.5 text-xs text-slate-600">
                  <input type="checkbox" checked={selected.breaker.rcbo ?? false} onChange={(event) => update({ id: selected.id, rcbo: event.target.checked })} />
                  RCBO (breaker + RCD)
                </label>
                <label><span className={labelClass}>Cable</span><input key={`${selected.id}-${selected.cable.type}`} defaultValue={selected.cable.type} className={inputClass} onBlur={(event) => update({ id: selected.id, cableType: event.target.value })} /></label>
                <label><span className={labelClass}>Cross-section (mm²)</span>
                  <select value={selected.cable.crossSectionMm2} className={inputClass} onChange={(event) => update({ id: selected.id, crossSectionMm2: Number(event.target.value) })}>
                    {[1.5, 2.5, 4, 6, 10, 16, 25].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label><span className={labelClass}>Cable length (m)</span><input key={`${selected.id}-${selected.cable.lengthM}`} type="number" min={0} step={0.5} defaultValue={selected.cable.lengthM ?? 0} className={inputClass} onBlur={(event) => update({ id: selected.id, lengthM: Math.max(0, Number(event.target.value) || 0) })} /></label>
                <label><span className={labelClass}>Installation method</span>
                  <select value={selected.installationMethod ?? "B2"} className={inputClass} onChange={(event) => update({ id: selected.id, installationMethod: event.target.value })}>
                    {INSTALLATION_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
                  </select>
                </label>
                <label><span className={labelClass}>Ambient temperature (°C)</span><input key={`${selected.id}-${selected.ambientTempC}`} type="number" min={20} max={60} step={5} defaultValue={selected.ambientTempC ?? 30} className={inputClass} onBlur={(event) => update({ id: selected.id, ambientTempC: Math.max(20, Math.min(60, Number(event.target.value) || 30)) })} /></label>
                <label><span className={labelClass}>Grouped circuits</span><input key={`${selected.id}-${selected.groupedCircuits}`} type="number" min={1} max={9} step={1} defaultValue={selected.groupedCircuits ?? 1} className={inputClass} onBlur={(event) => update({ id: selected.id, groupedCircuits: Math.max(1, Math.min(9, Math.round(Number(event.target.value) || 1))) })} /></label>
                <label className="col-span-2"><span className={labelClass}>Notes</span><input key={`${selected.id}-${selected.notes}`} defaultValue={selected.notes ?? ""} className={inputClass} onBlur={(event) => update({ id: selected.id, notes: event.target.value })} /></label>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cable routes</h3>
                <button type="button" onClick={() => onDrawRoute(selected.id)} className="rounded-md border border-blue-200 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-50">{routeDrawing ? "Cancel drawing" : "Draw route"}</button>
              </div>
              {selectedRoutes.length === 0 ? <p className="text-[11px] text-slate-400">Draw a polyline from the distribution board to the loads. The route length updates the cable length and voltage drop automatically.</p> : (
                <div className="space-y-1">
                  {selectedRoutes.map((route) => (
                    <div key={route.id} className="flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-[11px]">
                      <span className="flex-1 text-slate-700">{route.points.length} points · reserve {route.reservePercent ?? 10} %</span>
                      <span className="font-medium text-slate-700">{routeLengthM(route).toFixed(1)} m</span>
                      <button type="button" title="Delete cable route" className="text-slate-300 hover:text-red-500" onClick={() => {
                        const remaining = selectedRoutes.filter((item) => item.id !== route.id).reduce((sum, item) => sum + routeLengthM(item), 0);
                        dispatch(actions.removeRoute({ id: route.id }));
                        dispatch(actions.updateCircuit({ id: selected.id, lengthM: Math.round(remaining * 10) / 10 }));
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned symbols</h3>
                <span className="text-[10px] text-slate-400">{state.units.reduce((sum, unit) => sum + unit.symbols.filter((symbol) => symbol.circuitId === selected.id).length, 0)} total</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <button type="button" disabled={!selectedSymbol} onClick={() => selectedSymbol && dispatch(actions.assignSymbolCircuit({ unitId: activeUnit.id, symbolId: selectedSymbol.id, circuitId: selected.id }))} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
                  Assign selected {selectedSymbolDef ? `(${selectedSymbolDef.name})` : "symbol"}
                </button>
                <button type="button" disabled={!selectedSymbol} onClick={() => selectedSymbol && dispatch(actions.assignSymbolCircuit({ unitId: activeUnit.id, symbolId: selectedSymbol.id, circuitId: null }))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">Unassign</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {state.units.flatMap((unit) => unit.symbols.filter((symbol) => symbol.circuitId === selected.id).map((symbol) => {
                  const def = getElectricalDef(symbol.defId);
                  return <span key={symbol.id} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{unit.name}: {symbol.label || def?.name || symbol.defId}</span>;
                }))}
                {state.units.every((unit) => unit.symbols.every((symbol) => symbol.circuitId !== selected.id)) ? <span className="text-[11px] text-slate-400">No symbols assigned yet. Select a symbol on the plan and use the button above.</span> : null}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
