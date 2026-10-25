/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { HlskPlanPHState } from "document-models/hlsk-plan/v1";

import { hlskPlanCoreOperations } from "../src/reducers/core.js";
import { hlskPlanDuctsOperations } from "../src/reducers/ducts.js";
import { hlskPlanFixturesOperations } from "../src/reducers/fixtures.js";
import { hlskPlanPipesOperations } from "../src/reducers/pipes.js";
import { hlskPlanRisersOperations } from "../src/reducers/risers.js";
import { hlskPlanRoomsOperations } from "../src/reducers/rooms.js";

import {
  AddDuctRouteInputSchema,
  AddFixtureInputSchema,
  AddPipeRouteInputSchema,
  AddRiserInputSchema,
  AddRoomInputSchema,
  AddUnitInputSchema,
  RemoveDuctRouteInputSchema,
  RemoveFixtureInputSchema,
  RemovePipeRouteInputSchema,
  RemoveRiserInputSchema,
  RemoveRoomInputSchema,
  RemoveUnitInputSchema,
  SetActiveUnitInputSchema,
  SetProjectNameInputSchema,
  SetUnitBackgroundInputSchema,
  UpdateDuctRouteInputSchema,
  UpdateFixtureInputSchema,
  UpdatePipeRouteInputSchema,
  UpdateRiserInputSchema,
  UpdateRoomInputSchema,
  UpdateSettingsInputSchema,
  UpdateUnitBackgroundInputSchema,
  UpdateUnitInputSchema,
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

const stateReducer: StateReducer<HlskPlanPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_PROJECT_NAME": {
      memoizedSchema(SetProjectNameInputSchema).parse(action.input);

      hlskPlanCoreOperations.setProjectNameOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_ACTIVE_UNIT": {
      memoizedSchema(SetActiveUnitInputSchema).parse(action.input);

      hlskPlanCoreOperations.setActiveUnitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_UNIT": {
      memoizedSchema(AddUnitInputSchema).parse(action.input);

      hlskPlanCoreOperations.addUnitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_UNIT": {
      memoizedSchema(UpdateUnitInputSchema).parse(action.input);

      hlskPlanCoreOperations.updateUnitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_UNIT": {
      memoizedSchema(RemoveUnitInputSchema).parse(action.input);

      hlskPlanCoreOperations.removeUnitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_UNIT_BACKGROUND": {
      memoizedSchema(SetUnitBackgroundInputSchema).parse(action.input);

      hlskPlanCoreOperations.setUnitBackgroundOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_UNIT_BACKGROUND": {
      memoizedSchema(UpdateUnitBackgroundInputSchema).parse(action.input);

      hlskPlanCoreOperations.updateUnitBackgroundOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SETTINGS": {
      memoizedSchema(UpdateSettingsInputSchema).parse(action.input);

      hlskPlanCoreOperations.updateSettingsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_ROOM": {
      memoizedSchema(AddRoomInputSchema).parse(action.input);

      hlskPlanRoomsOperations.addRoomOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_ROOM": {
      memoizedSchema(UpdateRoomInputSchema).parse(action.input);

      hlskPlanRoomsOperations.updateRoomOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_ROOM": {
      memoizedSchema(RemoveRoomInputSchema).parse(action.input);

      hlskPlanRoomsOperations.removeRoomOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_FIXTURE": {
      memoizedSchema(AddFixtureInputSchema).parse(action.input);

      hlskPlanFixturesOperations.addFixtureOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_FIXTURE": {
      memoizedSchema(UpdateFixtureInputSchema).parse(action.input);

      hlskPlanFixturesOperations.updateFixtureOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_FIXTURE": {
      memoizedSchema(RemoveFixtureInputSchema).parse(action.input);

      hlskPlanFixturesOperations.removeFixtureOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_PIPE_ROUTE": {
      memoizedSchema(AddPipeRouteInputSchema).parse(action.input);

      hlskPlanPipesOperations.addPipeRouteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_PIPE_ROUTE": {
      memoizedSchema(UpdatePipeRouteInputSchema).parse(action.input);

      hlskPlanPipesOperations.updatePipeRouteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_PIPE_ROUTE": {
      memoizedSchema(RemovePipeRouteInputSchema).parse(action.input);

      hlskPlanPipesOperations.removePipeRouteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_DUCT_ROUTE": {
      memoizedSchema(AddDuctRouteInputSchema).parse(action.input);

      hlskPlanDuctsOperations.addDuctRouteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_DUCT_ROUTE": {
      memoizedSchema(UpdateDuctRouteInputSchema).parse(action.input);

      hlskPlanDuctsOperations.updateDuctRouteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_DUCT_ROUTE": {
      memoizedSchema(RemoveDuctRouteInputSchema).parse(action.input);

      hlskPlanDuctsOperations.removeDuctRouteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_RISER": {
      memoizedSchema(AddRiserInputSchema).parse(action.input);

      hlskPlanRisersOperations.addRiserOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_RISER": {
      memoizedSchema(UpdateRiserInputSchema).parse(action.input);

      hlskPlanRisersOperations.updateRiserOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_RISER": {
      memoizedSchema(RemoveRiserInputSchema).parse(action.input);

      hlskPlanRisersOperations.removeRiserOperation(
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

export const reducer: Reducer<HlskPlanPHState> = createReducer(stateReducer);
