import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  DragEvent as ReactDragEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { getElectricalDef, electricalCategoryColor } from "../lib/catalog.js";
import { newId, routeLengthM } from "../lib/engine.js";
import {
  pointInPolygon,
  polygonAreaM2,
  roomAt,
  roomColor,
  unitRooms,
} from "../lib/rooms.js";
import type {
  ElectricalRoom,
  ElectricalSymbol,
  ElectricalUnit,
  ElectricalPlanGlobalState,
  Position,
} from "../lib/types.js";
import { actions } from "document-models/electrical-plan";
import type { ElectricalPlanAction } from "document-models/electrical-plan/v1";
import { SymbolGlyph } from "./SymbolGlyph.js";
import {
  downloadBlob,
  downloadText,
  printHtml,
  safeFilename,
} from "../lib/ui.js";

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface DragState {
  id: string;
  x: number;
  y: number;
}
interface LabelDrag {
  roomId: string;
  x: number;
  y: number;
}
interface RoomEdit {
  roomId: string;
  kind: "room" | "vertex";
  index: number | null;
  startX: number;
  startY: number;
  originPoints: Position[];
  points: Position[];
  originLabelX: number;
  originLabelY: number;
  labelX: number;
  labelY: number;
  moved: boolean;
}

export interface PlanCanvasHandle {
  fit: () => void;
  exportSvg: () => string;
  exportPng: () => Promise<void>;
}

interface Props {
  state: ElectricalPlanGlobalState;
  unit: ElectricalUnit;
  dispatch: (action: ElectricalPlanAction) => void;
  selectedDefId: string | null;
  selectedSymbolId: string | null;
  selectedRoomId: string | null;
  roomDrawing: boolean;
  routeDrawing: boolean;
  routeCircuitId: string | null;
  onSelectSymbol: (id: string | null) => void;
  onSelectRoom: (id: string | null) => void;
  onPlaced: (id: string) => void;
  onCreateRoom: (points: Position[]) => void;
  onCreateRoute: (points: Position[]) => void;
  onToggleRoomDrawing: () => void;
  onToggleRouteDrawing: () => void;
  onImportFile?: (file: File) => void;
}

