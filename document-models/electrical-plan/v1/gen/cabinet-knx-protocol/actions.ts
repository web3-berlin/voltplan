/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddDistributorInput,
  PlanCabinetInput,
  SetGroupAddressesInput,
  UpdateDistributorInput,
  UpdateReportInput,
} from "../types.js";

export type AddDistributorAction = Action & {
  type: "ADD_DISTRIBUTOR";
  input: AddDistributorInput;
};
export type UpdateDistributorAction = Action & {
  type: "UPDATE_DISTRIBUTOR";
  input: UpdateDistributorInput;
};
export type PlanCabinetAction = Action & {
  type: "PLAN_CABINET";
  input: PlanCabinetInput;
};
export type SetGroupAddressesAction = Action & {
  type: "SET_GROUP_ADDRESSES";
  input: SetGroupAddressesInput;
};
export type UpdateReportAction = Action & {
  type: "UPDATE_REPORT";
  input: UpdateReportInput;
};

export type ElectricalPlanCabinetKnxProtocolAction =
  | AddDistributorAction
  | UpdateDistributorAction
  | PlanCabinetAction
  | SetGroupAddressesAction
  | UpdateReportAction;
