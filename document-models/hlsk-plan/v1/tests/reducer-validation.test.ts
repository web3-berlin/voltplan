import type { Action } from "document-model";
import {
  actions,
  initialGlobalState,
  reducer,
  utils,
} from "document-models/hlsk-plan/v1";
import type { HlskPlanDocument, HlskRoom } from "document-models/hlsk-plan/v1";

import { hlskPlanCoreOperations as coreOps } from "../src/reducers/core.js";
import { hlskPlanDuctsOperations as ductOps } from "../src/reducers/ducts.js";
import { hlskPlanFixturesOperations as fixtureOps } from "../src/reducers/fixtures.js";
import { hlskPlanPipesOperations as pipeOps } from "../src/reducers/pipes.js";
import { hlskPlanRisersOperations as riserOps } from "../src/reducers/risers.js";
import { hlskPlanRoomsOperations as roomOps } from "../src/reducers/rooms.js";
import { describe, expect, it } from "vitest";

type Doc = HlskPlanDocument;

const fresh = (): Doc =>
  utils.createDocument({ global: structuredClone(initialGlobalState) });

const run = (doc: Doc, action: Action) => {
  const updated = reducer(doc, action);
  return { updated, error: updated.operations.global.at(-1)?.error };
};

const expectOk = (doc: Doc, action: Action): Doc => {
  const { updated, error } = run(doc, action);
  expect(error).toBeUndefined();
  return updated;
};

const expectError = (doc: Doc, action: Action, message: string): Doc => {
  const { updated, error } = run(doc, action);
  expect(error).toContain(message);
  return updated;
};

const expectOperationError = (fn: () => void, message: string) => {
  let actual = "";
  try {
    fn();
  } catch (error) {
    actual = error instanceof Error ? error.message : String(error);
  }
  expect(actual).toContain(message);
};

const room = () => ({
  id: "room_1",
  name: "Bathroom",
  points: [
    { x: 0, y: 0 },
    { x: 400, y: 0 },
    { x: 400, y: 300 },
    { x: 0, y: 300 },
  ],
  fillColor: "#dbeafe",
  labelX: 200,
  labelY: 150,
  locked: false,
});

const fixture = (overrides: Record<string, unknown> = {}) => ({
  id: "fixture_1",
  kind: "wc",
  discipline: "sanitary",
  name: "WC",
  position: { x: 100, y: 100 },
  rotation: 0,
  roomId: "room_1",
  mountHeightCm: 0,
  notes: null,
  locked: false,
  ...overrides,
});

const pipe = (overrides: Record<string, unknown> = {}) => ({
  id: "pipe_1",
  kind: "cold_water",
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
  diameterMm: 15,
  slopePercent: 0,
  insulation: false,
  notes: null,
  ...overrides,
});

const duct = (overrides: Record<string, unknown> = {}) => ({
  id: "duct_1",
  kind: "supply",
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
  widthMm: 100,
  heightMm: 60,
  airflowM3h: 120,
  notes: null,
  ...overrides,
});

const riser = (overrides: Record<string, unknown> = {}) => ({
  id: "riser_1",
  kind: "cold_water",
  x: 50,
  y: 50,
  label: "Riser 1",
  notes: null,
  ...overrides,
});

