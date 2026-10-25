/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { HlskPlanGlobalState } from "../types.js";
import type {
  AddRiserAction,
  RemoveRiserAction,
  UpdateRiserAction,
} from "./actions.js";

export interface HlskPlanRisersOperations {
  addRiserOperation: (
    state: HlskPlanGlobalState,
    action: AddRiserAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRiserOperation: (
    state: HlskPlanGlobalState,
    action: UpdateRiserAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRiserOperation: (
    state: HlskPlanGlobalState,
    action: RemoveRiserAction,
    dispatch?: SignalDispatch,
  ) => void;
}
