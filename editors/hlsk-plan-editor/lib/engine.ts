import {
  DUCT_BY_ID,
  FIXTURES,
  FIXTURE_BY_ID,
  PIPE_BY_ID,
  RISER_BY_ID,
  disciplineLabel,
  ductLabel,
  pipeLabel,
  riserLabel,
} from "./catalog.js";
import { polygonAreaM2, routeLengthM, unitRooms } from "./geometry.js";
import type {
  HlskFixture,
  HlskPlanGlobalState,
  HlskUnit,
  PipeRoute,
  Position,
} from "./types.js";

export function newId(prefix: string): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${uuid}`;
}

export function fixtureName(fixture: HlskFixture): string {
  return FIXTURE_BY_ID.get(fixture.kind)?.name ?? fixture.name;
}

export interface BomLine {
  unit: string;
  category: string;
  item: string;
  detail: string;
  quantity: number;
  lengthM?: number;
}

export interface BomTotals {
  fixtures: number;
  pipes: number;
  ducts: number;
  risers: number;
  pipeLengthM: number;
  ductLengthM: number;
}

export interface Bom {
  lines: BomLine[];
  totals: BomTotals;
}

export function hlskBom(state: HlskPlanGlobalState): Bom {
  const lines: BomLine[] = [];
  const totals: BomTotals = {
    fixtures: 0,
    pipes: 0,
    ducts: 0,
    risers: 0,
    pipeLengthM: 0,
    ductLengthM: 0,
  };

  for (const unit of state.units) {
    const fixtureGroups = new Map<
      string,
      { name: string; discipline: string; count: number }
    >();
    for (const fixture of unit.fixtures) {
      const key = `${fixture.kind}|${fixture.discipline}`;
      const entry = fixtureGroups.get(key);
      if (entry) entry.count += 1;
      else
        fixtureGroups.set(key, {
          name: fixtureName(fixture),
          discipline: disciplineLabel(fixture.discipline),
          count: 1,
        });
    }
    for (const entry of fixtureGroups.values()) {
      lines.push({
        unit: unit.name,
        category: "Fixture",
        item: entry.name,
        detail: entry.discipline,
        quantity: entry.count,
      });
      totals.fixtures += entry.count;
    }

    const pipeGroups = new Map<
      string,
      { name: string; detail: string; count: number; length: number }
    >();
    for (const route of unit.pipeRoutes) {
      const key = `${route.kind}|${route.diameterMm}`;
      const entry = pipeGroups.get(key);
      const length = routeLengthM(route);
      if (entry) {
        entry.count += 1;
        entry.length += length;
      } else {
        pipeGroups.set(key, {
          name: pipeLabel(route.kind),
          detail: `${route.diameterMm} mm diameter`,
          count: 1,
          length,
        });
      }
      totals.pipes += 1;
      totals.pipeLengthM += length;
    }
    for (const entry of pipeGroups.values()) {
      lines.push({
        unit: unit.name,
        category: "Pipe",
        item: entry.name,
        detail: entry.detail,
        quantity: entry.count,
        lengthM: Math.round(entry.length * 10) / 10,
      });
    }

    const ductGroups = new Map<
      string,
      { name: string; detail: string; count: number; length: number }
    >();
    for (const route of unit.ductRoutes) {
      const key = `${route.kind}|${route.widthMm}|${route.heightMm}`;
      const entry = ductGroups.get(key);
      const length = routeLengthM(route);
      if (entry) {
        entry.count += 1;
        entry.length += length;
      } else {
        ductGroups.set(key, {
          name: ductLabel(route.kind),
          detail: `${route.widthMm} × ${route.heightMm} mm duct`,
          count: 1,
          length,
        });
      }
      totals.ducts += 1;
      totals.ductLengthM += length;
    }
    for (const entry of ductGroups.values()) {
      lines.push({
        unit: unit.name,
        category: "Duct",
        item: entry.name,
        detail: entry.detail,
        quantity: entry.count,
        lengthM: Math.round(entry.length * 10) / 10,
      });
    }

    const riserGroups = new Map<string, number>();
    for (const riser of unit.risers) {
      riserGroups.set(riser.kind, (riserGroups.get(riser.kind) ?? 0) + 1);
      totals.risers += 1;
    }
    for (const [kind, count] of riserGroups) {
      lines.push({
        unit: unit.name,
        category: "Riser",
        item: riserLabel(kind),
        detail: "Vertical shaft marker",
        quantity: count,
      });
    }
  }

  return { lines, totals };
}

export interface CheckItem {
  severity: "warning" | "info";
  title: string;
  message: string;
  hint: string;
}

export function hlskChecks(state: HlskPlanGlobalState): CheckItem[] {
  const checks: CheckItem[] = [];

  for (const unit of state.units) {
    const fixtures = unit.fixtures;
    const rooms = unitRooms(unit);
    const wasteRoutes = unit.pipeRoutes.filter(
      (route) => route.kind === "waste" || route.kind === "condensate",
    );
    const sanitaryFixtures = fixtures.filter(
      (fixture) => fixture.discipline === "sanitary",
    );

    if (fixtures.length > 0 && unit.risers.length === 0) {
      checks.push({
        severity: "warning",
        title: `${unit.name}: no riser`,
        message: "This floor has fixtures but no riser marker.",
        hint: "Add a riser on the Risers tab so the vertical connections are clear.",
      });
    }

    if (sanitaryFixtures.length > 0 && wasteRoutes.length === 0) {
      checks.push({
        severity: "warning",
        title: `${unit.name}: sanitary fixtures without waste pipe`,
        message:
          "There are sanitary fixtures, but no waste pipe on this floor.",
        hint: "Draw a waste-water pipe from each fixture to the waste riser.",
      });
    }

    for (const fixture of fixtures) {
      if (fixture.roomId == null) {
        checks.push({
          severity: "warning",
          title: `${unit.name}: fixture outside a room`,
          message: `${fixtureName(fixture)} is not assigned to a room.`,
          hint: "Move it inside a room or assign a room in the inspector.",
        });
      }
    }

    for (const route of unit.pipeRoutes) {
      const definition = PIPE_BY_ID.get(route.kind);
      if (
        definition?.requiresSlope &&
        (route.slopePercent == null || route.slopePercent < 1)
      ) {
        checks.push({
          severity: "warning",
          title: `${unit.name}: ${definition.name} needs fall`,
          message: "This pipe does not have at least 1% fall.",
          hint: "Set the fall to 1% or more in the inspector so water drains.",
        });
      }
      if (route.kind === "waste" && route.diameterMm < 50) {
        checks.push({
          severity: "warning",
          title: `${unit.name}: waste pipe too small`,
          message: `Waste pipe is ${route.diameterMm} mm.`,
          hint: "Use at least 50 mm for a toilet waste pipe.",
        });
      }
      if (
        (route.kind === "cold_water" || route.kind === "hot_water") &&
        route.diameterMm < 15
      ) {
        checks.push({
          severity: "warning",
          title: `${unit.name}: water pipe too small`,
          message: `${pipeLabel(route.kind)} pipe is ${route.diameterMm} mm.`,
          hint: "Use at least 15 mm for cold and hot water.",
        });
      }
    }

    for (const route of unit.ductRoutes) {
      if (route.airflowM3h == null || route.airflowM3h <= 0) {
        checks.push({
          severity: "info",
          title: `${unit.name}: duct airflow not set`,
          message: `${ductLabel(route.kind)} duct has no airflow value.`,
          hint: "Add the planned airflow in m³/h in the inspector.",
        });
      }
    }

    const ventilationFixtures = fixtures.some(
      (fixture) => fixture.discipline === "ventilation",
    );
    if (ventilationFixtures && unit.ductRoutes.length === 0) {
      checks.push({
        severity: "warning",
        title: `${unit.name}: ventilation fixtures without ducts`,
        message: "Ventilation fixtures are placed, but no duct route is drawn.",
        hint: "Draw supply and exhaust ducts to connect the ventilation unit.",
      });
    }

    const heatingFixtures = fixtures.some(
      (fixture) => fixture.discipline === "heating",
    );
    const heatingRoutes = unit.pipeRoutes.some(
      (route) =>
        route.kind === "heating_supply" || route.kind === "heating_return",
    );
    if (heatingFixtures && !heatingRoutes) {
      checks.push({
        severity: "warning",
        title: `${unit.name}: heating fixtures without heating pipes`,
        message:
          "Heating fixtures are placed, but no heating flow or return is drawn.",
        hint: "Draw heating flow and return pipes from the heat source.",
      });
    }

    for (const room of rooms) {
      const area = polygonAreaM2(room.points);
      if (area === 0) {
        checks.push({
          severity: "info",
          title: `${room.name}: room area is zero`,
          message: "The room outline has no usable area.",
          hint: "Redraw the room outline with at least three points.",
        });
      }
    }
  }

  if (checks.length === 0) {
    checks.push({
      severity: "info",
      title: "No obvious gaps found",
      message: "The plan passes the basic checks.",
      hint: "Check dimensions, airflow and pipe fall against the project design.",
    });
  }

  return checks;
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function hlskCsv(state: HlskPlanGlobalState): string {
  const bom = hlskBom(state);
  const rows = [
    ["Floor", "Category", "Item", "Detail", "Quantity", "Length (m)"],
    ...bom.lines.map((line) => [
      line.unit,
      line.category,
      line.item,
      line.detail,
      String(line.quantity),
      line.lengthM == null ? "" : line.lengthM.toFixed(1),
    ]),
  ];
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function hlskCsvFilename(name: string): string {
  return `${
    name
      .trim()
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "hlsk-plan"
  }-materials.csv`;
}

export function activeUnit(state: HlskPlanGlobalState): HlskUnit | undefined {
  return (
    state.units.find((unit) => unit.id === state.activeUnitId) ?? state.units[0]
  );
}

export function unitFixtureCount(unit: HlskUnit): number {
  return unit.fixtures.length;
}

export function routePointsText(points: Position[]): string {
  return points
    .map((point) => `${Math.round(point.x)},${Math.round(point.y)}`)
    .join(" → ");
}

export function fixtureDefinitionFor(fixture: HlskFixture) {
  return FIXTURE_BY_ID.get(fixture.kind);
}

export function fixtureCatalog() {
  return FIXTURES;
}

export function pipeDefinition(kind: string) {
  return PIPE_BY_ID.get(kind);
}

export function ductDefinition(kind: string) {
  return DUCT_BY_ID.get(kind);
}

export function riserDefinition(kind: string) {
  return RISER_BY_ID.get(kind);
}

export function pipeRoute(route: PipeRoute): string {
  return routePointsText(route.points);
}
