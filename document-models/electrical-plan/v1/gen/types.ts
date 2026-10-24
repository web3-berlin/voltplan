/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { ElectricalPlanAction } from "./actions.js";
import type { ElectricalPlanState as ElectricalPlanGlobalState } from "./schema/types.js";

type ElectricalPlanLocalState = Record<PropertyKey, never>;

type ElectricalPlanPHState = PHBaseState & {
  global: ElectricalPlanGlobalState;
  local: ElectricalPlanLocalState;
};
type ElectricalPlanDocument = PHDocument<ElectricalPlanPHState>;

export * from "./schema/types.js";

export type {
  ElectricalPlanAction,
  ElectricalPlanDocument,
  ElectricalPlanGlobalState,
  ElectricalPlanLocalState,
  ElectricalPlanPHState,
};
