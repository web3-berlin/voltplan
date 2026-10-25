/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddRiserInput,
  RemoveRiserInput,
  UpdateRiserInput,
} from "../types.js";

export type AddRiserAction = Action & {
  type: "ADD_RISER";
  input: AddRiserInput;
};
export type UpdateRiserAction = Action & {
  type: "UPDATE_RISER";
  input: UpdateRiserInput;
};
export type RemoveRiserAction = Action & {
  type: "REMOVE_RISER";
  input: RemoveRiserInput;
};

export type HlskPlanRisersAction =
  | AddRiserAction
  | UpdateRiserAction
  | RemoveRiserAction;
