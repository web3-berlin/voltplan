/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentModelUtils, PHBaseState, Reducer } from "document-model";
import {
  baseCreateDocument,
  baseLoadFromInputVersioned,
  baseSaveToFileHandle,
  createBaseState,
} from "document-model";
import { electricalPlanUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsElectricalPlanDocument,
  assertIsElectricalPlanState,
  isElectricalPlanDocument,
  isElectricalPlanState,
} from "./document-schema.js";
import { electricalPlanDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  ElectricalPlanGlobalState,
  ElectricalPlanLocalState,
  ElectricalPlanPHState,
} from "./types.js";

export const initialGlobalState: ElectricalPlanGlobalState = {
  name: "Untitled Project",
  units: [
    {
      id: "unit_1",
      name: "Ground Floor",
      level: 0,
      symbols: [],
      background: null,
      rooms: [],
    },
  ],
  circuits: [],
  distributors: [],
  cabinetDevices: [],
  groupAddresses: [],
  reports: [],
  settings: {
    symbolStyle: "simple",
    showCircuitBadges: true,
    showMountHeights: false,
  },
  nextCircuitNumber: 1,
  activeUnitId: "unit_1",
  routes: [],
};
export const initialLocalState: ElectricalPlanLocalState = {};

export const utils: DocumentModelUtils<ElectricalPlanPHState> = {
  fileExtension: "epl",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(
      utils.createState,
      state,
      electricalPlanDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: electricalPlanUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isElectricalPlanState(state);
  },
  assertIsStateOfType(state) {
    return assertIsElectricalPlanState(state);
  },
  isDocumentOfType(document) {
    return isElectricalPlanDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsElectricalPlanDocument(document);
  },
};
