/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddFixtureInput,
  RemoveFixtureInput,
  UpdateFixtureInput,
} from "../types.js";

export type AddFixtureAction = Action & {
  type: "ADD_FIXTURE";
  input: AddFixtureInput;
};
export type UpdateFixtureAction = Action & {
  type: "UPDATE_FIXTURE";
  input: UpdateFixtureInput;
};
export type RemoveFixtureAction = Action & {
  type: "REMOVE_FIXTURE";
  input: RemoveFixtureInput;
};

export type HlskPlanFixturesAction =
  | AddFixtureAction
  | UpdateFixtureAction
  | RemoveFixtureAction;
