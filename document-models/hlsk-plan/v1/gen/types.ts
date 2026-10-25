/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { HlskPlanAction } from "./actions.js";
import type { HlskPlanState as HlskPlanGlobalState } from "./schema/types.js";

type HlskPlanLocalState = Record<PropertyKey, never>;

type HlskPlanPHState = PHBaseState & {
  global: HlskPlanGlobalState;
  local: HlskPlanLocalState;
};
type HlskPlanDocument = PHDocument<HlskPlanPHState>;

export * from "./schema/types.js";

export type {
  HlskPlanAction,
  HlskPlanDocument,
  HlskPlanGlobalState,
  HlskPlanLocalState,
  HlskPlanPHState,
};
