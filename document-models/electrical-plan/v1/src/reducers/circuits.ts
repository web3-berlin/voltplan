import type { ElectricalPlanCircuitsOperations } from "document-models/electrical-plan/v1";
import {
  DuplicateCircuitNumberError,
  DuplicateIdError,
  UnknownCircuitError,
  UnknownSymbolError,
  UnknownUnitError,
} from "../../gen/circuits/error.js";

export const electricalPlanCircuitsOperations: ElectricalPlanCircuitsOperations =
  {
    addCircuitOperation(state, action) {
      if (state.circuits.some((c) => c.id === action.input.circuit.id))
        throw new DuplicateIdError("Circuit id already exists");
      if (
        state.circuits.some((c) => c.skNumber === action.input.circuit.skNumber)
      )
        throw new DuplicateCircuitNumberError("Circuit number already exists");
      const c = action.input.circuit;
      state.circuits.push({
        id: c.id,
        skNumber: c.skNumber,
        name: c.name,
        kind: c.kind,
        distributorId: c.distributorId ?? null,
        color: c.color ?? null,
        notes: c.notes ?? null,
        phases: c.phases ?? null,
        breaker: {
          characteristic: c.breaker.characteristic,
          poles: c.breaker.poles,
          ratingA: c.breaker.ratingA,
          rcbo: c.breaker.rcbo ?? false,
          rcdMa: c.breaker.rcdMa ?? null,
        },
        cable: {
          type: c.cable.type,
          crossSectionMm2: c.cable.crossSectionMm2,
          lengthM: c.cable.lengthM ?? null,
        },
        installationMethod: c.installationMethod ?? "B2",
        ambientTempC: c.ambientTempC ?? 30,
        groupedCircuits: c.groupedCircuits ?? 1,
      });
      state.nextCircuitNumber = Math.max(
        state.nextCircuitNumber,
        c.skNumber + 1,
      );
    },
    updateCircuitOperation(state, action) {
      const c = state.circuits.find((x) => x.id === action.input.id);
      if (!c) throw new UnknownCircuitError("Unknown circuit");
      const i = action.input;
      if (i.name != null) c.name = i.name;
      if (i.kind != null) c.kind = i.kind;
      if (i.color !== undefined) c.color = i.color;
      if (i.phases !== undefined) c.phases = i.phases;
      if (i.distributorId !== undefined) c.distributorId = i.distributorId;
      if (i.ratingA != null) c.breaker.ratingA = i.ratingA;
      if (i.characteristic != null) c.breaker.characteristic = i.characteristic;
      if (i.poles != null) c.breaker.poles = i.poles;
      if (i.rcdMa !== undefined) c.breaker.rcdMa = i.rcdMa;
      if (i.rcbo !== undefined && i.rcbo !== null) c.breaker.rcbo = i.rcbo;
      if (i.cableType != null) c.cable.type = i.cableType;
      if (i.crossSectionMm2 != null)
        c.cable.crossSectionMm2 = i.crossSectionMm2;
      if (i.lengthM !== undefined) c.cable.lengthM = i.lengthM;
      if (i.notes !== undefined) c.notes = i.notes;
      if (i.installationMethod !== undefined)
        c.installationMethod = i.installationMethod;
      if (i.ambientTempC !== undefined) c.ambientTempC = i.ambientTempC;
      if (i.groupedCircuits !== undefined)
        c.groupedCircuits = i.groupedCircuits;
    },
    removeCircuitOperation(state, action) {
      state.circuits = state.circuits.filter((c) => c.id !== action.input.id);
      state.routes = (state.routes ?? []).filter(
        (r) => r.circuitId !== action.input.id,
      );
      state.cabinetDevices = state.cabinetDevices.filter(
        (d) => d.circuitId !== action.input.id,
      );
      state.reports = state.reports.filter(
        (r) => r.circuitId !== action.input.id,
      );
      for (const u of state.units)
        for (const s of u.symbols)
          if (s.circuitId === action.input.id) s.circuitId = null;
    },
    assignSymbolCircuitOperation(state, action) {
      if (
        action.input.circuitId &&
        !state.circuits.some((c) => c.id === action.input.circuitId)
      )
        throw new UnknownCircuitError("Unknown circuit");
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      const s = u.symbols.find((x) => x.id === action.input.symbolId);
      if (!s) throw new UnknownSymbolError("Unknown symbol");
      s.circuitId = action.input.circuitId;
    },
    addRouteOperation(state, action) {
      const r = action.input.route;
      if (!state.circuits.some((c) => c.id === r.circuitId))
        throw new UnknownCircuitError("Unknown circuit");
      if (!state.units.some((u) => u.id === r.unitId))
        throw new UnknownUnitError("Unknown unit");
      if (!r.points || r.points.length < 2) return;
      state.routes = state.routes ?? [];
      if (state.routes.some((x) => x.id === r.id))
        throw new DuplicateIdError("Route id already exists");
      state.routes.push({
        id: r.id,
        circuitId: r.circuitId,
        unitId: r.unitId,
        points: r.points.map((point) => ({ x: point.x, y: point.y })),
        reservePercent: r.reservePercent ?? 10,
      });
    },
    updateRouteOperation(state, action) {
      const r = (state.routes ?? []).find((x) => x.id === action.input.id);
      if (!r) return;
      const i = action.input;
      if (i.circuitId != null) {
        if (!state.circuits.some((c) => c.id === i.circuitId))
          throw new UnknownCircuitError("Unknown circuit");
        r.circuitId = i.circuitId;
      }
      if (i.unitId != null) {
        if (!state.units.some((u) => u.id === i.unitId))
          throw new UnknownUnitError("Unknown unit");
        r.unitId = i.unitId;
      }
      if (i.points != null && i.points.length >= 2)
        r.points = i.points.map((point) => ({ x: point.x, y: point.y }));
      if (i.reservePercent !== undefined) r.reservePercent = i.reservePercent;
    },
    removeRouteOperation(state, action) {
      state.routes = (state.routes ?? []).filter(
        (x) => x.id !== action.input.id,
      );
    },
  };
