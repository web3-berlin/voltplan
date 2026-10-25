import type { HlskPlanRisersOperations } from "document-models/hlsk-plan/v1";
import {
  DuplicateIdError,
  InvalidRiserError,
  UnknownRiserError,
  UnknownUnitError,
} from "../../gen/risers/error.js";

export const hlskPlanRisersOperations: HlskPlanRisersOperations = {
  addRiserOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const r = action.input.riser;
    if (!r.kind.trim()) throw new InvalidRiserError("A riser needs a kind");
    if (!Number.isFinite(r.x) || !Number.isFinite(r.y))
      throw new InvalidRiserError("Riser position must be finite");
    if (r.label != null && !r.label.trim())
      throw new InvalidRiserError("Riser label cannot be empty");
    if (u.risers.some((x) => x.id === r.id))
      throw new DuplicateIdError("Riser id already exists");
    u.risers.push({
      id: r.id,
      kind: r.kind,
      x: r.x,
      y: r.y,
      label: r.label ?? null,
      notes: r.notes ?? null,
    });
  },
  updateRiserOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const r = u.risers.find((x) => x.id === action.input.id);
    if (!r) throw new UnknownRiserError("Unknown riser");
    const i = action.input;
    if (i.kind !== undefined && i.kind !== null) {
      if (!i.kind.trim()) throw new InvalidRiserError("A riser needs a kind");
      r.kind = i.kind;
    }
    if (i.x !== undefined && i.x !== null) {
      if (!Number.isFinite(i.x))
        throw new InvalidRiserError("Riser position must be finite");
      r.x = i.x;
    }
    if (i.y !== undefined && i.y !== null) {
      if (!Number.isFinite(i.y))
        throw new InvalidRiserError("Riser position must be finite");
      r.y = i.y;
    }
    if (i.label !== undefined) {
      if (i.label !== null && !i.label.trim())
        throw new InvalidRiserError("Riser label cannot be empty");
      r.label = i.label;
    }
    if (i.notes !== undefined) r.notes = i.notes;
  },
  removeRiserOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    if (!u.risers.some((x) => x.id === action.input.id))
      throw new UnknownRiserError("Unknown riser");
    u.risers = u.risers.filter((x) => x.id !== action.input.id);
  },
};
