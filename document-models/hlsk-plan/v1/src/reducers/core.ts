import type { HlskPlanCoreOperations } from "document-models/hlsk-plan/v1";
import {
  DuplicateIdError,
  InvalidNameError,
  InvalidSettingsError,
  InvalidUnitError,
  UnknownUnitError,
} from "../../gen/core/error.js";

export const hlskPlanCoreOperations: HlskPlanCoreOperations = {
  setProjectNameOperation(state, action) {
    if (!action.input.name.trim())
      throw new InvalidNameError("A plan needs a name");
    state.name = action.input.name;
  },
  setActiveUnitOperation(state, action) {
    if (!state.units.some((u) => u.id === action.input.unitId))
      throw new UnknownUnitError("Unknown unit");
    state.activeUnitId = action.input.unitId;
  },
  addUnitOperation(state, action) {
    if (!action.input.name.trim())
      throw new InvalidUnitError("A unit needs a name");
    if (!Number.isInteger(action.input.level) || action.input.level < 0)
      throw new InvalidUnitError("Level must be a non-negative integer");
    if (state.units.some((u) => u.id === action.input.id))
      throw new DuplicateIdError("Unit id already exists");
    state.units.push({
      id: action.input.id,
      name: action.input.name,
      level: action.input.level,
      background: null,
      rooms: [],
      fixtures: [],
      pipeRoutes: [],
      ductRoutes: [],
      risers: [],
    });
  },
  updateUnitOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.id);
    if (!u) throw new UnknownUnitError("Unknown unit");
    if (action.input.name !== undefined && action.input.name !== null) {
      if (!action.input.name.trim())
        throw new InvalidUnitError("A unit needs a name");
      u.name = action.input.name;
    }
    if (action.input.level !== undefined && action.input.level !== null) {
      if (!Number.isInteger(action.input.level) || action.input.level < 0)
        throw new InvalidUnitError("Level must be a non-negative integer");
      u.level = action.input.level;
    }
  },
  removeUnitOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.id);
    if (!u) throw new UnknownUnitError("Unknown unit");
    if (state.units.length <= 1)
      throw new InvalidUnitError("At least one floor must remain");
    state.units = state.units.filter((x) => x.id !== action.input.id);
    if (state.activeUnitId === action.input.id)
      state.activeUnitId = state.units[0].id;
  },
  setUnitBackgroundOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const b = action.input.background;
    if (b.widthCm != null && (!Number.isFinite(b.widthCm) || b.widthCm <= 0))
      throw new InvalidUnitError("Background width must be positive");
    if (b.heightCm != null && (!Number.isFinite(b.heightCm) || b.heightCm <= 0))
      throw new InvalidUnitError("Background height must be positive");
    if (
      !Number.isFinite(b.x) ||
      !Number.isFinite(b.y) ||
      !Number.isFinite(b.scale) ||
      !Number.isFinite(b.opacity) ||
      !Number.isFinite(b.rotation)
    )
      throw new InvalidUnitError("Background geometry must be finite");
    u.background = {
      dataUrl: b.dataUrl ?? null,
      widthCm: b.widthCm ?? null,
      heightCm: b.heightCm ?? null,
      x: b.x,
      y: b.y,
      scale: b.scale,
      opacity: b.opacity,
      rotation: b.rotation,
      locked: b.locked,
    };
  },
  updateUnitBackgroundOperation(state, action) {
    const u = state.units.find((x) => x.id === action.input.unitId);
    if (!u) throw new UnknownUnitError("Unknown unit");
    const i = action.input;
    const b = u.background ?? {
      dataUrl: null,
      widthCm: null,
      heightCm: null,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      rotation: 0,
      locked: false,
    };
    if (i.dataUrl !== undefined) b.dataUrl = i.dataUrl;
    if (i.widthCm !== undefined) {
      if (i.widthCm !== null && (!Number.isFinite(i.widthCm) || i.widthCm <= 0))
        throw new InvalidUnitError("Background width must be positive");
      b.widthCm = i.widthCm;
    }
    if (i.heightCm !== undefined) {
      if (
        i.heightCm !== null &&
        (!Number.isFinite(i.heightCm) || i.heightCm <= 0)
      )
        throw new InvalidUnitError("Background height must be positive");
      b.heightCm = i.heightCm;
    }
    if (i.x !== undefined) {
      if (i.x === null || !Number.isFinite(i.x))
        throw new InvalidUnitError("Background geometry must be finite");
      b.x = i.x;
    }
    if (i.y !== undefined) {
      if (i.y === null || !Number.isFinite(i.y))
        throw new InvalidUnitError("Background geometry must be finite");
      b.y = i.y;
    }
    if (i.scale !== undefined) {
      if (i.scale === null || !Number.isFinite(i.scale) || i.scale <= 0)
        throw new InvalidUnitError("Background scale must be positive");
      b.scale = i.scale;
    }
    if (i.opacity !== undefined) {
      if (i.opacity === null || !Number.isFinite(i.opacity))
        throw new InvalidUnitError("Background opacity must be finite");
      b.opacity = i.opacity;
    }
    if (i.rotation !== undefined) {
      if (i.rotation === null || !Number.isFinite(i.rotation))
        throw new InvalidUnitError("Background rotation must be finite");
      b.rotation = i.rotation;
    }
    if (i.locked !== undefined && i.locked !== null) b.locked = i.locked;
    u.background = b;
  },
  updateSettingsOperation(state, action) {
    const i = action.input;
    if (i.showLabels !== undefined && i.showLabels !== null)
      state.settings.showLabels = i.showLabels;
    if (i.showMountHeights !== undefined && i.showMountHeights !== null)
      state.settings.showMountHeights = i.showMountHeights;
    if (i.pipeDiameterMm !== undefined && i.pipeDiameterMm !== null) {
      if (!Number.isFinite(i.pipeDiameterMm) || i.pipeDiameterMm <= 0)
        throw new InvalidSettingsError("Pipe diameter must be positive");
      state.settings.pipeDiameterMm = i.pipeDiameterMm;
    }
  },
};
