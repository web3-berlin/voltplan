/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { baseActions } from "document-model";
import {
  electricalPlanCabinetKnxProtocolActions,
  electricalPlanCircuitsActions,
  electricalPlanInstallationPlanActions,
} from "./gen/creators.js";

/** Actions for the ElectricalPlan document model */

export const actions = {
  ...baseActions,
  ...electricalPlanInstallationPlanActions,
  ...electricalPlanCircuitsActions,
  ...electricalPlanCabinetKnxProtocolActions,
};
