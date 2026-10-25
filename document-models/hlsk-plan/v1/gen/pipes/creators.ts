/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddPipeRouteInputSchema,
  RemovePipeRouteInputSchema,
  UpdatePipeRouteInputSchema,
} from "../schema/zod.js";
import type {
  AddPipeRouteInput,
  RemovePipeRouteInput,
  UpdatePipeRouteInput,
} from "../types.js";
import type {
  AddPipeRouteAction,
  RemovePipeRouteAction,
  UpdatePipeRouteAction,
} from "./actions.js";

export const addPipeRoute = (input: AddPipeRouteInput) =>
  createAction<AddPipeRouteAction>(
    "ADD_PIPE_ROUTE",
    { ...input },
    undefined,
    AddPipeRouteInputSchema,
    "global",
  );

export const updatePipeRoute = (input: UpdatePipeRouteInput) =>
  createAction<UpdatePipeRouteAction>(
    "UPDATE_PIPE_ROUTE",
    { ...input },
    undefined,
    UpdatePipeRouteInputSchema,
    "global",
  );

export const removePipeRoute = (input: RemovePipeRouteInput) =>
  createAction<RemovePipeRouteAction>(
    "REMOVE_PIPE_ROUTE",
    { ...input },
    undefined,
    RemovePipeRouteInputSchema,
    "global",
  );
