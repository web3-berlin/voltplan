import type { HlskPlanFixturesOperations } from "document-models/hlsk-plan/v1";
import {
  DuplicateIdError,
  InvalidFixtureError,
  UnknownFixtureError,
  UnknownRoomError,
  UnknownUnitError,
} from "../../gen/fixtures/error.js";

export const hlskPlanFixturesOperations: HlskPlanFixturesOperations = {
  addFixtureOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const f = action.input.fixture;
    if (!f.kind.trim()) throw new InvalidFixtureError("A fixture needs a kind");
    if (!f.discipline.trim())
      throw new InvalidFixtureError("A fixture needs a discipline");
    if (!f.name.trim()) throw new InvalidFixtureError("A fixture needs a name");
    if (!Number.isFinite(f.position.x) || !Number.isFinite(f.position.y))
      throw new InvalidFixtureError("Fixture position must be finite");
    if (!Number.isFinite(f.rotation))
      throw new InvalidFixtureError("Fixture rotation must be finite");
    if (
      f.mountHeightCm != null &&
      (!Number.isFinite(f.mountHeightCm) || f.mountHeightCm < 0)
    )
      throw new InvalidFixtureError("Mounting height must be non-negative");
    if (f.roomId != null && !(u.rooms ?? []).some((r) => r.id === f.roomId))
      throw new UnknownRoomError("Unknown room");
    if (u.fixtures.some((x) => x.id === f.id))
      throw new DuplicateIdError("Fixture id already exists");
    u.fixtures.push({
      id: f.id,
      kind: f.kind,
      discipline: f.discipline,
      name: f.name,
      position: { x: f.position.x, y: f.position.y },
      rotation: f.rotation,
      roomId: f.roomId ?? null,
      mountHeightCm: f.mountHeightCm ?? null,
      notes: f.notes ?? null,
      locked: f.locked ?? false,
    });
  },
  updateFixtureOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const f = u.fixtures.find((x) => x.id === action.input.id);
    if (!f) throw new UnknownFixtureError("Unknown fixture");
    const i = action.input;
    if (i.kind !== undefined && i.kind !== null) {
      if (!i.kind.trim())
        throw new InvalidFixtureError("A fixture needs a kind");
      f.kind = i.kind;
    }
    if (i.name !== undefined && i.name !== null) {
      if (!i.name.trim())
        throw new InvalidFixtureError("A fixture needs a name");
      f.name = i.name;
    }
    if (i.discipline !== undefined && i.discipline !== null) {
      if (!i.discipline.trim())
        throw new InvalidFixtureError("A fixture needs a discipline");
      f.discipline = i.discipline;
    }
    if (i.position !== undefined && i.position !== null) {
      if (!Number.isFinite(i.position.x) || !Number.isFinite(i.position.y))
        throw new InvalidFixtureError("Fixture position must be finite");
      f.position = { x: i.position.x, y: i.position.y };
    }
    if (i.rotation !== undefined && i.rotation !== null) {
      if (!Number.isFinite(i.rotation))
        throw new InvalidFixtureError("Fixture rotation must be finite");
      f.rotation = i.rotation;
    }
    if (i.roomId !== undefined) {
      if (i.roomId !== null && !(u.rooms ?? []).some((r) => r.id === i.roomId))
        throw new UnknownRoomError("Unknown room");
      f.roomId = i.roomId;
    }
    if (i.mountHeightCm !== undefined) {
      if (
        i.mountHeightCm !== null &&
        (!Number.isFinite(i.mountHeightCm) || i.mountHeightCm < 0)
      )
        throw new InvalidFixtureError("Mounting height must be non-negative");
      f.mountHeightCm = i.mountHeightCm;
    }
    if (i.notes !== undefined) f.notes = i.notes;
    if (i.locked !== undefined && i.locked !== null) f.locked = i.locked;
  },
  removeFixtureOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    if (!u.fixtures.some((x) => x.id === action.input.id))
      throw new UnknownFixtureError("Unknown fixture");
    u.fixtures = u.fixtures.filter((x) => x.id !== action.input.id);
  },
};
