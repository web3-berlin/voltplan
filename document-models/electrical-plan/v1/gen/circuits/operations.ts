/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ElectricalPlanGlobalState } from "../types.js";
import type {
  AddCircuitAction,
  AddRouteAction,
  AssignSymbolCircuitAction,
  RemoveCircuitAction,
  RemoveRouteAction,
  UpdateCircuitAction,
  UpdateRouteAction,
} from "./actions.js";

export interface ElectricalPlanCircuitsOperations {
  addCircuitOperation: (
    state: ElectricalPlanGlobalState,
    action: AddCircuitAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateCircuitOperation: (
    state: ElectricalPlanGlobalState,
    action: UpdateCircuitAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeCircuitOperation: (
    state: ElectricalPlanGlobalState,
    action: RemoveCircuitAction,
    dispatch?: SignalDispatch,
  ) => void;
  assignSymbolCircuitOperation: (
    state: ElectricalPlanGlobalState,
    action: AssignSymbolCircuitAction,
    dispatch?: SignalDispatch,
  ) => void;
  addRouteOperation: (
    state: ElectricalPlanGlobalState,
    action: AddRouteAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRouteOperation: (
    state: ElectricalPlanGlobalState,
    action: UpdateRouteAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRouteOperation: (
    state: ElectricalPlanGlobalState,
    action: RemoveRouteAction,
    dispatch?: SignalDispatch,
  ) => void;
}
