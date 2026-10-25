import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { DocumentToolbar } from "@powerhousedao/design-system/connect/index";
import {
  actions,
  useSelectedHlskPlanDocument,
} from "document-models/hlsk-plan";
import type { HlskPlanAction } from "document-models/hlsk-plan/v1";

import {
  DISCIPLINES,
  DUCT_KINDS,
  PIPE_KINDS,
  riserLabel,
} from "./lib/catalog.js";
import {
  activeUnit as getActiveUnit,
  hlskBom,
  hlskChecks,
  hlskCsv,
  hlskCsvFilename,
  newId,
} from "./lib/engine.js";
import {
  pointInPolygon,
  polygonCentroid,
  roomColor,
  unitRooms,
} from "./lib/geometry.js";
import { hlskReportHtml } from "./lib/report.js";
import { downloadText, printHtml } from "./lib/ui.js";
import type { Discipline, DrawMode } from "./lib/types.js";
import { ChecksPanel } from "./components/ChecksPanel.js";
import { FixturePalette } from "./components/FixturePalette.js";
import { Inspector } from "./components/Inspector.js";
import type { InspectorSelection } from "./components/Inspector.js";
import { MaterialsPanel } from "./components/MaterialsPanel.js";
import { PlanCanvas } from "./components/PlanCanvas.js";
import type { PlanCanvasHandle } from "./components/PlanCanvas.js";
import { ReportPanel } from "./components/ReportPanel.js";
import { RiserPalette } from "./components/RiserPalette.js";
import { RoomList } from "./components/RoomList.js";
import { RoutePalette } from "./components/RoutePalette.js";

type Tab =
  | "plan"
  | "sanitary"
  | "heating"
  | "ventilation"
  | "risers"
  | "checks"
  | "materials"
  | "report";

const TABS: { id: Tab; label: string }[] = [
  { id: "plan", label: "Floor plan" },
  { id: "sanitary", label: "Sanitary" },
  { id: "heating", label: "Heating" },
  { id: "ventilation", label: "Ventilation" },
  { id: "risers", label: "Risers & shafts" },
  { id: "checks", label: "Checks" },
  { id: "materials", label: "Materials" },
  { id: "report", label: "Report" },
];

