import type { HlskPlanRoomsOperations } from "document-models/hlsk-plan/v1";
import {
  DuplicateIdError,
  InvalidRoomError,
  UnknownRoomError,
  UnknownUnitError,
} from "../../gen/rooms/error.js";

export const hlskPlanRoomsOperations: HlskPlanRoomsOperations = {
  addRoomOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const r = action.input.room;
    if (!r.name.trim()) throw new InvalidRoomError("A room needs a name");
    if (!Number.isInteger(r.labelX) || !Number.isInteger(r.labelY))
      throw new InvalidRoomError("Room label coordinates must be integers");
    if (r.points.length < 3)
      throw new InvalidRoomError("A room needs at least three points");
    if (!r.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
      throw new InvalidRoomError("Room points must be finite");
    if ((u.rooms ?? []).some((x) => x.id === r.id))
      throw new DuplicateIdError("Room id already exists");
    u.rooms = u.rooms ?? [];
    u.rooms.push({
      id: r.id,
      name: r.name,
      points: r.points.map((p) => ({ x: p.x, y: p.y })),
      fillColor: r.fillColor ?? null,
      labelX: r.labelX,
      labelY: r.labelY,
      locked: r.locked ?? false,
    });
  },
  updateRoomOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const r = (u.rooms ?? []).find((x) => x.id === action.input.id);
    if (!r) throw new UnknownRoomError("Unknown room");
    const i = action.input;
    if (i.name !== undefined && i.name !== null) {
      if (!i.name.trim()) throw new InvalidRoomError("A room needs a name");
      r.name = i.name;
    }
    if (i.fillColor !== undefined) r.fillColor = i.fillColor;
    if (i.points !== undefined && i.points !== null) {
      if (i.points.length < 3)
        throw new InvalidRoomError("A room needs at least three points");
      if (!i.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
        throw new InvalidRoomError("Room points must be finite");
      r.points = i.points.map((p) => ({ x: p.x, y: p.y }));
    }
    if (i.labelX !== undefined && i.labelX !== null) {
      if (!Number.isFinite(i.labelX))
        throw new InvalidRoomError("Room label must be finite");
      r.labelX = i.labelX;
    }
    if (i.labelY !== undefined && i.labelY !== null) {
      if (!Number.isFinite(i.labelY))
        throw new InvalidRoomError("Room label must be finite");
      r.labelY = i.labelY;
    }
    if (i.locked !== undefined && i.locked !== null) r.locked = i.locked;
  },
  removeRoomOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const r = (u.rooms ?? []).find((x) => x.id === action.input.id);
    if (!r) throw new UnknownRoomError("Unknown room");
    if (u.fixtures.some((f) => f.roomId === r.id))
      throw new InvalidRoomError(
        "Remove or move the fixtures in this room first",
      );
    u.rooms = (u.rooms ?? []).filter((x) => x.id !== r.id);
  },
};
