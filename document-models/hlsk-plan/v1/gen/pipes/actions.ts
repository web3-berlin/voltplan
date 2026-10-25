/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddPipeRouteInput,
  RemovePipeRouteInput,
  UpdatePipeRouteInput,
} from "../types.js";

export type AddPipeRouteAction = Action & {
  type: "ADD_PIPE_ROUTE";
  input: AddPipeRouteInput;
};
export type UpdatePipeRouteAction = Action & {
  type: "UPDATE_PIPE_ROUTE";
  input: UpdatePipeRouteInput;
};
export type RemovePipeRouteAction = Action & {
  type: "REMOVE_PIPE_ROUTE";
  input: RemovePipeRouteInput;
};

export type HlskPlanPipesAction =
  | AddPipeRouteAction
  | UpdatePipeRouteAction
  | RemovePipeRouteAction;
