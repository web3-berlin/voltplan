import { getElectricalDef } from "./catalog.js";
import { polygonAreaM2, unitRooms } from "./rooms.js";
import type {
  CabinetDevice,
  CableRoute,
  CircuitKind,
  ElectricalCircuit,
  ElectricalKnxFunction,
  ElectricalDistributor,
  ElectricalPlanGlobalState,
  ElectricalSymbol,
  ElectricalSymbolDef,
  ElectricalUnit,
  GroupAddress,
  InspectionReport,
  SymbolPart,
} from "./types.js";

export const CIRCUIT_KIND_LABELS: Record<CircuitKind, string> = {
  lighting: "Lighting",
  sockets: "Sockets",
  appliance: "Appliance",
  hvac: "HVAC",
  other: "Other",
};

const RATINGS = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63];
const COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#4f46e5",
];

export function newId(prefix: string): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${uuid}`;
}

export function circuitColor(index: number): string {
  return COLORS[index % COLORS.length];
}

export function unitById(
  state: ElectricalPlanGlobalState,
  id: string,
): ElectricalUnit | undefined {
  return state.units.find((unit) => unit.id === id);
}

export function activeUnit(
  state: ElectricalPlanGlobalState,
): ElectricalUnit | undefined {
  return unitById(state, state.activeUnitId) ?? state.units[0];
}

export function pointPowerW(def: ElectricalSymbolDef): number {
  if (def.powerW != null) return def.powerW;
  switch (def.category) {
    case "lighting":
      return 80;
    case "outlet":
      return 200;
    case "appliance":
      return 2000;
    case "hvac":
      return 1200;
    case "knx":
      return 5;
    case "data":
      return 10;
    case "safety":
      return 3;
    case "distribution":
      return 0;
    case "switch":
      return 0;
    default:
      return 0;
  }
}

export interface CircuitLoad {
  circuitId: string;
  watts: number;
  points: number;
  currentA: number;
}

export function circuitCurrentA(watts: number, poles: number): number {
  return poles === 3 ? watts / (Math.sqrt(3) * 400 * 0.9) : watts / (230 * 0.9);
}
export function polylineLengthM(
  points: readonly { x: number; y: number }[],
): number {
  let lengthCm = 0;
  for (let index = 1; index < points.length; index += 1) {
    lengthCm += Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].y - points[index - 1].y,
    );
  }
  return lengthCm / 100;
}

export function routeLengthM(
  route: Pick<CableRoute, "points" | "reservePercent">,
): number {
  const reserve = Math.max(0, route.reservePercent ?? 10);
  return (
    Math.round(polylineLengthM(route.points) * (1 + reserve / 100) * 10) / 10
  );
}

export function circuitRouteLengthM(
  state: ElectricalPlanGlobalState,
  circuitId: string,
): number {
  return (
    Math.round(
      (state.routes ?? [])
        .filter((route) => route.circuitId === circuitId)
        .reduce((sum, route) => sum + routeLengthM(route), 0) * 10,
    ) / 10
  );
}

export function circuitLoads(
  state: ElectricalPlanGlobalState,
): Map<string, CircuitLoad> {
  const circuits = new Map(
    state.circuits.map((circuit) => [circuit.id, circuit]),
  );
  const loads = new Map<string, CircuitLoad>();
  for (const unit of state.units) {
    for (const symbol of unit.symbols) {
      if (!symbol.circuitId || !circuits.has(symbol.circuitId)) continue;
      const def = getElectricalDef(symbol.defId);
      if (!def) continue;
      const load = loads.get(symbol.circuitId) ?? {
        circuitId: symbol.circuitId,
        watts: 0,
        points: 0,
        currentA: 0,
      };
      load.watts += pointPowerW(def);
      load.points += 1;
      loads.set(symbol.circuitId, load);
    }
  }
  for (const [id, load] of loads) {
    const circuit = circuits.get(id)!;
    load.currentA = circuitCurrentA(load.watts, circuit.breaker.poles);
  }
  return loads;
}

export function recommendedBreaker(watts: number, poles: number): number {
  const target = circuitCurrentA(Math.max(watts, 0), poles) * 1.25;
  return RATINGS.find((rating) => rating >= target) ?? 63;
}

export function recommendedCable(
  ratingA: number,
  poles: number,
): { type: string; crossSectionMm2: number } {
  const crossSectionMm2 =
    ratingA <= 16
      ? 1.5
      : ratingA <= 20
        ? 2.5
        : ratingA <= 25
          ? 4
          : ratingA <= 32
            ? 6
            : ratingA <= 40
              ? 10
              : ratingA <= 50
                ? 16
                : 25;
  return {
    type: `${poles === 3 ? "NYM-J 5x" : "NYM-J 3x"}${String(crossSectionMm2).replace(".", ",")}`,
    crossSectionMm2,
  };
}

export const INSTALLATION_METHODS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C",
  "E",
  "F",
] as const;
export type InstallationMethod = (typeof INSTALLATION_METHODS)[number];

// Reference current-carrying capacity for copper PVC insulated cables, in amperes.
// These are planning values; final selection must follow the cable manufacturer's data and
// DIN VDE 0298-4 for the actual installation, grouping and ambient conditions.
const BASE_AMPACITY: Partial<
  Record<InstallationMethod, Record<number, number>>
> = {
  A1: { 1.5: 14.5, 2.5: 19.5, 4: 26, 6: 34, 10: 46, 16: 61, 25: 78 },
  A2: { 1.5: 15.5, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 66, 25: 84 },
  B1: { 1.5: 17.5, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76, 25: 101 },
  B2: { 1.5: 16.5, 2.5: 23, 4: 30, 6: 38, 10: 52, 16: 69, 25: 90 },
  C: { 1.5: 19.5, 2.5: 27, 4: 36, 6: 45, 10: 63, 16: 85, 25: 112 },
  E: { 1.5: 22, 2.5: 30, 4: 40, 6: 51, 10: 70, 16: 94, 25: 119 },
  F: { 1.5: 23, 2.5: 31, 4: 42, 6: 54, 10: 75, 16: 100, 25: 127 },
};
const AMBIENT_FACTORS: [number, number][] = [
  [30, 1],
  [35, 0.94],
  [40, 0.87],
  [45, 0.79],
  [50, 0.71],
  [55, 0.61],
  [60, 0.5],
];
const GROUPING_FACTORS = [1, 0.8, 0.7, 0.65, 0.6, 0.57, 0.54, 0.52, 0.5];

export function cableAmpacity(circuit: ElectricalCircuit): number | null {
  const method = (circuit.installationMethod ?? "B2") as InstallationMethod;
  const base = BASE_AMPACITY[method]?.[circuit.cable.crossSectionMm2];
  if (base == null) return null;
  const ambient = circuit.ambientTempC ?? 30;
  const ambientFactor =
    AMBIENT_FACTORS.find(([temperature]) => ambient <= temperature)?.[1] ??
    AMBIENT_FACTORS[AMBIENT_FACTORS.length - 1][1];
  const grouping = Math.max(1, Math.round(circuit.groupedCircuits ?? 1));
  const groupingFactor =
    GROUPING_FACTORS[Math.min(GROUPING_FACTORS.length, grouping) - 1] ?? 0.5;
  return Math.round(base * ambientFactor * groupingFactor * 10) / 10;
}

export interface CircuitWarning {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
}

/** Voltage drop of a final circuit at the calculated load, in percent. */
export function voltageDropPercent(
  circuit: ElectricalCircuit,
  load: CircuitLoad | undefined,
): number | null {
  const lengthM = circuit.cable.lengthM ?? 0;
  const areaMm2 = circuit.cable.crossSectionMm2;
  const currentA = load?.currentA ?? 0;
  if (lengthM <= 0 || areaMm2 <= 0 || currentA <= 0) return null;
  const threePhase = circuit.breaker.poles === 3;
  const voltage = threePhase ? 400 : 230;
  const factor = threePhase ? Math.sqrt(3) : 2;
  // Copper resistivity at 20 °C. A cold-cable estimate; the normative calculation must use
  // the installation method, conductor temperature and conductor resistances from the cable data.
  return ((factor * 0.0175 * lengthM * currentA) / areaMm2 / voltage) * 100;
}

export function circuitWarnings(
  circuit: ElectricalCircuit,
  load: CircuitLoad | undefined,
): CircuitWarning[] {
  const warnings: CircuitWarning[] = [];
  const watts = load?.watts ?? 0;
  const currentA = load?.currentA ?? 0;
  if (!load || load.points === 0)
    warnings.push({
      code: "unassigned",
      severity: "info",
      message: "No symbols assigned to this circuit.",
    });
  else if (currentA > circuit.breaker.ratingA)
    warnings.push({
      code: "overload",
      severity: "error",
      message: `Load ${currentA.toFixed(1)} A exceeds the ${circuit.breaker.ratingA} A breaker.`,
    });
  else if (currentA > circuit.breaker.ratingA * 0.8)
    warnings.push({
      code: "near_limit",
      severity: "warning",
      message: `Load ${currentA.toFixed(1)} A is above 80 % of the breaker.`,
    });
  if (
    (circuit.kind === "sockets" || circuit.kind === "appliance") &&
    circuit.breaker.rcdMa !== 30
  ) {
    warnings.push({
      code: "rcd",
      severity: "error",
      message: "Sockets and appliances need 30 mA residual-current protection.",
    });
  }
  if (watts > 4600 && circuit.breaker.poles === 1)
    warnings.push({
      code: "three_phase",
      severity: "warning",
      message: "More than 4.6 kW on one phase. Consider a three-phase circuit.",
    });
  const recommended = recommendedBreaker(watts, circuit.breaker.poles);
  if (watts > 0 && circuit.breaker.ratingA < recommended)
    warnings.push({
      code: "breaker_size",
      severity: "warning",
      message: `Recommended breaker for this load is ${recommended} A.`,
    });
  const cable = recommendedCable(
    circuit.breaker.ratingA,
    circuit.breaker.poles,
  );
  if (circuit.cable.crossSectionMm2 < cable.crossSectionMm2)
    warnings.push({
      code: "cable_size",
      severity: "warning",
      message: `Cable ${circuit.cable.type} is small for a ${circuit.breaker.ratingA} A breaker.`,
    });
  if (
    circuit.breaker.poles === 3 &&
    !circuit.cable.type.toLowerCase().includes("5x")
  )
    warnings.push({
      code: "cable_cores",
      severity: "error",
      message: "Three-phase circuits need a five-core cable.",
    });
  const ampacity = cableAmpacity(circuit);
  if (ampacity != null && circuit.breaker.ratingA > ampacity) {
    warnings.push({
      code: "ampacity",
      severity: "error",
      message: `Derated cable ampacity ${ampacity.toFixed(1)} A is below the ${circuit.breaker.ratingA} A breaker. Check installation method, grouping and cross-section.`,
    });
  } else if (ampacity != null && circuit.breaker.ratingA > ampacity * 0.9) {
    warnings.push({
      code: "ampacity_reserve",
      severity: "warning",
      message: `Cable utilization is above 90 % of its derated ampacity (${ampacity.toFixed(1)} A).`,
    });
  }
  const drop = voltageDropPercent(circuit, load);
  if (drop != null && drop > 5)
    warnings.push({
      code: "voltage_drop_error",
      severity: "error",
      message: `Voltage drop ${drop.toFixed(1)} % exceeds the 5 % limit. Shorten the run or increase the cross-section.`,
    });
  else if (drop != null && drop > 3)
    warnings.push({
      code: "voltage_drop",
      severity: "warning",
      message: `Voltage drop ${drop.toFixed(1)} % is above the 3 % planning target.`,
    });
  return warnings;
}

export interface KnxBusLoad {
  devices: number;
  loadMa: number;
  supplyMa: number;
  capacityMa: number;
  percent: number;
  unknownDevices: number;
}

/** Sum KNX bus loads. Without a placed power supply, one 640 mA line supply is assumed. */
export function knxBusLoad(state: ElectricalPlanGlobalState): KnxBusLoad {
  let devices = 0;
  let loadMa = 0;
  let supplyMa = 0;
  let unknownDevices = 0;
  for (const unit of state.units) {
    for (const symbol of unit.symbols) {
      if (!symbol.knx?.enabled) continue;
      const def = getElectricalDef(symbol.defId);
      if (!def) continue;
      devices += 1;
      supplyMa += def.busSupplyMa ?? 0;
      if (def.busCurrentMa != null) loadMa += def.busCurrentMa;
      else if (def.busLoads != null) loadMa += def.busLoads * 10;
      else {
        loadMa += 10;
        unknownDevices += 1;
      }
    }
  }
  const capacityMa = supplyMa > 0 ? supplyMa : 640;
  return {
    devices,
    loadMa,
    supplyMa,
    capacityMa,
    percent: capacityMa > 0 ? (loadMa / capacityMa) * 100 : 0,
    unknownDevices,
  };
}

export function duplicateCircuitNumbers(
  circuits: readonly ElectricalCircuit[],
): string[] {
  const seen = new Map<number, string>();
  const messages: string[] = [];
  for (const circuit of circuits) {
    const previous = seen.get(circuit.skNumber);
    if (previous)
      messages.push(
        `Circuit number ${circuit.skNumber} is used by ${circuit.name} and ${previous}.`,
      );
    else seen.set(circuit.skNumber, circuit.name);
  }
  return messages;
}

export interface BomLine {
  key: string;
  defId?: string;
  article: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  circuitIds: string[];
  roomBreakdown: { name: string; quantity: number }[];
}
export interface BomGroup {
  category: string;
  lines: BomLine[];
  quantity: number;
  total: number;
}
export interface BomCircuit {
  circuitId: string;
  name: string;
  skNumber: number;
  load?: CircuitLoad;
  lines: BomLine[];
}

export function electricalBom(state: ElectricalPlanGlobalState) {
  const lines = new Map<string, BomLine>();
  const circuitLines = new Map<string, BomLine[]>();
  const add = (line: BomLine) => {
    const existing = lines.get(line.key);
    if (existing) {
      existing.quantity += line.quantity;
      existing.total =
        Math.round(existing.quantity * existing.unitPrice * 100) / 100;
      for (const id of line.circuitIds)
        if (!existing.circuitIds.includes(id)) existing.circuitIds.push(id);
      for (const room of line.roomBreakdown) {
        const current = existing.roomBreakdown.find(
          (entry) => entry.name === room.name,
        );
        if (current) current.quantity += room.quantity;
        else existing.roomBreakdown.push({ ...room });
      }
      return;
    }
    lines.set(line.key, line);
  };
  for (const unit of state.units) {
    const rooms = new Map(unitRooms(unit).map((room) => [room.id, room.name]));
    for (const symbol of unit.symbols) {
      const def = getElectricalDef(symbol.defId);
      if (!def) continue;
      const price = symbol.details?.price ?? def.price ?? 0;
      const roomName = symbol.roomId ? rooms.get(symbol.roomId) : undefined;
      const line: BomLine = {
        key: `symbol:${def.id}:${price.toFixed(2)}`,
        defId: def.id,
        article: def.article ?? def.id.toUpperCase(),
        description: def.name,
        category: def.category,
        quantity: 1,
        unit: def.unit ?? "pc",
        unitPrice: price,
        total: Math.round(price * 100) / 100,
        circuitIds: symbol.circuitId ? [symbol.circuitId] : [],
        roomBreakdown: roomName ? [{ name: roomName, quantity: 1 }] : [],
      };
      add(line);
      if (symbol.circuitId) {
        const list = circuitLines.get(symbol.circuitId) ?? [];
        list.push(line);
        circuitLines.set(symbol.circuitId, list);
      }
    }
  }
  for (const device of state.cabinetDevices) {
    const price = device.price ?? 0;
    add({
      key: `cabinet:${device.kind}:${device.article ?? device.label}:${price.toFixed(2)}`,
      article: device.article ?? device.label,
      description: device.label,
      category: "cabinet",
      quantity: 1,
      unit: "pc",
      unitPrice: price,
      total: price,
      circuitIds: device.circuitId ? [device.circuitId] : [],
      roomBreakdown: [],
    });
  }
  for (const circuit of state.circuits) {
    const length = circuit.cable.lengthM ?? 0;
    if (length <= 0) continue;
    const price = cablePrice(circuit.cable.crossSectionMm2);
    add({
      key: `cable:${circuit.cable.type}:${circuit.cable.crossSectionMm2}`,
      article: circuit.cable.type,
      description: circuit.cable.type,
      category: "cable",
      quantity: length,
      unit: "m",
      unitPrice: price,
      total: Math.round(length * price * 100) / 100,
      circuitIds: [circuit.id],
      roomBreakdown: [],
    });
  }
  const all = [...lines.values()].sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      a.description.localeCompare(b.description),
  );
  const groups = new Map<string, BomGroup>();
  for (const line of all) {
    const group = groups.get(line.category) ?? {
      category: line.category,
      lines: [],
      quantity: 0,
      total: 0,
    };
    group.lines.push(line);
    group.quantity += line.quantity;
    group.total = Math.round((group.total + line.total) * 100) / 100;
    groups.set(line.category, group);
  }
  const loads = circuitLoads(state);
  const rooms = state.units.flatMap((unit) => {
    const roomSymbols = new Map<string, { points: number; watts: number }>();
    for (const symbol of unit.symbols) {
      if (!symbol.roomId) continue;
      const def = getElectricalDef(symbol.defId);
      if (!def) continue;
      const entry = roomSymbols.get(symbol.roomId) ?? { points: 0, watts: 0 };
      entry.points += 1;
      entry.watts += pointPowerW(def);
      roomSymbols.set(symbol.roomId, entry);
    }
    return unitRooms(unit).map((room) => ({
      unitId: unit.id,
      unitName: unit.name,
      roomId: room.id,
      name: room.name,
      areaM2: polygonAreaM2(room.points),
      points: roomSymbols.get(room.id)?.points ?? 0,
      watts: roomSymbols.get(room.id)?.watts ?? 0,
    }));
  });
  const circuits: BomCircuit[] = state.circuits
    .map((circuit) => ({
      circuitId: circuit.id,
      name: circuit.name,
      skNumber: circuit.skNumber,
      load: loads.get(circuit.id),
      lines: circuitLines.get(circuit.id) ?? [],
    }))
    .sort((a, b) => a.skNumber - b.skNumber);
  return {
    lines: all,
    groups: [...groups.values()],
    circuits,
    rooms,
    totals: {
      symbols: all
        .filter((line) => line.defId)
        .reduce((sum, line) => sum + line.quantity, 0),
      lines: all.length,
      total:
        Math.round(all.reduce((sum, line) => sum + line.total, 0) * 100) / 100,
    },
  };
}

function cablePrice(crossSectionMm2: number): number {
  const table: Record<number, number> = {
    1.5: 1.1,
    2.5: 1.6,
    4: 2.4,
    6: 3.4,
    10: 5.8,
    16: 9.2,
    25: 14.5,
  };
  return table[crossSectionMm2] ?? 2;
}

export function bomCsv(bom: ReturnType<typeof electricalBom>): string {
  const header = [
    "Article",
    "Description",
    "Category",
    "Quantity",
    "Unit",
    "Unit price",
    "Total",
    "Circuits",
    "Rooms",
  ];
  const quote = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  return [
    header.map(quote).join(";"),
    ...bom.lines.map((line) =>
      [
        line.article,
        line.description,
        line.category,
        line.quantity,
        line.unit,
        line.unitPrice.toFixed(2),
        line.total.toFixed(2),
        line.circuitIds.join(" "),
        line.roomBreakdown
          .map((room) => `${room.name} (${room.quantity})`)
          .join(" "),
      ]
        .map(quote)
        .join(";"),
    ),
  ].join("\r\n");
}

// ── KNX ────────────────────────────────────────────────────────────
const DEFAULT_KNX_FUNCTIONS: ElectricalKnxFunction[] = [
  { key: "switch", name: "Switch", de: "Schalten", dpt: "1.001" },
  { key: "status", name: "Status", de: "Status", dpt: "1.001" },
];

export function generateKnx(state: ElectricalPlanGlobalState): {
  addresses: GroupAddress[];
  added: number;
  conflicts: string[];
} {
  const existing = [...state.groupAddresses];
  const keyed = new Map(
    existing.map((address) => [
      `${address.fixtureId ?? ""}:${address.functionKey ?? ""}`,
      address,
    ]),
  );
  const used = new Set(
    existing.map(
      (address) => `${address.main}/${address.middle}/${address.sub}`,
    ),
  );
  const nextByRange = new Map<string, number>();
  for (const address of existing) {
    const range = `${address.main}/${address.middle}`;
    nextByRange.set(range, Math.max(nextByRange.get(range) ?? 0, address.sub));
  }
  const addresses: GroupAddress[] = [];
  let added = 0;
  for (const unit of state.units) {
    for (const symbol of unit.symbols) {
      if (!symbol.knx?.enabled) continue;
      const def = getElectricalDef(symbol.defId);
      if (!def) continue;
      const middle = 0;
      for (const fn of def.knxFunctions ?? DEFAULT_KNX_FUNCTIONS) {
        const key = `${symbol.id}:${fn.key}`;
        const current = keyed.get(key);
        if (current) {
          addresses.push(current);
          continue;
        }
        const main = knxMainGroupFor(def, fn.key);
        const range = `${main}/${middle}`;
        let sub = (nextByRange.get(range) ?? 0) + 1;
        while (used.has(`${main}/${middle}/${sub}`)) sub += 1;
        nextByRange.set(range, sub);
        used.add(`${main}/${middle}/${sub}`);
        const address: GroupAddress = {
          id: newId("ga"),
          main,
          middle,
          sub,
          name: `${symbol.label || def.name} · ${fn.name}`,
          dpt: fn.dpt,
          fixtureId: symbol.id,
          functionKey: fn.key,
          description: `${def.de} · ${fn.de}`,
        };
        addresses.push(address);
        keyed.set(key, address);
        added += 1;
      }
    }
  }
  const conflicts: string[] = [];
  const seen = new Set<string>();
  for (const address of addresses) {
    const value = `${address.main}/${address.middle}/${address.sub}`;
    if (seen.has(value))
      conflicts.push(`Duplicate group address ${value}: ${address.name}`);
    seen.add(value);
  }
  return { addresses, added, conflicts };
}

function knxMainGroupFor(
  def: ElectricalSymbolDef,
  functionKey: string,
): number {
  if (
    functionKey === "move" ||
    functionKey === "stop" ||
    functionKey === "position" ||
    functionKey.endsWith("_move") ||
    functionKey.endsWith("_stop") ||
    functionKey.endsWith("_position")
  )
    return 3;
  switch (def.category) {
    case "lighting":
      return 1;
    case "switch":
      return 1;
    case "hvac":
      return 2;
    case "safety":
      return 4;
    case "data":
      return 5;
    case "knx":
      return 5;
    default:
      return 6;
  }
}

function knxDpt(dpt: string): string {
  const [main, sub] = dpt.split(".");
  return `DPST-${Number(main)}-${Number(sub)}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function knxXml(addresses: readonly GroupAddress[]): string {
  const mains = new Map<number, Map<number, GroupAddress[]>>();
  for (const address of addresses) {
    const middles =
      mains.get(address.main) ?? new Map<number, GroupAddress[]>();
    const list = middles.get(address.middle) ?? [];
    list.push(address);
    middles.set(address.middle, list);
    mains.set(address.main, middles);
  }
  const lines = [
    '<?xml version="1.0" encoding="utf-8" standalone="yes"?>',
    '<GroupAddress-Export xmlns="http://knx.org/xml/ga-export/01">',
  ];
  for (const [main, middles] of [...mains.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    lines.push(
      `  <GroupRange Name="Main ${main}" RangeStart="${main << 11}" RangeEnd="${(main << 11) | 2047}">`,
    );
    for (const [middle, list] of [...middles.entries()].sort(
      (a, b) => a[0] - b[0],
    )) {
      const start = (main << 11) | (middle << 8);
      lines.push(
        `    <GroupRange Name="Middle ${middle}" RangeStart="${start}" RangeEnd="${start | 255}">`,
      );
      for (const address of [...list].sort((a, b) => a.sub - b.sub)) {
        const attrs = [
          `Name="${escapeXml(address.name)}"`,
          `Address="${address.main}/${address.middle}/${address.sub}"`,
          `DPTs="${knxDpt(address.dpt)}"`,
        ];
        if (address.description)
          attrs.push(`Description="${escapeXml(address.description)}"`);
        lines.push(`      <GroupAddress ${attrs.join(" ")} />`);
      }
      lines.push("    </GroupRange>");
    }
    lines.push("  </GroupRange>");
  }
  lines.push("</GroupAddress-Export>");
  return lines.join("\n");
}

export function knxCsv(addresses: readonly GroupAddress[]): string {
  const header = [
    "Main",
    "Middle",
    "Sub",
    "Address",
    "Name",
    "DatapointType",
    "Description",
  ];
  const quote = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  return [
    header.map(quote).join(";"),
    ...addresses.map((address) =>
      [
        address.main,
        address.middle,
        address.sub,
        `${address.main}/${address.middle}/${address.sub}`,
        address.name,
        knxDpt(address.dpt),
        address.description ?? "",
      ]
        .map(quote)
        .join(";"),
    ),
  ].join("\r\n");
}

// ── Cabinet ────────────────────────────────────────────────────────
export function autoPlanCabinet(
  state: ElectricalPlanGlobalState,
  distributorId: string,
): CabinetDevice[] {
  const distributor = state.distributors.find(
    (item) => item.id === distributorId,
  );
  if (!distributor) return [];
  const device = (
    input: Pick<CabinetDevice, "kind" | "label" | "teWidth"> &
      Partial<CabinetDevice>,
  ): CabinetDevice => ({
    id: newId("dev"),
    distributorId,
    circuitId: null,
    article: null,
    phases: null,
    price: null,
    row: null,
    startTe: null,
    ...input,
  });
  const devices: CabinetDevice[] = [
    device({
      kind: "main_switch",
      label: "Main switch",
      teWidth: 4,
      article: "HS 63A",
      price: 55,
    }),
    device({
      kind: "spd",
      label: "Surge protection type 2",
      teWidth: 4,
      article: "SPD T2",
      price: 95,
    }),
    device({
      kind: "terminal",
      label: "Terminal block",
      teWidth: 2,
      article: "KL",
      price: 12,
    }),
    device({
      kind: "meter",
      label: "Energy meter",
      teWidth: 4,
      article: "EZ",
      price: 180,
    }),
  ];
  const rcdCircuits = state.circuits.filter(
    (circuit) => circuit.breaker.rcdMa === 30 && !circuit.breaker.rcbo,
  );
  for (let index = 0; index < rcdCircuits.length; index += 6) {
    const group = rcdCircuits.slice(index, index + 6);
    devices.push(
      device({
        kind: "rcd",
        teWidth: 4,
        label: `RCD 40 A / 30 mA · ${group.map((circuit) => `SK${circuit.skNumber}`).join(", ")}`,
        article: "FI 40/0.03",
        price: 48,
      }),
    );
  }
  for (const circuit of [...state.circuits].sort(
    (a, b) => a.skNumber - b.skNumber,
  )) {
    devices.push(
      device({
        circuitId: circuit.id,
        kind: circuit.breaker.rcbo ? "rcbo" : "mcb",
        label: `SK${circuit.skNumber} · ${circuit.name}`,
        teWidth: 1,
        phases: circuit.phases ?? ["L1"],
        article: `${circuit.breaker.characteristic}${circuit.breaker.ratingA}`,
        price: circuit.breaker.rcbo ? 42 : 9,
      }),
    );
  }
  if (
    state.circuits.some(
      (circuit) => circuit.kind === "lighting" || circuit.kind === "sockets",
    )
  ) {
    devices.push(
      device({
        kind: "knx_actuator",
        label: "KNX actuator proposal",
        teWidth: 4,
        article: "KNX-SA",
        price: 180,
      }),
    );
  }
  return layoutCabinet(distributor, devices);
}

export function layoutCabinet(
  distributor: ElectricalDistributor,
  devices: readonly CabinetDevice[],
): CabinetDevice[] {
  let row = 0;
  let used = 0;
  return devices.map((item) => {
    const copy: CabinetDevice = { ...item, row: null, startTe: null };
    if (item.teWidth > distributor.tePerRow) return copy;
    if (row >= distributor.rows) return copy;
    if (used + item.teWidth > distributor.tePerRow) {
      row += 1;
      used = 0;
    }
    if (row >= distributor.rows) return copy;
    copy.row = row;
    copy.startTe = used + 1;
    used += item.teWidth;
    return copy;
  });
}

export function cabinetStats(
  distributor: ElectricalDistributor,
  devices: readonly CabinetDevice[],
) {
  const totalTe = distributor.rows * distributor.tePerRow;
  const placed = devices.filter(
    (device) => device.row != null && device.startTe != null,
  );
  const usedTe = placed.reduce((sum, device) => sum + device.teWidth, 0);
  const freeTe = Math.max(0, totalTe - usedTe);
  const reservePercent = totalTe > 0 ? (freeTe / totalTe) * 100 : 0;
  return {
    totalTe,
    usedTe,
    freeTe,
    reservePercent,
    requiredReserve: distributor.reservePercent,
    reserveOk: reservePercent >= distributor.reservePercent,
    unplaced: devices.length - placed.length,
  };
}

export function cabinetRows(
  distributor: ElectricalDistributor,
  devices: readonly CabinetDevice[],
) {
  return Array.from({ length: distributor.rows }, (_, row) => {
    const rowDevices = devices
      .filter((device) => device.row === row)
      .sort((a, b) => (a.startTe ?? 0) - (b.startTe ?? 0));
    return {
      row,
      devices: rowDevices,
      freeTe:
        distributor.tePerRow -
        rowDevices.reduce((sum, device) => sum + device.teWidth, 0),
    };
  });
}

export function cabinetCsv(
  distributor: ElectricalDistributor,
  devices: readonly CabinetDevice[],
): string {
  const header = [
    "Row",
    "Start TE",
    "Width TE",
    "Kind",
    "Label",
    "Article",
    "Circuit",
  ];
  const quote = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  return [
    header.map(quote).join(";"),
    ...devices.map((device) =>
      [
        device.row ?? "",
        device.startTe ?? "",
        device.teWidth,
        device.kind,
        device.label,
        device.article ?? "",
        device.circuitId ?? "",
      ]
        .map(quote)
        .join(";"),
    ),
  ].join("\r\n");
}

export function cabinetSvg(
  distributor: ElectricalDistributor,
  devices: readonly CabinetDevice[],
  width = 900,
): string {
  const margin = 24,
    rowHeight = 46,
    rowGap = 10;
  const teWidth = Math.max(
    7,
    Math.min(24, (width - margin * 2) / distributor.tePerRow),
  );
  const bodyWidth = distributor.tePerRow * teWidth;
  const height =
    margin * 2 +
    distributor.rows * rowHeight +
    (distributor.rows - 1) * rowGap +
    24;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="white"/>`,
    `<text x="${margin}" y="${margin - 6}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#111827">${escapeXml(distributor.name)}</text>`,
    `<text x="${width - margin}" y="${margin - 6}" text-anchor="end" font-family="sans-serif" font-size="11" fill="#6b7280">${distributor.rows} rows · ${distributor.tePerRow} TE</text>`,
  ];
  for (let row = 0; row < distributor.rows; row++) {
    const y = margin + 12 + row * (rowHeight + rowGap);
    parts.push(
      `<rect x="${margin}" y="${y}" width="${bodyWidth}" height="${rowHeight}" fill="#f8fafc" stroke="#cbd5e1"/>`,
    );
    for (let te = 1; te < distributor.tePerRow; te++)
      parts.push(
        `<line x1="${margin + te * teWidth}" y1="${y}" x2="${margin + te * teWidth}" y2="${y + rowHeight}" stroke="#e2e8f0" stroke-width="0.6"/>`,
      );
    for (const device of devices.filter((item) => item.row === row)) {
      const x = margin + ((device.startTe ?? 1) - 1) * teWidth + 2;
      const w = device.teWidth * teWidth - 4;
      const fill =
        device.kind === "rcd"
          ? "#fef3c7"
          : device.kind === "mcb"
            ? "#dbeafe"
            : device.kind === "main_switch"
              ? "#fee2e2"
              : device.kind.startsWith("knx")
                ? "#dcfce7"
                : "#e5e7eb";
      parts.push(
        `<rect x="${x}" y="${y + 4}" width="${w}" height="${rowHeight - 8}" rx="3" fill="${fill}" stroke="#94a3b8"/>`,
      );
      const label =
        device.label.length > 18
          ? `${device.label.slice(0, 17)}…`
          : device.label;
      parts.push(
        `<text x="${x + w / 2}" y="${y + rowHeight / 2 - 2}" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#475569">${escapeXml(device.kind.replace(/_/g, " "))}</text>`,
      );
      parts.push(
        `<text x="${x + w / 2}" y="${y + rowHeight / 2 + 8}" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#334155">${escapeXml(label)}</text>`,
      );
    }
    parts.push(
      `<text x="${margin - 6}" y="${y + rowHeight / 2}" text-anchor="end" dominant-baseline="central" font-family="sans-serif" font-size="10" fill="#64748b">R${row + 1}</text>`,
    );
  }
  parts.push("</svg>");
  return parts.join("\n");
}

