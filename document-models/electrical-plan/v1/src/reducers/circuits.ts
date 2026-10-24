import type { ElectricalPlanCircuitsOperations } from "document-models/electrical-plan/v1";
import {
  DuplicateCircuitNumberError,
  DuplicateIdError,
  InvalidCircuitError,
  InvalidRouteError,
  UnknownCircuitError,
  UnknownDistributorError,
  UnknownRouteError,
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
      if (!Number.isInteger(c.skNumber) || c.skNumber < 1)
        throw new InvalidCircuitError(
          "Circuit number must be a positive integer",
        );
      if (!c.name.trim()) throw new InvalidCircuitError("A circuit needs a name");
      if (!c.kind.trim()) throw new InvalidCircuitError("A circuit needs a kind");
      if (!c.breaker.characteristic.trim())
        throw new InvalidCircuitError("A breaker needs a characteristic");
      if (
        !Number.isInteger(c.breaker.poles) ||
        c.breaker.poles < 1 ||
        c.breaker.poles > 3
      )
        throw new InvalidCircuitError("Breaker poles must be 1, 2 or 3");
      if (!Number.isFinite(c.breaker.ratingA) || c.breaker.ratingA <= 0)
        throw new InvalidCircuitError("Breaker rating must be positive");
      if (
        c.breaker.rcdMa != null &&
        (!Number.isFinite(c.breaker.rcdMa) ||
          c.breaker.rcdMa < 0 ||
          c.breaker.rcdMa > 300)
      )
        throw new InvalidCircuitError(
          "RCD rating must be between 0 and 300 mA",
        );
      if (!c.cable.type.trim())
        throw new InvalidCircuitError("A cable needs a type");
      if (
        !Number.isFinite(c.cable.crossSectionMm2) ||
        c.cable.crossSectionMm2 <= 0
      )
        throw new InvalidCircuitError(
          "Cable cross-section must be positive",
        );
      if (
        c.cable.lengthM != null &&
        (!Number.isFinite(c.cable.lengthM) || c.cable.lengthM < 0)
      )
        throw new InvalidCircuitError(
          "Cable length must be non-negative",
        );
      if (c.ambientTempC != null && !Number.isFinite(c.ambientTempC))
        throw new InvalidCircuitError(
          "Ambient temperature must be finite",
        );
      if (
        c.groupedCircuits != null &&
        (!Number.isInteger(c.groupedCircuits) || c.groupedCircuits < 1)
      )
        throw new InvalidCircuitError(
          "Grouped circuits must be a positive integer",
        );
      if (
        c.distributorId != null &&
        !state.distributors.some((d) => d.id === c.distributorId)
      )
        throw new UnknownDistributorError("Unknown distribution board");
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
      if (i.name != null) {
        if (!i.name.trim())
          throw new InvalidCircuitError("A circuit needs a name");
        c.name = i.name;
      }
      if (i.kind != null) {
        if (!i.kind.trim())
          throw new InvalidCircuitError("A circuit needs a kind");
        c.kind = i.kind;
      }
      if (i.color !== undefined) c.color = i.color;
      if (i.phases !== undefined) c.phases = i.phases;
      if (i.distributorId !== undefined) {
        if (
          i.distributorId != null &&
          !state.distributors.some((d) => d.id === i.distributorId)
        )
          throw new UnknownDistributorError("Unknown distribution board");
        c.distributorId = i.distributorId;
      }
      if (i.ratingA != null) {
        if (!Number.isFinite(i.ratingA) || i.ratingA <= 0)
          throw new InvalidCircuitError("Breaker rating must be positive");
        c.breaker.ratingA = i.ratingA;
      }
      if (i.characteristic != null) {
        if (!i.characteristic.trim())
          throw new InvalidCircuitError(
            "A breaker needs a characteristic",
          );
        c.breaker.characteristic = i.characteristic;
      }
      if (i.poles != null) {
        if (!Number.isInteger(i.poles) || i.poles < 1 || i.poles > 3)
          throw new InvalidCircuitError(
            "Breaker poles must be 1, 2 or 3",
          );
        c.breaker.poles = i.poles;
      }
      if (i.rcdMa !== undefined) {
        if (
          i.rcdMa != null &&
          (!Number.isFinite(i.rcdMa) ||
            i.rcdMa < 0 ||
            i.rcdMa > 300)
        )
          throw new InvalidCircuitError(
            "RCD rating must be between 0 and 300 mA",
          );
        c.breaker.rcdMa = i.rcdMa;
      }
      if (i.rcbo !== undefined && i.rcbo !== null) c.breaker.rcbo = i.rcbo;
      if (i.cableType != null) {
        if (!i.cableType.trim())
          throw new InvalidCircuitError("A cable needs a type");
        c.cable.type = i.cableType;
      }
      if (i.crossSectionMm2 != null) {
        if (
          !Number.isFinite(i.crossSectionMm2) ||
          i.crossSectionMm2 <= 0
        )
          throw new InvalidCircuitError(
            "Cable cross-section must be positive",
          );
        c.cable.crossSectionMm2 = i.crossSectionMm2;
      }
      if (i.lengthM !== undefined) {
        if (
          i.lengthM != null &&
          (!Number.isFinite(i.lengthM) || i.lengthM < 0)
        )
          throw new InvalidCircuitError(
            "Cable length must be non-negative",
          );
        c.cable.lengthM = i.lengthM;
      }
      if (i.notes !== undefined) c.notes = i.notes;
      if (i.installationMethod !== undefined)
        c.installationMethod = i.installationMethod;
      if (i.ambientTempC !== undefined) {
        if (i.ambientTempC != null && !Number.isFinite(i.ambientTempC))
          throw new InvalidCircuitError(
            "Ambient temperature must be finite",
          );
        c.ambientTempC = i.ambientTempC;
      }
      if (i.groupedCircuits !== undefined) {
        if (
          i.groupedCircuits != null &&
          (!Number.isInteger(i.groupedCircuits) ||
            i.groupedCircuits < 1)
        )
          throw new InvalidCircuitError(
            "Grouped circuits must be a positive integer",
          );
        c.groupedCircuits = i.groupedCircuits;
      }
    },
    removeCircuitOperation(state, action) {
      if (!state.circuits.some((c) => c.id === action.input.id))
        throw new UnknownCircuitError("Unknown circuit");
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
      if (!r.points || r.points.length < 2)
        throw new InvalidRouteError("A route needs at least two points");
      if (
        !r.points.every(
          (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
        )
      )
        throw new InvalidRouteError("Route points must be finite");
      if (
        r.reservePercent != null &&
        (!Number.isFinite(r.reservePercent) || r.reservePercent < 0)
      )
        throw new InvalidRouteError("Route reserve must be non-negative");
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
      if (!r) throw new UnknownRouteError("Unknown route");
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
      if (i.points != null) {
        if (i.points.length < 2)
          throw new InvalidRouteError("A route needs at least two points");
        if (
          !i.points.every(
            (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
          )
        )
          throw new InvalidRouteError("Route points must be finite");
        r.points = i.points.map((point) => ({ x: point.x, y: point.y }));
      }
      if (i.reservePercent !== undefined) {
        if (
          i.reservePercent != null &&
          (!Number.isFinite(i.reservePercent) || i.reservePercent < 0)
        )
          throw new InvalidRouteError("Route reserve must be non-negative");
        r.reservePercent = i.reservePercent;
      }
    },
    removeRouteOperation(state, action) {
      if (!(state.routes ?? []).some((x) => x.id === action.input.id))
        throw new UnknownRouteError("Unknown route");
      state.routes = (state.routes ?? []).filter(
        (x) => x.id !== action.input.id,
      );
    },
  };
