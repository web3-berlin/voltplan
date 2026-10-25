import type { HlskPlanPipesOperations } from "document-models/hlsk-plan/v1";
import {
  DuplicateIdError,
  InvalidPipeRouteError,
  UnknownPipeRouteError,
  UnknownUnitError,
} from "../../gen/pipes/error.js";

export const hlskPlanPipesOperations: HlskPlanPipesOperations = {
  addPipeRouteOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const r = action.input.route;
    if (!r.kind.trim()) throw new InvalidPipeRouteError("A pipe needs a kind");
    if (r.points.length < 2)
      throw new InvalidPipeRouteError("A pipe needs at least two points");
    if (!r.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
      throw new InvalidPipeRouteError("Pipe points must be finite");
    if (!Number.isFinite(r.diameterMm) || r.diameterMm <= 0)
      throw new InvalidPipeRouteError("Pipe diameter must be positive");
    if (
      r.slopePercent != null &&
      (!Number.isFinite(r.slopePercent) ||
        r.slopePercent < 0 ||
        r.slopePercent > 100)
    )
      throw new InvalidPipeRouteError(
        "Pipe slope must be between 0 and 100 percent",
      );
    if (u.pipeRoutes.some((x) => x.id === r.id))
      throw new DuplicateIdError("Pipe route id already exists");
    u.pipeRoutes.push({
      id: r.id,
      kind: r.kind,
      points: r.points.map((p) => ({ x: p.x, y: p.y })),
      diameterMm: r.diameterMm,
      slopePercent: r.slopePercent ?? null,
      insulation: r.insulation ?? false,
      notes: r.notes ?? null,
    });
  },
  updatePipeRouteOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const r = u.pipeRoutes.find((x) => x.id === action.input.id);
    if (!r) throw new UnknownPipeRouteError("Unknown pipe route");
    const i = action.input;
    if (i.kind !== undefined && i.kind !== null) {
      if (!i.kind.trim())
        throw new InvalidPipeRouteError("A pipe needs a kind");
      r.kind = i.kind;
    }
    if (i.points !== undefined && i.points !== null) {
      if (i.points.length < 2)
        throw new InvalidPipeRouteError("A pipe needs at least two points");
      if (!i.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
        throw new InvalidPipeRouteError("Pipe points must be finite");
      r.points = i.points.map((p) => ({ x: p.x, y: p.y }));
    }
    if (i.diameterMm !== undefined && i.diameterMm !== null) {
      if (!Number.isFinite(i.diameterMm) || i.diameterMm <= 0)
        throw new InvalidPipeRouteError("Pipe diameter must be positive");
      r.diameterMm = i.diameterMm;
    }
    if (i.slopePercent !== undefined) {
      if (
        i.slopePercent !== null &&
        (!Number.isFinite(i.slopePercent) ||
          i.slopePercent < 0 ||
          i.slopePercent > 100)
      )
        throw new InvalidPipeRouteError(
          "Pipe slope must be between 0 and 100 percent",
        );
      r.slopePercent = i.slopePercent;
    }
    if (i.insulation !== undefined && i.insulation !== null)
      r.insulation = i.insulation;
    if (i.notes !== undefined) r.notes = i.notes;
  },
  removePipeRouteOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    if (!u.pipeRoutes.some((x) => x.id === action.input.id))
      throw new UnknownPipeRouteError("Unknown pipe route");
    u.pipeRoutes = u.pipeRoutes.filter((x) => x.id !== action.input.id);
  },
};
