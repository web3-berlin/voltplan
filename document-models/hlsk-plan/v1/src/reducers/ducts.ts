import type { HlskPlanDuctsOperations } from "document-models/hlsk-plan/v1";
import {
  DuplicateIdError,
  InvalidDuctRouteError,
  UnknownDuctRouteError,
  UnknownUnitError,
} from "../../gen/ducts/error.js";

export const hlskPlanDuctsOperations: HlskPlanDuctsOperations = {
  addDuctRouteOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const r = action.input.route;
    if (!r.kind.trim()) throw new InvalidDuctRouteError("A duct needs a kind");
    if (r.points.length < 2)
      throw new InvalidDuctRouteError("A duct needs at least two points");
    if (!r.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
      throw new InvalidDuctRouteError("Duct points must be finite");
    if (!Number.isFinite(r.widthMm) || r.widthMm <= 0)
      throw new InvalidDuctRouteError("Duct width must be positive");
    if (!Number.isFinite(r.heightMm) || r.heightMm <= 0)
      throw new InvalidDuctRouteError("Duct height must be positive");
    if (
      r.airflowM3h != null &&
      (!Number.isFinite(r.airflowM3h) || r.airflowM3h < 0)
    )
      throw new InvalidDuctRouteError("Airflow must be non-negative");
    if (u.ductRoutes.some((x) => x.id === r.id))
      throw new DuplicateIdError("Duct route id already exists");
    u.ductRoutes.push({
      id: r.id,
      kind: r.kind,
      points: r.points.map((p) => ({ x: p.x, y: p.y })),
      widthMm: r.widthMm,
      heightMm: r.heightMm,
      airflowM3h: r.airflowM3h ?? null,
      notes: r.notes ?? null,
    });
  },
  updateDuctRouteOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const r = u.ductRoutes.find((x) => x.id === action.input.id);
    if (!r) throw new UnknownDuctRouteError("Unknown duct route");
    const i = action.input;
    if (i.kind !== undefined && i.kind !== null) {
      if (!i.kind.trim())
        throw new InvalidDuctRouteError("A duct needs a kind");
      r.kind = i.kind;
    }
    if (i.points !== undefined && i.points !== null) {
      if (i.points.length < 2)
        throw new InvalidDuctRouteError("A duct needs at least two points");
      if (!i.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
        throw new InvalidDuctRouteError("Duct points must be finite");
      r.points = i.points.map((p) => ({ x: p.x, y: p.y }));
    }
    if (i.widthMm !== undefined && i.widthMm !== null) {
      if (!Number.isFinite(i.widthMm) || i.widthMm <= 0)
        throw new InvalidDuctRouteError("Duct width must be positive");
      r.widthMm = i.widthMm;
    }
    if (i.heightMm !== undefined && i.heightMm !== null) {
      if (!Number.isFinite(i.heightMm) || i.heightMm <= 0)
        throw new InvalidDuctRouteError("Duct height must be positive");
      r.heightMm = i.heightMm;
    }
    if (i.airflowM3h !== undefined) {
      if (
        i.airflowM3h !== null &&
        (!Number.isFinite(i.airflowM3h) || i.airflowM3h < 0)
      )
        throw new InvalidDuctRouteError("Airflow must be non-negative");
      r.airflowM3h = i.airflowM3h;
    }
    if (i.notes !== undefined) r.notes = i.notes;
  },
  removeDuctRouteOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    if (!u.ductRoutes.some((x) => x.id === action.input.id))
      throw new UnknownDuctRouteError("Unknown duct route");
    u.ductRoutes = u.ductRoutes.filter((x) => x.id !== action.input.id);
  },
};
