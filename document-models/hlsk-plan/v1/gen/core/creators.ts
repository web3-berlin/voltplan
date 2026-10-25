/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddUnitInputSchema,
  RemoveUnitInputSchema,
  SetActiveUnitInputSchema,
  SetProjectNameInputSchema,
  SetUnitBackgroundInputSchema,
  UpdateSettingsInputSchema,
  UpdateUnitBackgroundInputSchema,
  UpdateUnitInputSchema,
} from "../schema/zod.js";
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

export const addUnit = (input: AddUnitInput) =>
  createAction<AddUnitAction>(
    "ADD_UNIT",
    { ...input },
    undefined,
    AddUnitInputSchema,
    "global",
  );

export const updateUnit = (input: UpdateUnitInput) =>
  createAction<UpdateUnitAction>(
    "UPDATE_UNIT",
    { ...input },
    undefined,
    UpdateUnitInputSchema,
    "global",
  );

export const removeUnit = (input: RemoveUnitInput) =>
  createAction<RemoveUnitAction>(
    "REMOVE_UNIT",
    { ...input },
    undefined,
    RemoveUnitInputSchema,
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
