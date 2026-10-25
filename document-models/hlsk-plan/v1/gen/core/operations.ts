/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { HlskPlanGlobalState } from "../types.js";
import type {
  AddUnitAction,
  RemoveUnitAction,
  SetActiveUnitAction,
  SetProjectNameAction,
  SetUnitBackgroundAction,
  UpdateSettingsAction,
  UpdateUnitAction,
  UpdateUnitBackgroundAction,
} from "./actions.js";

export interface HlskPlanCoreOperations {
  setProjectNameOperation: (
    state: HlskPlanGlobalState,
    action: SetProjectNameAction,
    dispatch?: SignalDispatch,
  ) => void;
  setActiveUnitOperation: (
    state: HlskPlanGlobalState,
    action: SetActiveUnitAction,
    dispatch?: SignalDispatch,
  ) => void;
  addUnitOperation: (
    state: HlskPlanGlobalState,
    action: AddUnitAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateUnitOperation: (
    state: HlskPlanGlobalState,
    action: UpdateUnitAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeUnitOperation: (
    state: HlskPlanGlobalState,
    action: RemoveUnitAction,
    dispatch?: SignalDispatch,
  ) => void;
  setUnitBackgroundOperation: (
    state: HlskPlanGlobalState,
    action: SetUnitBackgroundAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateUnitBackgroundOperation: (
    state: HlskPlanGlobalState,
    action: UpdateUnitBackgroundAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateSettingsOperation: (
    state: HlskPlanGlobalState,
    action: UpdateSettingsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
