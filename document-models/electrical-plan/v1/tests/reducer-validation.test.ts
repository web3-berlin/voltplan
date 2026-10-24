import type { ElectricalPlanPHState } from "document-models/electrical-plan/v1";
import {
  actions,
  defaultGlobalState,
} from "document-models/electrical-plan/v1";
import { describe, expect, it } from "vitest";

import { electricalPlanCabinetKnxProtocolOperations as cabinetOps } from "../src/reducers/cabinet-knx-protocol.js";
import { electricalPlanCircuitsOperations as circuitOps } from "../src/reducers/circuits.js";
import { electricalPlanInstallationPlanOperations as installationOps } from "../src/reducers/installation-plan.js";

type GlobalState = ElectricalPlanPHState["global"];

const emptyState = (): GlobalState => defaultGlobalState();

const positions = (count = 3) =>
  Array.from({ length: count }, (_, index) => ({ x: index, y: index }));

const validCircuit = (overrides: Record<string, unknown> = {}) => ({
  id: "circuit_1",
  skNumber: 1,
  name: "Living room",
  kind: "lighting",
  distributorId: null,
  breaker: {
    characteristic: "B",
    poles: 1,
    ratingA: 10,
    rcbo: false,
    rcdMa: null,
  },
  cable: { type: "NYM-J", crossSectionMm2: 1.5, lengthM: null },
  ambientTempC: 30,
  groupedCircuits: 1,
  ...overrides,
});

const addCircuitTo = (state: GlobalState, circuit = validCircuit()) => {
  circuitOps.addCircuitOperation(state, actions.addCircuit({ circuit }));
};

const addSymbolTo = (
  state: GlobalState,
  overrides: Record<string, unknown> = {},
) => {
  installationOps.addSymbolOperation(
    state,
    actions.addSymbol({
      unitId: "unit_1",
      symbol: {
        id: "symbol_1",
        defId: "socket",
        position: { x: 1, y: 1 },
        rotation: 0,
        knxEnabled: false,
        ...overrides,
      },
    }),
  );
};

