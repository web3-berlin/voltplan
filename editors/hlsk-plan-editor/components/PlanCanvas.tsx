import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { actions } from "document-models/hlsk-plan";
import type { HlskPlanAction } from "document-models/hlsk-plan/v1";

import {
  DUCT_BY_ID,
  PIPE_BY_ID,
  RISER_BY_ID,
  disciplineColor,
  ductLabel,
  getFixtureDef,
  pipeLabel,
  riserLabel,
} from "../lib/catalog.js";
import { newId } from "../lib/engine.js";
import {
  roomAt,
  roomColor,
  routeLengthM,
  routeMidpoint,
  unitRooms,
} from "../lib/geometry.js";
import type {
  Discipline,
  DrawMode,
  HlskFixture,
  HlskPlanGlobalState,
  HlskRoom,
  HlskUnit,
  Position,
  Riser,
} from "../lib/types.js";
import { downloadBlob, downloadText, safeFilename } from "../lib/ui.js";
import { FixtureGlyph } from "./FixtureGlyph.js";

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DragState {
  kind: "fixture" | "riser";
  id: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

export interface PlanCanvasHandle {
  fit: () => void;
  exportSvg: () => string;
  exportPng: () => Promise<void>;
}

interface Props {
  state: HlskPlanGlobalState;
  unit: HlskUnit;
  dispatch: (action: HlskPlanAction) => void;
  selectedFixtureId: string | null;
  selectedRoomId: string | null;
  selectedPipeId: string | null;
  selectedDuctId: string | null;
  selectedRiserId: string | null;
  placementDefId: string | null;
  drawMode: DrawMode | null;
  visibleDisciplines: Discipline[] | null;
  visiblePipeKinds: string[] | null;
  visibleDuctKinds: string[] | null;
  showRisers: boolean;
  onSelectFixture: (id: string | null) => void;
  onSelectRoom: (id: string | null) => void;
  onSelectPipe: (id: string | null) => void;
  onSelectDuct: (id: string | null) => void;
  onSelectRiser: (id: string | null) => void;
  onCreateRoom: (points: Position[]) => void;
  onCreatePipe: (points: Position[], kind: string) => void;
  onCreateDuct: (points: Position[], kind: string) => void;
  onCreateRiser: (point: Position, kind: string) => void;
  onPlaced: (id: string) => void;
  onCancelDraw: () => void;
  onClearPlacement: () => void;
  onImportFile?: (file: File) => void;
}

const DEFAULT_VIEW: ViewBox = { x: -30, y: -30, w: 900, h: 620 };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toPlanPoint(
  event: { clientX: number; clientY: number },
  svg: SVGSVGElement,
  view: ViewBox,
): Position {
  const rect = svg.getBoundingClientRect();
  return {
    x:
      Math.round(
        (view.x + ((event.clientX - rect.left) / rect.width) * view.w) * 10,
      ) / 10,
    y:
      Math.round(
        (view.y + ((event.clientY - rect.top) / rect.height) * view.h) * 10,
      ) / 10,
  };
}

function unitBounds(unit: HlskUnit): ViewBox {
  let minX = 0;
  let minY = 0;
  let maxX = 800;
  let maxY = 600;

  const include = (x: number, y: number) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };

  const background = unit.background;
  const hasContent =
    Boolean(background?.dataUrl) ||
    unitRooms(unit).length > 0 ||
    unit.fixtures.length > 0 ||
    unit.pipeRoutes.length > 0 ||
    unit.ductRoutes.length > 0 ||
    unit.risers.length > 0;
  if (background?.dataUrl) {
    include(background.x, background.y);
    include(
      background.x + (background.widthCm ?? 800),
      background.y + (background.heightCm ?? 520),
    );
  }
  for (const room of unitRooms(unit)) {
    for (const point of room.points) include(point.x, point.y);
  }
  for (const fixture of unit.fixtures)
    include(fixture.position.x, fixture.position.y);
  for (const route of unit.pipeRoutes)
    for (const point of route.points) include(point.x, point.y);
  for (const route of unit.ductRoutes)
    for (const point of route.points) include(point.x, point.y);
  for (const riser of unit.risers) include(riser.x, riser.y);

  if (!hasContent) return DEFAULT_VIEW;
  const padding = 28;
  return {
    x: minX - padding,
    y: minY - padding,
    w: Math.max(80, maxX - minX + padding * 2),
    h: Math.max(80, maxY - minY + padding * 2),
  };
}

