/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddCircuitInput,
  AddRouteInput,
  AssignSymbolCircuitInput,
  RemoveCircuitInput,
  RemoveRouteInput,
  UpdateCircuitInput,
  UpdateRouteInput,
} from "../types.js";

export type AddCircuitAction = Action & {
  type: "ADD_CIRCUIT";
  input: AddCircuitInput;
};
export type UpdateCircuitAction = Action & {
  type: "UPDATE_CIRCUIT";
  input: UpdateCircuitInput;
};
export type RemoveCircuitAction = Action & {
  type: "REMOVE_CIRCUIT";
  input: RemoveCircuitInput;
};
export type AssignSymbolCircuitAction = Action & {
  type: "ASSIGN_SYMBOL_CIRCUIT";
  input: AssignSymbolCircuitInput;
};
export type AddRouteAction = Action & {
  type: "ADD_ROUTE";
  input: AddRouteInput;
};
export type UpdateRouteAction = Action & {
  type: "UPDATE_ROUTE";
  input: UpdateRouteInput;
};
export type RemoveRouteAction = Action & {
  type: "REMOVE_ROUTE";
  input: RemoveRouteInput;
};

export type ElectricalPlanCircuitsAction =
  | AddCircuitAction
  | UpdateCircuitAction
  | RemoveCircuitAction
  | AssignSymbolCircuitAction
  | AddRouteAction
  | UpdateRouteAction
  | RemoveRouteAction;