const DEFAULT_VIEW: ViewBox = { x: -30, y: -30, w: 900, h: 620 };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const PlanCanvas = forwardRef<PlanCanvasHandle, Props>(
  function PlanCanvas(
    {
      state,
      unit,
      dispatch,
      selectedDefId,
      selectedSymbolId,
      selectedRoomId,
      roomDrawing,
      routeDrawing,
      routeCircuitId,
      onSelectSymbol,
      onSelectRoom,
      onPlaced,
      onCreateRoom,
      onCreateRoute,
      onToggleRoomDrawing,
      onToggleRouteDrawing,
      onImportFile,
    },
    ref,
  ) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [view, setView] = useState<ViewBox>(DEFAULT_VIEW);
    const [drag, setDrag] = useState<DragState | null>(null);
    const [labelDrag, setLabelDrag] = useState<LabelDrag | null>(null);
    const [roomEdit, setRoomEdit] = useState<RoomEdit | null>(null);
    const [draftRoom, setDraftRoom] = useState<Position[]>([]);
    const [routeDraft, setRouteDraft] = useState<Position[]>([]);
    const dragRef = useRef<{
      id: string;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
      lastX: number;
      lastY: number;
      moved: boolean;
    } | null>(null);
    const panRef = useRef<{
      startX: number;
      startY: number;
      view: ViewBox;
    } | null>(null);
    const labelDragRef = useRef<{
      roomId: string;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
      lastX: number;
      lastY: number;
      moved: boolean;
    } | null>(null);
    const roomEditRef = useRef<RoomEdit | null>(null);

    const background = unit.background;
    const rooms = useMemo(() => unitRooms(unit), [unit]);
    const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
    const selectedSymbol = selectedSymbolId
      ? unit.symbols.find((symbol) => symbol.id === selectedSymbolId)
      : undefined;
    const roomPoints = (roomId: string, points: Position[]) =>
      roomEdit?.roomId === roomId ? roomEdit.points : points;
    const reassignRoomSymbols = useCallback(
      (roomId: string, points: Position[]) => {
        const geometries = rooms.map((room) =>
          room.id === roomId ? { ...room, points } : room,
        );
        for (const symbol of unit.symbols) {
          const target =
            geometries.find((room) =>
              pointInPolygon(symbol.position, room.points),
            )?.id ?? null;
          if ((symbol.roomId ?? null) !== target) {
            dispatch(
              actions.updateSymbol({
                unitId: unit.id,
                id: symbol.id,
                roomId: target,
              }),
            );
          }
        }
      },
      [dispatch, rooms, unit.id, unit.symbols],
    );
    const def = selectedDefId ? getElectricalDef(selectedDefId) : undefined;
    const circuits = useMemo(
      () => new Map(state.circuits.map((circuit) => [circuit.id, circuit])),
      [state.circuits],
    );
    const zoomPercent = background?.widthCm
      ? Math.round((background.widthCm / view.w) * 100)
      : Math.round((800 / view.w) * 100);
    // Keep switch/socket glyphs readable at any zoom level. Scaling by view width cancels the SVG zoom,
    // so their on-screen size stays roughly constant instead of shrinking when zooming out.
    const symbolScale = view.w / 1500;

    const fit = useCallback(() => {
      const width =
        background?.widthCm && background.widthCm > 0
          ? background.widthCm
          : 800;
      const height =
        background?.heightCm && background.heightCm > 0
          ? background.heightCm
          : width * 0.65;
      const padding = Math.max(18, Math.max(width, height) * 0.035);
      setView({
        x: -padding,
        y: -padding,
        w: width + padding * 2,
        h: height + padding * 2,
      });
    }, [background?.widthCm, background?.heightCm]);

    const zoomBy = useCallback((factor: number) => {
      setView((current) => {
        const width = clamp(current.w * factor, 20, 30000);
        const ratio = width / current.w;
        const centerX = current.x + current.w / 2;
        const centerY = current.y + current.h / 2;
        return {
          x: centerX - (current.w * ratio) / 2,
          y: centerY - (current.h * ratio) / 2,
          w: width,
          h: current.h * ratio,
        };
      });
    }, []);

    useEffect(() => {
      fit();
    }, [unit.id, background?.widthCm, background?.heightCm, fit]);

    useEffect(() => {
      if (!roomDrawing) setDraftRoom([]);
    }, [roomDrawing]);

    useEffect(() => {
      setDraftRoom([]);
    }, [unit.id]);

    const toPlan = useCallback(
      (event: { clientX: number; clientY: number }) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const point = new DOMPoint(event.clientX, event.clientY);
        const matrix = svg.getScreenCTM();
        if (!matrix) return { x: 0, y: 0 };
        const transformed = point.matrixTransform(matrix.inverse());
        return { x: transformed.x, y: transformed.y };
      },
      [],
    );

    useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const point = toPlan(event);
        setView((current) => {
          const factor = Math.exp(event.deltaY * 0.0014);
          const width = clamp(current.w * factor, 20, 30000);
          const ratio = width / current.w;
          return {
            x: point.x - (point.x - current.x) * ratio,
            y: point.y - (point.y - current.y) * ratio,
            w: width,
            h: current.h * ratio,
          };
        });
      };
      svg.addEventListener("wheel", onWheel, { passive: false });
      return () => svg.removeEventListener("wheel", onWheel);
    }, [toPlan]);

    const exportSvg = useCallback(() => {
      const svg = svgRef.current;
      if (!svg) return "";
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone
        .querySelectorAll("[data-export-ignore]")
        .forEach((node) => node.remove());
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const exportWidth = 2000;
      clone.setAttribute("width", String(exportWidth));
      clone.setAttribute(
        "height",
        String(Math.max(1, Math.round(exportWidth * (view.h / view.w)))),
      );
      const backdrop = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      backdrop.setAttribute("x", String(view.x));
      backdrop.setAttribute("y", String(view.y));
      backdrop.setAttribute("width", String(view.w));
      backdrop.setAttribute("height", String(view.h));
      backdrop.setAttribute("fill", "#ffffff");
      clone.insertBefore(backdrop, clone.firstChild);
      return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
    }, [view]);

    const exportPng = useCallback(async () => {
      const svg = exportSvg();
      if (!svg) return;
      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const element = new Image();
          element.onload = () => resolve(element);
          element.onerror = () =>
            reject(new Error("Could not rasterise the plan"));
          element.src = svgUrl;
        });
        const width = 2200;
        const height = Math.max(1, Math.round(width * (view.h / view.w)));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is not available");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        const png = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (png) downloadBlob(`${safeFilename(unit.name)}-plan.png`, png);
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    }, [exportSvg, unit.name, view.h, view.w]);

    useImperativeHandle(ref, () => ({ fit, exportSvg, exportPng }), [
      fit,
      exportSvg,
      exportPng,
    ]);

    const addSymbol = (x: number, y: number) => {
      if (!def) return;
      const id = newId("sym");
      dispatch(
        actions.addSymbol({
          unitId: unit.id,
          symbol: {
            id,
            defId: def.id,
            knxEnabled: def.bus ?? false,
            position: { x, y },
            rotation: 0,
            mountHeightCm: def.defaultHeightCm,
            label: null,
            circuitId: null,
            roomId: roomAt(unit, { x, y })?.id ?? null,
          },
        }),
      );
      onPlaced(id);
    };

    const finishRoom = useCallback(() => {
      if (draftRoom.length < 3) return;
      onCreateRoom(draftRoom);
      setDraftRoom([]);
    }, [draftRoom, onCreateRoom]);

    useEffect(() => {
      if (!roomDrawing || draftRoom.length === 0) return;
      const onKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement | null;
        if (
          target?.closest("input, textarea, select, [contenteditable='true']")
        )
          return;
        if (event.key === "Enter") {
          event.preventDefault();
          finishRoom();
        } else if (event.key === "Escape") {
          event.preventDefault();
          setDraftRoom([]);
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [draftRoom.length, finishRoom, roomDrawing]);
    const finishRoute = useCallback(() => {
      if (routeDraft.length < 2) return;
      onCreateRoute(routeDraft);
      setRouteDraft([]);
    }, [onCreateRoute, routeDraft]);

    useEffect(() => {
      if (!routeDrawing) {
        setRouteDraft([]);
        return;
      }
      setDraftRoom([]);
    }, [routeDrawing, unit.id]);

    useEffect(() => {
      if (!routeDrawing || routeDraft.length === 0) return;
      const onKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement | null;
        if (
          target?.closest("input, textarea, select, [contenteditable='true']")
        )
          return;
        if (event.key === "Enter") {
          event.preventDefault();
          finishRoute();
        } else if (event.key === "Escape") {
          event.preventDefault();
          setRouteDraft([]);
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [finishRoute, routeDraft.length, routeDrawing]);

    const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
      const target = event.target as Element;
      if (event.button === 1) {
        event.preventDefault();
        if (
          target.closest("[data-room], [data-room-label], [data-export-ignore]")
        )
          return;
        if (selectedSymbol && !selectedSymbol.locked) {
          dispatch(
            actions.updateSymbol({
              unitId: unit.id,
              id: selectedSymbol.id,
              rotation: (selectedSymbol.rotation + 90) % 360,
            }),
          );
        }
        return;
      }
      if (event.button === 2 || event.altKey) {
        event.preventDefault();
        svgRef.current?.setPointerCapture(event.pointerId);
        panRef.current = { startX: event.clientX, startY: event.clientY, view };
        return;
      }
      if (event.button !== 0) return;
      if (target.closest("[data-symbol]") && !roomDrawing && !routeDrawing)
        return;
      if (routeDrawing) {
        const point = toPlan(event);
        if (routeDraft.length >= 2) {
          const first = routeDraft[0];
          if (
            Math.hypot(point.x - first.x, point.y - first.y) <
            Math.max(3, view.w * 0.012)
          ) {
            finishRoute();
            return;
          }
        }
        setRouteDraft((points) => [...points, point]);
        return;
      }
      if (roomDrawing) {
        const point = toPlan(event);
        if (draftRoom.length >= 3) {
          const first = draftRoom[0];
          if (
            Math.hypot(point.x - first.x, point.y - first.y) <
            Math.max(3, view.w * 0.012)
          ) {
            finishRoom();
            return;
          }
        }
        setDraftRoom((points) => [...points, point]);
        return;
      }
      if (selectedDefId && def) {
        const point = toPlan(event);
        addSymbol(point.x, point.y);
        return;
      }
      onSelectSymbol(null);
      onSelectRoom(null);
    };

    const handleSymbolPointerDown = (
      event: ReactPointerEvent<SVGGElement>,
      symbol: ElectricalSymbol,
    ) => {
      if (event.button === 1) {
        event.preventDefault();
        event.stopPropagation();
        onSelectSymbol(symbol.id);
        if (!symbol.locked)
          dispatch(
            actions.updateSymbol({
              unitId: unit.id,
              id: symbol.id,
              rotation: (symbol.rotation + 90) % 360,
            }),
          );
        return;
      }
      if (event.button !== 0 || roomDrawing || routeDrawing || event.altKey)
        return;
      event.stopPropagation();
      onSelectSymbol(symbol.id);
      if (symbol.locked) return;
      const point = toPlan(event);
      dragRef.current = {
        id: symbol.id,
        startX: point.x,
        startY: point.y,
        originX: symbol.position.x,
        originY: symbol.position.y,
        lastX: symbol.position.x,
        lastY: symbol.position.y,
        moved: false,
      };
      setDrag({ id: symbol.id, x: symbol.position.x, y: symbol.position.y });
    };

    const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
      if (!panRef.current) return;
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
    };

    const handlePointerUp = () => {
      panRef.current = null;
    };

    const dragging = drag !== null;
    const draggingLabel = labelDrag !== null;

    const handleRoomLabelPointerDown = (
      event: ReactPointerEvent<SVGGElement>,
      roomId: string,
      labelX: number,
      labelY: number,
    ) => {
      if (event.button !== 0 || roomDrawing || routeDrawing || event.altKey)
        return;
      event.stopPropagation();
      onSelectSymbol(null);
      onSelectRoom(roomId);
      const room = rooms.find((item) => item.id === roomId);
      if (room?.locked) return;
      const point = toPlan(event);
      labelDragRef.current = {
        roomId,
        startX: point.x,
        startY: point.y,
        originX: labelX,
        originY: labelY,
        lastX: labelX,
        lastY: labelY,
        moved: false,
      };
      setLabelDrag({ roomId, x: labelX, y: labelY });
    };

    const beginRoomEdit = (
      event: ReactPointerEvent<SVGGElement | SVGCircleElement>,
      room: ElectricalRoom,
      kind: RoomEdit["kind"],
      index: number | null,
    ) => {
      if (
        event.button !== 0 ||
        roomDrawing ||
        routeDrawing ||
        selectedDefId ||
        (event.altKey && kind === "room")
      )
        return;
      event.stopPropagation();
      onSelectSymbol(null);
      onSelectRoom(room.id);
      if (room.locked) return;
      const point = toPlan(event);
      const next: RoomEdit = {
        roomId: room.id,
        kind,
        index,
        startX: point.x,
        startY: point.y,
        originPoints: room.points.map((vertex) => ({
          x: vertex.x,
          y: vertex.y,
        })),
        points: room.points.map((vertex) => ({ x: vertex.x, y: vertex.y })),
        originLabelX: room.labelX,
        originLabelY: room.labelY,
        labelX: room.labelX,
        labelY: room.labelY,
        moved: false,
      };
      roomEditRef.current = next;
      setRoomEdit(next);
    };

    const handleRoomPointerDown = (
      event: ReactPointerEvent<SVGGElement>,
      room: ElectricalRoom,
    ) => {
      beginRoomEdit(event, room, "room", null);
    };

    const handleRoomVertexPointerDown = (
      event: ReactPointerEvent<SVGCircleElement>,
      room: ElectricalRoom,
      index: number,
    ) => {
      if (
        event.button !== 0 ||
        roomDrawing ||
        routeDrawing ||
        selectedDefId ||
        room.locked
      )
        return;
      if (event.altKey) {
        event.stopPropagation();
        if (room.points.length <= 3) return;
        const points = room.points
          .filter((_, pointIndex) => pointIndex !== index)
          .map((vertex) => ({ x: vertex.x, y: vertex.y }));
        dispatch(actions.updateRoom({ unitId: unit.id, id: room.id, points }));
        reassignRoomSymbols(room.id, points);
        return;
      }
      beginRoomEdit(event, room, "vertex", index);
    };

    const handleRoomDoubleClick = (
      event: ReactMouseEvent<SVGGElement>,
      room: ElectricalRoom,
    ) => {
      if (roomDrawing || routeDrawing || selectedDefId) return;
      event.stopPropagation();
      onSelectRoom(room.id);
      if (room.locked) return;
      const point = toPlan(event);
      let bestIndex = -1;
      let bestPoint = point;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < room.points.length; index += 1) {
        const a = room.points[index];
        const b = room.points[(index + 1) % room.points.length];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lengthSquared = dx * dx + dy * dy;
        const t =
          lengthSquared > 0
            ? Math.max(
                0,
                Math.min(
                  1,
                  ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared,
                ),
              )
            : 0;
        const candidate = { x: a.x + dx * t, y: a.y + dy * t };
        const distance = Math.hypot(
          point.x - candidate.x,
          point.y - candidate.y,
        );
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
          bestPoint = candidate;
        }
      }
      if (bestIndex < 0 || bestDistance > Math.max(2, view.w * 0.012)) return;
      const points = room.points.map((vertex) => ({
        x: vertex.x,
        y: vertex.y,
      }));
      points.splice(bestIndex + 1, 0, {
        x: Math.round(bestPoint.x * 10) / 10,
        y: Math.round(bestPoint.y * 10) / 10,
      });
      dispatch(actions.updateRoom({ unitId: unit.id, id: room.id, points }));
      reassignRoomSymbols(room.id, points);
      onSelectRoom(room.id);
    };

    const editingRoom = roomEdit !== null;

    useEffect(() => {
      if (!editingRoom) return;
      const onMove = (event: PointerEvent) => {
        const current = roomEditRef.current;
        if (!current) return;
        const point = toPlan(event);
        const dx = point.x - current.startX;
        const dy = point.y - current.startY;
        if (Math.hypot(dx, dy) > 0.25) current.moved = true;
        if (current.kind === "room") {
          current.points = current.originPoints.map((vertex) => ({
            x: vertex.x + dx,
            y: vertex.y + dy,
          }));
          current.labelX = current.originLabelX + dx;
          current.labelY = current.originLabelY + dy;
        } else if (current.index != null) {
          current.points = current.originPoints.map((vertex, index) =>
            index === current.index
              ? { x: vertex.x + dx, y: vertex.y + dy }
              : vertex,
          );
        }
        setRoomEdit({ ...current });
      };
      const onUp = () => {
        const current = roomEditRef.current;
        if (current?.moved) {
          const points = current.points.map((vertex) => ({
            x: Math.round(vertex.x * 10) / 10,
            y: Math.round(vertex.y * 10) / 10,
          }));
          dispatch(
            actions.updateRoom({
              unitId: unit.id,
              id: current.roomId,
              points,
              ...(current.kind === "room"
                ? {
                    labelX: Math.round(current.labelX * 10) / 10,
                    labelY: Math.round(current.labelY * 10) / 10,
                  }
                : {}),
            }),
          );
          reassignRoomSymbols(current.roomId, points);
        }
        roomEditRef.current = null;
        setRoomEdit(null);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, [dispatch, editingRoom, reassignRoomSymbols, toPlan, unit.id]);

    useEffect(() => {
      if (!draggingLabel) return;
      const onMove = (event: PointerEvent) => {
        const current = labelDragRef.current;
        if (!current) return;
        const point = toPlan(event);
        current.lastX = current.originX + (point.x - current.startX);
        current.lastY = current.originY + (point.y - current.startY);
        if (
          Math.abs(point.x - current.startX) > 0.3 ||
          Math.abs(point.y - current.startY) > 0.3
        )
          current.moved = true;
        setLabelDrag({
          roomId: current.roomId,
          x: current.lastX,
          y: current.lastY,
        });
      };
      const onUp = () => {
        const current = labelDragRef.current;
        if (current && current.moved) {
          dispatch(
            actions.updateRoom({
              unitId: unit.id,
              id: current.roomId,
              labelX: current.lastX,
              labelY: current.lastY,
            }),
          );
        }
        labelDragRef.current = null;
        setLabelDrag(null);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, [dispatch, draggingLabel, toPlan, unit.id]);

    useEffect(() => {
      if (!dragging) return;
      const onMove = (event: PointerEvent) => {
        const current = dragRef.current;
        if (!current) return;
        const point = toPlan(event);
        const x = current.originX + (point.x - current.startX);
        const y = current.originY + (point.y - current.startY);
        if (
          Math.abs(point.x - current.startX) > 0.4 ||
          Math.abs(point.y - current.startY) > 0.4
        )
          current.moved = true;
        current.lastX = x;
        current.lastY = y;
        setDrag({ id: current.id, x, y });
      };
      const onUp = () => {
        const current = dragRef.current;
        if (current && current.moved) {
          const symbol = unit.symbols.find((item) => item.id === current.id);
          const targetRoom =
            roomAt(unit, { x: current.lastX, y: current.lastY })?.id ?? null;
          dispatch(
            actions.moveSymbol({
              unitId: unit.id,
              id: current.id,
              x: current.lastX,
              y: current.lastY,
            }),
          );
          if (symbol && (symbol.roomId ?? null) !== targetRoom) {
            dispatch(
              actions.updateSymbol({
                unitId: unit.id,
                id: current.id,
                roomId: targetRoom,
              }),
            );
          }
        }
        dragRef.current = null;
        setDrag(null);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, [dragging, dispatch, toPlan, unit]);

    const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.dataTransfer.files.length)
        onImportFile?.(event.dataTransfer.files[0]);
    };

    return (
      <div
        className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onContextMenu={(event) => event.preventDefault()}
      >
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          className={`h-full w-full touch-none select-none ${selectedDefId || roomDrawing ? "cursor-crosshair" : "cursor-default"}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="application"
          aria-label={`Electrical plan for ${unit.name}`}
        >
          <defs>
            <pattern
              id="plan-small-grid"
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
              id="plan-grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <rect width="100" height="100" fill="url(#plan-small-grid)" />
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
            fill="url(#plan-grid)"
          />
          {background?.dataUrl ? (
            <image
              href={background.dataUrl}
              x={background.x}
              y={background.y}
              width={background.widthCm ?? 800}
              height={background.heightCm ?? 520}
              opacity={background.opacity}
              preserveAspectRatio="none"
              transform={
                background.rotation
                  ? `rotate(${background.rotation} ${background.x + (background.widthCm ?? 800) / 2} ${background.y + (background.heightCm ?? 520) / 2})`
                  : undefined
              }
              style={{ pointerEvents: "none" }}
            />
          ) : null}
          {rooms.map((room, index) => {
            const color = room.fillColor ?? roomColor(index);
            const selected = selectedRoomId === room.id;
            const points = roomPoints(room.id, room.points);
            return (
              <g
                key={room.id}
                style={{
                  pointerEvents: selectedDefId || roomDrawing ? "none" : "auto",
                  cursor: selectedDefId || roomDrawing ? "default" : "move",
                }}
                data-room={room.id}
                onPointerDown={(event) => handleRoomPointerDown(event, room)}
                onDoubleClick={(event) => handleRoomDoubleClick(event, room)}
              >
                <title>
                  {room.name} — drag to move, double-click an edge to add a
                  vertex
                </title>
                <polygon
                  points={points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  fill={color}
                  fillOpacity={selected ? 0.18 : 0.11}
                  stroke={color}
                  strokeWidth={selected ? 0.75 : 0.38}
                  strokeDasharray={selected ? undefined : "2.4 1.4"}
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
          {(state.routes ?? [])
            .filter((route) => route.unitId === unit.id)
            .map((route) => {
              const circuit = circuits.get(route.circuitId);
              const color = circuit?.color ?? "#0f172a";
              return (
                <g
                  key={route.id}
                  style={{ pointerEvents: "none" }}
                  data-route={route.id}
                >
                  <polyline
                    points={route.points
                      .map((point) => `${point.x},${point.y}`)
                      .join(" ")}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.1}
                    strokeDasharray="3 1.6"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                  <text
                    x={route.points[0]?.x ?? 0}
                    y={(route.points[0]?.y ?? 0) - 2}
                    fontSize={3.4}
                    fill={color}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {routeLengthM(route).toFixed(1)} m
                  </text>
                </g>
              );
            })}
          {routeDraft.length ? (
            <g data-export-ignore="true" style={{ pointerEvents: "none" }}>
              <polyline
                points={routeDraft
                  .map((point) => `${point.x},${point.y}`)
                  .join(" ")}
                fill="none"
                stroke={
                  routeCircuitId
                    ? (circuits.get(routeCircuitId)?.color ?? "#0f172a")
                    : "#0f172a"
                }
                strokeWidth={1.1}
                strokeDasharray="3 1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {routeDraft.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={index === 0 ? 1.7 : 1.1}
                  fill={index === 0 ? "#2563eb" : "#0f172a"}
                  stroke="#ffffff"
                  strokeWidth={0.35}
                />
              ))}
            </g>
          ) : null}
          {!background?.dataUrl &&
          unit.symbols.length === 0 &&
          rooms.length === 0 ? (
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
          {unit.symbols.map((symbol) => {
            const symbolDef = getElectricalDef(symbol.defId);
            if (!symbolDef) return null;
            const circuit = symbol.circuitId
              ? circuits.get(symbol.circuitId)
              : undefined;
            const color =
              symbol.color ??
              circuit?.color ??
              electricalCategoryColor(symbolDef.category);
            const position = drag?.id === symbol.id ? drag : symbol.position;
            const selected = selectedSymbolId === symbol.id;
            // DIN socket/switch glyphs have small path bounds; give them a larger base size so the
            // icon itself stays recognizable instead of only its hit area and label growing.
            const symbolSize =
              symbolDef.category === "distribution"
                ? 18
                : symbolDef.category === "outlet" ||
                    symbolDef.category === "switch"
                  ? 44
                  : symbolDef.category === "lighting"
                    ? 16
                    : 22;
            return (
              <g
                key={symbol.id}
                data-symbol={symbol.id}
                transform={`translate(${position.x} ${position.y}) rotate(${symbol.rotation}) scale(${symbolScale})`}
                onPointerDown={(event) =>
                  handleSymbolPointerDown(event, symbol)
                }
                className="cursor-move"
              >
                <circle r={symbolSize * 0.72} fill="transparent" />
                <g transform={`scale(${symbolSize / 22})`}>
                  <SymbolGlyph def={symbolDef} color={color} />
                </g>
                {selected ? (
                  <circle
                    r={symbolSize * 0.78}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth={0.5}
                    strokeDasharray="2 1.4"
                    data-export-ignore="true"
                  />
                ) : null}
                {state.settings.showCircuitBadges && circuit ? (
                  <g data-ui="true">
                    <rect
                      x={4}
                      y={-symbolSize - 6}
                      width={circuit.skNumber > 9 ? 13 : 10}
                      height={5.2}
                      rx={1.2}
                      fill={circuit.color ?? "#2563eb"}
                    />
                    <text
                      x={4 + (circuit.skNumber > 9 ? 6.5 : 5)}
                      y={-symbolSize - 2.2}
                      textAnchor="middle"
                      fontSize={3.1}
                      fontWeight={700}
                      fill="white"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      SK{circuit.skNumber}
                    </text>
                  </g>
                ) : null}
                {symbol.label ? (
                  <text
                    data-ui="true"
                    x={0}
                    y={symbolSize + 4}
                    textAnchor="middle"
                    fontSize={3.1}
                    fill="#334155"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {symbol.label.length > 24
                      ? `${symbol.label.slice(0, 23)}…`
                      : symbol.label}
                  </text>
                ) : null}
                {state.settings.showMountHeights &&
                symbol.mountHeightCm != null ? (
                  <text
                    data-ui="true"
                    x={0}
                    y={symbolSize + (symbol.label ? 8 : 4.2)}
                    textAnchor="middle"
                    fontSize={2.7}
                    fill="#64748b"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {symbol.mountHeightCm} cm
                  </text>
                ) : null}
              </g>
            );
          })}
          {rooms.map((room, index) => {
            const color = room.fillColor ?? roomColor(index);
            const points = roomPoints(room.id, room.points);
            const area = polygonAreaM2(points);
            const editedLabel = roomEdit?.roomId === room.id ? roomEdit : null;
            const label =
              labelDrag?.roomId === room.id
                ? labelDrag
                : editedLabel
                  ? { x: editedLabel.labelX, y: editedLabel.labelY }
                  : { x: room.labelX, y: room.labelY };
            return (
              <g
                key={`label-${room.id}`}
                data-room-label={room.id}
                style={{ pointerEvents: "auto", cursor: "move" }}
                onPointerDown={(event) =>
                  handleRoomLabelPointerDown(
                    event,
                    room.id,
                    room.labelX,
                    room.labelY,
                  )
                }
              >
                <title>{room.name} — drag to move the label</title>
                <rect
                  x={label.x - 24}
                  y={label.y - 9}
                  width={48}
                  height={19}
                  fill="transparent"
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  fontSize={5.2}
                  fontWeight={600}
                  fill={color}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {room.name}
                </text>
                <text
                  x={label.x}
                  y={label.y + 5.6}
                  textAnchor="middle"
                  fontSize={3.6}
                  fill="#64748b"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {area.toFixed(1)} m²
                </text>
              </g>
            );
          })}
          {selectedRoom && !selectedRoom.locked
            ? (() => {
                const points = roomPoints(selectedRoom.id, selectedRoom.points);
                const handleRadius = Math.max(1.4, view.w / 260);
                return (
                  <g
                    data-export-ignore="true"
                    style={{ pointerEvents: "auto" }}
                  >
                    {points.map((point, index) => (
                      <circle
                        key={`${selectedRoom.id}-vertex-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r={handleRadius}
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth={handleRadius * 0.35}
                        style={{ cursor: "grab" }}
                        onPointerDown={(event) =>
                          handleRoomVertexPointerDown(
                            event,
                            selectedRoom,
                            index,
                          )
                        }
                      >
                        <title>Drag to move vertex · Alt-click to remove</title>
                      </circle>
                    ))}
                  </g>
                );
              })()
            : null}
          {draftRoom.length ? (
            <g data-export-ignore="true" style={{ pointerEvents: "none" }}>
              {draftRoom.length >= 2 ? (
                <polygon
                  points={draftRoom
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth={0.55}
                  strokeDasharray="3 1.5"
                  strokeLinejoin="round"
                />
              ) : null}
              {draftRoom.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={index === 0 ? 1.8 : 1.2}
                  fill={index === 0 ? "#2563eb" : "#0f172a"}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                />
              ))}
            </g>
          ) : null}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            {routeDrawing ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-blue-700">
                  Drawing cable route · {routeDraft.length} point
                  {routeDraft.length === 1 ? "" : "s"}
                </span>
                <span className="text-slate-400">
                  {routeDraft.length < 2
                    ? "Add at least 2 points"
                    : "Enter or click the first point"}
                </span>
                <button
                  type="button"
                  disabled={routeDraft.length < 2}
                  onClick={finishRoute}
                  className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Finish
                </button>
                <button
                  type="button"
                  onClick={() => setRouteDraft([])}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : roomDrawing ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-slate-700">
                  Drawing room · {draftRoom.length} point
                  {draftRoom.length === 1 ? "" : "s"}
                </span>
                <span className="text-slate-400">
                  {draftRoom.length < 3
                    ? "Add at least 3 points"
                    : "Enter or click the first point"}
                </span>
                <button
                  type="button"
                  disabled={draftRoom.length < 3}
                  onClick={finishRoom}
                  className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Finish
                </button>
                <button
                  type="button"
                  onClick={() => setDraftRoom([])}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : def ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-blue-700">
                  Placing {def.name}
                </span>
                <span className="text-slate-400">
                  Click the plan · Esc to stop
                </span>
              </div>
            ) : selectedRoom ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <span className="font-semibold text-blue-700">
                  {selectedRoom.name}
                  {selectedRoom.locked ? " · locked" : ""}
                </span>
                <span className="text-slate-400">
                  {selectedRoom.locked
                    ? "Unlock it in the room list to edit · Esc to deselect"
                    : "Drag body or vertices · double-click edge to add · Alt-click vertex to remove · Esc to deselect"}
                </span>
              </div>
            ) : null}
          </div>
          <div
            className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur"
            data-ui="true"
          >
            <button
              type="button"
              title="Draw a room polygon"
              className={`rounded-md px-2 py-1 text-xs font-medium ${roomDrawing ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              onClick={onToggleRoomDrawing}
            >
              Room
            </button>
            <button
              type="button"
              title={
                routeCircuitId
                  ? "Draw a cable route for the selected circuit"
                  : "Select a circuit first"
              }
              disabled={!routeCircuitId && !routeDrawing}
              className={`rounded-md px-2 py-1 text-xs font-medium ${routeDrawing ? "bg-blue-700 text-white" : routeCircuitId ? "text-slate-600 hover:bg-slate-100" : "text-slate-300"}`}
              onClick={onToggleRouteDrawing}
            >
              Route
            </button>
            <span className="mx-1 h-4 w-px bg-slate-200" />
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
              onClick={() => {
                void exportPng();
              }}
            >
              PNG
            </button>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={() =>
                printHtml(
                  `${unit.name} — Electrical plan`,
                  `<h1>${escapeXml(unit.name)} — Electrical plan</h1><div class="meta">${escapeXml(state.name)}</div>${exportSvg()}`,
                )
              }
            >
              PDF
            </button>
          </div>
        </div>
        <div
          className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-[10px] text-slate-500 shadow-sm"
          data-ui="true"
        >
          {background?.widthCm
            ? `${Math.round(background.widthCm)} × ${Math.round(background.heightCm ?? 0)} cm`
            : `${Math.round(view.w)} × ${Math.round(view.h)} cm`}{" "}
          · {unit.symbols.length} symbols · {rooms.length} rooms ·
          Right/Alt-drag to pan · middle-click a symbol to rotate · drop a
          PDF/image to import
        </div>
      </div>
    );
  },
);
