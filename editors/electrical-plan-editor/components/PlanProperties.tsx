import { getElectricalDef, electricalCategoryColor } from "../lib/catalog.js";
import { newId } from "../lib/engine.js";
import { polygonAreaM2, roomColor, unitRooms } from "../lib/rooms.js";
import type { ElectricalPlanGlobalState, ElectricalSymbol, ElectricalUnit } from "../lib/types.js";
import { actions } from "document-models/electrical-plan";
import type { ElectricalPlanAction } from "document-models/electrical-plan/v1";
import { SymbolGlyph } from "./SymbolGlyph.js";

interface Props {
  state: ElectricalPlanGlobalState;
  unit: ElectricalUnit;
  dispatch: (action: ElectricalPlanAction) => void;
  selectedSymbol: ElectricalSymbol | undefined;
  selectedRoomId: string | null;
  onSelectRoom: (id: string | null) => void;
  onPickBackground: () => void;
  onClearSymbol: () => void;
  onStartRoom: () => void;
}

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500";

function LockGlyph({ locked }: { locked: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.4" />
      {locked ? <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" /> : <path d="M5.5 7V5.2a2.5 2.5 0 0 1 4.7-1.2" />}
    </svg>
  );
}

export function PlanProperties({ state, unit, dispatch, selectedSymbol, selectedRoomId, onSelectRoom, onPickBackground, onClearSymbol, onStartRoom }: Props) {
  const def = selectedSymbol ? getElectricalDef(selectedSymbol.defId) : undefined;
  const background = unit.background;
  const rooms = unitRooms(unit);
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
  const updateBackground = (patch: Parameters<typeof actions.updateUnitBackground>[0]) => dispatch(actions.updateUnitBackground(patch));

  if (selectedSymbol && def) {
    const color = selectedSymbol.color ?? electricalCategoryColor(def.category);
    return (
      <aside className="flex h-full w-[300px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{def.category} · {def.mount}</p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-900">{def.name}</h2>
              <p className="text-[11px] text-slate-500">{def.de}</p>
              {def.manufacturer || def.orderNumber ? <p className="mt-1 text-[10px] text-slate-400">{def.manufacturer ?? "—"}{def.orderNumber ? ` · ${def.orderNumber}` : ""}{def.channels ? ` · ${def.channels} channels` : ""}{def.busLoads != null ? ` · ${def.busLoads * 10} mA bus` : ""}</p> : null}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <svg viewBox="-11 -11 22 22" className="h-9 w-9" style={{ color }}><SymbolGlyph def={def} color={color} /></svg>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
            <span className="rounded bg-slate-50 px-2 py-1">{def.widthCm} × {def.heightCm} cm</span>
            <span className="rounded bg-slate-50 px-2 py-1">{def.powerW ?? 0} W</span>
            <span className="rounded bg-slate-50 px-2 py-1">{def.article ?? "—"}</span>
            <span className="rounded bg-slate-50 px-2 py-1">{selectedSymbol.details?.price != null ? `${selectedSymbol.details.price.toFixed(2)} €` : def.price != null ? `${def.price.toFixed(2)} €` : "—"}</span>
          </div>
        </div>

        <div className="space-y-3 border-b border-slate-200 p-4">
          <label><span className={labelClass}>Label</span><input key={`${selectedSymbol.id}-${selectedSymbol.label}`} defaultValue={selectedSymbol.label ?? ""} placeholder={def.name} className={inputClass} onBlur={(event) => dispatch(actions.updateSymbol({ unitId: unit.id, id: selectedSymbol.id, label: event.target.value.trim() || null }))} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label><span className={labelClass}>Mount height (cm)</span><input key={`${selectedSymbol.id}-${selectedSymbol.mountHeightCm}`} type="number" defaultValue={selectedSymbol.mountHeightCm ?? def.defaultHeightCm} className={inputClass} onBlur={(event) => dispatch(actions.updateSymbol({ unitId: unit.id, id: selectedSymbol.id, mountHeightCm: Number(event.target.value) }))} /></label>
            <label><span className={labelClass}>Rotation</span>
              <select value={selectedSymbol.rotation} className={inputClass} onChange={(event) => dispatch(actions.updateSymbol({ unitId: unit.id, id: selectedSymbol.id, rotation: Number(event.target.value) }))}>
                {[0, 90, 180, 270].map((value) => <option key={value} value={value}>{value}°</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label><span className={labelClass}>Price override (€)</span><input key={`${selectedSymbol.id}-price-${selectedSymbol.details?.price}`} type="number" min={0} step="0.01" defaultValue={selectedSymbol.details?.price ?? ""} placeholder={def.price != null ? def.price.toFixed(2) : "0.00"} className={inputClass} onBlur={(event) => {
              const value = event.target.value.trim();
              const price = value === "" ? null : Number(value);
              dispatch(actions.updateSymbolDetails({ unitId: unit.id, id: selectedSymbol.id, price: Number.isFinite(price as number) ? price : null }));
            }} /></label>
            <label><span className={labelClass}>Circuit</span>
              <select value={selectedSymbol.circuitId ?? ""} className={inputClass} onChange={(event) => dispatch(actions.updateSymbol({ unitId: unit.id, id: selectedSymbol.id, circuitId: event.target.value || null }))}>
                <option value="">Unassigned</option>
                {[...state.circuits].sort((a, b) => a.skNumber - b.skNumber).map((circuit) => <option key={circuit.id} value={circuit.id}>SK{circuit.skNumber} · {circuit.name}</option>)}
              </select>
            </label>
          </div>
          <label><span className={labelClass}>Symbol note</span><input key={`${selectedSymbol.id}-note-${selectedSymbol.details?.note}`} defaultValue={selectedSymbol.details?.note ?? ""} placeholder="Optional note for BOM / handover" className={inputClass} onBlur={(event) => dispatch(actions.updateSymbolDetails({ unitId: unit.id, id: selectedSymbol.id, note: event.target.value.trim() || null }))} /></label>
          <label><span className={labelClass}>Room</span>
            <select value={selectedSymbol.roomId ?? ""} className={inputClass} onChange={(event) => dispatch(actions.updateSymbol({ unitId: unit.id, id: selectedSymbol.id, roomId: event.target.value || null }))}>
              <option value="">No room</option>
              {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={selectedSymbol.locked ?? false} onChange={(event) => dispatch(actions.updateSymbol({ unitId: unit.id, id: selectedSymbol.id, locked: event.target.checked }))} />
              Lock position
            </label>
            {def.bus ? (
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={selectedSymbol.knx?.enabled ?? false} onChange={(event) => dispatch(actions.updateSymbol({ unitId: unit.id, id: selectedSymbol.id, knxEnabled: event.target.checked }))} />
                KNX bus participant
              </label>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => {
              const id = newId("sym");
              dispatch(actions.addSymbol({ unitId: unit.id, symbol: { id, defId: selectedSymbol.defId, knxEnabled: selectedSymbol.knx?.enabled ?? false, position: { x: selectedSymbol.position.x + 10, y: selectedSymbol.position.y + 10 }, rotation: selectedSymbol.rotation, mountHeightCm: selectedSymbol.mountHeightCm, label: selectedSymbol.label, circuitId: selectedSymbol.circuitId, roomId: selectedSymbol.roomId } }));
            }} className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Duplicate</button>
            <button type="button" onClick={() => { dispatch(actions.removeSymbol({ unitId: unit.id, id: selectedSymbol.id })); onClearSymbol(); }} className="flex-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
          </div>
        </div>

        <div className="p-4 text-[11px] leading-relaxed text-slate-400">
          Drag to move. Arrow keys can nudge after selecting. Press R to rotate by 90°, Ctrl+D to duplicate, Delete to remove.
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Plan settings</p>
        <h2 className="mt-0.5 text-sm font-semibold text-slate-900">{unit.name}</h2>
        <p className="text-[11px] text-slate-500">{unit.symbols.length} symbols · {rooms.length} rooms · level {unit.level}</p>
      </div>

      <div className="space-y-3 border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rooms</h3>
          <button type="button" onClick={onStartRoom} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700">Draw room</button>
        </div>
        {rooms.length === 0 ? <p className="text-[11px] leading-relaxed text-slate-400">Draw room polygons to label areas, auto-assign symbols and get an area/load schedule.</p> : (
          <div className="space-y-1">
            {rooms.map((room, index) => {
              const selected = selectedRoomId === room.id;
              return (
                <div key={room.id} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[11px] ${selected ? "border-blue-300 bg-blue-50" : "border-slate-100"}`}>
                  <input type="color" aria-label={`Colour for ${room.name}`} value={room.fillColor ?? roomColor(index)} onChange={(event) => dispatch(actions.updateRoom({ unitId: unit.id, id: room.id, fillColor: event.target.value }))} className="h-5 w-5 shrink-0 cursor-pointer rounded border border-slate-200 bg-transparent p-0" />
                  <button type="button" className={`min-w-0 flex-1 truncate text-left font-medium hover:underline ${selected ? "text-blue-700" : "text-slate-700"}`} onClick={() => onSelectRoom(room.id)} title="Select room and edit its shape on the plan">{room.name}</button>
                  <span className="text-slate-400">{polygonAreaM2(room.points).toFixed(1)} m²</span>
                  <button type="button" title={room.locked ? "Unlock room" : "Lock room (prevent moving and reshaping)"} aria-label={room.locked ? `Unlock ${room.name}` : `Lock ${room.name}`} className={room.locked ? "text-amber-600 hover:text-amber-700" : "text-slate-300 hover:text-slate-600"} onClick={() => {
                    dispatch(actions.updateRoom({ unitId: unit.id, id: room.id, locked: !room.locked }));
                    onSelectRoom(room.id);
                  }}><LockGlyph locked={!!room.locked} /></button>
                  <button type="button" title="Rename room" className="text-slate-400 hover:text-blue-600" onClick={() => {
                    const name = window.prompt("Rename room", room.name);
                    if (name?.trim() && name.trim() !== room.name) dispatch(actions.updateRoom({ unitId: unit.id, id: room.id, name: name.trim() }));
                  }}>✎</button>
                  <button type="button" title="Delete room" className="text-slate-300 hover:text-red-500" onClick={() => {
                    if (window.confirm(`Delete ${room.name}? Symbols stay on the plan and become unassigned.`)) {
                      dispatch(actions.removeRoom({ unitId: unit.id, id: room.id }));
                      if (selected) onSelectRoom(null);
                    }
                  }}>×</button>
                </div>
              );
            })}
          </div>
        )}
        {selectedRoom ? (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
              <input type="checkbox" checked={!!selectedRoom.locked} onChange={(event) => dispatch(actions.updateRoom({ unitId: unit.id, id: selectedRoom.id, locked: event.target.checked }))} />
              Lock room (prevent moving and reshaping)
            </label>
            <p className="text-[10px] leading-relaxed text-slate-500">
              {selectedRoom.locked
                ? "This room is locked. Unlock it to drag the body or edit vertices."
                : "Drag the room body or its blue vertex handles on the plan. Double-click an edge to add a vertex; Alt-click a handle to remove one. Ctrl+C / Ctrl+V duplicates the room."}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Floor plan</h3>
          <button type="button" onClick={onPickBackground} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700">{background?.dataUrl ? "Replace" : "Import"}</button>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">PDF, PNG, JPG or WebP. For multi-page PDFs you can choose the page. Drop a file directly on the plan.</p>
        {background?.dataUrl ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label><span className={labelClass}>Opacity</span><input type="range" min={0.05} max={1} step={0.05} value={background.opacity} className="w-full" onChange={(event) => updateBackground({ unitId: unit.id, opacity: Number(event.target.value) })} /></label>
              <label><span className={labelClass}>Width (cm)</span><input key={`${unit.id}-${background.widthCm}`} type="number" min={10} step={10} defaultValue={Math.round(background.widthCm ?? 0)} className={inputClass} onBlur={(event) => {
                const width = Math.max(10, Number(event.target.value) || 0);
                const oldWidth = background.widthCm ?? width;
                const oldHeight = background.heightCm ?? width * 0.65;
                updateBackground({ unitId: unit.id, widthCm: width, heightCm: oldWidth > 0 ? Math.round(oldHeight * (width / oldWidth) * 10) / 10 : oldHeight });
              }} /></label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label><span className={labelClass}>Rotation</span>
                <select value={background.rotation} className={inputClass} onChange={(event) => updateBackground({ unitId: unit.id, rotation: Number(event.target.value) })}>
                  {[0, 90, 180, 270].map((value) => <option key={value} value={value}>{value}°</option>)}
                </select>
              </label>
              <label><span className={labelClass}>Offset X (cm)</span><input key={`${unit.id}-bgx-${background.x}`} type="number" step={5} defaultValue={Math.round(background.x)} className={inputClass} onBlur={(event) => updateBackground({ unitId: unit.id, x: Number(event.target.value) || 0 })} /></label>
              <label><span className={labelClass}>Offset Y (cm)</span><input key={`${unit.id}-bgy-${background.y}`} type="number" step={5} defaultValue={Math.round(background.y)} className={inputClass} onBlur={(event) => updateBackground({ unitId: unit.id, y: Number(event.target.value) || 0 })} /></label>
              <div className="flex items-end pb-1.5 text-[10px] text-slate-400">Use offsets to align the underlay with the grid.</div>
            </div>
            <button type="button" onClick={() => { if (window.confirm("Remove the floor plan image from this floor?")) dispatch(actions.setUnitBackground({ unitId: unit.id })); }} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Remove image</button>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 border-b border-slate-200 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Display</h3>
        <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={state.settings.showCircuitBadges} onChange={(event) => dispatch(actions.updateSettings({ settings: { showCircuitBadges: event.target.checked } }))} /> Circuit badges on plan</label>
        <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={state.settings.showMountHeights} onChange={(event) => dispatch(actions.updateSettings({ settings: { showMountHeights: event.target.checked } }))} /> Mounting heights on plan</label>
      </div>

      <div className="space-y-2 border-b border-slate-200 p-4 text-[11px] leading-relaxed text-slate-500">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tips</h3>
        <p>Pick a symbol from the left, then click the plan to place it.</p>
        <p>Right-drag pans the plan; left-drag moves a symbol or room. <kbd className="rounded border border-slate-300 bg-slate-50 px-1">Alt</kbd>-drag also pans, scroll to zoom.</p>
        <p>Middle-click a symbol to rotate it 90°; locked symbols stay in place.</p>
        <p>Draw rooms to label areas; symbols placed inside are assigned automatically.</p>
        <p>Use <strong>Fit</strong> when the plan disappears after calibration.</p>
      </div>
    </aside>
  );
}