// ── Inspection protocol ────────────────────────────────────────────
export interface ProtocolRow {
  circuitId: string;
  skNumber: number;
  name: string;
  kind: string;
  breaker: string;
  rcd: string;
  cable: string;
  loadVa: number;
  report: InspectionReport;
}

export function protocolRows(state: ElectricalPlanGlobalState): ProtocolRow[] {
  const loads = circuitLoads(state);
  const reports = new Map(
    state.reports.map((report) => [report.circuitId, report]),
  );
  return [...state.circuits]
    .sort((a, b) => a.skNumber - b.skNumber)
    .map((circuit) => ({
      circuitId: circuit.id,
      skNumber: circuit.skNumber,
      name: circuit.name,
      kind: circuit.kind,
      breaker: `${circuit.breaker.characteristic}${circuit.breaker.ratingA} A · ${circuit.breaker.poles}P`,
      rcd: circuit.breaker.rcdMa ? `${circuit.breaker.rcdMa} mA` : "-",
      cable: circuit.cable.type,
      loadVa: Math.round(loads.get(circuit.id)?.watts ?? 0),
      report: reports.get(circuit.id) ?? {
        id: `report_${circuit.id}`,
        circuitId: circuit.id,
        result: "not_tested",
        rcdTripMs: null,
        rcdTestCurrentMa: null,
        insulationMohm: null,
        insulationTestVoltageV: null,
        continuityOhm: null,
        loopImpedanceOhm: null,
        rotatingField: "not_tested",
        visualInspection: "not_tested",
        tester: "",
        testedAt: "",
        nextTestDue: "",
        signature: "",
        notes: "",
      },
    }));
}

