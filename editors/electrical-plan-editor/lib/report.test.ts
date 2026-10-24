import { describe, expect, it } from "vitest";
import { projectReportHtml } from "./report.js";
import type { ElectricalPlanGlobalState } from "./types.js";

const state: ElectricalPlanGlobalState = {
  name: "Report test",
  activeUnitId: "u1",
  nextCircuitNumber: 2,
  units: [
    {
      id: "u1",
      name: "Ground Floor",
      level: 0,
      background: null,
      rooms: [
        {
          id: "r1",
          name: "Living",
          points: [
            { x: 0, y: 0 },
            { x: 400, y: 0 },
            { x: 400, y: 300 },
            { x: 0, y: 300 },
          ],
          fillColor: "#2563eb",
          labelX: 200,
          labelY: 150,
          locked: null,
        },
      ],
      symbols: [
        {
          id: "s1",
          defId: "outlet_schuko",
          position: { x: 100, y: 100 },
          rotation: 0,
          circuitId: "c1",
          roomId: "r1",
          color: null,
          label: null,
          locked: false,
          mountHeightCm: 30,
          details: null,
          knx: null,
        },
      ],
    },
  ],
  routes: [],
  circuits: [
    {
      id: "c1",
      skNumber: 1,
      name: "Sockets",
      kind: "sockets",
      distributorId: "d1",
      color: "#dc2626",
      notes: null,
      phases: ["L1"],
      breaker: {
        characteristic: "B",
        ratingA: 16,
        poles: 1,
        rcbo: false,
        rcdMa: 30,
      },
      cable: { type: "NYM-J 3x1,5", crossSectionMm2: 1.5, lengthM: 10 },
      installationMethod: "B2",
      ambientTempC: 30,
      groupedCircuits: 1,
    },
  ],
  distributors: [
    {
      id: "d1",
      name: "Main",
      location: null,
      rows: 3,
      tePerRow: 12,
      reservePercent: 20,
    },
  ],
  cabinetDevices: [],
  groupAddresses: [],
  reports: [],
  settings: {
    symbolStyle: "simple",
    showCircuitBadges: true,
    showMountHeights: false,
  },
};

describe("project report", () => {
  it("contains plan, BOM, rooms, cabinet, diagram and protocol sections", () => {
    const html = projectReportHtml(
      state,
      '<svg id="plan"></svg>',
      "Ground Floor",
    );
    expect(html).toContain("Report test");
    expect(html).toContain("Installation plan — Ground Floor");
    expect(html).toContain("Bill of materials");
    expect(html).toContain("Room schedule");
    expect(html).toContain("Living");
    expect(html).toContain("Main");
    expect(html).toContain("Circuit diagrams");
    expect(html).toContain("Inspection protocol");
  });
});
