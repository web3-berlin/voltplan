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
import { hlskPlanUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsHlskPlanDocument,
  assertIsHlskPlanState,
  isHlskPlanDocument,
  isHlskPlanState,
} from "./document-schema.js";
import { hlskPlanDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  HlskPlanGlobalState,
  HlskPlanLocalState,
  HlskPlanPHState,
} from "./types.js";

export const initialGlobalState: HlskPlanGlobalState = {
  name: "Untitled HLSK Project",
  activeUnitId: "unit_1",
  nextFixtureNumber: 1,
  units: [
    {
      id: "unit_1",
      name: "Ground Floor",
      level: 0,
      background: null,
      rooms: [],
      fixtures: [],
      pipeRoutes: [],
      ductRoutes: [],
      risers: [],
    },
  ],
  settings: { showLabels: true, showMountHeights: false, pipeDiameterMm: 15 },
};
export const initialLocalState: HlskPlanLocalState = {};

export const utils: DocumentModelUtils<HlskPlanPHState> = {
  fileExtension: "hlsk",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(utils.createState, state, hlskPlanDocumentType);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: hlskPlanUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isHlskPlanState(state);
  },
  assertIsStateOfType(state) {
    return assertIsHlskPlanState(state);
  },
  isDocumentOfType(document) {
    return isHlskPlanDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsHlskPlanDocument(document);
  },
};
