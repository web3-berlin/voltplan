import type { HlskRoom, HlskUnit, PipeRoute, Position } from "./types.js";

export const ROOM_COLORS = [
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#ef4444",
  "#06b6d4",
  "#eab308",
];

export function roomColor(index: number): string {
  return ROOM_COLORS[index % ROOM_COLORS.length];
}

export function unitRooms(unit: HlskUnit): HlskRoom[] {
  return unit.rooms ?? [];
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
  const sum = points.reduce(
    (result, point) => ({ x: result.x + point.x, y: result.y + point.y }),
    { x: 0, y: 0 },
  );
  return {
    x: Math.round((sum.x / points.length) * 10) / 10,
    y: Math.round((sum.y / points.length) * 10) / 10,
  };
}

export function pointInPolygon(
  point: Position,
  polygon: readonly Position[],
): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (
    let index = 0, previous = polygon.length - 1;
    index < polygon.length;
    previous = index, index += 1
  ) {
    const a = polygon[index];
    const b = polygon[previous];
    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x <
        ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || Number.EPSILON) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function roomAt(unit: HlskUnit, point: Position): HlskRoom | undefined {
  return unitRooms(unit).find((room) => pointInPolygon(point, room.points));
}

export function polylineLengthCm(points: readonly Position[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].y - points[index - 1].y,
    );
  }
  return total;
}

export function routeLengthM(
  route: PipeRoute | { points: Position[] },
): number {
  return Math.round((polylineLengthCm(route.points) / 100) * 10) / 10;
}

export function routeMidpoint(points: readonly Position[]): Position {
  if (!points.length) return { x: 0, y: 0 };
  const half = polylineLengthCm(points) / 2;
  let walked = 0;
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const segment = Math.hypot(end.x - start.x, end.y - start.y);
    if (walked + segment >= half) {
      const t = segment === 0 ? 0 : (half - walked) / segment;
      return {
        x: Math.round((start.x + (end.x - start.x) * t) * 10) / 10,
        y: Math.round((start.y + (end.y - start.y) * t) * 10) / 10,
      };
    }
    walked += segment;
  }
  return points[points.length - 1];
}