export const PlanCanvas = forwardRef<PlanCanvasHandle, Props>(
  function PlanCanvas(
    {
      state,
      unit,
      dispatch,
      selectedFixtureId,
      selectedRoomId,
      selectedPipeId,
      selectedDuctId,
      selectedRiserId,
      placementDefId,
      drawMode,
      visibleDisciplines,
      visiblePipeKinds,
      visibleDuctKinds,
      showRisers,
      onSelectFixture,
      onSelectRoom,
      onSelectPipe,
      onSelectDuct,
      onSelectRiser,
      onCreateRoom,
      onCreatePipe,
      onCreateDuct,
      onCreateRiser,
      onPlaced,
      onCancelDraw,
      onClearPlacement,
      onImportFile,
    },
    ref,
  ) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [view, setView] = useState<ViewBox>(unitBounds(unit));
    const [drag, setDrag] = useState<DragState | null>(null);
    const [draft, setDraft] = useState<Position[]>([]);
    const dragRef = useRef<DragState | null>(null);
    const panRef = useRef<{
      startX: number;
      startY: number;
      view: ViewBox;
    } | null>(null);

    const rooms = useMemo(() => unitRooms(unit), [unit]);
    const fixtures = useMemo(
      () =>
        unit.fixtures.filter(
          (fixture) =>
            visibleDisciplines == null ||
            visibleDisciplines.includes(fixture.discipline as Discipline),
        ),
      [unit.fixtures, visibleDisciplines],
    );
    const pipes = useMemo(
      () =>
        unit.pipeRoutes.filter(
          (route) =>
            visiblePipeKinds == null || visiblePipeKinds.includes(route.kind),
        ),
      [unit.pipeRoutes, visiblePipeKinds],
    );
    const ducts = useMemo(
      () =>
        unit.ductRoutes.filter(
          (route) =>
            visibleDuctKinds == null || visibleDuctKinds.includes(route.kind),
        ),
      [unit.ductRoutes, visibleDuctKinds],
    );

    const fit = useCallback(() => {
      setView(unitBounds(unit));
    }, [unit]);

    const fittedUnitId = useRef(unit.id);
    useEffect(() => {
      if (fittedUnitId.current !== unit.id) {
        fittedUnitId.current = unit.id;
        setView(unitBounds(unit));
      }
    }, [unit]);

    const drawKey =
      drawMode?.type === "pipe" || drawMode?.type === "duct"
        ? drawMode.kind
        : (drawMode?.type ?? null);
    useEffect(() => {
      setDraft([]);
      setDrag(null);
      dragRef.current = null;
    }, [unit.id, drawKey, placementDefId]);

    const zoomBy = (factor: number) => {
      const centerX = view.x + view.w / 2;
      const centerY = view.y + view.h / 2;
      const w = clamp(view.w * factor, 80, 8000);
      const h = clamp(view.h * factor, 80, 8000);
      setView({ x: centerX - w / 2, y: centerY - h / 2, w, h });
    };

    const exportSvg = useCallback(() => {
      const svg = svgRef.current;
      if (!svg) return "";
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone
        .querySelectorAll("[data-export-ignore]")
        .forEach((node) => node.remove());
      return clone.outerHTML;
    }, []);

    const exportPng = useCallback(async () => {
      const svgText = exportSvg();
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const image = new Image();
      try {
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("Could not render the plan"));
          image.src = url;
        });
        const canvas = document.createElement("canvas");
        const scale = 2;
        canvas.width = Math.round(view.w * scale);
        canvas.height = Math.round(view.h * scale);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is not available");
        context.fillStyle = "#f8fafc";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const png = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (!png) throw new Error("Could not create the PNG");
        downloadBlob(`${safeFilename(unit.name)}-plan.png`, png);
      } finally {
        URL.revokeObjectURL(url);
      }
    }, [exportSvg, unit.name, view.h, view.w]);

    useImperativeHandle(ref, () => ({ fit, exportSvg, exportPng }), [
      fit,
      exportSvg,
      exportPng,
    ]);

    const finishDraft = () => {
      if (!drawMode) return;
      if (drawMode.type === "room") {
        if (draft.length < 3) return;
        onCreateRoom(draft);
        setDraft([]);
        return;
      }
      if (drawMode.type === "pipe") {
        if (draft.length < 2) return;
        onCreatePipe(draft, drawMode.kind);
        setDraft([]);
        return;
      }
      if (drawMode.type === "duct") {
        if (draft.length < 2) return;
        onCreateDuct(draft, drawMode.kind);
        setDraft([]);
      }
    };

    const addFixtureAt = (point: Position) => {
      if (!placementDefId) return;
      const definition = getFixtureDef(placementDefId);
      if (!definition) return;
      const id = newId("fixture");
      const room = roomAt(unit, point);
      dispatch(
        actions.addFixture({
          unitId: unit.id,
          fixture: {
            id,
            kind: definition.kind,
            discipline: definition.discipline,
            name: definition.name,
            position: point,
            rotation: 0,
            roomId: room?.id ?? null,
            mountHeightCm: definition.defaultHeightCm,
            notes: null,
            locked: false,
          },
        }),
      );
      onPlaced(id);
    };

    const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      if (event.button === 2 || event.altKey) {
        event.preventDefault();
        svg.setPointerCapture(event.pointerId);
        panRef.current = { startX: event.clientX, startY: event.clientY, view };
        return;
      }
      if (event.button !== 0) return;
      const target = event.target as Element | null;
      if (
        !placementDefId &&
        !drawMode &&
        target?.closest(
          "[data-fixture], [data-room], [data-pipe], [data-duct], [data-riser]",
        )
      )
        return;

      const point = toPlanPoint(event, svg, view);

      if (drawMode?.type === "riser") {
        onCreateRiser(point, drawMode.kind);
        return;
      }
      if (drawMode?.type === "pipe" || drawMode?.type === "duct") {
        if (draft.length >= 2) {
          const first = draft[0];
          if (
            Math.hypot(point.x - first.x, point.y - first.y) <
            Math.max(3, view.w * 0.012)
          ) {
            finishDraft();
            return;
          }
        }
        setDraft((points) => [...points, point]);
        return;
      }
      if (drawMode?.type === "room") {
        if (draft.length >= 3) {
          const first = draft[0];
          if (
            Math.hypot(point.x - first.x, point.y - first.y) <
            Math.max(3, view.w * 0.012)
          ) {
            finishDraft();
            return;
          }
        }
        setDraft((points) => [...points, point]);
        return;
      }
      if (placementDefId) {
        addFixtureAt(point);
        return;
      }
      onSelectFixture(null);
      onSelectRoom(null);
      onSelectPipe(null);
      onSelectDuct(null);
      onSelectRiser(null);
    };

    const handleFixturePointerDown = (
      event: ReactPointerEvent<SVGGElement>,
      fixture: HlskFixture,
    ) => {
      if (event.button !== 0 || drawMode || placementDefId || event.altKey)
        return;
      event.stopPropagation();
      onSelectFixture(fixture.id);
      if (fixture.locked) return;
      const svg = svgRef.current;
      if (!svg) return;
      const point = toPlanPoint(event, svg, view);
      const next: DragState = {
        kind: "fixture",
        id: fixture.id,
        x: fixture.position.x,
        y: fixture.position.y,
        startX: point.x,
        startY: point.y,
        originX: fixture.position.x,
        originY: fixture.position.y,
        moved: false,
      };
      dragRef.current = next;
      setDrag(next);
    };

    const handleRiserPointerDown = (
      event: ReactPointerEvent<SVGGElement>,
      riser: Riser,
    ) => {
      if (event.button !== 0 || drawMode || placementDefId || event.altKey)
        return;
      event.stopPropagation();
      onSelectRiser(riser.id);
      const svg = svgRef.current;
      if (!svg) return;
      const point = toPlanPoint(event, svg, view);
      const next: DragState = {
        kind: "riser",
        id: riser.id,
        x: riser.x,
        y: riser.y,
        startX: point.x,
        startY: point.y,
        originX: riser.x,
        originY: riser.y,
        moved: false,
      };
      dragRef.current = next;
      setDrag(next);
    };

    const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
      if (panRef.current) {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const dx =
          (event.clientX - panRef.current.startX) *
          (panRef.current.view.w / rect.width);
        const dy =
          (event.clientY - panRef.current.startY) *
          (panRef.current.view.h / rect.height);
        setView({
          ...panRef.current.view,
          x: panRef.current.view.x - dx,
          y: panRef.current.view.y - dy,
        });
        return;
      }
      const active = dragRef.current;
      if (!active) return;
      const svg = svgRef.current;
      if (!svg) return;
      const point = toPlanPoint(event, svg, view);
      const dx = point.x - active.startX;
      const dy = point.y - active.startY;
      const next = {
        ...active,
        x: active.originX + dx,
        y: active.originY + dy,
        moved: true,
      };
      dragRef.current = next;
      setDrag(next);
    };

    const handlePointerUp = () => {
      panRef.current = null;
      const active = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!active || !active.moved) return;
      if (active.kind === "fixture") {
        dispatch(
          actions.updateFixture({
            unitId: unit.id,
            id: active.id,
            position: { x: active.x, y: active.y },
            roomId: roomAt(unit, { x: active.x, y: active.y })?.id ?? null,
          }),
        );
      } else {
        dispatch(
          actions.updateRiser({
            unitId: unit.id,
            id: active.id,
            x: active.x,
            y: active.y,
          }),
        );
      }
    };

    const routeColor = (kind: string) =>
      PIPE_BY_ID.get(kind)?.color ?? DUCT_BY_ID.get(kind)?.color ?? "#0f172a";

    const zoomPercent = Math.round((DEFAULT_VIEW.w / view.w) * 100);
    const empty =
      !unit.background?.dataUrl &&
      rooms.length === 0 &&
      unit.fixtures.length === 0 &&
      unit.pipeRoutes.length === 0 &&
      unit.ductRoutes.length === 0 &&
      unit.risers.length === 0;

    return (
      <div
        className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          const file = event.dataTransfer.files.item(0);
          if (file) {
            event.preventDefault();
            onImportFile?.(file);
          }
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          className={`h-full w-full touch-none select-none ${placementDefId || drawMode ? "cursor-crosshair" : "cursor-default"}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="application"
          aria-label={`HLSK plan for ${unit.name}`}
        >
          <defs>
            <pattern
              id="hlsk-small-grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="0.14"
              />
            </pattern>
            <pattern
              id="hlsk-grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <rect width="100" height="100" fill="url(#hlsk-small-grid)" />
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.28"
              />
            </pattern>
          </defs>
          <rect
            x={view.x}
            y={view.y}
            width={view.w}
            height={view.h}
            fill="#f8fafc"
          />
          <rect
            x={view.x}
            y={view.y}
            width={view.w}
            height={view.h}
            fill="url(#hlsk-grid)"
          />

          {unit.background?.dataUrl ? (
            <image
              href={unit.background.dataUrl}
              x={unit.background.x}
              y={unit.background.y}
              width={unit.background.widthCm ?? 800}
              height={unit.background.heightCm ?? 520}
              opacity={unit.background.opacity}
              preserveAspectRatio="none"
              transform={
                unit.background.rotation
                  ? `rotate(${unit.background.rotation} ${unit.background.x + (unit.background.widthCm ?? 800) / 2} ${unit.background.y + (unit.background.heightCm ?? 520) / 2})`
                  : undefined
              }
              style={{ pointerEvents: "none" }}
            />
          ) : null}

          {rooms.map((room: HlskRoom, index: number) => {
            const color = room.fillColor ?? roomColor(index);
            const selected = selectedRoomId === room.id;
            return (
              <g
                key={room.id}
                data-room={room.id}
                onPointerDown={(event) => {
                  if (drawMode || placementDefId) return;
                  event.stopPropagation();
                  onSelectRoom(room.id);
                  onSelectFixture(null);
                  onSelectPipe(null);
                  onSelectDuct(null);
                  onSelectRiser(null);
                }}
                style={{
                  cursor: drawMode || placementDefId ? "default" : "pointer",
                }}
              >
                <title>{room.name} — click to select</title>
                <polygon
                  points={room.points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  fill={color}
                  fillOpacity={selected ? 0.2 : 0.12}
                  stroke={color}
                  strokeWidth={selected ? 0.8 : 0.4}
                  strokeDasharray={selected ? undefined : "2.4 1.4"}
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {pipes.map((route) => {
            const color = PIPE_BY_ID.get(route.kind)?.color ?? "#475569";
            const selected = selectedPipeId === route.id;
            return (
              <g
                key={route.id}
                data-pipe={route.id}
                onPointerDown={(event) => {
                  if (drawMode || placementDefId) return;
                  event.stopPropagation();
                  onSelectPipe(route.id);
                  onSelectFixture(null);
                  onSelectRoom(null);
                  onSelectDuct(null);
                  onSelectRiser(null);
                }}
                style={{
                  cursor: drawMode || placementDefId ? "default" : "pointer",
                }}
              >
                <title>{pipeLabel(route.kind)} — click to select</title>
                <polyline
                  points={route.points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={selected ? 2.4 : 1.6}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.9}
                />
                {selected ? (
                  <polyline
                    data-export-ignore="true"
                    points={route.points
                      .map((point) => `${point.x},${point.y}`)
                      .join(" ")}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth={3.2}
                    strokeDasharray="4 2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={0.5}
                  />
                ) : null}
                <text
                  x={routeMidpoint(route.points).x}
                  y={routeMidpoint(route.points).y - 3}
                  textAnchor="middle"
                  fontSize={4.2}
                  fill={color}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  style={{ pointerEvents: "none" }}
                >
                  {pipeLabel(route.kind)} · {routeLengthM(route).toFixed(1)} m
                </text>
              </g>
            );
          })}

          {ducts.map((route) => {
            const color = DUCT_BY_ID.get(route.kind)?.color ?? "#475569";
            const selected = selectedDuctId === route.id;
            const strokeWidth = Math.max(2.2, route.widthMm / 45);
            return (
              <g
                key={route.id}
                data-duct={route.id}
                onPointerDown={(event) => {
                  if (drawMode || placementDefId) return;
                  event.stopPropagation();
                  onSelectDuct(route.id);
                  onSelectFixture(null);
                  onSelectRoom(null);
                  onSelectPipe(null);
                  onSelectRiser(null);
                }}
                style={{
                  cursor: drawMode || placementDefId ? "default" : "pointer",
                }}
              >
                <title>{ductLabel(route.kind)} — click to select</title>
                <polyline
                  points={route.points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={selected ? strokeWidth + 1 : strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.78}
                />
                {selected ? (
                  <polyline
                    data-export-ignore="true"
                    points={route.points
                      .map((point) => `${point.x},${point.y}`)
                      .join(" ")}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth={strokeWidth + 2.6}
                    strokeDasharray="4 2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={0.45}
                  />
                ) : null}
                <text
                  x={routeMidpoint(route.points).x}
                  y={routeMidpoint(route.points).y - 4}
                  textAnchor="middle"
                  fontSize={4.2}
                  fill={color}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  style={{ pointerEvents: "none" }}
                >
                  {ductLabel(route.kind)}
                  {route.airflowM3h != null
                    ? ` · ${route.airflowM3h} m³/h`
                    : ""}
                </text>
              </g>
            );
          })}

          {fixtures.map((fixture) => {
            const definition = getFixtureDef(fixture.kind);
            if (!definition) return null;
            const selected = selectedFixtureId === fixture.id;
            const position =
              drag?.kind === "fixture" && drag.id === fixture.id
                ? drag
                : fixture.position;
            return (
              <g
                key={fixture.id}
                data-fixture={fixture.id}
                transform={`translate(${position.x} ${position.y}) rotate(${fixture.rotation})`}
                onPointerDown={(event) =>
                  handleFixturePointerDown(event, fixture)
                }
                style={{ cursor: fixture.locked ? "pointer" : "move" }}
              >
                <title>{definition.name} — drag to move</title>
                <circle r={22} fill="transparent" />
                <FixtureGlyph
                  parts={definition.parts}
                  color={disciplineColor(fixture.discipline as Discipline)}
                />
                {selected ? (
                  <circle
                    data-export-ignore="true"
                    r={25}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth={0.7}
                    strokeDasharray="2.2 1.5"
                  />
                ) : null}
                {state.settings.showLabels ? (
                  <text
                    x={0}
                    y={27}
                    textAnchor="middle"
                    fontSize={4.4}
                    fontWeight={600}
                    fill="#334155"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {fixture.name.length > 26
                      ? `${fixture.name.slice(0, 25)}…`
                      : fixture.name}
                  </text>
                ) : null}
                {state.settings.showMountHeights &&
                fixture.mountHeightCm != null ? (
                  <text
                    x={0}
                    y={state.settings.showLabels ? 32 : 27}
                    textAnchor="middle"
                    fontSize={3.5}
                    fill="#64748b"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {fixture.mountHeightCm} cm
                  </text>
                ) : null}
              </g>
            );
          })}

          {showRisers
            ? unit.risers.map((riser) => {
                const color = RISER_BY_ID.get(riser.kind)?.color ?? "#475569";
                const selected = selectedRiserId === riser.id;
                const position =
                  drag?.kind === "riser" && drag.id === riser.id ? drag : riser;
                return (
                  <g
                    key={riser.id}
                    data-riser={riser.id}
                    transform={`translate(${position.x} ${position.y})`}
                    onPointerDown={(event) =>
                      handleRiserPointerDown(event, riser)
                    }
                    style={{ cursor: "move" }}
                  >
                    <title>{riserLabel(riser.kind)} — drag to move</title>
                    <circle
                      r={7.5}
                      fill="#ffffff"
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    <path
                      d="M -4.5 0 L 4.5 0 M 0 -4.5 L 0 4.5"
                      stroke={color}
                      strokeWidth={1.2}
                    />
                    {selected ? (
                      <circle
                        data-export-ignore="true"
                        r={10}
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth={0.7}
                        strokeDasharray="2.2 1.5"
                      />
                    ) : null}
                    <text
                      x={0}
                      y={13}
                      textAnchor="middle"
                      fontSize={4}
                      fontWeight={600}
                      fill={color}
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      style={{ pointerEvents: "none" }}
                    >
                      {riser.label ?? riserLabel(riser.kind)}
                    </text>
                  </g>
                );
              })
            : null}

          {draft.length ? (
            <g data-export-ignore="true" style={{ pointerEvents: "none" }}>
              {drawMode?.type === "room" ? (
                <>
                  {draft.length >= 2 ? (
                    <polygon
                      points={draft
                        .map((point) => `${point.x},${point.y}`)
                        .join(" ")}
                      fill="rgba(14,165,233,0.12)"
                      stroke="#0f172a"
                      strokeWidth={0.55}
                      strokeDasharray="3 1.5"
                      strokeLinejoin="round"
                    />
                  ) : null}
                </>
              ) : (
                <polyline
                  points={draft
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  fill="none"
                  stroke={
                    drawMode?.type === "pipe"
                      ? routeColor(drawMode.kind)
                      : drawMode?.type === "duct"
                        ? routeColor(drawMode.kind)
                        : "#0f172a"
                  }
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {draft.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={index === 0 ? 2 : 1.5}
                  fill={index === 0 ? "#2563eb" : "#0f172a"}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                />
              ))}
            </g>
          ) : null}

          {empty ? (
            <g
              data-export-ignore="true"
              transform={`translate(${view.x + view.w / 2} ${view.y + view.h / 2})`}
              style={{ pointerEvents: "none" }}
            >
              <text
                textAnchor="middle"
                y={-8}
                fill="#94a3b8"
                fontSize={Math.max(12, view.w / 48)}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                Start with a floor plan
              </text>
              <text
                textAnchor="middle"
                y={16}
                fill="#cbd5e1"
                fontSize={Math.max(9, view.w / 80)}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                Import a PDF, PNG or JPG, or draw a room on the empty plan.
              </text>
            </g>
          ) : null}
        </svg>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            {drawMode?.type === "room" ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-blue-700">
                  Drawing a room · {draft.length} point
                  {draft.length === 1 ? "" : "s"}
                </span>
                <span className="text-slate-400">
                  {draft.length < 3
                    ? "Add at least 3 points"
                    : "Click the first point or Finish"}
                </span>
                <button
                  type="button"
                  disabled={draft.length < 3}
                  onClick={finishDraft}
                  className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Finish
                </button>
                <button
                  type="button"
                  onClick={onCancelDraw}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : drawMode?.type === "pipe" ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-blue-700">
                  Drawing {pipeLabel(drawMode.kind)} · {draft.length} point
                  {draft.length === 1 ? "" : "s"}
                </span>
                <span className="text-slate-400">
                  {draft.length < 2
                    ? "Add at least 2 points"
                    : "Click the first point or Finish"}
                </span>
                <button
                  type="button"
                  disabled={draft.length < 2}
                  onClick={finishDraft}
                  className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Finish
                </button>
                <button
                  type="button"
                  onClick={onCancelDraw}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : drawMode?.type === "duct" ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-blue-700">
                  Drawing {ductLabel(drawMode.kind)} · {draft.length} point
                  {draft.length === 1 ? "" : "s"}
                </span>
                <span className="text-slate-400">
                  {draft.length < 2
                    ? "Add at least 2 points"
                    : "Click the first point or Finish"}
                </span>
                <button
                  type="button"
                  disabled={draft.length < 2}
                  onClick={finishDraft}
                  className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Finish
                </button>
                <button
                  type="button"
                  onClick={onCancelDraw}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : drawMode?.type === "riser" ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-blue-700">
                  Placing {riserLabel(drawMode.kind)}
                </span>
                <span className="text-slate-400">
                  Click the plan · Esc to stop
                </span>
                <button
                  type="button"
                  onClick={onCancelDraw}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : placementDefId ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-blue-700">
                  Placing {getFixtureDef(placementDefId)?.name ?? "fixture"}
                </span>
                <span className="text-slate-400">
                  Click the plan · Esc to stop
                </span>
                <button
                  type="button"
                  onClick={onClearPlacement}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                >
                  Stop
                </button>
              </div>
            ) : selectedRoomId ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-blue-700">
                  {rooms.find((room) => room.id === selectedRoomId)?.name ??
                    "Room"}
                </span>
                <span className="text-slate-400">
                  Select it in the room list to edit · Esc to deselect
                </span>
              </div>
            ) : null}
          </div>
          <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
            <button
              type="button"
              title="Zoom out"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => zoomBy(1.2)}
            >
              −
            </button>
            <span className="min-w-[42px] text-center text-[10px] tabular-nums text-slate-500">
              {zoomPercent}%
            </span>
            <button
              type="button"
              title="Zoom in"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => zoomBy(0.83)}
            >
              +
            </button>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={fit}
            >
              Fit
            </button>
            <span className="mx-1 h-4 w-px bg-slate-200" />
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={() =>
                downloadText(
                  `${safeFilename(unit.name)}-plan.svg`,
                  exportSvg(),
                  "image/svg+xml",
                )
              }
            >
              SVG
            </button>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={() => void exportPng()}
            >
              PNG
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-[10px] text-slate-500 shadow-sm">
          {unit.background?.widthCm
            ? `${Math.round(unit.background.widthCm)} × ${Math.round(unit.background.heightCm ?? 0)} cm`
            : `${Math.round(view.w)} × ${Math.round(view.h)} cm`}{" "}
          · {fixtures.length} fixtures · {rooms.length} rooms · {pipes.length}{" "}
          pipes · {ducts.length} ducts · {unit.risers.length} risers ·
          Right/Alt-drag to pan
        </div>
      </div>
    );
  },
);
