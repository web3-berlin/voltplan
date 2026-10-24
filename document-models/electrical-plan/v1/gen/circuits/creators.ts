/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddCircuitInputSchema,
  AddRouteInputSchema,
  AssignSymbolCircuitInputSchema,
  RemoveCircuitInputSchema,
  RemoveRouteInputSchema,
  UpdateCircuitInputSchema,
  UpdateRouteInputSchema,
} from "../schema/zod.js";
import type {
  AddCircuitInput,
  AddRouteInput,
  AssignSymbolCircuitInput,
  RemoveCircuitInput,
  RemoveRouteInput,
  UpdateCircuitInput,
  UpdateRouteInput,
} from "../types.js";
import type {
  AddCircuitAction,
  AddRouteAction,
  AssignSymbolCircuitAction,
  RemoveCircuitAction,
  RemoveRouteAction,
  UpdateCircuitAction,
  UpdateRouteAction,
} from "./actions.js";

export const addCircuit = (input: AddCircuitInput) =>
  createAction<AddCircuitAction>(
    "ADD_CIRCUIT",
    { ...input },
    undefined,
    AddCircuitInputSchema,
    "global",
  );

export const updateCircuit = (input: UpdateCircuitInput) =>
  createAction<UpdateCircuitAction>(
    "UPDATE_CIRCUIT",
    { ...input },
    undefined,
    UpdateCircuitInputSchema,
    "global",
  );

export const removeCircuit = (input: RemoveCircuitInput) =>
  createAction<RemoveCircuitAction>(
    "REMOVE_CIRCUIT",
    { ...input },
    undefined,
    RemoveCircuitInputSchema,
    "global",
  );

export const assignSymbolCircuit = (input: AssignSymbolCircuitInput) =>
  createAction<AssignSymbolCircuitAction>(
    "ASSIGN_SYMBOL_CIRCUIT",
    { ...input },
    undefined,
    AssignSymbolCircuitInputSchema,
    "global",
  );

export const addRoute = (input: AddRouteInput) =>
  createAction<AddRouteAction>(
    "ADD_ROUTE",
    { ...input },
    undefined,
    AddRouteInputSchema,
    "global",
  );

export const updateRoute = (input: UpdateRouteInput) =>
  createAction<UpdateRouteAction>(
    "UPDATE_ROUTE",
    { ...input },
    undefined,
    UpdateRouteInputSchema,
    "global",
  );

export const removeRoute = (input: RemoveRouteInput) =>
  createAction<RemoveRouteAction>(
    "REMOVE_ROUTE",
    { ...input },
    undefined,
    RemoveRouteInputSchema,
    "global",
  );
