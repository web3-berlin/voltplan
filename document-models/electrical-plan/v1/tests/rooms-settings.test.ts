import {
  addCircuit,
  addRoom,
  addSymbol,
  addUnit,
  isElectricalPlanDocument,
  reducer,
  removeRoom,
  setProjectName,
  updateCircuit,
  updateRoom,
  updateSettings,
  updateSymbol,
  updateSymbolDetails,
  utils,
} from "document-models/electrical-plan/v1";
import { describe, expect, it } from "vitest";

function addTestRoom(document: ReturnType<typeof utils.createDocument>) {
  return reducer(
    document,
    addRoom({
      unitId: "unit_1",
      room: {
        id: "room_1",
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
      },
    }),
  );
}

describe("rooms", () => {
  it("adds a room to the active floor", () => {
    const updated = addTestRoom(utils.createDocument());
    expect(isElectricalPlanDocument(updated)).toBe(true);
    expect(updated.state.global.units[0].rooms).toHaveLength(1);
    expect(updated.state.global.units[0].rooms?.[0]).toMatchObject({
      id: "room_1",
      name: "Living",
    });
  });

  it("renames a room and removes it from assigned symbols", () => {
    let document = addTestRoom(utils.createDocument());
    document = reducer(
      document,
      addSymbol({
        unitId: "unit_1",
        symbol: {
          id: "sym_1",
          defId: "outlet_schuko",
          position: { x: 100, y: 100 },
          rotation: 0,
          mountHeightCm: 30,
          roomId: "room_1",
        },
      }),
    );
    document = reducer(
      document,
      updateRoom({ unitId: "unit_1", id: "room_1", name: "Living room" }),
    );
    expect(document.state.global.units[0].rooms?.[0]?.name).toBe("Living room");

    document = reducer(
      document,
      removeRoom({ unitId: "unit_1", id: "room_1" }),
    );
    expect(document.state.global.units[0].rooms).toEqual([]);
    expect(document.state.global.units[0].symbols[0].roomId).toBeNull();
  });

  it("initialises rooms on new floors", () => {
    const updated = reducer(
      utils.createDocument(),
      addUnit({ id: "unit_2", name: "Upper", level: 1 }),
    );
    expect(updated.state.global.units[1].rooms).toEqual([]);
  });

  it("moves a symbol between rooms", () => {
    let document = reducer(
      utils.createDocument(),
      addRoom({
        unitId: "unit_1",
        room: {
          id: "r2",
          name: "Kitchen",
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
          ],
          fillColor: null,
          labelX: 3,
          labelY: 3,
        },
      }),
    );
    document = reducer(
      document,
      addSymbol({
        unitId: "unit_1",
        symbol: {
          id: "sym_1",
          defId: "outlet_schuko",
          position: { x: 1, y: 1 },
          rotation: 0,
          mountHeightCm: null,
          roomId: null,
        },
      }),
    );
    document = reducer(
      document,
      updateSymbol({ unitId: "unit_1", id: "sym_1", roomId: "r2" }),
    );
    expect(document.state.global.units[0].symbols[0].roomId).toBe("r2");
    document = reducer(
      document,
      updateSymbol({ unitId: "unit_1", id: "sym_1", roomId: null }),
    );
    expect(document.state.global.units[0].symbols[0].roomId).toBeNull();
  });
});

describe("project name", () => {
  it("uses a model action that does not collide with document actions", () => {
    const updated = reducer(
      utils.createDocument(),
      setProjectName({ name: "Smoke Test Plan" }),
    );
    expect(updated.state.global.name).toBe("Smoke Test Plan");
    expect(updated.operations.global[0].action.type).toBe("SET_PROJECT_NAME");
  });
});

describe("circuit metadata", () => {
  it("updates colour, phase and RCBO state", () => {
    let document = reducer(
      utils.createDocument(),
      addCircuit({
        circuit: {
          id: "c1",
          skNumber: 1,
          name: "Sockets",
          kind: "sockets",
          color: "#2563eb",
          phases: ["L1"],
          breaker: { characteristic: "B", ratingA: 16, poles: 1, rcdMa: 30 },
          cable: { type: "NYM-J 3x1,5", crossSectionMm2: 1.5 },
        },
      }),
    );
    document = reducer(
      document,
      updateCircuit({ id: "c1", color: "#dc2626", rcbo: true, phases: ["L2"] }),
    );
    expect(document.state.global.circuits[0].color).toBe("#dc2626");
    expect(document.state.global.circuits[0].breaker.rcbo).toBe(true);
    expect(document.state.global.circuits[0].phases).toEqual(["L2"]);
  });
});

describe("symbol details", () => {
  it("stores a price override and note", () => {
    let document = reducer(
      utils.createDocument(),
      addSymbol({
        unitId: "unit_1",
        symbol: {
          id: "s1",
          defId: "outlet_schuko",
          position: { x: 10, y: 10 },
          rotation: 0,
          mountHeightCm: 30,
        },
      }),
    );
    document = reducer(
      document,
      updateSymbolDetails({
        unitId: "unit_1",
        id: "s1",
        price: 17.5,
        note: "Brushed steel",
      }),
    );
    expect(document.state.global.units[0].symbols[0].details?.price).toBe(17.5);
    expect(document.state.global.units[0].symbols[0].details?.note).toBe(
      "Brushed steel",
    );
  });
});

describe("settings", () => {
  it("updates display flags", () => {
    const updated = reducer(
      utils.createDocument(),
      updateSettings({
        settings: { showMountHeights: true, showCircuitBadges: false },
      }),
    );
    expect(updated.state.global.settings.showMountHeights).toBe(true);
    expect(updated.state.global.settings.showCircuitBadges).toBe(false);
    expect(updated.state.global.settings.symbolStyle).toBe("simple");
  });
});
