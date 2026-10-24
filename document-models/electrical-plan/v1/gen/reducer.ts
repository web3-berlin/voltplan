/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { ElectricalPlanPHState } from "document-models/electrical-plan/v1";

import { electricalPlanCabinetKnxProtocolOperations } from "../src/reducers/cabinet-knx-protocol.js";
import { electricalPlanCircuitsOperations } from "../src/reducers/circuits.js";
import { electricalPlanInstallationPlanOperations } from "../src/reducers/installation-plan.js";

import {
  AddCircuitInputSchema,
  AddDistributorInputSchema,
  AddRoomInputSchema,
  AddRouteInputSchema,
  AddSymbolInputSchema,
  AddUnitInputSchema,
  AssignSymbolCircuitInputSchema,
  MoveSymbolInputSchema,
  PlanCabinetInputSchema,
  RemoveCircuitInputSchema,
  RemoveRoomInputSchema,
  RemoveRouteInputSchema,
  RemoveSymbolInputSchema,
  RenameUnitInputSchema,
  SetActiveUnitInputSchema,
  SetGroupAddressesInputSchema,
  SetProjectNameInputSchema,
  SetUnitBackgroundInputSchema,
  UpdateCircuitInputSchema,
  UpdateDistributorInputSchema,
  UpdateReportInputSchema,
  UpdateRoomInputSchema,
  UpdateRouteInputSchema,
  UpdateSettingsInputSchema,
  UpdateSymbolDetailsInputSchema,
  UpdateSymbolInputSchema,
  UpdateUnitBackgroundInputSchema,
} from "./schema/zod.js";

const schemaMemo = new Map<() => unknown, unknown>();

function memoizedSchema<T>(makeSchema: () => T): T {
  let schema = schemaMemo.get(makeSchema) as T | undefined;
  if (schema === undefined) {
    schema = makeSchema();
    schemaMemo.set(makeSchema, schema);
  }
  return schema;
}

const stateReducer: StateReducer<ElectricalPlanPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "ADD_UNIT": {
      memoizedSchema(AddUnitInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.addUnitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RENAME_UNIT": {
      memoizedSchema(RenameUnitInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.renameUnitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_ROOM": {
      memoizedSchema(AddRoomInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.addRoomOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_ROOM": {
      memoizedSchema(UpdateRoomInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.updateRoomOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_ROOM": {
      memoizedSchema(RemoveRoomInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.removeRoomOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SYMBOL": {
      memoizedSchema(AddSymbolInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.addSymbolOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SYMBOL": {
      memoizedSchema(UpdateSymbolInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.updateSymbolOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SYMBOL_DETAILS": {
      memoizedSchema(UpdateSymbolDetailsInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.updateSymbolDetailsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MOVE_SYMBOL": {
      memoizedSchema(MoveSymbolInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.moveSymbolOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SYMBOL": {
      memoizedSchema(RemoveSymbolInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.removeSymbolOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_PROJECT_NAME": {
      memoizedSchema(SetProjectNameInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.setProjectNameOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_ACTIVE_UNIT": {
      memoizedSchema(SetActiveUnitInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.setActiveUnitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_UNIT_BACKGROUND": {
      memoizedSchema(SetUnitBackgroundInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.setUnitBackgroundOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_UNIT_BACKGROUND": {
      memoizedSchema(UpdateUnitBackgroundInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.updateUnitBackgroundOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SETTINGS": {
      memoizedSchema(UpdateSettingsInputSchema).parse(action.input);

      electricalPlanInstallationPlanOperations.updateSettingsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_CIRCUIT": {
      memoizedSchema(AddCircuitInputSchema).parse(action.input);

      electricalPlanCircuitsOperations.addCircuitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_CIRCUIT": {
      memoizedSchema(UpdateCircuitInputSchema).parse(action.input);

      electricalPlanCircuitsOperations.updateCircuitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_CIRCUIT": {
      memoizedSchema(RemoveCircuitInputSchema).parse(action.input);

      electricalPlanCircuitsOperations.removeCircuitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ASSIGN_SYMBOL_CIRCUIT": {
      memoizedSchema(AssignSymbolCircuitInputSchema).parse(action.input);

      electricalPlanCircuitsOperations.assignSymbolCircuitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_ROUTE": {
      memoizedSchema(AddRouteInputSchema).parse(action.input);

      electricalPlanCircuitsOperations.addRouteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_ROUTE": {
      memoizedSchema(UpdateRouteInputSchema).parse(action.input);

      electricalPlanCircuitsOperations.updateRouteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_ROUTE": {
      memoizedSchema(RemoveRouteInputSchema).parse(action.input);

      electricalPlanCircuitsOperations.removeRouteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_DISTRIBUTOR": {
      memoizedSchema(AddDistributorInputSchema).parse(action.input);

      electricalPlanCabinetKnxProtocolOperations.addDistributorOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_DISTRIBUTOR": {
      memoizedSchema(UpdateDistributorInputSchema).parse(action.input);

      electricalPlanCabinetKnxProtocolOperations.updateDistributorOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "PLAN_CABINET": {
      memoizedSchema(PlanCabinetInputSchema).parse(action.input);

      electricalPlanCabinetKnxProtocolOperations.planCabinetOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_GROUP_ADDRESSES": {
      memoizedSchema(SetGroupAddressesInputSchema).parse(action.input);

      electricalPlanCabinetKnxProtocolOperations.setGroupAddressesOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_REPORT": {
      memoizedSchema(UpdateReportInputSchema).parse(action.input);

      electricalPlanCabinetKnxProtocolOperations.updateReportOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<ElectricalPlanPHState> =
  createReducer(stateReducer);
