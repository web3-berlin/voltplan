/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { HlskPlanGlobalState } from "../types.js";
import type {
  AddDuctRouteAction,
  RemoveDuctRouteAction,
  UpdateDuctRouteAction,
} from "./actions.js";

export interface HlskPlanDuctsOperations {
  addDuctRouteOperation: (
    state: HlskPlanGlobalState,
    action: AddDuctRouteAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateDuctRouteOperation: (
    state: HlskPlanGlobalState,
    action: UpdateDuctRouteAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeDuctRouteOperation: (
    state: HlskPlanGlobalState,
    action: RemoveDuctRouteAction,
    dispatch?: SignalDispatch,
  ) => void;
}
