/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { HlskPlanGlobalState } from "../types.js";
import type {
  AddPipeRouteAction,
  RemovePipeRouteAction,
  UpdatePipeRouteAction,
} from "./actions.js";

export interface HlskPlanPipesOperations {
  addPipeRouteOperation: (
    state: HlskPlanGlobalState,
    action: AddPipeRouteAction,
    dispatch?: SignalDispatch,
  ) => void;
  updatePipeRouteOperation: (
    state: HlskPlanGlobalState,
    action: UpdatePipeRouteAction,
    dispatch?: SignalDispatch,
  ) => void;
  removePipeRouteOperation: (
    state: HlskPlanGlobalState,
    action: RemovePipeRouteAction,
    dispatch?: SignalDispatch,
  ) => void;
}