describe("installation reducer validation", () => {
  it("rejects invalid units", () => {
    const state = emptyState();
    expect(() =>
      installationOps.addUnitOperation(
        state,
        actions.addUnit({ id: "unit_2", name: " ", level: 1 }),
      ),
    ).toThrow("A unit needs a name");
    expect(() =>
      installationOps.addUnitOperation(
        state,
        actions.addUnit({ id: "unit_1", name: "Duplicate", level: 1 }),
      ),
    ).toThrow("Unit id already exists");
    expect(() =>
      installationOps.renameUnitOperation(
        state,
        actions.renameUnit({ id: "missing", name: "Renamed" }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      installationOps.renameUnitOperation(
        state,
        actions.renameUnit({ id: "unit_1", name: " " }),
      ),
    ).toThrow("A unit needs a name");
    installationOps.renameUnitOperation(
      state,
      actions.renameUnit({ id: "unit_1", name: "Renamed" }),
    );
    expect(state.units[0].name).toBe("Renamed");
  });

  it("rejects symbol references to missing units, circuits, rooms and duplicates", () => {
    const state = emptyState();
    expect(() =>
      installationOps.addSymbolOperation(
        state,
        actions.addSymbol({
          unitId: "missing",
          symbol: {
            id: "symbol_1",
            defId: "socket",
            position: { x: 1, y: 1 },
            rotation: 0,
          },
        }),
      ),
    ).toThrow("Unknown unit");

    addSymbolTo(state);
    expect(() => addSymbolTo(state)).toThrow("Symbol id already exists");

    expect(() =>
      addSymbolTo(state, { id: "symbol_2", circuitId: "missing" }),
    ).toThrow("Unknown circuit");
    expect(() =>
      addSymbolTo(state, { id: "symbol_3", roomId: "missing" }),
    ).toThrow("Unknown room");
  });

  it("stores explicit symbol fields and KNX state", () => {
    const state = emptyState();
    addCircuitTo(state);
    installationOps.addRoomOperation(
      state,
      actions.addRoom({
        unitId: "unit_1",
        room: {
          id: "room_1",
          name: "Room",
          points: positions(),
          labelX: 1,
          labelY: 1,
        },
      }),
    );
    addSymbolTo(state, {
      id: "symbol_knx",
      circuitId: "circuit_1",
      roomId: "room_1",
      knxEnabled: true,
      color: "#fff",
      label: "KNX socket",
      locked: true,
      mountHeightCm: 30,
    });
    const symbol = state.units[0].symbols[0];
    expect(symbol).toMatchObject({
      id: "symbol_knx",
      circuitId: "circuit_1",
      roomId: "room_1",
      color: "#fff",
      label: "KNX socket",
      locked: true,
      mountHeightCm: 30,
      details: null,
      knx: { enabled: true, groupAddressIds: [], participantName: null },
    });
    expect(symbol).not.toHaveProperty("knxEnabled");
  });

  it("validates symbol updates and clears KNX bindings", () => {
    const state = emptyState();
    addSymbolTo(state, {
      id: "symbol_1",
      knxEnabled: true,
      label: "before",
      color: "#000",
    });
    addCircuitTo(state);
    expect(() =>
      installationOps.updateSymbolOperation(
        state,
        actions.updateSymbol({
          unitId: "missing",
          id: "symbol_1",
          label: "after",
        }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      installationOps.updateSymbolOperation(
        state,
        actions.updateSymbol({
          unitId: "unit_1",
          id: "missing",
          label: "after",
        }),
      ),
    ).toThrow("Unknown symbol");
    expect(() =>
      installationOps.updateSymbolOperation(
        state,
        actions.updateSymbol({
          unitId: "unit_1",
          id: "symbol_1",
          circuitId: "missing",
        }),
      ),
    ).toThrow("Unknown circuit");
    expect(() =>
      installationOps.updateSymbolOperation(
        state,
        actions.updateSymbol({
          unitId: "unit_1",
          id: "symbol_1",
          roomId: "missing",
        }),
      ),
    ).toThrow("Unknown room");

    installationOps.updateSymbolOperation(
      state,
      actions.updateSymbol({
        unitId: "unit_1",
        id: "symbol_1",
        circuitId: "circuit_1",
      }),
    );
    expect(state.units[0].symbols[0].circuitId).toBe("circuit_1");
    state.groupAddresses.push({
      id: "ga_1",
      name: "Socket",
      main: 1,
      middle: 1,
      sub: 1,
      dpt: "1.001",
      fixtureId: "symbol_1",
      description: null,
      functionKey: null,
    });
    installationOps.updateSymbolOperation(
      state,
      actions.updateSymbol({
        unitId: "unit_1",
        id: "symbol_1",
        defId: "lamp",
        label: "after",
        color: "#aaa",
        rotation: 90,
        mountHeightCm: 10,
        locked: false,
        knxEnabled: false,
      }),
    );
    const symbol = state.units[0].symbols[0];
    expect(symbol).toMatchObject({
      defId: "lamp",
      label: "after",
      color: "#aaa",
      rotation: 90,
      mountHeightCm: 10,
      locked: false,
      knx: { enabled: false, groupAddressIds: [], participantName: null },
    });
    expect(state.groupAddresses).toHaveLength(0);
  });

  it("validates movement and removal", () => {
    const state = emptyState();
    addSymbolTo(state);
    expect(() =>
      installationOps.moveSymbolOperation(
        state,
        actions.moveSymbol({ unitId: "missing", id: "symbol_1", x: 2, y: 3 }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      installationOps.moveSymbolOperation(
        state,
        actions.moveSymbol({ unitId: "unit_1", id: "missing", x: 2, y: 3 }),
      ),
    ).toThrow("Unknown symbol");
    installationOps.moveSymbolOperation(
      state,
      actions.moveSymbol({ unitId: "unit_1", id: "symbol_1", x: 2, y: 3 }),
    );
    expect(state.units[0].symbols[0].position).toEqual({ x: 2, y: 3 });

    state.groupAddresses.push({
      id: "ga_symbol",
      name: "Socket",
      main: 1,
      middle: 1,
      sub: 1,
      dpt: "1.001",
      fixtureId: "symbol_1",
      description: null,
      functionKey: null,
    });
    expect(() =>
      installationOps.removeSymbolOperation(
        state,
        actions.removeSymbol({ unitId: "missing", id: "symbol_1" }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      installationOps.removeSymbolOperation(
        state,
        actions.removeSymbol({ unitId: "unit_1", id: "missing" }),
      ),
    ).toThrow("Unknown symbol");
    installationOps.removeSymbolOperation(
      state,
      actions.removeSymbol({ unitId: "unit_1", id: "symbol_1" }),
    );
    expect(state.units[0].symbols).toHaveLength(0);
  });

  it("validates active unit and background changes", () => {
    const state = emptyState();
    expect(() =>
      installationOps.setActiveUnitOperation(
        state,
        actions.setActiveUnit({ unitId: "missing" }),
      ),
    ).toThrow("Unknown unit");
    installationOps.setActiveUnitOperation(
      state,
      actions.setActiveUnit({ unitId: "unit_1" }),
    );
    expect(state.activeUnitId).toBe("unit_1");

    expect(() =>
      installationOps.setUnitBackgroundOperation(
        state,
        actions.setUnitBackground({ unitId: "missing", background: null }),
      ),
    ).toThrow("Unknown unit");
    installationOps.setUnitBackgroundOperation(
      state,
      actions.setUnitBackground({ unitId: "unit_1", background: null }),
    );
    expect(state.units[0].background).toBeNull();

    installationOps.setUnitBackgroundOperation(
      state,
      actions.setUnitBackground({
        unitId: "unit_1",
        background: {
          x: 1,
          y: 2,
          scale: 1,
          opacity: 0.5,
          rotation: 0,
          locked: false,
        },
      }),
    );
    expect(state.units[0].background).toMatchObject({
      dataUrl: null,
      widthCm: null,
      heightCm: null,
    });

    expect(() =>
      installationOps.updateUnitBackgroundOperation(
        state,
        actions.updateUnitBackground({ unitId: "missing", x: 1 }),
      ),
    ).toThrow("Unknown unit");
    state.units[0].background = null;
    installationOps.updateUnitBackgroundOperation(
      state,
      actions.updateUnitBackground({ unitId: "unit_1", dataUrl: "image" }),
    );
    expect(state.units[0].background).toMatchObject({
      dataUrl: "image",
      scale: 1,
      opacity: 0.5,
    });
    installationOps.updateUnitBackgroundOperation(
      state,
      actions.updateUnitBackground({
        unitId: "unit_1",
        widthCm: 100,
        heightCm: 50,
        x: 0,
        y: 0,
        scale: 2,
        opacity: 0.2,
        rotation: 45,
        locked: false,
      }),
    );
    expect(state.units[0].background).toMatchObject({
      widthCm: 100,
      heightCm: 50,
      scale: 2,
      opacity: 0.2,
      rotation: 45,
      locked: false,
    });
  });

  it("validates rooms, settings and symbol details", () => {
    const state = emptyState();
    expect(() =>
      installationOps.addRoomOperation(
        state,
        actions.addRoom({
          unitId: "missing",
          room: {
            id: "room_1",
            name: "Room",
            points: positions(),
            labelX: 1,
            labelY: 1,
          },
        }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      installationOps.addRoomOperation(
        state,
        actions.addRoom({
          unitId: "unit_1",
          room: {
            id: "room_1",
            name: " ",
            points: positions(),
            labelX: 1,
            labelY: 1,
          },
        }),
      ),
    ).toThrow("A room needs a name");
    expect(() =>
      installationOps.addRoomOperation(
        state,
        actions.addRoom({
          unitId: "unit_1",
          room: {
            id: "room_1",
            name: "Room",
            points: positions(2),
            labelX: 1,
            labelY: 1,
          },
        }),
      ),
    ).toThrow("A room needs at least three points");
    const invalidRoomPoints = actions.addRoom({
      unitId: "unit_1",
      room: {
        id: "room_1",
        name: "Room",
        points: positions(),
        labelX: 1,
        labelY: 1,
      },
    });
    invalidRoomPoints.input.room.points[0].x = Number.NaN;
    expect(() =>
      installationOps.addRoomOperation(state, invalidRoomPoints),
    ).toThrow("Room points must be finite");
    installationOps.addRoomOperation(
      state,
      actions.addRoom({
        unitId: "unit_1",
        room: {
          id: "room_1",
          name: "Room",
          points: positions(),
          labelX: 1,
          labelY: 1,
          locked: false,
        },
      }),
    );
    expect(state.units[0].rooms?.[0]).toMatchObject({
      fillColor: null,
      locked: false,
    });
    expect(() =>
      installationOps.addRoomOperation(
        state,
        actions.addRoom({
          unitId: "unit_1",
          room: {
            id: "room_1",
            name: "Room",
            points: positions(),
            labelX: 1,
            labelY: 1,
          },
        }),
      ),
    ).toThrow("Room id already exists");

    expect(() =>
      installationOps.updateRoomOperation(
        state,
        actions.updateRoom({
          unitId: "missing",
          id: "room_1",
          points: positions(),
        }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      installationOps.updateRoomOperation(
        state,
        actions.updateRoom({
          unitId: "unit_1",
          id: "missing",
          points: positions(),
        }),
      ),
    ).toThrow("Unknown room");
    expect(() =>
      installationOps.updateRoomOperation(
        state,
        actions.updateRoom({
          unitId: "unit_1",
          id: "room_1",
          name: " ",
        }),
      ),
    ).toThrow("A room needs a name");
    expect(() =>
      installationOps.updateRoomOperation(
        state,
        actions.updateRoom({
          unitId: "unit_1",
          id: "room_1",
          points: positions(2),
        }),
      ),
    ).toThrow("A room needs at least three points");
    const invalidUpdatedRoomPoints = actions.updateRoom({
      unitId: "unit_1",
      id: "room_1",
      points: positions(),
    });
    invalidUpdatedRoomPoints.input.points![0].x = Number.NaN;
    expect(() =>
      installationOps.updateRoomOperation(state, invalidUpdatedRoomPoints),
    ).toThrow("Room points must be finite");
    installationOps.updateRoomOperation(
      state,
      actions.updateRoom({
        unitId: "unit_1",
        id: "room_1",
        name: "Renamed",
        fillColor: "#fff",
        points: positions(),
        labelX: 2,
        labelY: 3,
        locked: true,
      }),
    );
    expect(state.units[0].rooms?.[0]).toMatchObject({
      name: "Renamed",
      fillColor: "#fff",
      labelX: 2,
      labelY: 3,
      locked: true,
    });

    addSymbolTo(state, { roomId: "room_1" });
    expect(() =>
      installationOps.removeRoomOperation(
        state,
        actions.removeRoom({ unitId: "missing", id: "room_1" }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      installationOps.removeRoomOperation(
        state,
        actions.removeRoom({ unitId: "unit_1", id: "missing" }),
      ),
    ).toThrow("Unknown room");
    installationOps.removeRoomOperation(
      state,
      actions.removeRoom({ unitId: "unit_1", id: "room_1" }),
    );
    expect(state.units[0].symbols[0].roomId).toBeNull();

    installationOps.updateSettingsOperation(
      state,
      actions.updateSettings({ settings: {} }),
    );
    installationOps.updateSettingsOperation(
      state,
      actions.updateSettings({
        settings: {
          symbolStyle: "detailed",
          showCircuitBadges: false,
          showMountHeights: true,
        },
      }),
    );
    expect(state.settings).toEqual({
      symbolStyle: "detailed",
      showCircuitBadges: false,
      showMountHeights: true,
    });

    expect(() =>
      installationOps.setProjectNameOperation(
        state,
        actions.setProjectName({ name: " " }),
      ),
    ).toThrow("A project needs a name");
    installationOps.setProjectNameOperation(
      state,
      actions.setProjectName({ name: "Project" }),
    );
    expect(state.name).toBe("Project");

    addSymbolTo(state, { id: "symbol_details" });
    expect(() =>
      installationOps.updateSymbolDetailsOperation(
        state,
        actions.updateSymbolDetails({
          unitId: "missing",
          id: "symbol_details",
        }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      installationOps.updateSymbolDetailsOperation(
        state,
        actions.updateSymbolDetails({ unitId: "unit_1", id: "missing" }),
      ),
    ).toThrow("Unknown symbol");
    installationOps.updateSymbolDetailsOperation(
      state,
      actions.updateSymbolDetails({
        unitId: "unit_1",
        id: "symbol_details",
      }),
    );
    expect(state.units[0].symbols.at(-1)?.details).toEqual({
      photos: null,
      price: null,
      note: null,
    });
    installationOps.updateSymbolDetailsOperation(
      state,
      actions.updateSymbolDetails({
        unitId: "unit_1",
        id: "symbol_details",
        price: 20,
        note: "note",
      }),
    );
    expect(state.units[0].symbols.at(-1)?.details).toEqual({
      photos: null,
      price: 20,
      note: "note",
    });
  });
});

describe("circuit reducer validation", () => {
  it("rejects duplicate and invalid circuit fields", () => {
    const state = emptyState();
    addCircuitTo(state);
    expect(() => addCircuitTo(state)).toThrow("Circuit id already exists");
    expect(() =>
      addCircuitTo(state, validCircuit({ id: "circuit_2" })),
    ).toThrow("Circuit number already exists");

    expect(() =>
      addCircuitTo(state, validCircuit({ id: "bad_sk_zero", skNumber: 0 })),
    ).toThrow("Circuit number must be a positive integer");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({ id: "bad_sk_fraction", skNumber: 1.5 }),
      ),
    ).toThrow("Circuit number must be a positive integer");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({ id: "bad_name", skNumber: 100, name: " " }),
      ),
    ).toThrow("A circuit needs a name");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({ id: "bad_kind", skNumber: 101, kind: " " }),
      ),
    ).toThrow("A circuit needs a kind");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({
          id: "bad_breaker",
          skNumber: 100,
          breaker: {
            characteristic: " ",
            poles: 1,
            ratingA: 10,
            rcbo: false,
            rcdMa: null,
          },
        }),
      ),
    ).toThrow("A breaker needs a characteristic");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({
          id: "bad_poles",
          skNumber: 100,
          breaker: {
            characteristic: "B",
            poles: 4,
            ratingA: 10,
            rcbo: false,
            rcdMa: null,
          },
        }),
      ),
    ).toThrow("Breaker poles must be 1, 2 or 3");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({
          id: "bad_rating",
          skNumber: 100,
          breaker: {
            characteristic: "B",
            poles: 1,
            ratingA: 0,
            rcbo: false,
            rcdMa: null,
          },
        }),
      ),
    ).toThrow("Breaker rating must be positive");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({
          id: "bad_rcd",
          skNumber: 100,
          breaker: {
            characteristic: "B",
            poles: 1,
            ratingA: 10,
            rcbo: false,
            rcdMa: 301,
          },
        }),
      ),
    ).toThrow("RCD rating must be between 0 and 300 mA");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({
          id: "bad_cable",
          skNumber: 100,
          cable: { type: " ", crossSectionMm2: 1.5, lengthM: null },
        }),
      ),
    ).toThrow("A cable needs a type");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({
          id: "bad_cross",
          skNumber: 100,
          cable: { type: "NYM-J", crossSectionMm2: 0, lengthM: null },
        }),
      ),
    ).toThrow("Cable cross-section must be positive");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({
          id: "bad_length",
          skNumber: 100,
          cable: { type: "NYM-J", crossSectionMm2: 1.5, lengthM: -1 },
        }),
      ),
    ).toThrow("Cable length must be non-negative");
    const invalidTemperature = actions.addCircuit({
      circuit: {
        ...validCircuit({ id: "bad_temp", skNumber: 102 }),
      },
    });
    invalidTemperature.input.circuit.ambientTempC = Number.NaN;
    expect(() =>
      circuitOps.addCircuitOperation(state, invalidTemperature),
    ).toThrow("Ambient temperature must be finite");
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({ id: "bad_group", skNumber: 100, groupedCircuits: 0 }),
      ),
    ).toThrow("Grouped circuits must be a positive integer");
    state.distributors.push({
      id: "board_existing",
      name: "Board",
      rows: 2,
      tePerRow: 12,
      reservePercent: 10,
      location: null,
    });
    expect(() =>
      addCircuitTo(
        state,
        validCircuit({
          id: "bad_distributor",
          skNumber: 100,
          distributorId: "missing",
        }),
      ),
    ).toThrow("Unknown distribution board");
  });

  it("accepts optional circuit values and updates fields", () => {
    const state = emptyState();
    addCircuitTo(
      state,
      validCircuit({
        rcdMa: 30,
        groupedCircuits: 2,
        cable: { type: "NYM-J", crossSectionMm2: 2.5, lengthM: 10 },
      }),
    );
    expect(state.circuits[0]).toMatchObject({
      distributorId: null,
      installationMethod: "B2",
      ambientTempC: 30,
      groupedCircuits: 2,
    });
    expect(state.nextCircuitNumber).toBe(2);

    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "missing", name: "X" }),
      ),
    ).toThrow("Unknown circuit");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", name: " " }),
      ),
    ).toThrow("A circuit needs a name");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", kind: " " }),
      ),
    ).toThrow("A circuit needs a kind");
    state.distributors.push({
      id: "board_existing",
      name: "Board",
      rows: 2,
      tePerRow: 12,
      reservePercent: 10,
      location: null,
    });
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", distributorId: "missing" }),
      ),
    ).toThrow("Unknown distribution board");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", ratingA: 0 }),
      ),
    ).toThrow("Breaker rating must be positive");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", characteristic: " " }),
      ),
    ).toThrow("A breaker needs a characteristic");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", poles: 0 }),
      ),
    ).toThrow("Breaker poles must be 1, 2 or 3");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", rcdMa: 301 }),
      ),
    ).toThrow("RCD rating must be between 0 and 300 mA");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", cableType: " " }),
      ),
    ).toThrow("A cable needs a type");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", crossSectionMm2: 0 }),
      ),
    ).toThrow("Cable cross-section must be positive");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", lengthM: -1 }),
      ),
    ).toThrow("Cable length must be non-negative");
    const invalidUpdatedTemperature = actions.updateCircuit({
      id: "circuit_1",
      ambientTempC: 30,
    });
    invalidUpdatedTemperature.input.ambientTempC = Number.NaN;
    expect(() =>
      circuitOps.updateCircuitOperation(state, invalidUpdatedTemperature),
    ).toThrow("Ambient temperature must be finite");
    expect(() =>
      circuitOps.updateCircuitOperation(
        state,
        actions.updateCircuit({ id: "circuit_1", groupedCircuits: 0 }),
      ),
    ).toThrow("Grouped circuits must be a positive integer");

    circuitOps.updateCircuitOperation(
      state,
      actions.updateCircuit({
        id: "circuit_1",
        name: "Updated",
        kind: "power",
        color: "#fff",
        phases: ["L1", "L2"],
        distributorId: null,
        ratingA: 16,
        characteristic: "C",
        poles: 2,
        rcdMa: null,
        rcbo: true,
        cableType: "NYM-J",
        crossSectionMm2: 2.5,
        lengthM: null,
        notes: "note",
        installationMethod: "C",
        ambientTempC: null,
        groupedCircuits: null,
      }),
    );
    expect(state.circuits[0]).toMatchObject({
      name: "Updated",
      kind: "power",
      color: "#fff",
      phases: ["L1", "L2"],
      distributorId: null,
      breaker: {
        characteristic: "C",
        poles: 2,
        ratingA: 16,
        rcbo: true,
        rcdMa: null,
      },
      cable: {
        type: "NYM-J",
        crossSectionMm2: 2.5,
        lengthM: null,
      },
      notes: "note",
      installationMethod: "C",
      ambientTempC: null,
      groupedCircuits: null,
    });
  });

  it("rejects unknown circuits and removes dependent data", () => {
    const state = emptyState();
    expect(() =>
      circuitOps.removeCircuitOperation(
        state,
        actions.removeCircuit({ id: "missing" }),
      ),
    ).toThrow("Unknown circuit");
    addCircuitTo(state);
    addSymbolTo(state, { circuitId: "circuit_1" });
    state.routes = [];
    state.routes.push({
      id: "route_1",
      circuitId: "circuit_1",
      unitId: "unit_1",
      points: positions(2),
      reservePercent: 10,
    });
    state.cabinetDevices.push({
      id: "device_1",
      distributorId: "board_1",
      circuitId: "circuit_1",
      kind: "breaker",
      label: "Breaker",
      teWidth: 2,
      article: null,
      phases: null,
      price: null,
      row: null,
      startTe: null,
    });
    state.reports.push({
      id: "report_1",
      circuitId: "circuit_1",
      result: "pass",
      continuityOhm: null,
      insulationMohm: null,
      insulationTestVoltageV: null,
      loopImpedanceOhm: null,
      nextTestDue: null,
      notes: null,
      rcdTestCurrentMa: null,
      rcdTripMs: null,
      rotatingField: null,
      signature: null,
      testedAt: null,
      tester: null,
      visualInspection: null,
    });
    circuitOps.removeCircuitOperation(
      state,
      actions.removeCircuit({ id: "circuit_1" }),
    );
    expect(state.circuits).toHaveLength(0);
    expect(state.routes).toHaveLength(0);
    expect(state.cabinetDevices).toHaveLength(0);
    expect(state.reports).toHaveLength(0);
    expect(state.units[0].symbols[0].circuitId).toBeNull();
  });

  it("validates symbol circuit assignment", () => {
    const state = emptyState();
    addSymbolTo(state);
    expect(() =>
      circuitOps.assignSymbolCircuitOperation(
        state,
        actions.assignSymbolCircuit({
          unitId: "missing",
          symbolId: "symbol_1",
          circuitId: null,
        }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      circuitOps.assignSymbolCircuitOperation(
        state,
        actions.assignSymbolCircuit({
          unitId: "unit_1",
          symbolId: "missing",
          circuitId: null,
        }),
      ),
    ).toThrow("Unknown symbol");
    expect(() =>
      circuitOps.assignSymbolCircuitOperation(
        state,
        actions.assignSymbolCircuit({
          unitId: "unit_1",
          symbolId: "symbol_1",
          circuitId: "missing",
        }),
      ),
    ).toThrow("Unknown circuit");
    circuitOps.assignSymbolCircuitOperation(
      state,
      actions.assignSymbolCircuit({
        unitId: "unit_1",
        symbolId: "symbol_1",
        circuitId: null,
      }),
    );
    expect(state.units[0].symbols[0].circuitId).toBeNull();
    addCircuitTo(state);
    circuitOps.assignSymbolCircuitOperation(
      state,
      actions.assignSymbolCircuit({
        unitId: "unit_1",
        symbolId: "symbol_1",
        circuitId: "circuit_1",
      }),
    );
    expect(state.units[0].symbols[0].circuitId).toBe("circuit_1");
  });

  it("validates routes including undefined route storage", () => {
    const state = emptyState();
    addCircuitTo(state);
    expect(() =>
      circuitOps.addRouteOperation(
        state,
        actions.addRoute({
          route: {
            id: "route_1",
            circuitId: "missing",
            unitId: "unit_1",
            points: positions(2),
          },
        }),
      ),
    ).toThrow("Unknown circuit");
    expect(() =>
      circuitOps.addRouteOperation(
        state,
        actions.addRoute({
          route: {
            id: "route_1",
            circuitId: "circuit_1",
            unitId: "missing",
            points: positions(2),
          },
        }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      circuitOps.addRouteOperation(
        state,
        actions.addRoute({
          route: {
            id: "route_1",
            circuitId: "circuit_1",
            unitId: "unit_1",
            points: [],
          },
        }),
      ),
    ).toThrow("A route needs at least two points");
    const invalidRoutePoints = actions.addRoute({
      route: {
        id: "route_1",
        circuitId: "circuit_1",
        unitId: "unit_1",
        points: positions(2),
      },
    });
    invalidRoutePoints.input.route.points[0].x = Number.NaN;
    expect(() =>
      circuitOps.addRouteOperation(state, invalidRoutePoints),
    ).toThrow("Route points must be finite");
    expect(() =>
      circuitOps.addRouteOperation(
        state,
        actions.addRoute({
          route: {
            id: "route_1",
            circuitId: "circuit_1",
            unitId: "unit_1",
            points: positions(2),
            reservePercent: -1,
          },
        }),
      ),
    ).toThrow("Route reserve must be non-negative");

    // The initial state has routes: [], so this covers the nullish fallback.
    Reflect.deleteProperty(state, "routes");
    circuitOps.addRouteOperation(
      state,
      actions.addRoute({
        route: {
          id: "route_1",
          circuitId: "circuit_1",
          unitId: "unit_1",
          points: positions(2),
        },
      }),
    );
    expect(state.routes?.[0].reservePercent).toBe(10);
    expect(() =>
      circuitOps.addRouteOperation(
        state,
        actions.addRoute({
          route: {
            id: "route_1",
            circuitId: "circuit_1",
            unitId: "unit_1",
            points: positions(2),
          },
        }),
      ),
    ).toThrow("Route id already exists");

    expect(() =>
      circuitOps.updateRouteOperation(
        state,
        actions.updateRoute({ id: "missing", points: positions(2) }),
      ),
    ).toThrow("Unknown route");
    expect(() =>
      circuitOps.updateRouteOperation(
        state,
        actions.updateRoute({ id: "route_1", circuitId: "missing" }),
      ),
    ).toThrow("Unknown circuit");
    expect(() =>
      circuitOps.updateRouteOperation(
        state,
        actions.updateRoute({ id: "route_1", unitId: "missing" }),
      ),
    ).toThrow("Unknown unit");
    expect(() =>
      circuitOps.updateRouteOperation(
        state,
        actions.updateRoute({ id: "route_1", points: [] }),
      ),
    ).toThrow("A route needs at least two points");
    const invalidUpdatedRoutePoints = actions.updateRoute({
      id: "route_1",
      points: positions(2),
    });
    invalidUpdatedRoutePoints.input.points![0].x = Number.NaN;
    expect(() =>
      circuitOps.updateRouteOperation(state, invalidUpdatedRoutePoints),
    ).toThrow("Route points must be finite");
    expect(() =>
      circuitOps.updateRouteOperation(
        state,
        actions.updateRoute({ id: "route_1", reservePercent: -1 }),
      ),
    ).toThrow("Route reserve must be non-negative");
    circuitOps.updateRouteOperation(
      state,
      actions.updateRoute({
        id: "route_1",
        circuitId: "circuit_1",
        unitId: "unit_1",
        points: positions(3),
        reservePercent: null,
      }),
    );
    expect(state.routes?.[0]).toMatchObject({
      circuitId: "circuit_1",
      unitId: "unit_1",
      reservePercent: null,
    });

    expect(() =>
      circuitOps.removeRouteOperation(
        state,
        actions.removeRoute({ id: "missing" }),
      ),
    ).toThrow("Unknown route");
    circuitOps.removeRouteOperation(
      state,
      actions.removeRoute({ id: "route_1" }),
    );
    expect(state.routes).toHaveLength(0);
  });
});

describe("cabinet and KNX reducer validation", () => {
  it("validates distributors", () => {
    const state = emptyState();
    const distributor = {
      id: "board_1",
      name: "Board",
      rows: 2,
      tePerRow: 12,
      reservePercent: 10,
    };
    expect(() =>
      cabinetOps.addDistributorOperation(
        state,
        actions.addDistributor({
          distributor: { ...distributor, name: " " },
        }),
      ),
    ).toThrow("A distribution board needs a name");
    expect(() =>
      cabinetOps.addDistributorOperation(
        state,
        actions.addDistributor({
          distributor: { ...distributor, rows: 0 },
        }),
      ),
    ).toThrow("Rows must be a positive integer");
    expect(() =>
      cabinetOps.addDistributorOperation(
        state,
        actions.addDistributor({
          distributor: { ...distributor, rows: 1.5 },
        }),
      ),
    ).toThrow("Rows must be a positive integer");
    expect(() =>
      cabinetOps.addDistributorOperation(
        state,
        actions.addDistributor({
          distributor: { ...distributor, tePerRow: 0 },
        }),
      ),
    ).toThrow("TE per row must be a positive integer");
    expect(() =>
      cabinetOps.addDistributorOperation(
        state,
        actions.addDistributor({
          distributor: { ...distributor, reservePercent: -1 },
        }),
      ),
    ).toThrow("Reserve must be between 0 and 100 percent");
    expect(() =>
      cabinetOps.addDistributorOperation(
        state,
        actions.addDistributor({
          distributor: { ...distributor, reservePercent: 101 },
        }),
      ),
    ).toThrow("Reserve must be between 0 and 100 percent");
    cabinetOps.addDistributorOperation(
      state,
      actions.addDistributor({ distributor }),
    );
    expect(state.distributors[0]).toMatchObject({ location: null });
    expect(() =>
      cabinetOps.addDistributorOperation(
        state,
        actions.addDistributor({ distributor }),
      ),
    ).toThrow("Distribution board id already exists");

    expect(() =>
      cabinetOps.updateDistributorOperation(
        state,
        actions.updateDistributor({ id: "missing", rows: 2 }),
      ),
    ).toThrow("Unknown distribution board");
    expect(() =>
      cabinetOps.updateDistributorOperation(
        state,
        actions.updateDistributor({ id: "board_1", name: " " }),
      ),
    ).toThrow("A distribution board needs a name");
    expect(() =>
      cabinetOps.updateDistributorOperation(
        state,
        actions.updateDistributor({ id: "board_1", rows: 0 }),
      ),
    ).toThrow("Rows must be a positive integer");
    expect(() =>
      cabinetOps.updateDistributorOperation(
        state,
        actions.updateDistributor({ id: "board_1", tePerRow: 0 }),
      ),
    ).toThrow("TE per row must be a positive integer");
    expect(() =>
      cabinetOps.updateDistributorOperation(
        state,
        actions.updateDistributor({ id: "board_1", reservePercent: 101 }),
      ),
    ).toThrow("Reserve must be between 0 and 100 percent");
    cabinetOps.updateDistributorOperation(
      state,
      actions.updateDistributor({
        id: "board_1",
        name: "Updated",
        rows: 3,
        tePerRow: 18,
        reservePercent: 20,
        location: "Hall",
      }),
    );
    expect(state.distributors[0]).toMatchObject({
      name: "Updated",
      rows: 3,
      tePerRow: 18,
      reservePercent: 20,
      location: "Hall",
    });
  });

  it("validates cabinet layout and group addresses", () => {
    const state = emptyState();
    const distributor = {
      id: "board_1",
      name: "Board",
      rows: 2,
      tePerRow: 12,
      reservePercent: 10,
    };
    cabinetOps.addDistributorOperation(
      state,
      actions.addDistributor({ distributor }),
    );
    expect(() =>
      cabinetOps.planCabinetOperation(
        state,
        actions.planCabinet({
          distributorId: "missing",
          devices: [],
        }),
      ),
    ).toThrow("Unknown distribution board");
    expect(() =>
      cabinetOps.planCabinetOperation(
        state,
        actions.planCabinet({
          distributorId: "board_1",
          devices: [
            {
              id: "device_1",
              distributorId: "board_1",
              kind: "breaker",
              label: "Breaker",
              teWidth: 0,
            },
          ],
        }),
      ),
    ).toThrow("Device width must be a positive integer");
    expect(() =>
      cabinetOps.planCabinetOperation(
        state,
        actions.planCabinet({
          distributorId: "board_1",
          devices: [
            {
              id: "device_1",
              distributorId: "board_1",
              kind: "breaker",
              label: "Breaker",
              teWidth: 2,
              row: -1,
            },
          ],
        }),
      ),
    ).toThrow("Device row must be a non-negative integer");
    expect(() =>
      cabinetOps.planCabinetOperation(
        state,
        actions.planCabinet({
          distributorId: "board_1",
          devices: [
            {
              id: "device_1",
              distributorId: "board_1",
              kind: "breaker",
              label: "Breaker",
              teWidth: 2,
              startTe: 0,
            },
          ],
        }),
      ),
    ).toThrow("Device start TE must be a positive integer");
    expect(() =>
      cabinetOps.planCabinetOperation(
        state,
        actions.planCabinet({
          distributorId: "board_1",
          devices: [
            {
              id: "device_1",
              distributorId: "board_1",
              circuitId: "missing",
              kind: "breaker",
              label: "Breaker",
              teWidth: 2,
            },
          ],
        }),
      ),
    ).toThrow("Unknown circuit");

    addCircuitTo(state);
    cabinetOps.planCabinetOperation(
      state,
      actions.planCabinet({
        distributorId: "board_1",
        devices: [
          {
            id: "device_1",
            distributorId: "board_1",
            circuitId: "circuit_1",
            kind: "breaker",
            label: "Breaker",
            teWidth: 2,
            row: 0,
            startTe: 1,
            article: null,
            phases: null,
            price: null,
          },
        ],
      }),
    );
    expect(state.cabinetDevices).toHaveLength(1);
    expect(state.cabinetDevices[0]).toMatchObject({
      distributorId: "board_1",
      row: 0,
      startTe: 1,
    });
    cabinetOps.planCabinetOperation(
      state,
      actions.planCabinet({
        distributorId: "board_1",
        devices: [
          {
            id: "device_1",
            distributorId: "board_1",
            circuitId: "circuit_1",
            kind: "breaker",
            label: "Breaker",
            teWidth: 2,
            row: 0,
            startTe: 1,
            article: null,
            phases: null,
            price: null,
          },
        ],
      }),
    );
    expect(state.cabinetDevices).toHaveLength(1);

    const ga = {
      id: "ga_1",
      name: "Socket",
      main: 1,
      middle: 1,
      sub: 1,
      dpt: "1.001",
    };
    expect(() =>
      cabinetOps.setGroupAddressesOperation(
        state,
        actions.setGroupAddresses({
          addresses: [{ ...ga, main: 32 }],
        }),
      ),
    ).toThrow("Main group must be 0..31");
    expect(() =>
      cabinetOps.setGroupAddressesOperation(
        state,
        actions.setGroupAddresses({
          addresses: [{ ...ga, main: 1.5 }],
        }),
      ),
    ).toThrow("Main group must be 0..31");
    expect(() =>
      cabinetOps.setGroupAddressesOperation(
        state,
        actions.setGroupAddresses({
          addresses: [{ ...ga, middle: 8 }],
        }),
      ),
    ).toThrow("Middle group must be 0..7");
    expect(() =>
      cabinetOps.setGroupAddressesOperation(
        state,
        actions.setGroupAddresses({
          addresses: [{ ...ga, sub: 256 }],
        }),
      ),
    ).toThrow("Sub group must be 0..255");
    expect(() =>
      cabinetOps.setGroupAddressesOperation(
        state,
        actions.setGroupAddresses({
          addresses: [ga, ga],
        }),
      ),
    ).toThrow("Duplicate group address");
    cabinetOps.setGroupAddressesOperation(
      state,
      actions.setGroupAddresses({
        addresses: [{ ...ga }],
      }),
    );
    expect(state.groupAddresses[0]).toMatchObject({
      description: null,
      fixtureId: null,
      functionKey: null,
    });

    expect(() =>
      cabinetOps.updateReportOperation(
        state,
        actions.updateReport({
          report: { id: "report_1", circuitId: "missing", result: "fail" },
        }),
      ),
    ).toThrow("Unknown circuit");
    cabinetOps.updateReportOperation(
      state,
      actions.updateReport({
        report: { id: "report_1", circuitId: "circuit_1", result: "pass" },
      }),
    );
    expect(state.reports[0]).toMatchObject({
      continuityOhm: null,
      insulationMohm: null,
      notes: null,
      tester: null,
    });
    cabinetOps.updateReportOperation(
      state,
      actions.updateReport({
        report: { id: "report_1", circuitId: "circuit_1", result: "pass" },
      }),
    );
    expect(state.reports).toHaveLength(1);
  });
});
