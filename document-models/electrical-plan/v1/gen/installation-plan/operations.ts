/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ElectricalPlanGlobalState } from "../types.js";
import type {
  AddRoomAction,
  AddSymbolAction,
  AddUnitAction,
  MoveSymbolAction,
  RemoveRoomAction,
  RemoveSymbolAction,
  RenameUnitAction,
  SetActiveUnitAction,
  SetProjectNameAction,
  SetUnitBackgroundAction,
  UpdateRoomAction,
  UpdateSettingsAction,
  UpdateSymbolAction,
  UpdateSymbolDetailsAction,
  UpdateUnitBackgroundAction,
} from "./actions.js";

export interface ElectricalPlanInstallationPlanOperations {
  addUnitOperation: (
    state: ElectricalPlanGlobalState,
    action: AddUnitAction,
    dispatch?: SignalDispatch,
  ) => void;
  renameUnitOperation: (
    state: ElectricalPlanGlobalState,
    action: RenameUnitAction,
    dispatch?: SignalDispatch,
  ) => void;
  addRoomOperation: (
    state: ElectricalPlanGlobalState,
    action: AddRoomAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRoomOperation: (
    state: ElectricalPlanGlobalState,
    action: UpdateRoomAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRoomOperation: (
    state: ElectricalPlanGlobalState,
    action: RemoveRoomAction,
    dispatch?: SignalDispatch,
  ) => void;
  addSymbolOperation: (
    state: ElectricalPlanGlobalState,
    action: AddSymbolAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateSymbolOperation: (
    state: ElectricalPlanGlobalState,
    action: UpdateSymbolAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateSymbolDetailsOperation: (
    state: ElectricalPlanGlobalState,
    action: UpdateSymbolDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
  moveSymbolOperation: (
    state: ElectricalPlanGlobalState,
    action: MoveSymbolAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeSymbolOperation: (
    state: ElectricalPlanGlobalState,
    action: RemoveSymbolAction,
    dispatch?: SignalDispatch,
  ) => void;
  setProjectNameOperation: (
    state: ElectricalPlanGlobalState,
    action: SetProjectNameAction,
    dispatch?: SignalDispatch,
  ) => void;
  setActiveUnitOperation: (
    state: ElectricalPlanGlobalState,
    action: SetActiveUnitAction,
    dispatch?: SignalDispatch,
  ) => void;
  setUnitBackgroundOperation: (
    state: ElectricalPlanGlobalState,
    action: SetUnitBackgroundAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateUnitBackgroundOperation: (
    state: ElectricalPlanGlobalState,
    action: UpdateUnitBackgroundAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateSettingsOperation: (
    state: ElectricalPlanGlobalState,
    action: UpdateSettingsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
