/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddUnitInput,
  RemoveUnitInput,
  SetActiveUnitInput,
  SetProjectNameInput,
  SetUnitBackgroundInput,
  UpdateSettingsInput,
  UpdateUnitBackgroundInput,
  UpdateUnitInput,
} from "../types.js";

export type SetProjectNameAction = Action & {
  type: "SET_PROJECT_NAME";
  input: SetProjectNameInput;
};
export type SetActiveUnitAction = Action & {
  type: "SET_ACTIVE_UNIT";
  input: SetActiveUnitInput;
};
export type AddUnitAction = Action & { type: "ADD_UNIT"; input: AddUnitInput };
export type UpdateUnitAction = Action & {
  type: "UPDATE_UNIT";
  input: UpdateUnitInput;
};
export type RemoveUnitAction = Action & {
  type: "REMOVE_UNIT";
  input: RemoveUnitInput;
};
export type SetUnitBackgroundAction = Action & {
  type: "SET_UNIT_BACKGROUND";
  input: SetUnitBackgroundInput;
};
export type UpdateUnitBackgroundAction = Action & {
  type: "UPDATE_UNIT_BACKGROUND";
  input: UpdateUnitBackgroundInput;
};
export type UpdateSettingsAction = Action & {
  type: "UPDATE_SETTINGS";
  input: UpdateSettingsInput;
};

export type HlskPlanCoreAction =
  | SetProjectNameAction
  | SetActiveUnitAction
  | AddUnitAction
  | UpdateUnitAction
  | RemoveUnitAction
  | SetUnitBackgroundAction
  | UpdateUnitBackgroundAction
  | UpdateSettingsAction;
