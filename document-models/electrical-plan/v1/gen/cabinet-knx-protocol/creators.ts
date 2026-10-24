/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddDistributorInputSchema,
  PlanCabinetInputSchema,
  SetGroupAddressesInputSchema,
  UpdateDistributorInputSchema,
  UpdateReportInputSchema,
} from "../schema/zod.js";
import type {
  AddDistributorInput,
  PlanCabinetInput,
  SetGroupAddressesInput,
  UpdateDistributorInput,
  UpdateReportInput,
} from "../types.js";
import type {
  AddDistributorAction,
  PlanCabinetAction,
  SetGroupAddressesAction,
  UpdateDistributorAction,
  UpdateReportAction,
} from "./actions.js";

export const addDistributor = (input: AddDistributorInput) =>
  createAction<AddDistributorAction>(
    "ADD_DISTRIBUTOR",
    { ...input },
    undefined,
    AddDistributorInputSchema,
    "global",
  );

export const updateDistributor = (input: UpdateDistributorInput) =>
  createAction<UpdateDistributorAction>(
    "UPDATE_DISTRIBUTOR",
    { ...input },
    undefined,
    UpdateDistributorInputSchema,
    "global",
  );

export const planCabinet = (input: PlanCabinetInput) =>
  createAction<PlanCabinetAction>(
    "PLAN_CABINET",
    { ...input },
    undefined,
    PlanCabinetInputSchema,
    "global",
  );

export const setGroupAddresses = (input: SetGroupAddressesInput) =>
  createAction<SetGroupAddressesAction>(
    "SET_GROUP_ADDRESSES",
    { ...input },
    undefined,
    SetGroupAddressesInputSchema,
    "global",
  );

export const updateReport = (input: UpdateReportInput) =>
  createAction<UpdateReportAction>(
    "UPDATE_REPORT",
    { ...input },
    undefined,
    UpdateReportInputSchema,
    "global",
  );