export function protocolCsv(rows: readonly ProtocolRow[]): string {
  const header = [
    "SK",
    "Circuit",
    "Kind",
    "Breaker",
    "RCD",
    "Cable",
    "Load VA",
    "RCD trip ms",
    "RCD test mA",
    "Insulation MOhm",
    "Insulation test V",
    "Continuity Ohm",
    "Loop impedance Ohm",
    "Rotating field",
    "Visual inspection",
    "Result",
    "Tester",
    "Signature",
    "Date",
    "Next test",
    "Notes",
  ];
  const quote = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  return [
    header.map(quote).join(";"),
    ...rows.map((row) =>
      [
        row.skNumber,
        row.name,
        row.kind,
        row.breaker,
        row.rcd,
        row.cable,
        row.loadVa,
        row.report.rcdTripMs ?? "",
        row.report.rcdTestCurrentMa ?? "",
        row.report.insulationMohm ?? "",
        row.report.insulationTestVoltageV ?? "",
        row.report.continuityOhm ?? "",
        row.report.loopImpedanceOhm ?? "",
        row.report.rotatingField ?? "",
        row.report.visualInspection ?? "",
        row.report.result,
        row.report.tester ?? "",
        row.report.signature ?? "",
        row.report.testedAt ?? "",
        row.report.nextTestDue ?? "",
        row.report.notes ?? "",
      ]
        .map(quote)
        .join(";"),
    ),
  ].join("\r\n");
}

