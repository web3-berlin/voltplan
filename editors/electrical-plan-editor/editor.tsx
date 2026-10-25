import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  actions,
  useSelectedElectricalPlanDocument,
} from "document-models/electrical-plan";
import type { ElectricalPlanAction } from "document-models/electrical-plan/v1";
import { electricalBom, routeLengthM } from "./lib/engine.js";
import { newId } from "./lib/engine.js";
import {
  pointInPolygon,
  polygonCentroid,
  roomAt,
  roomColor,
  unitRooms,
} from "./lib/rooms.js";
import { PlanCanvas } from "./components/PlanCanvas.js";
import type { PlanCanvasHandle } from "./components/PlanCanvas.js";
import { SymbolPalette } from "./components/SymbolPalette.js";
import { PlanProperties } from "./components/PlanProperties.js";
import { CircuitPanel } from "./components/CircuitPanel.js";
import { BomPanel } from "./components/BomPanel.js";
import { KnxPanel } from "./components/KnxPanel.js";
import { CabinetPanel } from "./components/CabinetPanel.js";
import { ProtocolPanel } from "./components/ProtocolPanel.js";
import { DiagramPanel } from "./components/DiagramPanel.js";
import { DocumentToolbar } from "@powerhousedao/design-system/connect/index";
import { projectReportHtml } from "./lib/report.js";
import { printHtml } from "./lib/ui.js";

type Tab =
  | "plan"
  | "circuits"
  | "bom"
  | "knx"
  | "cabinet"
  | "protocol"
  | "diagram";

interface RoomClipboard {
  name: string;
  points: { x: number; y: number }[];
  fillColor: string | null | undefined;
  labelX: number;
  labelY: number;
  pasteCount: number;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "plan", label: "Installation plan" },
  { id: "circuits", label: "Circuits" },
  { id: "bom", label: "BOM" },
  { id: "knx", label: "KNX" },
  { id: "cabinet", label: "Cabinet" },
  { id: "protocol", label: "Protocol" },
  { id: "diagram", label: "Diagram" },
];

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

async function loadRaster(file: File): Promise<LoadedImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () =>
      reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Could not read image"));
    element.src = dataUrl;
  });
  return { dataUrl, width: image.naturalWidth, height: image.naturalHeight };
}

async function loadPdf(file: File): Promise<LoadedImage | null> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "./pdf.worker.min.mjs",
    import.meta.url,
  ).href;
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  try {
    const requested = window.prompt(
      `This PDF has ${pdf.numPages} page${pdf.numPages === 1 ? "" : "s"}. Which page should become the floor plan?`,
      "1",
    );
    if (requested === null) return null;
    const pageNumber = Math.max(
      1,
      Math.min(pdf.numPages, Number(requested) || 1),
    );
    const page = await pdf.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(2.4, 2400 / Math.max(base.width, base.height));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available");
    await page.render({ canvasContext: context, viewport }).promise;
    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.86),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    await pdf.destroy();
  }
}

