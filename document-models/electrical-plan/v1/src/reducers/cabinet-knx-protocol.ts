import type { ElectricalPlanCabinetKnxProtocolOperations } from "document-models/electrical-plan/v1";
import {
  DuplicateGroupAddressError,
  DuplicateIdError,
  InvalidDistributorError,
  InvalidGroupAddressError,
  UnknownCircuitError,
  UnknownDistributorError,
} from "../../gen/cabinet-knx-protocol/error.js";

export const electricalPlanCabinetKnxProtocolOperations: ElectricalPlanCabinetKnxProtocolOperations =
  {
    addDistributorOperation(state, action) {
      if (state.distributors.some((d) => d.id === action.input.distributor.id))
        throw new DuplicateIdError("Distribution board id already exists");
      const d = action.input.distributor;
      if (!d.name.trim())
        throw new InvalidDistributorError("A distribution board needs a name");
      if (!Number.isInteger(d.rows) || d.rows < 1)
        throw new InvalidDistributorError("Rows must be a positive integer");
      if (!Number.isInteger(d.tePerRow) || d.tePerRow < 1)
        throw new InvalidDistributorError(
          "TE per row must be a positive integer",
        );
      if (
        !Number.isFinite(d.reservePercent) ||
        d.reservePercent < 0 ||
        d.reservePercent > 100
      )
        throw new InvalidDistributorError(
          "Reserve must be between 0 and 100 percent",
        );
      state.distributors.push({
        ...d,
        location: d.location ?? null,
      });
    },
    updateDistributorOperation(state, action) {
      const d = state.distributors.find((x) => x.id === action.input.id);
      if (!d) throw new UnknownDistributorError("Unknown distribution board");
      const i = action.input;
      if (i.name != null) {
        if (!i.name.trim())
          throw new InvalidDistributorError(
            "A distribution board needs a name",
          );
        d.name = i.name;
      }
      if (i.rows !== undefined && i.rows !== null) {
        if (!Number.isInteger(i.rows) || i.rows < 1)
          throw new InvalidDistributorError("Rows must be a positive integer");
        d.rows = i.rows;
      }
      if (i.tePerRow !== undefined && i.tePerRow !== null) {
        if (!Number.isInteger(i.tePerRow) || i.tePerRow < 1)
          throw new InvalidDistributorError(
            "TE per row must be a positive integer",
          );
        d.tePerRow = i.tePerRow;
      }
      if (i.reservePercent !== undefined && i.reservePercent !== null) {
        if (
          !Number.isFinite(i.reservePercent) ||
          i.reservePercent < 0 ||
          i.reservePercent > 100
        )
          throw new InvalidDistributorError(
            "Reserve must be between 0 and 100 percent",
          );
        d.reservePercent = i.reservePercent;
      }
      if (i.location !== undefined) d.location = i.location;
    },
    planCabinetOperation(state, action) {
      const d = state.distributors.find(
        (x) => x.id === action.input.distributorId,
      );
      if (!d) throw new UnknownDistributorError("Unknown distribution board");
      for (const x of action.input.devices) {
        if (!Number.isInteger(x.teWidth) || x.teWidth < 1)
          throw new InvalidDistributorError(
            "Device width must be a positive integer",
          );
        if (x.row != null && (!Number.isInteger(x.row) || x.row < 0))
          throw new InvalidDistributorError(
            "Device row must be a non-negative integer",
          );
        if (
          x.startTe != null &&
          (!Number.isInteger(x.startTe) || x.startTe < 1)
        )
          throw new InvalidDistributorError(
            "Device start TE must be a positive integer",
          );
        if (
          x.circuitId != null &&
          !state.circuits.some((c) => c.id === x.circuitId)
        )
          throw new UnknownCircuitError("Unknown circuit");
      }
      state.cabinetDevices = [
        ...state.cabinetDevices.filter((x) => x.distributorId !== d.id),
        ...action.input.devices.map((x) => ({
          ...x,
          distributorId: d.id,
          article: x.article ?? null,
          circuitId: x.circuitId ?? null,
          phases: x.phases ?? null,
          price: x.price ?? null,
          row: x.row ?? null,
          startTe: x.startTe ?? null,
        })),
      ];
    },
    setGroupAddressesOperation(state, action) {
      const seen = new Set();
      for (const ga of action.input.addresses) {
        if (!Number.isInteger(ga.main) || ga.main < 0 || ga.main > 31)
          throw new InvalidGroupAddressError("Main group must be 0..31");
        if (!Number.isInteger(ga.middle) || ga.middle < 0 || ga.middle > 7)
          throw new InvalidGroupAddressError("Middle group must be 0..7");
        if (!Number.isInteger(ga.sub) || ga.sub < 0 || ga.sub > 255)
          throw new InvalidGroupAddressError("Sub group must be 0..255");
        const key = `${ga.main}/${ga.middle}/${ga.sub}`;
        if (seen.has(key))
          throw new DuplicateGroupAddressError("Duplicate group address");
        seen.add(key);
      }
      state.groupAddresses = action.input.addresses.map((ga) => ({
        ...ga,
        description: ga.description ?? null,
        fixtureId: ga.fixtureId ?? null,
        functionKey: ga.functionKey ?? null,
      }));
    },
    updateReportOperation(state, action) {
      if (!state.circuits.some((c) => c.id === action.input.report.circuitId))
        throw new UnknownCircuitError("Unknown circuit");
      const r = action.input.report;
      state.reports = [
        ...state.reports.filter((item) => item.circuitId !== r.circuitId),
        {
          ...r,
          continuityOhm: r.continuityOhm ?? null,
          insulationMohm: r.insulationMohm ?? null,
          insulationTestVoltageV: r.insulationTestVoltageV ?? null,
          loopImpedanceOhm: r.loopImpedanceOhm ?? null,
          nextTestDue: r.nextTestDue ?? null,
          notes: r.notes ?? null,
          rcdTestCurrentMa: r.rcdTestCurrentMa ?? null,
          rcdTripMs: r.rcdTripMs ?? null,
          rotatingField: r.rotatingField ?? null,
          signature: r.signature ?? null,
          testedAt: r.testedAt ?? null,
          tester: r.tester ?? null,
          visualInspection: r.visualInspection ?? null,
        },
      ];
    },
  };
