/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating ElectricalPlanDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  ElectricalPlanDocument,
  ElectricalPlanGlobalState,
  ElectricalPlanLocalState,
  ElectricalPlanPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): ElectricalPlanGlobalState {
  return {
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
}

export function defaultLocalState(): ElectricalPlanLocalState {
  return {};
}

export function defaultPHState(): ElectricalPlanPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<ElectricalPlanGlobalState>,
): ElectricalPlanGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<ElectricalPlanLocalState>,
): ElectricalPlanLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as ElectricalPlanLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<ElectricalPlanGlobalState>,
  localState?: Partial<ElectricalPlanLocalState>,
): ElectricalPlanPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a ElectricalPlanDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createElectricalPlanDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<ElectricalPlanGlobalState>;
    local?: Partial<ElectricalPlanLocalState>;
  }>,
): ElectricalPlanDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
