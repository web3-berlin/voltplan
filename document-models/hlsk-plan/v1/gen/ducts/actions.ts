/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddDuctRouteInput,
  RemoveDuctRouteInput,
  UpdateDuctRouteInput,
} from "../types.js";

export type AddDuctRouteAction = Action & {
  type: "ADD_DUCT_ROUTE";
  input: AddDuctRouteInput;
};
export type UpdateDuctRouteAction = Action & {
  type: "UPDATE_DUCT_ROUTE";
  input: UpdateDuctRouteInput;
};
export type RemoveDuctRouteAction = Action & {
  type: "REMOVE_DUCT_ROUTE";
  input: RemoveDuctRouteInput;
};

export type HlskPlanDuctsAction =
  | AddDuctRouteAction
  | UpdateDuctRouteAction
  | RemoveDuctRouteAction;