export default function Editor() {
  const [document, dispatch] = useSelectedElectricalPlanDocument();
  const state = document.state.global;
  const activeUnit =
    state.units.find((unit) => unit.id === state.activeUnitId) ??
    state.units.at(0);
  const [tab, setTab] = useState<Tab>("plan");
  const [selectedDefId, setSelectedDefId] = useState<string | null>(null);
  const [selectedSymbolId, setSelectedSymbolId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(
    null,
  );
  const [roomDrawing, setRoomDrawing] = useState(false);
  const [routeDrawing, setRouteDrawing] = useState(false);
  const [nameDraft, setNameDraft] = useState(state.name);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const planRef = useRef<PlanCanvasHandle>(null);
  const exportPlanRef = useRef<PlanCanvasHandle>(null);
  const roomClipboardRef = useRef<RoomClipboard | null>(null);
  const appliedHeaderName = useRef<string | null>(null);
  const bom = useMemo(() => electricalBom(state), [state]);

  useEffect(() => {
    setNameDraft(state.name);
  }, [state.name]);

  useEffect(() => {
    setRoomDrawing(false);
    setSelectedRoomId(null);
  }, [activeUnit?.id, tab]);

  useEffect(() => {
    setRouteDrawing(false);
  }, [activeUnit?.id]);

  useEffect(() => {
    const headerName = document.header.name.trim();
    if (
      state.name === "Untitled Project" &&
      headerName &&
      headerName !== state.name &&
      appliedHeaderName.current !== headerName
    ) {
      appliedHeaderName.current = headerName;
      dispatch(actions.setProjectName({ name: headerName }));
    }
  }, [dispatch, document.header.name, state.name]);

  const selectedSymbol = activeUnit?.symbols.find(
    (symbol) => symbol.id === selectedSymbolId,
  );

  const selectSymbol = (id: string | null) => {
    setSelectedSymbolId(id);
    if (id) {
      setSelectedRoomId(null);
      setRouteDrawing(false);
    }
  };

  const selectRoom = (id: string | null) => {
    setSelectedRoomId(id);
    if (id) {
      setSelectedSymbolId(null);
      setSelectedDefId(null);
      setRoomDrawing(false);
      setRouteDrawing(false);
    }
  };

  const commitName = () => {
    const name = nameDraft.trim();
    if (name && name !== state.name) dispatch(actions.setProjectName({ name }));
    else setNameDraft(state.name);
  };

  const addFloor = () => {
    const name = window.prompt(
      "Name of the new floor",
      `Floor ${state.units.length + 1}`,
    );
    if (!name?.trim()) return;
    const id = newId("unit");
    const level = Math.max(0, ...state.units.map((unit) => unit.level)) + 1;
    dispatch(actions.addUnit({ id, name: name.trim(), level }));
    dispatch(actions.setActiveUnit({ unitId: id }));
    setRoomDrawing(false);
    setTab("plan");
  };

  const renameFloor = () => {
    if (!activeUnit) return;
    const name = window.prompt("Rename floor", activeUnit.name);
    if (!name?.trim() || name.trim() === activeUnit.name) return;
    dispatch(actions.renameUnit({ id: activeUnit.id, name: name.trim() }));
  };

  const importFile = async (file: File) => {
    if (!activeUnit) return;
    setImporting(true);
    try {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      const loaded = isPdf ? await loadPdf(file) : await loadRaster(file);
      if (!loaded) return;
      const widthCm = 1200;
      const heightCm = Math.max(
        1,
        Math.round(((widthCm * loaded.height) / loaded.width) * 10) / 10,
      );
      dispatch(
        actions.setUnitBackground({
          unitId: activeUnit.id,
          background: {
            dataUrl: loaded.dataUrl,
            widthCm,
            heightCm,
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.42,
            rotation: 0,
            locked: false,
          },
        }),
      );
      window.setTimeout(() => planRef.current?.fit(), 80);
    } catch (error) {
      window.alert(
        `Could not import the plan: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setImporting(false);
    }
  };

  const importPlan = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await importFile(file);
  };

  const createRoom = (points: { x: number; y: number }[]) => {
    if (!activeUnit || points.length < 3) return;
    const defaultName = `Room ${unitRooms(activeUnit).length + 1}`;
    const name = window.prompt("Room name", defaultName);
    if (!name?.trim()) return;
    const id = newId("room");
    const label = polygonCentroid(points);
    dispatch(
      actions.addRoom({
        unitId: activeUnit.id,
        room: {
          id,
          name: name.trim(),
          points,
          fillColor: roomColor(unitRooms(activeUnit).length),
          labelX: label.x,
          labelY: label.y,
        },
      }),
    );
    for (const symbol of activeUnit.symbols) {
      if (pointInPolygon(symbol.position, points) && symbol.roomId !== id) {
        dispatch(
          actions.updateSymbol({
            unitId: activeUnit.id,
            id: symbol.id,
            roomId: id,
          }),
        );
      }
    }
    setRoomDrawing(false);
  };

  const createRoute = (points: { x: number; y: number }[]) => {
    if (!activeUnit || !selectedCircuitId || points.length < 2) return;
    const existing = (state.routes ?? []).filter(
      (route) => route.circuitId === selectedCircuitId,
    );
    const reservePercent = 10;
    const total =
      existing.reduce((sum, route) => sum + routeLengthM(route), 0) +
      routeLengthM({ points, reservePercent });
    dispatch(
      actions.addRoute({
        route: {
          id: newId("route"),
          circuitId: selectedCircuitId,
          unitId: activeUnit.id,
          points: points.map((point) => ({ x: point.x, y: point.y })),
          reservePercent,
        },
      }),
    );
    dispatch(
      actions.updateCircuit({
        id: selectedCircuitId,
        lengthM: Math.round(total * 10) / 10,
      }),
    );
    setRouteDrawing(false);
  };

  const selectCircuit = (id: string | null) => {
    setSelectedCircuitId(id);
    setRouteDrawing(false);
  };

  const toggleRouteDrawing = (circuitId?: string) => {
    const targetCircuitId = circuitId ?? selectedCircuitId;
    if (!targetCircuitId) {
      window.alert(
        "Select a circuit first (Circuits tab), then draw its cable route.",
      );
      return;
    }
    setSelectedCircuitId(targetCircuitId);
    setSelectedDefId(null);
    setSelectedSymbolId(null);
    setSelectedRoomId(null);
    setRoomDrawing(false);
    setRouteDrawing((value) => !value);
    setTab("plan");
  };

  const toggleRoomDrawing = () => {
    setSelectedDefId(null);
    setSelectedSymbolId(null);
    setSelectedRoomId(null);
    setRouteDrawing(false);
    setRoomDrawing((value) => !value);
  };

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      if (event.key === "Escape") {
        setSelectedDefId(null);
        setSelectedSymbolId(null);
        setSelectedRoomId(null);
        setRoomDrawing(false);
        setRouteDrawing(false);
        return;
      }
      const commandKey = (event.ctrlKey || event.metaKey) && !event.altKey;
      if (commandKey && event.key.toLowerCase() === "c") {
        const room = activeUnit
          ? unitRooms(activeUnit).find((item) => item.id === selectedRoomId)
          : undefined;
        if (!room) return;
        event.preventDefault();
        roomClipboardRef.current = {
          name: room.name,
          points: room.points.map((point) => ({ x: point.x, y: point.y })),
          fillColor: room.fillColor,
          labelX: room.labelX,
          labelY: room.labelY,
          pasteCount: 0,
        };
        return;
      }
      if (commandKey && event.key.toLowerCase() === "v") {
        const clipboard = roomClipboardRef.current;
        if (!clipboard || !activeUnit) return;
        event.preventDefault();
        clipboard.pasteCount += 1;
        const offset = 50 * clipboard.pasteCount;
        const existing = unitRooms(activeUnit);
        const baseName = clipboard.name.replace(/ Kopie(?: \d+)?$/, "");
        let name = `${baseName} Kopie`;
        let suffix = 2;
        while (existing.some((room) => room.name === name))
          name = `${baseName} Kopie ${suffix++}`;
        const id = newId("room");
        dispatch(
          actions.addRoom({
            unitId: activeUnit.id,
            room: {
              id,
              name,
              points: clipboard.points.map((point) => ({
                x: Math.round((point.x + offset) * 10) / 10,
                y: Math.round((point.y + offset) * 10) / 10,
              })),
              fillColor: clipboard.fillColor,
              labelX: Math.round((clipboard.labelX + offset) * 10) / 10,
              labelY: Math.round((clipboard.labelY + offset) * 10) / 10,
            },
          }),
        );
        setSelectedRoomId(id);
        setSelectedSymbolId(null);
        setSelectedDefId(null);
        setRoomDrawing(false);
        return;
      }
      if (!activeUnit || !selectedSymbol) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        const id = newId("sym");
        dispatch(
          actions.addSymbol({
            unitId: activeUnit.id,
            symbol: {
              id,
              defId: selectedSymbol.defId,
              knxEnabled: selectedSymbol.knx?.enabled ?? false,
              position: {
                x: selectedSymbol.position.x + 10,
                y: selectedSymbol.position.y + 10,
              },
              rotation: selectedSymbol.rotation,
              mountHeightCm: selectedSymbol.mountHeightCm,
              label: selectedSymbol.label,
              circuitId: selectedSymbol.circuitId,
              roomId: selectedSymbol.roomId,
            },
          }),
        );
        setSelectedSymbolId(id);
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        dispatch(
          actions.removeSymbol({
            unitId: activeUnit.id,
            id: selectedSymbol.id,
          }),
        );
        setSelectedSymbolId(null);
        return;
      }
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        dispatch(
          actions.updateSymbol({
            unitId: activeUnit.id,
            id: selectedSymbol.id,
            rotation: (selectedSymbol.rotation + 90) % 360,
          }),
        );
        return;
      }
      const step = event.shiftKey ? 10 : 1;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = (moves as Record<string, [number, number] | undefined>)[
        event.key
      ];
      if (move && selectedSymbol.locked) {
        event.preventDefault();
        return;
      }
      if (move) {
        event.preventDefault();
        const position = {
          x: selectedSymbol.position.x + move[0],
          y: selectedSymbol.position.y + move[1],
        };
        const targetRoom = roomAt(activeUnit, position)?.id ?? null;
        dispatch(
          actions.moveSymbol({
            unitId: activeUnit.id,
            id: selectedSymbol.id,
            x: position.x,
            y: position.y,
          }),
        );
        if ((selectedSymbol.roomId ?? null) !== targetRoom) {
          dispatch(
            actions.updateSymbol({
              unitId: activeUnit.id,
              id: selectedSymbol.id,
              roomId: targetRoom,
            }),
          );
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeUnit, dispatch, selectedRoomId, selectedSymbol]);

  if (!activeUnit) {
    return (
      <div className="p-8 text-sm text-slate-500">
        This document has no floor yet.
      </div>
    );
  }

  const tabCount = (id: Tab): string | number => {
    if (id === "circuits") return state.circuits.length;
    if (id === "bom") return bom.totals.lines;
    if (id === "knx") return state.groupAddresses.length;
    if (id === "cabinet") return state.distributors.length;
    if (id === "protocol") return state.circuits.length;
    if (id === "diagram") return state.circuits.length ? "SVG" : 0;
    return activeUnit.symbols.length;
  };

  return (
    <div className="flex h-[100dvh] min-h-[600px] flex-col overflow-hidden bg-slate-100 text-slate-900">
      <DocumentToolbar />
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">
            P
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Planvolt
              </span>
              <span className="text-[10px] text-slate-400">
                Electrical planning
              </span>
            </div>
            <input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className="mt-0.5 w-[280px] max-w-[40vw] truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-slate-900 outline-none hover:border-slate-200 focus:border-blue-400 focus:bg-white"
              aria-label="Project name"
              title={`Document: ${document.header.name} · Project: ${state.name}`}
            />
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <select
              value={activeUnit.id}
              onChange={(event) =>
                dispatch(actions.setActiveUnit({ unitId: event.target.value }))
              }
              className="max-w-[170px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
            >
              {state.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={renameFloor}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={addFloor}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              + Floor
            </button>
            <button
              type="button"
              onClick={() =>
                printHtml(
                  `${state.name} — Project report`,
                  projectReportHtml(
                    state,
                    exportPlanRef.current?.exportSvg() ??
                      planRef.current?.exportSvg() ??
                      "",
                    activeUnit.name,
                  ),
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Project PDF
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:bg-slate-400"
            >
              {importing ? "Importing…" : "Import plan"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
              onChange={(event) => {
                void importPlan(event);
              }}
              className="hidden"
            />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`relative flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${tab === item.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              {item.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${tab === item.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}
              >
                {tabCount(item.id)}
              </span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex min-h-0 flex-1">
        {tab === "plan" ? (
          <div className="flex min-h-0 w-full">
            <SymbolPalette
              selectedDefId={selectedDefId}
              onSelect={(id) => {
                setSelectedDefId(id);
                setSelectedSymbolId(null);
                setSelectedRoomId(null);
                setRoomDrawing(false);
                setRouteDrawing(false);
              }}
            />
            <div className="min-w-0 flex-1 p-3">
              <PlanCanvas
                ref={planRef}
                state={state}
                unit={activeUnit}
                dispatch={dispatch as (action: ElectricalPlanAction) => void}
                selectedDefId={selectedDefId}
                selectedSymbolId={selectedSymbolId}
                selectedRoomId={selectedRoomId}
                roomDrawing={roomDrawing}
                routeDrawing={routeDrawing}
                routeCircuitId={selectedCircuitId}
                onSelectSymbol={selectSymbol}
                onSelectRoom={selectRoom}
                onPlaced={selectSymbol}
                onCreateRoom={createRoom}
                onCreateRoute={createRoute}
                onToggleRoomDrawing={toggleRoomDrawing}
                onToggleRouteDrawing={toggleRouteDrawing}
                onImportFile={(file) => {
                  void importFile(file);
                }}
              />
            </div>
            <PlanProperties
              state={state}
              unit={activeUnit}
              dispatch={dispatch as (action: ElectricalPlanAction) => void}
              selectedSymbol={selectedSymbol}
              selectedRoomId={selectedRoomId}
              onSelectRoom={selectRoom}
              onPickBackground={() => fileInputRef.current?.click()}
              onClearSymbol={() => setSelectedSymbolId(null)}
              onStartRoom={toggleRoomDrawing}
            />
          </div>
        ) : null}
        {tab === "circuits" ? (
          <CircuitPanel
            state={state}
            activeUnit={activeUnit}
            dispatch={dispatch as (action: ElectricalPlanAction) => void}
            selectedCircuitId={selectedCircuitId}
            onSelectCircuit={selectCircuit}
            selectedSymbolId={selectedSymbolId}
            routeDrawing={routeDrawing}
            onDrawRoute={toggleRouteDrawing}
          />
        ) : null}
        {tab === "bom" ? <BomPanel state={state} /> : null}
        {tab === "knx" ? (
          <KnxPanel
            state={state}
            dispatch={dispatch as (action: ElectricalPlanAction) => void}
          />
        ) : null}
        {tab === "cabinet" ? (
          <CabinetPanel
            state={state}
            dispatch={dispatch as (action: ElectricalPlanAction) => void}
          />
        ) : null}
        {tab === "protocol" ? (
          <ProtocolPanel
            state={state}
            dispatch={dispatch as (action: ElectricalPlanAction) => void}
          />
        ) : null}
        {tab === "diagram" ? <DiagramPanel state={state} /> : null}
      </main>
      <div className="hidden" aria-hidden="true">
        <PlanCanvas
          ref={exportPlanRef}
          state={state}
          unit={activeUnit}
          dispatch={dispatch as (action: ElectricalPlanAction) => void}
          selectedDefId={null}
          selectedSymbolId={null}
          selectedRoomId={null}
          roomDrawing={false}
          routeDrawing={false}
          routeCircuitId={null}
          onSelectSymbol={selectSymbol}
          onSelectRoom={selectRoom}
          onPlaced={selectSymbol}
          onCreateRoom={createRoom}
          onCreateRoute={createRoute}
          onToggleRoomDrawing={toggleRoomDrawing}
          onToggleRouteDrawing={toggleRouteDrawing}
        />
      </div>
    </div>
  );
}
