import type { ElectricalRoom, ElectricalUnit, Position } from "./types.js";

export const ROOM_COLORS = ["#2563eb", "#0891b2", "#16a34a", "#d97706", "#7c3aed", "#dc2626", "#0d9488", "#ca8a04"];

export function roomColor(index: number): string {
  return ROOM_COLORS[index % ROOM_COLORS.length];
}

/** Old documents predate the rooms field; keep them readable without a migration. */
export function unitRooms(unit: ElectricalUnit): ElectricalRoom[] {
  return (unit as ElectricalUnit & { rooms?: ElectricalRoom[] }).rooms ?? [];
}

export function polygonAreaM2(points: readonly Position[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }
  return Math.round((Math.abs(area) / 2 / 10000) * 10) / 10;
}

export function polygonCentroid(points: readonly Position[]): Position {
  if (!points.length) return { x: 0, y: 0 };
  const sum = points.reduce((result, point) => ({ x: result.x + point.x, y: result.y + point.y }), { x: 0, y: 0 });
  return { x: Math.round((sum.x / points.length) * 10) / 10, y: Math.round((sum.y / points.length) * 10) / 10 };
}

export function pointInPolygon(point: Position, polygon: readonly Position[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index];
    const b = polygon[previous];
    const intersects = (a.y > point.y) !== (b.y > point.y)
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || Number.EPSILON) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function roomAt(unit: ElectricalUnit, point: Position): ElectricalRoom | undefined {
  return unitRooms(unit).find((room) => pointInPolygon(point, room.points));
}
