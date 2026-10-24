/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ElectricalPlanGlobalState } from "../types.js";
import type {
  AddDistributorAction,
  PlanCabinetAction,
  SetGroupAddressesAction,
  UpdateDistributorAction,
  UpdateReportAction,
} from "./actions.js";

export interface ElectricalPlanCabinetKnxProtocolOperations {
  addDistributorOperation: (
    state: ElectricalPlanGlobalState,
    action: AddDistributorAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateDistributorOperation: (
    state: ElectricalPlanGlobalState,
    action: UpdateDistributorAction,
    dispatch?: SignalDispatch,
  ) => void;
  planCabinetOperation: (
    state: ElectricalPlanGlobalState,
    action: PlanCabinetAction,
    dispatch?: SignalDispatch,
  ) => void;
  setGroupAddressesOperation: (
    state: ElectricalPlanGlobalState,
    action: SetGroupAddressesAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateReportOperation: (
    state: ElectricalPlanGlobalState,
    action: UpdateReportAction,
    dispatch?: SignalDispatch,
  ) => void;
}