describe("core operations", () => {
  it("runs a complete project setup flow", () => {
    let doc = fresh();
    doc = expectOk(doc, actions.setProjectName({ name: "HLSK demo" }));
    doc = expectOk(doc, actions.setActiveUnit({ unitId: "unit_1" }));
    doc = expectOk(
      doc,
      actions.addUnit({ id: "unit_2", name: "Upper Floor", level: 1 }),
    );
    doc = expectOk(
      doc,
      actions.updateUnit({ id: "unit_2", name: "First Floor", level: 2 }),
    );
    doc = expectOk(
      doc,
      actions.updateUnit({ id: "unit_1", name: "Ground Floor", level: null }),
    );
    doc = expectOk(doc, actions.setActiveUnit({ unitId: "unit_2" }));
    doc = expectOk(
      doc,
      actions.setUnitBackground({
        unitId: "unit_1",
        background: {
          dataUrl: "data:image/png;base64,abc",
          widthCm: 800,
          heightCm: 600,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.8,
          rotation: 0,
          locked: false,
        },
      }),
    );
    doc = expectOk(
      doc,
      actions.setUnitBackground({
        unitId: "unit_1",
        background: {
          dataUrl: null,
          widthCm: null,
          heightCm: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          rotation: 0,
          locked: false,
        },
      }),
    );
    doc = expectOk(
      doc,
      actions.updateUnitBackground({
        unitId: "unit_1",
        dataUrl: null,
        widthCm: 900,
        heightCm: 700,
        x: 10,
        y: 10,
        scale: 1.1,
        opacity: 0.9,
        rotation: 2,
        locked: true,
      }),
    );
    doc = expectOk(
      doc,
      actions.updateSettings({
        showLabels: false,
        showMountHeights: true,
        pipeDiameterMm: 20,
      }),
    );
    expect(doc.state.global.name).toBe("HLSK demo");
    expect(doc.state.global.units).toHaveLength(2);
    expect(doc.state.global.activeUnitId).toBe("unit_2");
    expect(doc.state.global.settings.showLabels).toBe(false);
    expect(doc.state.global.settings.showMountHeights).toBe(true);
    expect(doc.state.global.settings.pipeDiameterMm).toBe(20);
  });

  it("rejects invalid core inputs and unknown ids", () => {
    let doc = fresh();
    doc = expectError(
      doc,
      actions.setProjectName({ name: " " }),
      "A plan needs a name",
    );
    doc = expectError(
      doc,
      actions.setActiveUnit({ unitId: "missing" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.addUnit({ id: "x", name: " ", level: 0 }),
      "A unit needs a name",
    );
    doc = expectError(
      doc,
      actions.addUnit({ id: "x", name: "X", level: 1.5 }),
      "non-negative integer",
    );
    doc = expectError(
      doc,
      actions.addUnit({ id: "x", name: "X", level: -1 }),
      "non-negative integer",
    );
    doc = expectError(
      doc,
      actions.addUnit({ id: "unit_1", name: "X", level: 0 }),
      "Unit id already exists",
    );
    doc = expectError(
      doc,
      actions.updateUnit({ id: "missing", name: "X" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.updateUnit({ id: "unit_1", name: " " }),
      "A unit needs a name",
    );
    doc = expectError(
      doc,
      actions.updateUnit({ id: "unit_1", level: -1 }),
      "non-negative integer",
    );
    doc = expectError(
      doc,
      actions.removeUnit({ id: "missing" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.removeUnit({ id: "unit_1" }),
      "At least one floor must remain",
    );
    expect(doc.state.global.units).toHaveLength(1);
  });

  it("keeps a valid active unit when removing the active floor", () => {
    let doc = fresh();
    doc = expectOk(
      doc,
      actions.addUnit({ id: "unit_2", name: "Upper Floor", level: 1 }),
    );
    doc = expectOk(doc, actions.setActiveUnit({ unitId: "unit_2" }));
    doc = expectOk(doc, actions.removeUnit({ id: "unit_2" }));
    expect(doc.state.global.activeUnitId).toBe("unit_1");
  });

  it("leaves the active unit unchanged when removing another floor", () => {
    let doc = fresh();
    doc = expectOk(
      doc,
      actions.addUnit({ id: "unit_2", name: "Upper Floor", level: 1 }),
    );
    doc = expectOk(doc, actions.removeUnit({ id: "unit_2" }));
    expect(doc.state.global.activeUnitId).toBe("unit_1");
  });

  it("validates background dimensions and geometry", () => {
    let doc = fresh();
    doc = expectError(
      doc,
      actions.setUnitBackground({
        unitId: "missing",
        background: {
          dataUrl: null,
          widthCm: null,
          heightCm: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          rotation: 0,
          locked: false,
        },
      }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.setUnitBackground({
        unitId: "unit_1",
        background: {
          dataUrl: null,
          widthCm: 0,
          heightCm: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          rotation: 0,
          locked: false,
        },
      }),
      "Background width must be positive",
    );
    doc = expectError(
      doc,
      actions.setUnitBackground({
        unitId: "unit_1",
        background: {
          dataUrl: null,
          widthCm: null,
          heightCm: -1,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          rotation: 0,
          locked: false,
        },
      }),
      "Background height must be positive",
    );
  });

  it("validates background updates when no background exists", () => {
    let doc = fresh();
    doc = expectError(
      doc,
      actions.updateUnitBackground({ unitId: "missing", x: 0 }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.updateUnitBackground({ unitId: "unit_1", widthCm: 0 }),
      "Background width must be positive",
    );
    doc = expectError(
      doc,
      actions.updateUnitBackground({ unitId: "unit_1", heightCm: 0 }),
      "Background height must be positive",
    );
    doc = expectError(
      doc,
      actions.updateUnitBackground({ unitId: "unit_1", x: null }),
      "Background geometry must be finite",
    );
    doc = expectError(
      doc,
      actions.updateUnitBackground({ unitId: "unit_1", y: null }),
      "Background geometry must be finite",
    );
    doc = expectError(
      doc,
      actions.updateUnitBackground({ unitId: "unit_1", scale: 0 }),
      "Background scale must be positive",
    );
    doc = expectError(
      doc,
      actions.updateUnitBackground({ unitId: "unit_1", opacity: null }),
      "Background opacity must be finite",
    );
    doc = expectError(
      doc,
      actions.updateUnitBackground({ unitId: "unit_1", rotation: null }),
      "Background rotation must be finite",
    );
    doc = expectOk(
      doc,
      actions.updateUnitBackground({
        unitId: "unit_1",
        dataUrl: "data:image/png;base64,abc",
      }),
    );
    expect(doc.state.global.units[0].background?.dataUrl).toBe(
      "data:image/png;base64,abc",
    );
    expect(doc.state.global.units[0].background?.locked).toBe(false);
  });

  it("validates settings", () => {
    let doc = fresh();
    doc = expectError(
      doc,
      actions.updateSettings({ pipeDiameterMm: 0 }),
      "Pipe diameter must be positive",
    );
    doc = expectOk(doc, actions.updateSettings({ showLabels: true }));
    expect(doc.state.global.settings.showLabels).toBe(true);
    doc = expectOk(doc, actions.updateSettings({ showMountHeights: true }));
    expect(doc.state.global.settings.showMountHeights).toBe(true);
  });
});

describe("room operations", () => {
  it("adds, updates and removes a room", () => {
    let doc = fresh();
    doc = expectOk(doc, actions.addRoom({ unitId: "unit_1", room: room() }));
    doc = expectOk(
      doc,
      actions.updateRoom({
        unitId: "unit_1",
        id: "room_1",
        name: "Main Bath",
        fillColor: "#bfdbfe",
        locked: true,
      }),
    );
    doc = expectOk(
      doc,
      actions.updateRoom({
        unitId: "unit_1",
        id: "room_1",
        labelX: 250,
        labelY: 160,
      }),
    );
    doc = expectOk(
      doc,
      actions.updateRoom({
        unitId: "unit_1",
        id: "room_1",
        points: [
          { x: 0, y: 0 },
          { x: 500, y: 0 },
          { x: 500, y: 400 },
          { x: 0, y: 400 },
        ],
      }),
    );
    expect(doc.state.global.units[0].rooms?.[0].name).toBe("Main Bath");
    expect(doc.state.global.units[0].rooms?.[0].locked).toBe(true);
    doc = expectOk(doc, actions.removeRoom({ unitId: "unit_1", id: "room_1" }));
    expect(doc.state.global.units[0].rooms ?? []).toHaveLength(0);
  });

  it("rejects invalid room data and missing references", () => {
    let doc = fresh();
    doc = expectError(
      doc,
      actions.addRoom({ unitId: "missing", room: room() }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.addRoom({ unitId: "unit_1", room: { ...room(), name: " " } }),
      "A room needs a name",
    );
    doc = expectError(
      doc,
      actions.addRoom({ unitId: "unit_1", room: { ...room(), labelX: 1.5 } }),
      "Room label coordinates must be integers",
    );
    doc = expectError(
      doc,
      actions.addRoom({
        unitId: "unit_1",
        room: {
          ...room(),
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
        },
      }),
      "at least three points",
    );

    doc = expectOk(doc, actions.addRoom({ unitId: "unit_1", room: room() }));
    doc = expectError(
      doc,
      actions.addRoom({ unitId: "unit_1", room: room() }),
      "Room id already exists",
    );
    doc = expectError(
      doc,
      actions.updateRoom({ unitId: "missing", id: "room_1", name: "X" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.updateRoom({ unitId: "unit_1", id: "missing", name: "X" }),
      "Unknown room",
    );
    doc = expectError(
      doc,
      actions.updateRoom({ unitId: "unit_1", id: "room_1", name: " " }),
      "A room needs a name",
    );
    doc = expectError(
      doc,
      actions.updateRoom({
        unitId: "unit_1",
        id: "room_1",
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
      }),
      "at least three points",
    );

    doc = expectError(
      doc,
      actions.removeRoom({ unitId: "missing", id: "room_1" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.removeRoom({ unitId: "unit_1", id: "missing" }),
      "Unknown room",
    );
  });

  it("rejects removing a room that still contains fixtures", () => {
    let doc = fresh();
    doc = expectOk(doc, actions.addRoom({ unitId: "unit_1", room: room() }));
    doc = expectOk(
      doc,
      actions.addFixture({ unitId: "unit_1", fixture: fixture() }),
    );
    doc = expectError(
      doc,
      actions.removeRoom({ unitId: "unit_1", id: "room_1" }),
      "Remove or move the fixtures",
    );
  });
});

describe("fixture operations", () => {
  it("adds, updates and removes a fixture", () => {
    let doc = fresh();
    doc = expectOk(doc, actions.addRoom({ unitId: "unit_1", room: room() }));
    doc = expectOk(
      doc,
      actions.addFixture({ unitId: "unit_1", fixture: fixture() }),
    );
    doc = expectOk(
      doc,
      actions.addFixture({
        unitId: "unit_1",
        fixture: { ...fixture(), id: "fixture_2", locked: undefined },
      }),
    );
    doc = expectOk(
      doc,
      actions.updateFixture({
        unitId: "unit_1",
        id: "fixture_1",
        kind: "shower",
        discipline: "heating",
        name: "Shower",
        position: { x: 200, y: 200 },
        rotation: 90,
        roomId: null,
        mountHeightCm: 10,
        notes: "Wall-mounted",
        locked: true,
      }),
    );
    doc = expectOk(
      doc,
      actions.updateFixture({
        unitId: "unit_1",
        id: "fixture_1",
        roomId: null,
        mountHeightCm: null,
        notes: null,
        locked: null,
      }),
    );
    expect(doc.state.global.units[0].fixtures[0].kind).toBe("shower");
    expect(doc.state.global.units[0].fixtures[0].roomId).toBeNull();
    expect(doc.state.global.units[0].fixtures[0].locked).toBe(true);
    doc = expectOk(
      doc,
      actions.removeFixture({ unitId: "unit_1", id: "fixture_1" }),
    );
    doc = expectOk(
      doc,
      actions.removeFixture({ unitId: "unit_1", id: "fixture_2" }),
    );
    expect(doc.state.global.units[0].fixtures).toHaveLength(0);
  });

  it("rejects invalid fixture data and missing references", () => {
    let doc = fresh();
    doc = expectOk(doc, actions.addRoom({ unitId: "unit_1", room: room() }));
    doc = expectError(
      doc,
      actions.addFixture({ unitId: "missing", fixture: fixture() }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.addFixture({
        unitId: "unit_1",
        fixture: { ...fixture(), kind: " " },
      }),
      "A fixture needs a kind",
    );
    doc = expectError(
      doc,
      actions.addFixture({
        unitId: "unit_1",
        fixture: { ...fixture(), discipline: " " },
      }),
      "A fixture needs a discipline",
    );
    doc = expectError(
      doc,
      actions.addFixture({
        unitId: "unit_1",
        fixture: { ...fixture(), name: " " },
      }),
      "A fixture needs a name",
    );

    doc = expectError(
      doc,
      actions.addFixture({
        unitId: "unit_1",
        fixture: { ...fixture(), mountHeightCm: -1 },
      }),
      "Mounting height must be non-negative",
    );
    doc = expectError(
      doc,
      actions.addFixture({
        unitId: "unit_1",
        fixture: { ...fixture(), roomId: "missing" },
      }),
      "Unknown room",
    );
    doc = expectOk(
      doc,
      actions.addFixture({ unitId: "unit_1", fixture: fixture() }),
    );
    doc = expectError(
      doc,
      actions.addFixture({ unitId: "unit_1", fixture: fixture() }),
      "Fixture id already exists",
    );
    doc = expectError(
      doc,
      actions.updateFixture({ unitId: "missing", id: "fixture_1", name: "X" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.updateFixture({ unitId: "unit_1", id: "missing", name: "X" }),
      "Unknown fixture",
    );
    doc = expectError(
      doc,
      actions.updateFixture({ unitId: "unit_1", id: "fixture_1", kind: " " }),
      "A fixture needs a kind",
    );
    doc = expectError(
      doc,
      actions.updateFixture({ unitId: "unit_1", id: "fixture_1", name: " " }),
      "A fixture needs a name",
    );
    doc = expectError(
      doc,
      actions.updateFixture({
        unitId: "unit_1",
        id: "fixture_1",
        discipline: " ",
      }),
      "A fixture needs a discipline",
    );

    doc = expectError(
      doc,
      actions.updateFixture({
        unitId: "unit_1",
        id: "fixture_1",
        roomId: "missing",
      }),
      "Unknown room",
    );
    doc = expectError(
      doc,
      actions.updateFixture({
        unitId: "unit_1",
        id: "fixture_1",
        mountHeightCm: -1,
      }),
      "Mounting height must be non-negative",
    );
    doc = expectError(
      doc,
      actions.removeFixture({ unitId: "missing", id: "fixture_1" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.removeFixture({ unitId: "unit_1", id: "missing" }),
      "Unknown fixture",
    );
  });
});

describe("pipe operations", () => {
  it("adds, updates and removes a pipe route", () => {
    let doc = fresh();
    doc = expectOk(
      doc,
      actions.addPipeRoute({ unitId: "unit_1", route: pipe() }),
    );
    doc = expectOk(
      doc,
      actions.addPipeRoute({
        unitId: "unit_1",
        route: {
          ...pipe(),
          id: "pipe_2",
          slopePercent: null,
          insulation: undefined,
          notes: undefined,
        },
      }),
    );
    doc = expectOk(
      doc,
      actions.updatePipeRoute({
        unitId: "unit_1",
        id: "pipe_1",
        kind: "hot_water",
        points: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 100 },
        ],
        diameterMm: 20,
        slopePercent: 1.5,
        insulation: true,
        notes: "Insulated",
      }),
    );
    doc = expectOk(
      doc,
      actions.updatePipeRoute({ unitId: "unit_1", id: "pipe_1" }),
    );
    expect(doc.state.global.units[0].pipeRoutes[0].kind).toBe("hot_water");
    expect(doc.state.global.units[0].pipeRoutes[0].insulation).toBe(true);
    doc = expectOk(
      doc,
      actions.removePipeRoute({ unitId: "unit_1", id: "pipe_1" }),
    );
    doc = expectOk(
      doc,
      actions.removePipeRoute({ unitId: "unit_1", id: "pipe_2" }),
    );
    expect(doc.state.global.units[0].pipeRoutes).toHaveLength(0);
  });

  it("rejects invalid pipe data and missing references", () => {
    let doc = fresh();
    doc = expectError(
      doc,
      actions.addPipeRoute({ unitId: "missing", route: pipe() }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.addPipeRoute({
        unitId: "unit_1",
        route: { ...pipe(), kind: " " },
      }),
      "A pipe needs a kind",
    );
    doc = expectError(
      doc,
      actions.addPipeRoute({
        unitId: "unit_1",
        route: { ...pipe(), points: [{ x: 0, y: 0 }] },
      }),
      "at least two points",
    );

    doc = expectError(
      doc,
      actions.addPipeRoute({
        unitId: "unit_1",
        route: { ...pipe(), diameterMm: 0 },
      }),
      "Pipe diameter must be positive",
    );
    doc = expectError(
      doc,
      actions.addPipeRoute({
        unitId: "unit_1",
        route: { ...pipe(), slopePercent: -1 },
      }),
      "between 0 and 100",
    );
    doc = expectError(
      doc,
      actions.addPipeRoute({
        unitId: "unit_1",
        route: { ...pipe(), slopePercent: 101 },
      }),
      "between 0 and 100",
    );
    doc = expectOk(
      doc,
      actions.addPipeRoute({ unitId: "unit_1", route: pipe() }),
    );
    doc = expectError(
      doc,
      actions.addPipeRoute({ unitId: "unit_1", route: pipe() }),
      "Pipe route id already exists",
    );
    doc = expectError(
      doc,
      actions.updatePipeRoute({
        unitId: "missing",
        id: "pipe_1",
        kind: "hot_water",
      }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.updatePipeRoute({
        unitId: "unit_1",
        id: "missing",
        kind: "hot_water",
      }),
      "Unknown pipe route",
    );
    doc = expectError(
      doc,
      actions.updatePipeRoute({ unitId: "unit_1", id: "pipe_1", kind: " " }),
      "A pipe needs a kind",
    );
    const badPipeUpdatePoints = actions.updatePipeRoute({
      unitId: "unit_1",
      id: "pipe_1",
      points: [{ x: 0, y: 0 }],
    });
    doc = expectError(doc, badPipeUpdatePoints, "at least two points");
    doc = expectError(
      doc,
      actions.updatePipeRoute({
        unitId: "unit_1",
        id: "pipe_1",
        diameterMm: 0,
      }),
      "Pipe diameter must be positive",
    );
    doc = expectError(
      doc,
      actions.updatePipeRoute({
        unitId: "unit_1",
        id: "pipe_1",
        slopePercent: -1,
      }),
      "between 0 and 100",
    );
    doc = expectError(
      doc,
      actions.updatePipeRoute({
        unitId: "unit_1",
        id: "pipe_1",
        slopePercent: 101,
      }),
      "between 0 and 100",
    );
    doc = expectError(
      doc,
      actions.removePipeRoute({ unitId: "missing", id: "pipe_1" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.removePipeRoute({ unitId: "unit_1", id: "missing" }),
      "Unknown pipe route",
    );
  });
});

describe("duct operations", () => {
  it("adds, updates and removes a duct route", () => {
    let doc = fresh();
    doc = expectOk(
      doc,
      actions.addDuctRoute({ unitId: "unit_1", route: duct() }),
    );
    doc = expectOk(
      doc,
      actions.addDuctRoute({
        unitId: "unit_1",
        route: { ...duct(), id: "duct_2", airflowM3h: null, notes: undefined },
      }),
    );
    doc = expectOk(
      doc,
      actions.updateDuctRoute({
        unitId: "unit_1",
        id: "duct_1",
        kind: "exhaust",
        points: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 100 },
        ],
        widthMm: 120,
        heightMm: 70,
        airflowM3h: 150,
        notes: "Exhaust",
      }),
    );
    expect(doc.state.global.units[0].ductRoutes[0].kind).toBe("exhaust");
    expect(doc.state.global.units[0].ductRoutes[0].airflowM3h).toBe(150);
    doc = expectOk(
      doc,
      actions.updateDuctRoute({ unitId: "unit_1", id: "duct_1" }),
    );
    doc = expectOk(
      doc,
      actions.removeDuctRoute({ unitId: "unit_1", id: "duct_1" }),
    );
    doc = expectOk(
      doc,
      actions.removeDuctRoute({ unitId: "unit_1", id: "duct_2" }),
    );
    expect(doc.state.global.units[0].ductRoutes).toHaveLength(0);
  });

  it("rejects invalid duct data and missing references", () => {
    let doc = fresh();
    doc = expectError(
      doc,
      actions.addDuctRoute({ unitId: "missing", route: duct() }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.addDuctRoute({
        unitId: "unit_1",
        route: { ...duct(), kind: " " },
      }),
      "A duct needs a kind",
    );
    doc = expectError(
      doc,
      actions.addDuctRoute({
        unitId: "unit_1",
        route: { ...duct(), points: [{ x: 0, y: 0 }] },
      }),
      "at least two points",
    );
    doc = expectError(
      doc,
      actions.addDuctRoute({
        unitId: "unit_1",
        route: { ...duct(), widthMm: 0 },
      }),
      "Duct width must be positive",
    );
    doc = expectError(
      doc,
      actions.addDuctRoute({
        unitId: "unit_1",
        route: { ...duct(), heightMm: 0 },
      }),
      "Duct height must be positive",
    );
    doc = expectError(
      doc,
      actions.addDuctRoute({
        unitId: "unit_1",
        route: { ...duct(), airflowM3h: -1 },
      }),
      "Airflow must be non-negative",
    );
    doc = expectOk(
      doc,
      actions.addDuctRoute({ unitId: "unit_1", route: duct() }),
    );
    doc = expectError(
      doc,
      actions.addDuctRoute({ unitId: "unit_1", route: duct() }),
      "Duct route id already exists",
    );
    doc = expectError(
      doc,
      actions.updateDuctRoute({
        unitId: "missing",
        id: "duct_1",
        kind: "exhaust",
      }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.updateDuctRoute({
        unitId: "unit_1",
        id: "missing",
        kind: "exhaust",
      }),
      "Unknown duct route",
    );
    doc = expectError(
      doc,
      actions.updateDuctRoute({ unitId: "unit_1", id: "duct_1", kind: " " }),
      "A duct needs a kind",
    );
    doc = expectError(
      doc,
      actions.updateDuctRoute({
        unitId: "unit_1",
        id: "duct_1",
        points: [{ x: 0, y: 0 }],
      }),
      "at least two points",
    );
    doc = expectError(
      doc,
      actions.updateDuctRoute({ unitId: "unit_1", id: "duct_1", widthMm: 0 }),
      "Duct width must be positive",
    );
    doc = expectError(
      doc,
      actions.updateDuctRoute({ unitId: "unit_1", id: "duct_1", heightMm: 0 }),
      "Duct height must be positive",
    );
    doc = expectError(
      doc,
      actions.updateDuctRoute({
        unitId: "unit_1",
        id: "duct_1",
        airflowM3h: -1,
      }),
      "Airflow must be non-negative",
    );
    doc = expectError(
      doc,
      actions.removeDuctRoute({ unitId: "missing", id: "duct_1" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.removeDuctRoute({ unitId: "unit_1", id: "missing" }),
      "Unknown duct route",
    );
  });
});

describe("riser operations", () => {
  it("adds, updates and removes a riser", () => {
    let doc = fresh();
    doc = expectOk(doc, actions.addRiser({ unitId: "unit_1", riser: riser() }));
    doc = expectOk(
      doc,
      actions.addRiser({
        unitId: "unit_1",
        riser: {
          ...riser(),
          id: "riser_2",
          label: undefined,
          notes: undefined,
        },
      }),
    );
    doc = expectOk(
      doc,
      actions.updateRiser({
        unitId: "unit_1",
        id: "riser_1",
        kind: "waste",
        x: 100,
        y: 100,
        label: "Waste riser",
        notes: "In shaft",
      }),
    );
    expect(doc.state.global.units[0].risers[0].kind).toBe("waste");
    expect(doc.state.global.units[0].risers[0].x).toBe(100);
    doc = expectOk(
      doc,
      actions.updateRiser({ unitId: "unit_1", id: "riser_1" }),
    );
    doc = expectOk(
      doc,
      actions.removeRiser({ unitId: "unit_1", id: "riser_1" }),
    );
    doc = expectOk(
      doc,
      actions.removeRiser({ unitId: "unit_1", id: "riser_2" }),
    );
    expect(doc.state.global.units[0].risers).toHaveLength(0);
  });

  it("rejects invalid riser data and missing references", () => {
    let doc = fresh();
    doc = expectError(
      doc,
      actions.addRiser({ unitId: "missing", riser: riser() }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.addRiser({ unitId: "unit_1", riser: { ...riser(), kind: " " } }),
      "A riser needs a kind",
    );

    doc = expectError(
      doc,
      actions.addRiser({ unitId: "unit_1", riser: { ...riser(), label: " " } }),
      "Riser label cannot be empty",
    );
    doc = expectOk(doc, actions.addRiser({ unitId: "unit_1", riser: riser() }));
    doc = expectError(
      doc,
      actions.addRiser({ unitId: "unit_1", riser: riser() }),
      "Riser id already exists",
    );
    doc = expectError(
      doc,
      actions.updateRiser({ unitId: "missing", id: "riser_1", kind: "waste" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.updateRiser({ unitId: "unit_1", id: "missing", kind: "waste" }),
      "Unknown riser",
    );
    doc = expectError(
      doc,
      actions.updateRiser({ unitId: "unit_1", id: "riser_1", kind: " " }),
      "A riser needs a kind",
    );

    doc = expectError(
      doc,
      actions.updateRiser({ unitId: "unit_1", id: "riser_1", label: " " }),
      "Riser label cannot be empty",
    );
    doc = expectError(
      doc,
      actions.removeRiser({ unitId: "missing", id: "riser_1" }),
      "Unknown unit",
    );
    doc = expectError(
      doc,
      actions.removeRiser({ unitId: "unit_1", id: "missing" }),
      "Unknown riser",
    );
  });
});

describe("finite numeric guards reachable only through direct reducer calls", () => {
  it("rejects non-finite background geometry", () => {
    const state = structuredClone(initialGlobalState);
    const setAction = actions.setUnitBackground({
      unitId: "unit_1",
      background: {
        dataUrl: null,
        widthCm: 800,
        heightCm: 600,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        locked: false,
      },
    });
    setAction.input.background.x = Number.NaN;
    expectOperationError(
      () => coreOps.setUnitBackgroundOperation(state, setAction),
      "Background geometry must be finite",
    );
    const updateAction = actions.updateUnitBackground({
      unitId: "unit_1",
      x: 0,
    });
    updateAction.input.x = Number.NaN;
    expectOperationError(
      () => coreOps.updateUnitBackgroundOperation(state, updateAction),
      "Background geometry must be finite",
    );
  });

  it("rejects non-finite room points and labels", () => {
    const state = structuredClone(initialGlobalState);
    const addAction = actions.addRoom({ unitId: "unit_1", room: room() });
    addAction.input.room.points[0].x = Number.NaN;
    expectOperationError(
      () => roomOps.addRoomOperation(state, addAction),
      "Room points must be finite",
    );
    state.units[0].rooms = [room()];
    const updateRoomPoints = actions.updateRoom({
      unitId: "unit_1",
      id: "room_1",
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    });
    updateRoomPoints.input.points![0].x = Number.NaN;
    expectOperationError(
      () => roomOps.updateRoomOperation(state, updateRoomPoints),
      "Room points must be finite",
    );
    const labelX = actions.updateRoom({
      unitId: "unit_1",
      id: "room_1",
      labelX: 1,
    });
    labelX.input.labelX = Number.NaN;
    expectOperationError(
      () => roomOps.updateRoomOperation(state, labelX),
      "Room label must be finite",
    );
    const labelY = actions.updateRoom({
      unitId: "unit_1",
      id: "room_1",
      labelY: 1,
    });
    labelY.input.labelY = Number.NaN;
    expectOperationError(
      () => roomOps.updateRoomOperation(state, labelY),
      "Room label must be finite",
    );
  });

  it("rejects non-finite fixture positions, rotations and mounting heights", () => {
    const state = structuredClone(initialGlobalState);
    const addPosition = actions.addFixture({
      unitId: "unit_1",
      fixture: fixture(),
    });
    addPosition.input.fixture.position.x = Number.NaN;
    expectOperationError(
      () => fixtureOps.addFixtureOperation(state, addPosition),
      "Fixture position must be finite",
    );
    const addRotation = actions.addFixture({
      unitId: "unit_1",
      fixture: fixture(),
    });
    addRotation.input.fixture.rotation = Number.NaN;
    expectOperationError(
      () => fixtureOps.addFixtureOperation(state, addRotation),
      "Fixture rotation must be finite",
    );
    const addHeight = actions.addFixture({
      unitId: "unit_1",
      fixture: fixture(),
    });
    addHeight.input.fixture.mountHeightCm = Number.NaN;
    expectOperationError(
      () => fixtureOps.addFixtureOperation(state, addHeight),
      "Mounting height must be non-negative",
    );
    state.units[0].fixtures = [fixture()];
    const updatePosition = actions.updateFixture({
      unitId: "unit_1",
      id: "fixture_1",
      position: { x: 0, y: 0 },
    });
    updatePosition.input.position!.y = Number.NaN;
    expectOperationError(
      () => fixtureOps.updateFixtureOperation(state, updatePosition),
      "Fixture position must be finite",
    );
    const updateRotation = actions.updateFixture({
      unitId: "unit_1",
      id: "fixture_1",
      rotation: 0,
    });
    updateRotation.input.rotation = Number.NaN;
    expectOperationError(
      () => fixtureOps.updateFixtureOperation(state, updateRotation),
      "Fixture rotation must be finite",
    );
    const updateHeight = actions.updateFixture({
      unitId: "unit_1",
      id: "fixture_1",
      mountHeightCm: 0,
    });
    updateHeight.input.mountHeightCm = Number.NaN;
    expectOperationError(
      () => fixtureOps.updateFixtureOperation(state, updateHeight),
      "Mounting height must be non-negative",
    );
  });

  it("rejects non-finite pipe points, diameters and slopes", () => {
    const state = structuredClone(initialGlobalState);
    const addPoints = actions.addPipeRoute({ unitId: "unit_1", route: pipe() });
    addPoints.input.route.points[0].x = Number.NaN;
    expectOperationError(
      () => pipeOps.addPipeRouteOperation(state, addPoints),
      "Pipe points must be finite",
    );
    const addDiameter = actions.addPipeRoute({
      unitId: "unit_1",
      route: pipe(),
    });
    addDiameter.input.route.diameterMm = Number.NaN;
    expectOperationError(
      () => pipeOps.addPipeRouteOperation(state, addDiameter),
      "Pipe diameter must be positive",
    );
    const addSlope = actions.addPipeRoute({ unitId: "unit_1", route: pipe() });
    addSlope.input.route.slopePercent = Number.NaN;
    expectOperationError(
      () => pipeOps.addPipeRouteOperation(state, addSlope),
      "between 0 and 100",
    );
    state.units[0].pipeRoutes = [pipe()];
    const updatePoints = actions.updatePipeRoute({
      unitId: "unit_1",
      id: "pipe_1",
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    });
    updatePoints.input.points![0].x = Number.NaN;
    expectOperationError(
      () => pipeOps.updatePipeRouteOperation(state, updatePoints),
      "Pipe points must be finite",
    );
    const updateDiameter = actions.updatePipeRoute({
      unitId: "unit_1",
      id: "pipe_1",
      diameterMm: 10,
    });
    updateDiameter.input.diameterMm = Number.NaN;
    expectOperationError(
      () => pipeOps.updatePipeRouteOperation(state, updateDiameter),
      "Pipe diameter must be positive",
    );
    const updateSlope = actions.updatePipeRoute({
      unitId: "unit_1",
      id: "pipe_1",
      slopePercent: 1,
    });
    updateSlope.input.slopePercent = Number.NaN;
    expectOperationError(
      () => pipeOps.updatePipeRouteOperation(state, updateSlope),
      "between 0 and 100",
    );
  });

  it("rejects non-finite duct points, dimensions and airflow", () => {
    const state = structuredClone(initialGlobalState);
    const addPoints = actions.addDuctRoute({ unitId: "unit_1", route: duct() });
    addPoints.input.route.points[0].x = Number.NaN;
    expectOperationError(
      () => ductOps.addDuctRouteOperation(state, addPoints),
      "Duct points must be finite",
    );
    const addWidth = actions.addDuctRoute({ unitId: "unit_1", route: duct() });
    addWidth.input.route.widthMm = Number.NaN;
    expectOperationError(
      () => ductOps.addDuctRouteOperation(state, addWidth),
      "Duct width must be positive",
    );
    const addHeight = actions.addDuctRoute({ unitId: "unit_1", route: duct() });
    addHeight.input.route.heightMm = Number.NaN;
    expectOperationError(
      () => ductOps.addDuctRouteOperation(state, addHeight),
      "Duct height must be positive",
    );
    const addAirflow = actions.addDuctRoute({
      unitId: "unit_1",
      route: duct(),
    });
    addAirflow.input.route.airflowM3h = Number.NaN;
    expectOperationError(
      () => ductOps.addDuctRouteOperation(state, addAirflow),
      "Airflow must be non-negative",
    );
    state.units[0].ductRoutes = [duct()];
    const updatePoints = actions.updateDuctRoute({
      unitId: "unit_1",
      id: "duct_1",
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    });
    updatePoints.input.points![0].x = Number.NaN;
    expectOperationError(
      () => ductOps.updateDuctRouteOperation(state, updatePoints),
      "Duct points must be finite",
    );
    const updateWidth = actions.updateDuctRoute({
      unitId: "unit_1",
      id: "duct_1",
      widthMm: 10,
    });
    updateWidth.input.widthMm = Number.NaN;
    expectOperationError(
      () => ductOps.updateDuctRouteOperation(state, updateWidth),
      "Duct width must be positive",
    );
    const updateHeight = actions.updateDuctRoute({
      unitId: "unit_1",
      id: "duct_1",
      heightMm: 10,
    });
    updateHeight.input.heightMm = Number.NaN;
    expectOperationError(
      () => ductOps.updateDuctRouteOperation(state, updateHeight),
      "Duct height must be positive",
    );
    const updateAirflow = actions.updateDuctRoute({
      unitId: "unit_1",
      id: "duct_1",
      airflowM3h: 10,
    });
    updateAirflow.input.airflowM3h = Number.NaN;
    expectOperationError(
      () => ductOps.updateDuctRouteOperation(state, updateAirflow),
      "Airflow must be non-negative",
    );
  });

  it("rejects non-finite riser positions", () => {
    const state = structuredClone(initialGlobalState);
    const addX = actions.addRiser({ unitId: "unit_1", riser: riser() });
    addX.input.riser.x = Number.NaN;
    expectOperationError(
      () => riserOps.addRiserOperation(state, addX),
      "Riser position must be finite",
    );
    const addY = actions.addRiser({ unitId: "unit_1", riser: riser() });
    addY.input.riser.y = Number.NaN;
    expectOperationError(
      () => riserOps.addRiserOperation(state, addY),
      "Riser position must be finite",
    );
    state.units[0].risers = [riser()];
    const updateX = actions.updateRiser({
      unitId: "unit_1",
      id: "riser_1",
      x: 0,
    });
    updateX.input.x = Number.NaN;
    expectOperationError(
      () => riserOps.updateRiserOperation(state, updateX),
      "Riser position must be finite",
    );
    const updateY = actions.updateRiser({
      unitId: "unit_1",
      id: "riser_1",
      y: 0,
    });
    updateY.input.y = Number.NaN;
    expectOperationError(
      () => riserOps.updateRiserOperation(state, updateY),
      "Riser position must be finite",
    );
  });
});

describe("legacy nullable room arrays", () => {
  it("falls back when a unit has no room array", () => {
    const state = structuredClone(initialGlobalState);
    state.units[0].rooms = null;
    const addAction = actions.addRoom({
      unitId: "unit_1",
      room: {
        ...room(),
        id: "room_legacy",
        fillColor: undefined,
        locked: undefined,
      },
    });
    roomOps.addRoomOperation(state, addAction);
    expect(state.units[0].rooms).toHaveLength(1);
    expect(
      (state.units[0].rooms as unknown as HlskRoom[])[0].fillColor,
    ).toBeNull();
    expect((state.units[0].rooms as unknown as HlskRoom[])[0].locked).toBe(
      false,
    );

    state.units[0].rooms = null;
    const updateAction = actions.updateRoom({
      unitId: "unit_1",
      id: "missing",
      name: "X",
    });
    expectOperationError(
      () => roomOps.updateRoomOperation(state, updateAction),
      "Unknown room",
    );
    const removeAction = actions.removeRoom({
      unitId: "unit_1",
      id: "missing",
    });
    expectOperationError(
      () => roomOps.removeRoomOperation(state, removeAction),
      "Unknown room",
    );
  });

  it("falls back when a unit has no room array for fixtures", () => {
    const state = structuredClone(initialGlobalState);
    state.units[0].rooms = null;
    const missingRoom = actions.addFixture({
      unitId: "unit_1",
      fixture: { ...fixture(), roomId: "missing" },
    });
    expectOperationError(
      () => fixtureOps.addFixtureOperation(state, missingRoom),
      "Unknown room",
    );

    const defaults = actions.addFixture({
      unitId: "unit_1",
      fixture: {
        ...fixture(),
        id: "fixture_legacy",
        roomId: undefined,
        mountHeightCm: undefined,
        locked: undefined,
      },
    });
    fixtureOps.addFixtureOperation(state, defaults);
    expect(state.units[0].fixtures[0].roomId).toBeNull();
    expect(state.units[0].fixtures[0].mountHeightCm).toBeNull();
    expect(state.units[0].fixtures[0].locked).toBe(false);

    const updateMissingRoom = actions.updateFixture({
      unitId: "unit_1",
      id: "fixture_legacy",
      roomId: "missing",
    });
    expectOperationError(
      () => fixtureOps.updateFixtureOperation(state, updateMissingRoom),
      "Unknown room",
    );
    const updateWithoutOptionalFields = actions.updateFixture({
      unitId: "unit_1",
      id: "fixture_legacy",
      kind: "wc",
    });
    fixtureOps.updateFixtureOperation(state, updateWithoutOptionalFields);
    expect(state.units[0].fixtures[0].notes).toBeNull();
    expect(state.units[0].fixtures[0].locked).toBe(false);
  });
});
