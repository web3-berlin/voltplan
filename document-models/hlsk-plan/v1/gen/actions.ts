/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { HlskPlanCoreAction } from "./core/actions.js";
import type { HlskPlanDuctsAction } from "./ducts/actions.js";
import type { HlskPlanFixturesAction } from "./fixtures/actions.js";
import type { HlskPlanPipesAction } from "./pipes/actions.js";
import type { HlskPlanRisersAction } from "./risers/actions.js";
import type { HlskPlanRoomsAction } from "./rooms/actions.js";

export * from "./core/actions.js";
export * from "./ducts/actions.js";
export * from "./fixtures/actions.js";
export * from "./pipes/actions.js";
export * from "./risers/actions.js";
export * from "./rooms/actions.js";

export type HlskPlanAction =
  | HlskPlanCoreAction
  | HlskPlanRoomsAction
  | HlskPlanFixturesAction
  | HlskPlanPipesAction
  | HlskPlanDuctsAction
  | HlskPlanRisersAction;