const PLAN_TABS: Tab[] = [
  "plan",
  "sanitary",
  "heating",
  "ventilation",
  "risers",
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
    "../electrical-plan-editor/pdf.worker.min.mjs",
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
  const [document, dispatch] = useSelectedHlskPlanDocument();
  const state = document.state.global;
  const activeUnit = getActiveUnit(state) ?? state.units[0];
  const [tab, setTab] = useState<Tab>("plan");
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(
    null,
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedPipeId, setSelectedPipeId] = useState<string | null>(null);
  const [selectedDuctId, setSelectedDuctId] = useState<string | null>(null);
  const [selectedRiserId, setSelectedRiserId] = useState<string | null>(null);
  const [placementDefId, setPlacementDefId] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode | null>(null);
  const [nameDraft, setNameDraft] = useState(state.name);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const planRef = useRef<PlanCanvasHandle>(null);
  const exportPlanRef = useRef<PlanCanvasHandle>(null);
  const appliedHeaderName = useRef<string | null>(null);
  const bom = useMemo(() => hlskBom(state), [state]);
  const checks = useMemo(() => hlskChecks(state), [state]);

  useEffect(() => {
    setNameDraft(state.name);
  }, [state.name]);

  useEffect(() => {
    const headerName = document.header.name.trim();
    if (
      state.name === "Untitled HLSK Project" &&
      headerName &&
      headerName !== state.name &&
      appliedHeaderName.current !== headerName
    ) {
      appliedHeaderName.current = headerName;
      dispatch(actions.setProjectName({ name: headerName }));
    }
  }, [dispatch, document.header.name, state.name]);

  useEffect(() => {
    setDrawMode(null);
    setPlacementDefId(null);
    setSelectedFixtureId(null);
    setSelectedRoomId(null);
    setSelectedPipeId(null);
    setSelectedDuctId(null);
    setSelectedRiserId(null);
  }, [activeUnit.id, tab]);

  const selection = useMemo<InspectorSelection | null>(() => {
    if (selectedFixtureId) {
      const item = activeUnit.fixtures.find(
        (fixture) => fixture.id === selectedFixtureId,
      );
      if (item) return { kind: "fixture", item };
    }
    if (selectedRoomId) {
      const item = unitRooms(activeUnit).find(
        (room) => room.id === selectedRoomId,
      );
      if (item) return { kind: "room", item };
    }
    if (selectedPipeId) {
      const item = activeUnit.pipeRoutes.find(
        (route) => route.id === selectedPipeId,
      );
      if (item) return { kind: "pipe", item };
    }
    if (selectedDuctId) {
      const item = activeUnit.ductRoutes.find(
        (route) => route.id === selectedDuctId,
      );
      if (item) return { kind: "duct", item };
    }
    if (selectedRiserId) {
      const item = activeUnit.risers.find(
        (riser) => riser.id === selectedRiserId,
      );
      if (item) return { kind: "riser", item };
    }
    return null;
  }, [
    activeUnit,
    selectedFixtureId,
    selectedRoomId,
    selectedPipeId,
    selectedDuctId,
    selectedRiserId,
  ]);

  const clearSelection = () => {
    setSelectedFixtureId(null);
    setSelectedRoomId(null);
    setSelectedPipeId(null);
    setSelectedDuctId(null);
    setSelectedRiserId(null);
  };

  const selectFixture = (id: string | null) => {
    setSelectedFixtureId(id);
    setSelectedRoomId(null);
    setSelectedPipeId(null);
    setSelectedDuctId(null);
    setSelectedRiserId(null);
  };

  const selectRoom = (id: string | null) => {
    setSelectedRoomId(id);
    setSelectedFixtureId(null);
    setSelectedPipeId(null);
    setSelectedDuctId(null);
    setSelectedRiserId(null);
  };

  const selectPipe = (id: string | null) => {
    setSelectedPipeId(id);
    setSelectedFixtureId(null);
    setSelectedRoomId(null);
    setSelectedDuctId(null);
    setSelectedRiserId(null);
  };

  const selectDuct = (id: string | null) => {
    setSelectedDuctId(id);
    setSelectedFixtureId(null);
    setSelectedRoomId(null);
    setSelectedPipeId(null);
    setSelectedRiserId(null);
  };

  const selectRiser = (id: string | null) => {
    setSelectedRiserId(id);
    setSelectedFixtureId(null);
    setSelectedRoomId(null);
    setSelectedPipeId(null);
    setSelectedDuctId(null);
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
    setTab("plan");
  };

  const renameFloor = () => {
    const name = window.prompt("Rename floor", activeUnit.name);
    if (!name?.trim() || name.trim() === activeUnit.name) return;
    dispatch(actions.updateUnit({ id: activeUnit.id, name: name.trim() }));
  };

  const importFile = async (file: File) => {
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
            opacity: 0.36,
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
    if (points.length < 3) return;
    const defaultName = `Room ${unitRooms(activeUnit).length + 1}`;
    const name = window.prompt("Name this room", defaultName);
    if (!name?.trim()) {
      setDrawMode(null);
      return;
    }
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
          locked: false,
        },
      }),
    );
    for (const fixture of activeUnit.fixtures) {
      if (pointInPolygon(fixture.position, points) && fixture.roomId !== id) {
        dispatch(
          actions.updateFixture({
            unitId: activeUnit.id,
            id: fixture.id,
            roomId: id,
          }),
        );
      }
    }
    setSelectedRoomId(id);
    setSelectedFixtureId(null);
    setSelectedPipeId(null);
    setSelectedDuctId(null);
    setSelectedRiserId(null);
    setDrawMode(null);
  };

  const createPipe = (points: { x: number; y: number }[], kind: string) => {
    const definition = PIPE_KINDS.find((item) => item.id === kind);
    const id = newId("pipe");
    dispatch(
      actions.addPipeRoute({
        unitId: activeUnit.id,
        route: {
          id,
          kind,
          points,
          diameterMm: definition?.defaultDiameterMm ?? 15,
          slopePercent: definition?.requiresSlope ? 1 : null,
          insulation: false,
          notes: null,
        },
      }),
    );
    selectPipe(id);
    setDrawMode(null);
  };

  const createDuct = (points: { x: number; y: number }[], kind: string) => {
    const id = newId("duct");
    dispatch(
      actions.addDuctRoute({
        unitId: activeUnit.id,
        route: {
          id,
          kind,
          points,
          widthMm: 100,
          heightMm: 60,
          airflowM3h: null,
          notes: null,
        },
      }),
    );
    selectDuct(id);
    setDrawMode(null);
  };

  const createRiser = (point: { x: number; y: number }, kind: string) => {
    const id = newId("riser");
    dispatch(
      actions.addRiser({
        unitId: activeUnit.id,
        riser: {
          id,
          kind,
          x: point.x,
          y: point.y,
          label: riserLabel(kind),
          notes: null,
        },
      }),
    );
    selectRiser(id);
    setDrawMode(null);
  };

  const startRoom = () => {
    clearSelection();
    setPlacementDefId(null);
    setDrawMode({ type: "room" });
  };

  const startPipe = (kind: string) => {
    clearSelection();
    setPlacementDefId(null);
    setDrawMode({ type: "pipe", kind });
  };

  const startDuct = (kind: string) => {
    clearSelection();
    setPlacementDefId(null);
    setDrawMode({ type: "duct", kind });
  };

  const startRiser = (kind: string) => {
    clearSelection();
    setPlacementDefId(null);
    setDrawMode({ type: "riser", kind });
  };

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      if (event.key === "Escape") {
        clearSelection();
        setPlacementDefId(null);
        setDrawMode(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const printReport = () => {
    printHtml(
      `${state.name} — HLSK report`,
      hlskReportHtml(
        state,
        exportPlanRef.current?.exportSvg() ??
          planRef.current?.exportSvg() ??
          "",
        activeUnit.name,
      ),
    );
  };

  const downloadCsv = () => {
    downloadText(hlskCsvFilename(state.name), hlskCsv(state), "text/csv");
  };

  const tabCount = (id: Tab): string | number => {
    if (id === "plan") return activeUnit.fixtures.length;
    if (id === "sanitary") {
      return activeUnit.fixtures.filter(
        (fixture) => fixture.discipline === "sanitary",
      ).length;
    }
    if (id === "heating") {
      return activeUnit.fixtures.filter(
        (fixture) => fixture.discipline === "heating",
      ).length;
    }
    if (id === "ventilation") {
      return activeUnit.fixtures.filter(
        (fixture) => fixture.discipline === "ventilation",
      ).length;
    }
    if (id === "risers") return activeUnit.risers.length;
    if (id === "checks")
      return checks.filter((check) => check.severity === "warning").length;
    if (id === "materials") return bom.lines.length;
    return "PDF";
  };

  const planTab = PLAN_TABS.includes(tab);
  const disciplinesForTab: Discipline[] | null =
    tab === "plan" || tab === "risers"
      ? null
      : tab === "sanitary"
        ? ["sanitary"]
        : tab === "heating"
          ? ["heating"]
          : tab === "ventilation"
            ? ["ventilation"]
            : null;

  const pipeKindsForTab: string[] | null =
    tab === "plan" || tab === "risers"
      ? null
      : tab === "sanitary"
        ? ["waste", "cold_water", "hot_water", "condensate"]
        : tab === "heating"
          ? [
              "heating_supply",
              "heating_return",
              "cold_water",
              "hot_water",
              "condensate",
            ]
          : [];

  const ductKindsForTab: string[] | null =
    tab === "plan" || tab === "risers"
      ? null
      : tab === "ventilation"
        ? ["supply", "exhaust", "fresh_air", "return_air"]
        : [];

  const paletteDisciplines: Discipline[] =
    disciplinesForTab ?? DISCIPLINES.map((item) => item.id);

  const routePipeKinds = pipeKindsForTab ?? PIPE_KINDS.map((item) => item.id);
  const routeDuctKinds = ductKindsForTab ?? DUCT_KINDS.map((item) => item.id);

  return (
    <div className="flex h-[100dvh] min-h-[600px] flex-col overflow-hidden bg-slate-100 text-slate-900">
      <DocumentToolbar />
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-sm font-black text-white">
            H
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">
                Planvolt
              </span>
              <span className="text-[10px] text-slate-400">HLSK planning</span>
            </div>
            <input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className="mt-0.5 w-[280px] max-w-[40vw] truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-slate-900 outline-none hover:border-slate-200 focus:border-sky-400 focus:bg-white"
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
              aria-label="Floor"
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
              onClick={printReport}
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
              className={`relative flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${tab === item.id ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              {item.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${tab === item.id ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}
              >
                {tabCount(item.id)}
              </span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        {planTab ? (
          <div className="flex min-h-0 w-full">
            <aside className="flex h-full w-[270px] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white p-3">
              {tab === "risers" ? (
                <RiserPalette
                  risers={activeUnit.risers}
                  selectedRiserId={selectedRiserId}
                  onPlace={startRiser}
                  onSelect={selectRiser}
                />
              ) : (
                <>
                  <FixturePalette
                    disciplines={paletteDisciplines}
                    selectedDefId={placementDefId}
                    onSelect={(id) => {
                      setPlacementDefId((current) =>
                        current === id ? null : id,
                      );
                      clearSelection();
                      setDrawMode(null);
                    }}
                  />
                  <RoutePalette
                    pipeKinds={routePipeKinds}
                    ductKinds={routeDuctKinds}
                    drawMode={drawMode}
                    onDrawPipe={startPipe}
                    onDrawDuct={startDuct}
                  />
                  <RoomList
                    rooms={unitRooms(activeUnit)}
                    fixtures={activeUnit.fixtures}
                    selectedRoomId={selectedRoomId}
                    onSelect={selectRoom}
                    onDrawRoom={startRoom}
                  />
                </>
              )}
            </aside>
            <div className="min-w-0 flex-1 p-3">
              <PlanCanvas
                ref={planRef}
                state={state}
                unit={activeUnit}
                dispatch={dispatch}
                selectedFixtureId={selectedFixtureId}
                selectedRoomId={selectedRoomId}
                selectedPipeId={selectedPipeId}
                selectedDuctId={selectedDuctId}
                selectedRiserId={selectedRiserId}
                placementDefId={placementDefId}
                drawMode={drawMode}
                visibleDisciplines={disciplinesForTab}
                visiblePipeKinds={pipeKindsForTab}
                visibleDuctKinds={ductKindsForTab}
                showRisers
                onSelectFixture={selectFixture}
                onSelectRoom={selectRoom}
                onSelectPipe={selectPipe}
                onSelectDuct={selectDuct}
                onSelectRiser={selectRiser}
                onCreateRoom={createRoom}
                onCreatePipe={createPipe}
                onCreateDuct={createDuct}
                onCreateRiser={createRiser}
                onPlaced={(id) => {
                  selectFixture(id);
                  setDrawMode(null);
                }}
                onCancelDraw={() => setDrawMode(null)}
                onClearPlacement={() => setPlacementDefId(null)}
                onImportFile={(file) => {
                  void importFile(file);
                }}
              />
            </div>
            <Inspector
              unit={activeUnit}
              dispatch={dispatch}
              selection={selection}
              onDeselect={clearSelection}
            />
          </div>
        ) : null}

        {tab === "checks" ? (
          <div className="h-full w-full overflow-y-auto">
            <ChecksPanel checks={checks} onGoToPlan={() => setTab("plan")} />
          </div>
        ) : null}
        {tab === "materials" ? (
          <div className="h-full w-full overflow-y-auto">
            <MaterialsPanel
              bom={bom}
              onDownloadCsv={downloadCsv}
              onPrintReport={printReport}
            />
          </div>
        ) : null}
        {tab === "report" ? (
          <div className="h-full w-full overflow-y-auto">
            <ReportPanel
              projectName={state.name}
              floors={state.units.length}
              bom={bom}
              checks={checks}
              onPrintReport={printReport}
            />
          </div>
        ) : null}
      </main>

      <div className="hidden" aria-hidden="true">
        <PlanCanvas
          ref={exportPlanRef}
          state={state}
          unit={activeUnit}
          dispatch={dispatch as (action: HlskPlanAction) => void}
          selectedFixtureId={null}
          selectedRoomId={null}
          selectedPipeId={null}
          selectedDuctId={null}
          selectedRiserId={null}
          placementDefId={null}
          drawMode={null}
          visibleDisciplines={null}
          visiblePipeKinds={null}
          visibleDuctKinds={null}
          showRisers
          onSelectFixture={() => {}}
          onSelectRoom={() => {}}
          onSelectPipe={() => {}}
          onSelectDuct={() => {}}
          onSelectRiser={() => {}}
          onCreateRoom={() => {}}
          onCreatePipe={() => {}}
          onCreateDuct={() => {}}
          onCreateRiser={() => {}}
          onPlaced={() => {}}
          onCancelDraw={() => {}}
          onClearPlacement={() => {}}
        />
      </div>
    </div>
  );
}
