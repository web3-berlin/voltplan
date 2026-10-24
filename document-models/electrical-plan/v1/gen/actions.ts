/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { ElectricalPlanCabinetKnxProtocolAction } from "./cabinet-knx-protocol/actions.js";
import type { ElectricalPlanCircuitsAction } from "./circuits/actions.js";
import type { ElectricalPlanInstallationPlanAction } from "./installation-plan/actions.js";

export * from "./cabinet-knx-protocol/actions.js";
export * from "./circuits/actions.js";
export * from "./installation-plan/actions.js";

export type ElectricalPlanAction =
  | ElectricalPlanInstallationPlanAction
  | ElectricalPlanCircuitsAction
  | ElectricalPlanCabinetKnxProtocolAction;
