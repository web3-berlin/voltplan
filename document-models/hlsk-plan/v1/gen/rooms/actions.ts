/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddRoomInput,
  RemoveRoomInput,
  UpdateRoomInput,
} from "../types.js";

export type AddRoomAction = Action & { type: "ADD_ROOM"; input: AddRoomInput };
export type UpdateRoomAction = Action & {
  type: "UPDATE_ROOM";
  input: UpdateRoomInput;
};
export type RemoveRoomAction = Action & {
  type: "REMOVE_ROOM";
  input: RemoveRoomInput;
};

export type HlskPlanRoomsAction =
  | AddRoomAction
  | UpdateRoomAction
  | RemoveRoomAction;
