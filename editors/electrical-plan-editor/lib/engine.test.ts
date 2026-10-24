import { describe, expect, it } from "vitest";
import { electricalCatalog, getElectricalDef } from "./catalog.js";
import {
  autoPlanCabinet,
  bomCsv,
  cabinetCsv,
  cabinetStats,
  cabinetSvg,
  cableAmpacity,
  circuitDiagramPages,
  circuitLoads,
  circuitRouteLengthM,
  circuitWarnings,
  duplicateCircuitNumbers,
  electricalBom,
  generateKnx,
  knxBusLoad,
  knxCsv,
  knxXml,
  pointPowerW,
  protocolCsv,
  protocolRows,
  routeLengthM,
  symbolSvg,
  voltageDropPercent,
} from "./engine.js";
import { pointInPolygon, polygonAreaM2, polygonCentroid, unitRooms } from "./rooms.js";
import type { ElectricalCircuit, ElectricalPlanGlobalState, ElectricalSymbol, ElectricalUnit } from "./types.js";

function symbol(id: string, defId: string, circuitId: string | null, x = 0, y = 0, knx = false): ElectricalSymbol {
  return {
    id,
    defId,
    position: { x, y },
    rotation: 0,
    circuitId,
    color: null,
    label: null,
    locked: false,
    mountHeightCm: 30,
    roomId: null,
    details: null,
    knx: knx ? { enabled: true, groupAddressIds: [], participantName: null } : null,
  };
}

const circuit: ElectricalCircuit = {
  id: "c1",
  skNumber: 1,
  name: "Sockets",
  kind: "sockets",
  distributorId: "d1",
  color: "#2563eb",
  notes: null,
  phases: ["L1"],
  breaker: { characteristic: "B", ratingA: 16, poles: 1, rcbo: false, rcdMa: 30 },
  cable: { type: "NYM-J 3x1,5", crossSectionMm2: 1.5, lengthM: 12 },
  installationMethod: "B2",
  ambientTempC: 30,
  groupedCircuits: 1,
};

function state(overrides: Partial<ElectricalPlanGlobalState> = {}): ElectricalPlanGlobalState {
  return {
    name: "Test plan",
    activeUnitId: "u1",
    nextCircuitNumber: 2,
    units: [{
      id: "u1",
      name: "Ground Floor",
      level: 0,
      background: null,
      rooms: [],
      symbols: [
        symbol("s1", "outlet_schuko", "c1", 100, 100),
        symbol("s2", "light_group", "c1", 200, 100),
        symbol("s3", "knx_switch_actuator", null, 300, 100, true),
      ],
    }],
    circuits: [circuit],
    routes: [],
    distributors: [{ id: "d1", name: "Main", location: null, rows: 4, tePerRow: 12, reservePercent: 20 }],
    cabinetDevices: [],
    groupAddresses: [],
    reports: [],
    settings: { symbolStyle: "simple", showCircuitBadges: true, showMountHeights: false },
    ...overrides,
  };
}

describe("electrical catalog", () => {
  it("ships a DIN symbol set with unique ids", () => {
    expect(electricalCatalog.length).toBeGreaterThan(80);
    const ids = electricalCatalog.map((def) => def.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const def of electricalCatalog) {
      expect(def.parts.length).toBeGreaterThan(0);
      expect(Number.isFinite(def.widthCm)).toBe(true);
      expect(Number.isFinite(def.heightCm)).toBe(true);
    }
  });

  it("renders a self-contained SVG glyph", () => {
    const def = getElectricalDef("outlet_schuko");
    expect(def).toBeDefined();
    const svg = symbolSvg(def!, 48);
    expect(svg).toContain("<svg");
    expect(svg).toContain("viewBox=\"-11 -11 22 22\"");
  });
});

describe("circuit calculation", () => {
  it("aggregates points, power and current", () => {
    const loads = circuitLoads(state());
    const load = loads.get("c1")!;
    expect(load.points).toBe(2);
    expect(load.watts).toBe(pointPowerW(getElectricalDef("outlet_schuko")!) + pointPowerW(getElectricalDef("light_group")!));
    expect(load.currentA).toBeGreaterThan(0);
  });

  it("flags overloads and missing RCD protection", () => {
    const overloaded = state({
      units: [{
        id: "u1", name: "Ground Floor", level: 0, background: null, rooms: [],
        symbols: [symbol("s1", "outlet_cooker", "c1")],
      }],
      circuits: [{ ...circuit, breaker: { ...circuit.breaker, ratingA: 16, rcdMa: null } }],
    });
    const warnings = circuitWarnings(overloaded.circuits[0], circuitLoads(overloaded).get("c1"));
    expect(warnings.some((warning) => warning.code === "overload")).toBe(true);
    expect(warnings.some((warning) => warning.code === "rcd")).toBe(true);
  });

  it("detects duplicate SK numbers", () => {
    const messages = duplicateCircuitNumbers([circuit, { ...circuit, id: "c2", name: "Other" }]);
    expect(messages).toHaveLength(1);
  });
});

