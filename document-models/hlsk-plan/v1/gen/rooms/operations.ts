/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { HlskPlanGlobalState } from "../types.js";
import type {
  AddRoomAction,
  RemoveRoomAction,
  UpdateRoomAction,
} from "./actions.js";

export interface HlskPlanRoomsOperations {
  addRoomOperation: (
    state: HlskPlanGlobalState,
    action: AddRoomAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRoomOperation: (
    state: HlskPlanGlobalState,
    action: UpdateRoomAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRoomOperation: (
    state: HlskPlanGlobalState,
    action: RemoveRoomAction,
    dispatch?: SignalDispatch,
  ) => void;
}
