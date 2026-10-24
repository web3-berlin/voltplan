/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddRoomInput,
  AddSymbolInput,
  AddUnitInput,
  MoveSymbolInput,
  RemoveRoomInput,
  RemoveSymbolInput,
  RenameUnitInput,
  SetActiveUnitInput,
  SetProjectNameInput,
  SetUnitBackgroundInput,
  UpdateRoomInput,
  UpdateSettingsInput,
  UpdateSymbolDetailsInput,
  UpdateSymbolInput,
  UpdateUnitBackgroundInput,
} from "../types.js";

export type AddUnitAction = Action & { type: "ADD_UNIT"; input: AddUnitInput };
export type RenameUnitAction = Action & {
  type: "RENAME_UNIT";
  input: RenameUnitInput;
};
export type AddRoomAction = Action & { type: "ADD_ROOM"; input: AddRoomInput };
export type UpdateRoomAction = Action & {
  type: "UPDATE_ROOM";
  input: UpdateRoomInput;
};
export type RemoveRoomAction = Action & {
  type: "REMOVE_ROOM";
  input: RemoveRoomInput;
};
export type AddSymbolAction = Action & {
  type: "ADD_SYMBOL";
  input: AddSymbolInput;
};
export type UpdateSymbolAction = Action & {
  type: "UPDATE_SYMBOL";
  input: UpdateSymbolInput;
};
export type UpdateSymbolDetailsAction = Action & {
  type: "UPDATE_SYMBOL_DETAILS";
  input: UpdateSymbolDetailsInput;
};
export type MoveSymbolAction = Action & {
  type: "MOVE_SYMBOL";
  input: MoveSymbolInput;
};
export type RemoveSymbolAction = Action & {
  type: "REMOVE_SYMBOL";
  input: RemoveSymbolInput;
};
export type SetProjectNameAction = Action & {
  type: "SET_PROJECT_NAME";
  input: SetProjectNameInput;
};
export type SetActiveUnitAction = Action & {
  type: "SET_ACTIVE_UNIT";
  input: SetActiveUnitInput;
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

export type ElectricalPlanInstallationPlanAction =
  | AddUnitAction
  | RenameUnitAction
  | AddRoomAction
  | UpdateRoomAction
  | RemoveRoomAction
  | AddSymbolAction
  | UpdateSymbolAction
  | UpdateSymbolDetailsAction
  | MoveSymbolAction
  | RemoveSymbolAction
  | SetProjectNameAction
  | SetActiveUnitAction
  | SetUnitBackgroundAction
  | UpdateUnitBackgroundAction
  | UpdateSettingsAction;
