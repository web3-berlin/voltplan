/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddRoomInputSchema,
  RemoveRoomInputSchema,
  UpdateRoomInputSchema,
} from "../schema/zod.js";
import type {
  AddRoomInput,
  RemoveRoomInput,
  UpdateRoomInput,
} from "../types.js";
import type {
  AddRoomAction,
  RemoveRoomAction,
  UpdateRoomAction,
} from "./actions.js";

export const addRoom = (input: AddRoomInput) =>
  createAction<AddRoomAction>(
    "ADD_ROOM",
    { ...input },
    undefined,
    AddRoomInputSchema,
    "global",
  );

export const updateRoom = (input: UpdateRoomInput) =>
  createAction<UpdateRoomAction>(
    "UPDATE_ROOM",
    { ...input },
    undefined,
    UpdateRoomInputSchema,
    "global",
  );

export const removeRoom = (input: RemoveRoomInput) =>
  createAction<RemoveRoomAction>(
    "REMOVE_ROOM",
    { ...input },
    undefined,
    RemoveRoomInputSchema,
    "global",
  );