// ── Circuit diagram ────────────────────────────────────────────────
export interface DiagramPage {
  page: number;
  pages: number;
  svg: string;
}
const PAGE_W = 1160,
  PAGE_H = 820,
  MARGIN = 34,
  ROW_H = 54,
  CAPACITY = 9;
const PHASES = [
  { key: "L1", color: "#92400e", y: 150 },
  { key: "L2", color: "#111827", y: 166 },
  { key: "L3", color: "#6b7280", y: 182 },
  { key: "N", color: "#2563eb", y: 198 },
  { key: "PE", color: "#16a34a", y: 214 },
] as const;

function phaseColor(phase: string | undefined): string {
  return PHASES.find((item) => item.key === phase)?.color ?? "#111827";
}
function diagramTitle(page: number, pages: number, name: string): string {
  return `<g><rect x="${MARGIN}" y="${PAGE_H - 62}" width="${PAGE_W - MARGIN * 2}" height="40" fill="#fff" stroke="#334155" stroke-width="0.8"/>
    <text x="${MARGIN + 10}" y="${PAGE_H - 40}" font-family="sans-serif" font-size="13" font-weight="bold" fill="#111827">${escapeXml(name)}</text>
    <text x="${MARGIN + 10}" y="${PAGE_H - 26}" font-family="sans-serif" font-size="8" fill="#64748b">Circuit diagram · DIN EN 60617 inspired</text>
    <text x="${PAGE_W - MARGIN - 10}" y="${PAGE_H - 40}" text-anchor="end" font-family="sans-serif" font-size="9" fill="#334155">Page ${page} / ${pages}</text>
    <text x="${PAGE_W - MARGIN - 10}" y="${PAGE_H - 26}" text-anchor="end" font-family="sans-serif" font-size="8" fill="#64748b">planvolt · Powerhouse</text></g>`;
}
function diagramRow(
  circuit: ElectricalCircuit,
  x: number,
  y: number,
  loadW: number,
  hasRcd: boolean,
): string {
  const phase = circuit.phases?.[0] ?? "L1";
  const bus = PHASES.find((item) => item.key === phase) ?? PHASES[0];
  const color = phaseColor(phase);
  const parts = [
    `<line x1="${x + 23}" y1="${bus.y}" x2="${x + 23}" y2="${y - 12}" stroke="${color}" stroke-width="1.4"/>`,
  ];
  if (hasRcd)
    parts.push(
      `<g><rect x="${x - 58}" y="${y - 13}" width="46" height="26" rx="2" fill="#fff7ed" stroke="#c2410c" stroke-width="1.2"/><circle cx="${x - 20}" cy="${y - 7}" r="2.4" fill="none" stroke="#c2410c"/><text x="${x - 53}" y="${y - 3}" font-family="sans-serif" font-size="8" fill="#9a3412">FI</text><text x="${x - 53}" y="${y + 7}" font-family="sans-serif" font-size="7" fill="#9a3412">${circuit.breaker.rcdMa} mA</text></g>`,
    );
  parts.push(
    `<g><rect x="${x}" y="${y - 12}" width="46" height="24" rx="2" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.2"/><path d="M ${x + 10} ${y + 7} L ${x + 24} ${y - 8} L ${x + 30} ${y - 8}" fill="none" stroke="#1d4ed8" stroke-width="1.8"/><text x="${x + 40}" y="${y + 3}" text-anchor="end" font-family="sans-serif" font-size="8" font-weight="bold" fill="#1e3a8a">${escapeXml(circuit.breaker.characteristic)}${circuit.breaker.ratingA}</text></g>`,
  );
  parts.push(
    `<line x1="${x + 46}" y1="${y}" x2="${x + 160}" y2="${y}" stroke="${color}" stroke-width="1.4"/>`,
  );
  parts.push(
    `<g><circle cx="${x + 178}" cy="${y}" r="13" fill="#f8fafc" stroke="#334155" stroke-width="1.2"/><text x="${x + 178}" y="${y + 4}" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#334155">SK${circuit.skNumber}</text><text x="${x + 198}" y="${y - 2}" font-family="sans-serif" font-size="8" fill="#475569">${Math.round(loadW)} W</text></g>`,
  );
  parts.push(
    `<text x="${x + 238}" y="${y - 6}" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1e293b">SK${circuit.skNumber} · ${escapeXml(circuit.name)}</text>`,
  );
  parts.push(
    `<text x="${x + 238}" y="${y + 7}" font-family="sans-serif" font-size="8" fill="#64748b">${escapeXml(circuit.cable.type)} · ${circuit.breaker.poles}P · ${escapeXml(circuit.kind)}</text>`,
  );
  return `<g>${parts.join("")}</g>`;
}
function circuitLoadFor(
  state: ElectricalPlanGlobalState,
  circuitId: string,
): number {
  let watts = 0;
  for (const unit of state.units)
    for (const symbol of unit.symbols) {
      if (symbol.circuitId !== circuitId) continue;
      const def = getElectricalDef(symbol.defId);
      if (def) watts += pointPowerW(def);
    }
  return watts;
}
export function circuitDiagramPages(
  state: ElectricalPlanGlobalState | undefined,
  name = "Untitled Project",
): DiagramPage[] {
  if (!state?.circuits.length) return [];
  const groups = new Map<string, ElectricalCircuit[]>();
  for (const circuit of state.circuits) {
    const key = circuit.distributorId || "unassigned";
    const list = groups.get(key) ?? [];
    list.push(circuit);
    groups.set(key, list);
  }
  const pages: { title: string; circuits: ElectricalCircuit[] }[] = [];
  for (const [distributorId, circuits] of groups) {
    const title =
      state.distributors.find((item) => item.id === distributorId)?.name ??
      "Distribution";
    for (let index = 0; index < circuits.length; index += CAPACITY)
      pages.push({ title, circuits: circuits.slice(index, index + CAPACITY) });
  }
  return pages.map((page, index) => {
    const rows = page.circuits
      .map((circuit, row) =>
        diagramRow(
          circuit,
          300,
          270 + row * ROW_H,
          circuitLoadFor(state, circuit.id),
          !!circuit.breaker.rcdMa,
        ),
      )
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}" height="${PAGE_H}" viewBox="0 0 ${PAGE_W} ${PAGE_H}">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text x="${MARGIN}" y="${MARGIN + 10}" font-family="sans-serif" font-size="17" font-weight="bold" fill="#0f172a">Circuit diagram</text>
      <text x="${MARGIN}" y="${MARGIN + 26}" font-family="sans-serif" font-size="10" fill="#64748b">${escapeXml(page.title)} · ${escapeXml(name)}</text>
      <g><rect x="54" y="74" width="126" height="120" rx="4" fill="#f8fafc" stroke="#94a3b8"/><text x="117" y="90" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#334155">SUPPLY</text><text x="117" y="106" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#64748b">Hausanschluss</text><rect x="90" y="120" width="54" height="24" rx="2" fill="#fff" stroke="#64748b"/><text x="117" y="135" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#334155">kWh</text><rect x="90" y="150" width="54" height="24" rx="2" fill="#fee2e2" stroke="#b91c1c"/><text x="117" y="165" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#991b1b">MAIN</text><path d="M 180 180 L 220 180" stroke="#334155" stroke-width="1.6"/></g>
      ${PHASES.map((phase) => `<g><line x1="220" y1="${phase.y}" x2="1110" y2="${phase.y}" stroke="${phase.color}" stroke-width="2.4"/><text x="202" y="${phase.y + 4}" text-anchor="end" font-family="sans-serif" font-size="11" font-weight="bold" fill="${phase.color}">${phase.key}</text></g>`).join("")}
      <text x="220" y="244" font-family="sans-serif" font-size="9" fill="#94a3b8">L1 / L2 / L3 / N / PE busbars from topology</text>
      ${rows}
      ${page.circuits.length === CAPACITY ? `<text x="300" y="${270 + CAPACITY * ROW_H + 6}" font-family="sans-serif" font-size="9" fill="#b45309">Continued on next page →</text>` : ""}
      ${diagramTitle(index + 1, pages.length, name)}
    </svg>`;
    return { page: index + 1, pages: pages.length, svg };
  });
}

// ── Symbol SVG ─────────────────────────────────────────────────────
function n(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "0";
}
function partToSvg(part: SymbolPart, color: string): string {
  const stroke = `fill="none" stroke="${escapeXml(color)}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"`;
  const filled = `fill="white" stroke="${escapeXml(color)}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"`;
  switch (part.kind) {
    case "line": {
      const d = `M ${part.points.map((point) => `${n(point.x)} ${n(point.y)}`).join(" L ")}${part.closed ? " Z" : ""}`;
      return `<path d="${d}" ${part.closed ? filled : stroke}/>`;
    }
    case "circle":
      return `<circle cx="${n(part.cx)}" cy="${n(part.cy)}" r="${n(part.r)}" ${part.fill === false ? stroke : filled}/>`;
    case "arc":
      return `<path d="M ${n(part.cx + part.r * Math.cos(part.start))} ${n(part.cy + part.r * Math.sin(part.start))} A ${n(part.r)} ${n(part.r)} 0 ${Math.abs(part.end - part.start) > Math.PI ? 1 : 0} ${part.end > part.start ? 1 : 0} ${n(part.cx + part.r * Math.cos(part.end))} ${n(part.cy + part.r * Math.sin(part.end))}" ${stroke}/>`;
    case "rect":
      return `<rect x="${n(part.x)}" y="${n(part.y)}" width="${n(part.w)}" height="${n(part.h)}" ${part.fill === false ? stroke : filled}/>`;
    case "text":
      return `<text x="${n(part.x)}" y="${n(part.y)}" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="${n(part.size ?? 5)}" font-weight="${part.weight ?? "bold"}" fill="${escapeXml(color)}">${escapeXml(part.text)}</text>`;
  }
}

export function symbolSvg(
  def: ElectricalSymbolDef,
  size = 48,
  color = "#1f2937",
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-11 -11 22 22" aria-hidden="true">${def.parts.map((part) => partToSvg(part, color)).join("")}</svg>`;
}

export function symbolBadge(
  symbol: ElectricalSymbol,
  circuit: ElectricalCircuit | undefined,
): string {
  if (!circuit) return "";
  return `<g font-family="sans-serif" font-size="9" font-weight="bold"><rect x="${symbol.position.x + 10}" y="${symbol.position.y - 24}" width="30" height="13" rx="3" fill="${circuit.color ?? "#2563eb"}"/><text x="${symbol.position.x + 25}" y="${symbol.position.y - 16}" text-anchor="middle" fill="white">SK${circuit.skNumber}</text></g>`;
}
