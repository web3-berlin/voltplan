/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddFixtureInputSchema,
  RemoveFixtureInputSchema,
  UpdateFixtureInputSchema,
} from "../schema/zod.js";
import type {
  AddFixtureInput,
  RemoveFixtureInput,
  UpdateFixtureInput,
} from "../types.js";
import type {
  AddFixtureAction,
  RemoveFixtureAction,
  UpdateFixtureAction,
} from "./actions.js";

export const addFixture = (input: AddFixtureInput) =>
  createAction<AddFixtureAction>(
    "ADD_FIXTURE",
    { ...input },
    undefined,
    AddFixtureInputSchema,
    "global",
  );

export const updateFixture = (input: UpdateFixtureInput) =>
  createAction<UpdateFixtureAction>(
    "UPDATE_FIXTURE",
    { ...input },
    undefined,
    UpdateFixtureInputSchema,
    "global",
  );

export const removeFixture = (input: RemoveFixtureInput) =>
  createAction<RemoveFixtureAction>(
    "REMOVE_FIXTURE",
    { ...input },
    undefined,
    RemoveFixtureInputSchema,
    "global",
  );
