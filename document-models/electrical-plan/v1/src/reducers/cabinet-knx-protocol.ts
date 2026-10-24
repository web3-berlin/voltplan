import type { ElectricalPlanCabinetKnxProtocolOperations } from "document-models/electrical-plan/v1";
import {
  DuplicateGroupAddressError,
  DuplicateIdError,
  UnknownCircuitError,
  UnknownDistributorError,
} from "../../gen/cabinet-knx-protocol/error.js";

export const electricalPlanCabinetKnxProtocolOperations: ElectricalPlanCabinetKnxProtocolOperations =
  {
    addDistributorOperation(state, action) {
      if (state.distributors.some((d) => d.id === action.input.distributor.id))
        throw new DuplicateIdError("Distribution board id already exists");
      const d = action.input.distributor;
      state.distributors.push({
        ...d,
        location: d.location ?? null,
      });
    },
    updateDistributorOperation(state, action) {
      const d = state.distributors.find((x) => x.id === action.input.id);
      if (!d) throw new UnknownDistributorError("Unknown distribution board");
      const i = action.input;
      if (i.name != null) d.name = i.name;
      if (i.rows !== undefined && i.rows !== null) d.rows = i.rows;
      if (i.tePerRow !== undefined && i.tePerRow !== null)
        d.tePerRow = i.tePerRow;
      if (i.reservePercent !== undefined && i.reservePercent !== null)
        d.reservePercent = i.reservePercent;
      if (i.location !== undefined) d.location = i.location;
    },
    planCabinetOperation(state, action) {
      const d = state.distributors.find(
        (x) => x.id === action.input.distributorId,
      );
      if (!d) throw new UnknownDistributorError("Unknown distribution board");
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
