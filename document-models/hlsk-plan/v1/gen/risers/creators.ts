/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddRiserInputSchema,
  RemoveRiserInputSchema,
  UpdateRiserInputSchema,
} from "../schema/zod.js";
import type {
  AddRiserInput,
  RemoveRiserInput,
  UpdateRiserInput,
} from "../types.js";
import type {
  AddRiserAction,
  RemoveRiserAction,
  UpdateRiserAction,
} from "./actions.js";

export const addRiser = (input: AddRiserInput) =>
  createAction<AddRiserAction>(
    "ADD_RISER",
    { ...input },
    undefined,
    AddRiserInputSchema,
    "global",
  );

export const updateRiser = (input: UpdateRiserInput) =>
  createAction<UpdateRiserAction>(
    "UPDATE_RISER",
    { ...input },
    undefined,
    UpdateRiserInputSchema,
    "global",
  );

export const removeRiser = (input: RemoveRiserInput) =>
  createAction<RemoveRiserAction>(
    "REMOVE_RISER",
    { ...input },
    undefined,
    RemoveRiserInputSchema,
    "global",
  );
