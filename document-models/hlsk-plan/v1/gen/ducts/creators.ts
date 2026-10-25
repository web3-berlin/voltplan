/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddDuctRouteInputSchema,
  RemoveDuctRouteInputSchema,
  UpdateDuctRouteInputSchema,
} from "../schema/zod.js";
import type {
  AddDuctRouteInput,
  RemoveDuctRouteInput,
  UpdateDuctRouteInput,
} from "../types.js";
import type {
  AddDuctRouteAction,
  RemoveDuctRouteAction,
  UpdateDuctRouteAction,
} from "./actions.js";

export const addDuctRoute = (input: AddDuctRouteInput) =>
  createAction<AddDuctRouteAction>(
    "ADD_DUCT_ROUTE",
    { ...input },
    undefined,
    AddDuctRouteInputSchema,
    "global",
  );

export const updateDuctRoute = (input: UpdateDuctRouteInput) =>
  createAction<UpdateDuctRouteAction>(
    "UPDATE_DUCT_ROUTE",
    { ...input },
    undefined,
    UpdateDuctRouteInputSchema,
    "global",
  );

export const removeDuctRoute = (input: RemoveDuctRouteInput) =>
  createAction<RemoveDuctRouteAction>(
    "REMOVE_DUCT_ROUTE",
    { ...input },
    undefined,
    RemoveDuctRouteInputSchema,
    "global",
  );