describe("rooms", () => {
  it("computes polygon area, centroid and point containment", () => {
    const square = [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }];
    expect(polygonAreaM2(square)).toBe(12);
    expect(polygonCentroid(square)).toEqual({ x: 200, y: 150 });
    expect(pointInPolygon({ x: 200, y: 150 }, square)).toBe(true);
    expect(pointInPolygon({ x: 500, y: 150 }, square)).toBe(false);
  });

  it("supports documents created before rooms existed", () => {
    const legacyUnit = { ...state().units[0], rooms: undefined } as unknown as ElectricalUnit;
    expect(unitRooms(legacyUnit)).toEqual([]);
  });
});

describe("BOM", () => {
  it("groups symbols, cabinet devices and cable lengths", () => {
    const project = state({
      cabinetDevices: [{
        id: "dev1", distributorId: "d1", circuitId: "c1", kind: "mcb", label: "B16",
        teWidth: 1, row: 0, startTe: 1, phases: ["L1"], article: "B16", price: 9,
      }],
    });
    const bom = electricalBom(project);
    expect(bom.totals.symbols).toBe(3);
    expect(bom.lines.some((line) => line.category === "cable")).toBe(true);
    expect(bom.totals.total).toBeGreaterThan(0);
    expect(bomCsv(bom).split("\r\n")[0]).toContain("\"Article\"");
    expect(bomCsv(bom).split("\r\n")[0]).toContain("\"Rooms\"");
  });

  it("keeps different price overrides on separate BOM lines", () => {
    const project = state();
    project.units[0].symbols.push(symbol("s4", "outlet_schuko", "c1", 300, 100));
    project.units[0].symbols[0].details = { price: 99.99, note: null, photos: null };
    const bom = electricalBom(project);
    const socketLines = bom.lines.filter((line) => line.defId === "outlet_schuko");
    expect(socketLines).toHaveLength(2);
    expect(socketLines.map((line) => line.unitPrice).sort((a, b) => a - b)).toEqual([12, 99.99]);
    expect(bom.totals.total).toBeGreaterThan(100);
  });

  it("reports room area, points and load", () => {
    const project = state();
    project.units[0].rooms = [{ id: "r1", name: "Living", points: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }], fillColor: "#2563eb", labelX: 200, labelY: 150, locked: null }];
    project.units[0].symbols[0].roomId = "r1";
    const bom = electricalBom(project);
    expect(bom.rooms).toHaveLength(1);
    expect(bom.rooms[0].areaM2).toBe(12);
    expect(bom.rooms[0].points).toBe(1);
    expect(bom.rooms[0].watts).toBeGreaterThan(0);
    expect(bom.lines.find((line) => line.description === "Schuko outlet")?.roomBreakdown).toEqual([{ name: "Living", quantity: 1 }]);
  });
});

describe("KNX", () => {
  it("generates stable three-level addresses and valid XML", () => {
    const project = state();
    const first = generateKnx(project);
    expect(first.added).toBe(2);
    expect(first.addresses.map((address) => `${address.main}/${address.middle}/${address.sub}`)).toEqual(["5/0/1", "5/0/2"]);
    const xml = knxXml(first.addresses);
    expect(xml).toContain("<GroupAddress-Export");
    expect(xml).toContain("Address=\"5/0/1\"");
    expect(xml.trim().endsWith("</GroupAddress-Export>")).toBe(true);
    expect(knxCsv(first.addresses)).toContain("DPST-1-1");

    const second = generateKnx({ ...project, groupAddresses: first.addresses });
    expect(second.added).toBe(0);
    expect(second.conflicts).toHaveLength(0);
  });
});

