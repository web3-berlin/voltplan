/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddRoomInputSchema,
  AddSymbolInputSchema,
  AddUnitInputSchema,
  MoveSymbolInputSchema,
  RemoveRoomInputSchema,
  RemoveSymbolInputSchema,
  RenameUnitInputSchema,
  SetActiveUnitInputSchema,
  SetProjectNameInputSchema,
  SetUnitBackgroundInputSchema,
  UpdateRoomInputSchema,
  UpdateSettingsInputSchema,
  UpdateSymbolDetailsInputSchema,
  UpdateSymbolInputSchema,
  UpdateUnitBackgroundInputSchema,
} from "../schema/zod.js";
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

export const addUnit = (input: AddUnitInput) =>
  createAction<AddUnitAction>(
    "ADD_UNIT",
    { ...input },
    undefined,
    AddUnitInputSchema,
    "global",
  );

export const renameUnit = (input: RenameUnitInput) =>
  createAction<RenameUnitAction>(
    "RENAME_UNIT",
    { ...input },
    undefined,
    RenameUnitInputSchema,
    "global",
  );

export const addRoom = (input: AddRoomInput) =>
  createAction<AddRoomAction>(
    "ADD_ROOM",
    { ...input },
    undefined,
    AddRoomInputSchema,
    "global",
  );

export const updateRoom = (input: UpdateRoomInput) =>
  createAction<UpdateRoomAction>(
    "UPDATE_ROOM",
    { ...input },
    undefined,
    UpdateRoomInputSchema,
    "global",
  );

export const removeRoom = (input: RemoveRoomInput) =>
  createAction<RemoveRoomAction>(
    "REMOVE_ROOM",
    { ...input },
    undefined,
    RemoveRoomInputSchema,
    "global",
  );

export const addSymbol = (input: AddSymbolInput) =>
  createAction<AddSymbolAction>(
    "ADD_SYMBOL",
    { ...input },
    undefined,
    AddSymbolInputSchema,
    "global",
  );

export const updateSymbol = (input: UpdateSymbolInput) =>
  createAction<UpdateSymbolAction>(
    "UPDATE_SYMBOL",
    { ...input },
    undefined,
    UpdateSymbolInputSchema,
    "global",
  );

export const updateSymbolDetails = (input: UpdateSymbolDetailsInput) =>
  createAction<UpdateSymbolDetailsAction>(
    "UPDATE_SYMBOL_DETAILS",
    { ...input },
    undefined,
    UpdateSymbolDetailsInputSchema,
    "global",
  );

export const moveSymbol = (input: MoveSymbolInput) =>
  createAction<MoveSymbolAction>(
    "MOVE_SYMBOL",
    { ...input },
    undefined,
    MoveSymbolInputSchema,
    "global",
  );

export const removeSymbol = (input: RemoveSymbolInput) =>
  createAction<RemoveSymbolAction>(
    "REMOVE_SYMBOL",
    { ...input },
    undefined,
    RemoveSymbolInputSchema,
    "global",
  );

export const setProjectName = (input: SetProjectNameInput) =>
  createAction<SetProjectNameAction>(
    "SET_PROJECT_NAME",
    { ...input },
    undefined,
    SetProjectNameInputSchema,
    "global",
  );

export const setActiveUnit = (input: SetActiveUnitInput) =>
  createAction<SetActiveUnitAction>(
    "SET_ACTIVE_UNIT",
    { ...input },
    undefined,
    SetActiveUnitInputSchema,
    "global",
  );

export const setUnitBackground = (input: SetUnitBackgroundInput) =>
  createAction<SetUnitBackgroundAction>(
    "SET_UNIT_BACKGROUND",
    { ...input },
    undefined,
    SetUnitBackgroundInputSchema,
    "global",
  );

export const updateUnitBackground = (input: UpdateUnitBackgroundInput) =>
  createAction<UpdateUnitBackgroundAction>(
    "UPDATE_UNIT_BACKGROUND",
    { ...input },
    undefined,
    UpdateUnitBackgroundInputSchema,
    "global",
  );

export const updateSettings = (input: UpdateSettingsInput) =>
  createAction<UpdateSettingsAction>(
    "UPDATE_SETTINGS",
    { ...input },
    undefined,
    UpdateSettingsInputSchema,
    "global",
  );
