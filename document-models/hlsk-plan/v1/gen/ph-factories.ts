/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating HlskPlanDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  HlskPlanDocument,
  HlskPlanGlobalState,
  HlskPlanLocalState,
  HlskPlanPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): HlskPlanGlobalState {
  return {
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
}

export function defaultLocalState(): HlskPlanLocalState {
  return {};
}

export function defaultPHState(): HlskPlanPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<HlskPlanGlobalState>,
): HlskPlanGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<HlskPlanLocalState>,
): HlskPlanLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as HlskPlanLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<HlskPlanGlobalState>,
  localState?: Partial<HlskPlanLocalState>,
): HlskPlanPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a HlskPlanDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createHlskPlanDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<HlskPlanGlobalState>;
    local?: Partial<HlskPlanLocalState>;
  }>,
): HlskPlanDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
