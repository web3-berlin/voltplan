/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { HlskPlanGlobalState } from "../types.js";
import type {
  AddFixtureAction,
  RemoveFixtureAction,
  UpdateFixtureAction,
} from "./actions.js";

export interface HlskPlanFixturesOperations {
  addFixtureOperation: (
    state: HlskPlanGlobalState,
    action: AddFixtureAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateFixtureOperation: (
    state: HlskPlanGlobalState,
    action: UpdateFixtureAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFixtureOperation: (
    state: HlskPlanGlobalState,
    action: RemoveFixtureAction,
    dispatch?: SignalDispatch,
  ) => void;
}