describe("cabinet", () => {
  it("places devices in TE rows and keeps reserve", () => {
    const project = state();
    const devices = autoPlanCabinet(project, "d1");
    expect(devices.length).toBeGreaterThan(5);
    expect(devices.every((device) => device.row != null && device.startTe != null)).toBe(true);
    const stats = cabinetStats(project.distributors[0], devices);
    expect(stats.usedTe).toBeGreaterThan(0);
    expect(stats.reservePercent).toBeGreaterThan(0);
    expect(cabinetCsv(project.distributors[0], devices)).toContain("main_switch");
    expect(cabinetSvg(project.distributors[0], devices)).toContain("<svg");
  });

  it("leaves devices unplaced when the board is full", () => {
    const project = state({ distributors: [{ id: "d1", name: "Small", location: null, rows: 1, tePerRow: 4, reservePercent: 0 }] });
    const devices = autoPlanCabinet(project, "d1");
    expect(devices.some((device) => device.row == null)).toBe(true);
  });
});

describe("protocol and diagram", () => {
  it("provides deterministic protocol rows and CSV", () => {
    const rows = protocolRows(state());
    expect(rows).toHaveLength(1);
    expect(rows[0].report.id).toBe("report_c1");
    expect(protocolCsv(rows)).toContain("\"not_tested\"");
  });

  it("paginates circuit diagrams and embeds title text", () => {
    const pages = circuitDiagramPages(state(), "Test plan");
    expect(pages).toHaveLength(1);
    expect(pages[0].svg).toContain("Circuit diagram");
    expect(pages[0].svg).toContain("SK1");
    expect(circuitDiagramPages(undefined)).toEqual([]);
  });
});

describe("KNX device library and bus planning", () => {
  it("includes the MDT Glastaster II Smart with temperature sensor", () => {
    const device = getElectricalDef("mdt_glastaster_ii_smart_ts");
    expect(device?.manufacturer).toBe("MDT");
    expect(device?.orderNumber).toBe("BE-GT2TS.02");
    expect(device?.channels).toBe(6);
    expect(device?.busLoads).toBe(2);
    expect(device?.knxFunctions?.some((fn) => fn.dpt === "9.001")).toBe(true);
  });

  it("totals bus load and detects an overloaded line", () => {
    const base = state();
    const planned = state({
      units: [{
        ...base.units[0],
        symbols: [
          symbol("gt1", "mdt_glastaster_ii_smart_ts", null, 0, 0, true),
          symbol("gt2", "mdt_glastaster_ii_smart", null, 0, 0, true),
        ],
      }],
    });
    expect(knxBusLoad(planned).loadMa).toBe(40);
    expect(knxBusLoad(planned).devices).toBe(2);
    const overloaded = state({
      units: [{
        ...base.units[0],
        symbols: Array.from({ length: 40 }, (_, index) => symbol(`gt${index}`, "mdt_glastaster_ii_smart_ts", null, 0, 0, true)),
      }],
    });
    expect(knxBusLoad(overloaded).percent).toBeGreaterThan(100);
  });
});

describe("voltage drop", () => {
  it("calculates the final-circuit drop from length, current and cross-section", () => {
    const drop = voltageDropPercent(circuit, { circuitId: "c1", watts: 2000, points: 2, currentA: 9.66 });
    expect(drop).not.toBeNull();
    expect(drop!).toBeGreaterThan(1.1);
    expect(drop!).toBeLessThan(1.3);
  });

  it("skips circuits without a cable length", () => {
    expect(voltageDropPercent({ ...circuit, cable: { ...circuit.cable, lengthM: 0 } }, { circuitId: "c1", watts: 2000, points: 2, currentA: 9.66 })).toBeNull();
  });
});

describe("cable ampacity", () => {
  it("derates the B2 reference ampacity for ambient temperature and grouping", () => {
    expect(cableAmpacity(circuit)).toBe(16.5);
    const hot = { ...circuit, ambientTempC: 40, groupedCircuits: 2 };
    expect(cableAmpacity(hot)).toBeCloseTo(11.5, 1);
    expect(circuitWarnings(hot, { circuitId: "c1", watts: 2000, points: 2, currentA: 9.66 }).some((warning) => warning.code === "ampacity")).toBe(true);
  });
});

describe("cable routes", () => {
  it("measures polylines with reserve and sums routes per circuit", () => {
    expect(routeLengthM({ points: [{ x: 0, y: 0 }, { x: 300, y: 0 }], reservePercent: 10 })).toBe(3.3);
    const base = state();
    const routed = { ...base, routes: [{ id: "r1", circuitId: "c1", unitId: "u1", points: [{ x: 0, y: 0 }, { x: 300, y: 0 }], reservePercent: 10 }] };
    expect(circuitRouteLengthM(routed, "c1")).toBe(3.3);
  });
});
