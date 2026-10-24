export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Address: { input: `${string}:0x${string}`; output: `${string}:0x${string}` };
  Amount: {
    input: { unit?: string; value?: number };
    output: { unit?: string; value?: number };
  };
  Amount_Crypto: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Currency: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Fiat: {
    input: { unit: string; value: number };
    output: { unit: string; value: number };
  };
  Amount_Money: { input: number; output: number };
  Amount_Percentage: { input: number; output: number };
  Amount_Tokens: { input: number; output: number };
  AttachmentRef: {
    input: `attachment://v${number}:${string}`;
    output: `attachment://v${number}:${string}`;
  };
  Currency: { input: string; output: string };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  EmailAddress: { input: string; output: string };
  EthereumAddress: { input: string; output: string };
  OID: { input: string; output: string };
  OLabel: { input: string; output: string };
  PHID: { input: string; output: string };
  URL: { input: string; output: string };
  Unknown: { input: unknown; output: unknown };
  Upload: { input: File; output: File };
};

export type AddCircuitInput = {
  circuit: CircuitInput;
};

export type AddDistributorInput = {
  distributor: DistributorInput;
};

export type AddRoomInput = {
  room: RoomInput;
  unitId: Scalars["OID"]["input"];
};

export type AddRouteInput = {
  route: CableRouteInput;
};

export type AddSymbolInput = {
  symbol: SymbolInput;
  unitId: Scalars["OID"]["input"];
};

export type AddUnitInput = {
  id: Scalars["OID"]["input"];
  level: Scalars["Int"]["input"];
  name: Scalars["String"]["input"];
};

export type AssignSymbolCircuitInput = {
  circuitId?: InputMaybe<Scalars["OID"]["input"]>;
  symbolId: Scalars["OID"]["input"];
  unitId: Scalars["OID"]["input"];
};

export type BackgroundInput = {
  dataUrl?: InputMaybe<Scalars["String"]["input"]>;
  heightCm?: InputMaybe<Scalars["Float"]["input"]>;
  locked: Scalars["Boolean"]["input"];
  opacity: Scalars["Float"]["input"];
  rotation: Scalars["Float"]["input"];
  scale: Scalars["Float"]["input"];
  widthCm?: InputMaybe<Scalars["Float"]["input"]>;
  x: Scalars["Float"]["input"];
  y: Scalars["Float"]["input"];
};

export type BreakerInput = {
  characteristic: Scalars["String"]["input"];
  poles: Scalars["Int"]["input"];
  ratingA: Scalars["Float"]["input"];
  rcbo?: InputMaybe<Scalars["Boolean"]["input"]>;
  rcdMa?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CabinetDevice = {
  article: Maybe<Scalars["String"]["output"]>;
  circuitId: Maybe<Scalars["OID"]["output"]>;
  distributorId: Scalars["OID"]["output"];
  id: Scalars["OID"]["output"];
  kind: Scalars["String"]["output"];
  label: Scalars["String"]["output"];
  phases: Maybe<Array<Scalars["String"]["output"]>>;
  price: Maybe<Scalars["Float"]["output"]>;
  row: Maybe<Scalars["Int"]["output"]>;
  startTe: Maybe<Scalars["Int"]["output"]>;
  teWidth: Scalars["Int"]["output"];
};

export type CabinetDeviceInput = {
  article?: InputMaybe<Scalars["String"]["input"]>;
  circuitId?: InputMaybe<Scalars["OID"]["input"]>;
  distributorId: Scalars["OID"]["input"];
  id: Scalars["OID"]["input"];
  kind: Scalars["String"]["input"];
  label: Scalars["String"]["input"];
  phases?: InputMaybe<Array<Scalars["String"]["input"]>>;
  price?: InputMaybe<Scalars["Float"]["input"]>;
  row?: InputMaybe<Scalars["Int"]["input"]>;
  startTe?: InputMaybe<Scalars["Int"]["input"]>;
  teWidth: Scalars["Int"]["input"];
};

export type CableInput = {
  crossSectionMm2: Scalars["Float"]["input"];
  lengthM?: InputMaybe<Scalars["Float"]["input"]>;
  type: Scalars["String"]["input"];
};

export type CableRoute = {
  circuitId: Scalars["OID"]["output"];
  id: Scalars["OID"]["output"];
  points: Array<Position>;
  reservePercent: Maybe<Scalars["Float"]["output"]>;
  unitId: Scalars["OID"]["output"];
};

export type CableRouteInput = {
  circuitId: Scalars["OID"]["input"];
  id: Scalars["OID"]["input"];
  points: Array<PositionInput>;
  reservePercent?: InputMaybe<Scalars["Float"]["input"]>;
  unitId: Scalars["OID"]["input"];
};

export type CircuitInput = {
  ambientTempC?: InputMaybe<Scalars["Float"]["input"]>;
  breaker: BreakerInput;
  cable: CableInput;
  color?: InputMaybe<Scalars["String"]["input"]>;
  distributorId?: InputMaybe<Scalars["OID"]["input"]>;
  groupedCircuits?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  installationMethod?: InputMaybe<Scalars["String"]["input"]>;
  kind: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  phases?: InputMaybe<Array<Scalars["String"]["input"]>>;
  skNumber: Scalars["Int"]["input"];
};

export type DistributorInput = {
  id: Scalars["OID"]["input"];
  location?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  reservePercent: Scalars["Float"]["input"];
  rows: Scalars["Int"]["input"];
  tePerRow: Scalars["Int"]["input"];
};

export type ElectricalBreaker = {
  characteristic: Scalars["String"]["output"];
  poles: Scalars["Int"]["output"];
  ratingA: Scalars["Float"]["output"];
  rcbo: Maybe<Scalars["Boolean"]["output"]>;
  rcdMa: Maybe<Scalars["Int"]["output"]>;
};

export type ElectricalCable = {
  crossSectionMm2: Scalars["Float"]["output"];
  lengthM: Maybe<Scalars["Float"]["output"]>;
  type: Scalars["String"]["output"];
};

export type ElectricalCircuit = {
  ambientTempC: Maybe<Scalars["Float"]["output"]>;
  breaker: ElectricalBreaker;
  cable: ElectricalCable;
  color: Maybe<Scalars["String"]["output"]>;
  distributorId: Maybe<Scalars["OID"]["output"]>;
  groupedCircuits: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  installationMethod: Maybe<Scalars["String"]["output"]>;
  kind: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  notes: Maybe<Scalars["String"]["output"]>;
  phases: Maybe<Array<Scalars["String"]["output"]>>;
  skNumber: Scalars["Int"]["output"];
};

export type ElectricalDistributor = {
  id: Scalars["OID"]["output"];
  location: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  reservePercent: Scalars["Float"]["output"];
  rows: Scalars["Int"]["output"];
  tePerRow: Scalars["Int"]["output"];
};

export type ElectricalPlanState = {
  activeUnitId: Scalars["OID"]["output"];
  cabinetDevices: Array<CabinetDevice>;
  circuits: Array<ElectricalCircuit>;
  distributors: Array<ElectricalDistributor>;
  groupAddresses: Array<GroupAddress>;
  name: Scalars["String"]["output"];
  nextCircuitNumber: Scalars["Int"]["output"];
  reports: Array<InspectionReport>;
  routes: Maybe<Array<CableRoute>>;
  settings: ElectricalSettings;
  units: Array<ElectricalUnit>;
};

export type ElectricalRoom = {
  fillColor: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  labelX: Scalars["Float"]["output"];
  labelY: Scalars["Float"]["output"];
  locked: Maybe<Scalars["Boolean"]["output"]>;
  name: Scalars["String"]["output"];
  points: Array<Position>;
};

export type ElectricalSettings = {
  showCircuitBadges: Scalars["Boolean"]["output"];
  showMountHeights: Scalars["Boolean"]["output"];
  symbolStyle: Scalars["String"]["output"];
};

export type ElectricalSettingsInput = {
  showCircuitBadges?: InputMaybe<Scalars["Boolean"]["input"]>;
  showMountHeights?: InputMaybe<Scalars["Boolean"]["input"]>;
  symbolStyle?: InputMaybe<Scalars["String"]["input"]>;
};

export type ElectricalSymbol = {
  circuitId: Maybe<Scalars["OID"]["output"]>;
  color: Maybe<Scalars["String"]["output"]>;
  defId: Scalars["String"]["output"];
  details: Maybe<ItemDetails>;
  id: Scalars["OID"]["output"];
  knx: Maybe<KnxBinding>;
  label: Maybe<Scalars["String"]["output"]>;
  locked: Maybe<Scalars["Boolean"]["output"]>;
  mountHeightCm: Maybe<Scalars["Float"]["output"]>;
  position: Position;
  roomId: Maybe<Scalars["String"]["output"]>;
  rotation: Scalars["Float"]["output"];
};

export type ElectricalUnit = {
  background: Maybe<PlanBackground>;
  id: Scalars["OID"]["output"];
  level: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
  rooms: Maybe<Array<ElectricalRoom>>;
  symbols: Array<ElectricalSymbol>;
};

export type GroupAddress = {
  description: Maybe<Scalars["String"]["output"]>;
  dpt: Scalars["String"]["output"];
  fixtureId: Maybe<Scalars["OID"]["output"]>;
  functionKey: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  main: Scalars["Int"]["output"];
  middle: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
  sub: Scalars["Int"]["output"];
};

export type GroupAddressInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  dpt: Scalars["String"]["input"];
  fixtureId?: InputMaybe<Scalars["OID"]["input"]>;
  functionKey?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  main: Scalars["Int"]["input"];
  middle: Scalars["Int"]["input"];
  name: Scalars["String"]["input"];
  sub: Scalars["Int"]["input"];
};

export type InspectionReport = {
  circuitId: Scalars["OID"]["output"];
  continuityOhm: Maybe<Scalars["Float"]["output"]>;
  id: Scalars["OID"]["output"];
  insulationMohm: Maybe<Scalars["Float"]["output"]>;
  insulationTestVoltageV: Maybe<Scalars["Int"]["output"]>;
  loopImpedanceOhm: Maybe<Scalars["Float"]["output"]>;
  nextTestDue: Maybe<Scalars["String"]["output"]>;
  notes: Maybe<Scalars["String"]["output"]>;
  rcdTestCurrentMa: Maybe<Scalars["Float"]["output"]>;
  rcdTripMs: Maybe<Scalars["Float"]["output"]>;
  result: Scalars["String"]["output"];
  rotatingField: Maybe<Scalars["String"]["output"]>;
  signature: Maybe<Scalars["String"]["output"]>;
  testedAt: Maybe<Scalars["String"]["output"]>;
  tester: Maybe<Scalars["String"]["output"]>;
  visualInspection: Maybe<Scalars["String"]["output"]>;
};

export type ItemDetails = {
  note: Maybe<Scalars["String"]["output"]>;
  photos: Maybe<Array<Scalars["String"]["output"]>>;
  price: Maybe<Scalars["Float"]["output"]>;
};

export type KnxBinding = {
  enabled: Scalars["Boolean"]["output"];
  groupAddressIds: Maybe<Array<Scalars["OID"]["output"]>>;
  participantName: Maybe<Scalars["String"]["output"]>;
};

export type MoveSymbolInput = {
  id: Scalars["OID"]["input"];
  unitId: Scalars["OID"]["input"];
  x: Scalars["Float"]["input"];
  y: Scalars["Float"]["input"];
};

export type PlanBackground = {
  dataUrl: Maybe<Scalars["String"]["output"]>;
  heightCm: Maybe<Scalars["Float"]["output"]>;
  locked: Scalars["Boolean"]["output"];
  opacity: Scalars["Float"]["output"];
  rotation: Scalars["Float"]["output"];
  scale: Scalars["Float"]["output"];
  widthCm: Maybe<Scalars["Float"]["output"]>;
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

export type PlanCabinetInput = {
  devices: Array<CabinetDeviceInput>;
  distributorId: Scalars["OID"]["input"];
};

export type Position = {
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

export type PositionInput = {
  x: Scalars["Float"]["input"];
  y: Scalars["Float"]["input"];
};

export type RemoveCircuitInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveRoomInput = {
  id: Scalars["OID"]["input"];
  unitId: Scalars["OID"]["input"];
};

export type RemoveRouteInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveSymbolInput = {
  id: Scalars["OID"]["input"];
  unitId: Scalars["OID"]["input"];
};

export type RenameUnitInput = {
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
};

export type ReportInput = {
  circuitId: Scalars["OID"]["input"];
  continuityOhm?: InputMaybe<Scalars["Float"]["input"]>;
  id: Scalars["OID"]["input"];
  insulationMohm?: InputMaybe<Scalars["Float"]["input"]>;
  insulationTestVoltageV?: InputMaybe<Scalars["Int"]["input"]>;
  loopImpedanceOhm?: InputMaybe<Scalars["Float"]["input"]>;
  nextTestDue?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  rcdTestCurrentMa?: InputMaybe<Scalars["Float"]["input"]>;
  rcdTripMs?: InputMaybe<Scalars["Float"]["input"]>;
  result: Scalars["String"]["input"];
  rotatingField?: InputMaybe<Scalars["String"]["input"]>;
  signature?: InputMaybe<Scalars["String"]["input"]>;
  testedAt?: InputMaybe<Scalars["String"]["input"]>;
  tester?: InputMaybe<Scalars["String"]["input"]>;
  visualInspection?: InputMaybe<Scalars["String"]["input"]>;
};

export type RoomInput = {
  fillColor?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  labelX: Scalars["Float"]["input"];
  labelY: Scalars["Float"]["input"];
  locked?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
  points: Array<PositionInput>;
};

export type SetActiveUnitInput = {
  unitId: Scalars["OID"]["input"];
};

export type SetGroupAddressesInput = {
  addresses: Array<GroupAddressInput>;
};

export type SetProjectNameInput = {
  name: Scalars["String"]["input"];
};

export type SetUnitBackgroundInput = {
  background?: InputMaybe<BackgroundInput>;
  unitId: Scalars["OID"]["input"];
};

export type SymbolInput = {
  circuitId?: InputMaybe<Scalars["OID"]["input"]>;
  color?: InputMaybe<Scalars["String"]["input"]>;
  defId: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  knxEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  label?: InputMaybe<Scalars["String"]["input"]>;
  locked?: InputMaybe<Scalars["Boolean"]["input"]>;
  mountHeightCm?: InputMaybe<Scalars["Float"]["input"]>;
  position: PositionInput;
  roomId?: InputMaybe<Scalars["String"]["input"]>;
  rotation: Scalars["Float"]["input"];
};

export type UpdateCircuitInput = {
  ambientTempC?: InputMaybe<Scalars["Float"]["input"]>;
  cableType?: InputMaybe<Scalars["String"]["input"]>;
  characteristic?: InputMaybe<Scalars["String"]["input"]>;
  color?: InputMaybe<Scalars["String"]["input"]>;
  crossSectionMm2?: InputMaybe<Scalars["Float"]["input"]>;
  distributorId?: InputMaybe<Scalars["OID"]["input"]>;
  groupedCircuits?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  installationMethod?: InputMaybe<Scalars["String"]["input"]>;
  kind?: InputMaybe<Scalars["String"]["input"]>;
  lengthM?: InputMaybe<Scalars["Float"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  phases?: InputMaybe<Array<Scalars["String"]["input"]>>;
  poles?: InputMaybe<Scalars["Int"]["input"]>;
  ratingA?: InputMaybe<Scalars["Float"]["input"]>;
  rcbo?: InputMaybe<Scalars["Boolean"]["input"]>;
  rcdMa?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateDistributorInput = {
  id: Scalars["OID"]["input"];
  location?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  reservePercent?: InputMaybe<Scalars["Float"]["input"]>;
  rows?: InputMaybe<Scalars["Int"]["input"]>;
  tePerRow?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateReportInput = {
  report: ReportInput;
};

export type UpdateRoomInput = {
  fillColor?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  labelX?: InputMaybe<Scalars["Float"]["input"]>;
  labelY?: InputMaybe<Scalars["Float"]["input"]>;
  locked?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  points?: InputMaybe<Array<PositionInput>>;
  unitId: Scalars["OID"]["input"];
};

export type UpdateRouteInput = {
  circuitId?: InputMaybe<Scalars["OID"]["input"]>;
  id: Scalars["OID"]["input"];
  points?: InputMaybe<Array<PositionInput>>;
  reservePercent?: InputMaybe<Scalars["Float"]["input"]>;
  unitId?: InputMaybe<Scalars["OID"]["input"]>;
};

export type UpdateSettingsInput = {
  settings: ElectricalSettingsInput;
};

export type UpdateSymbolDetailsInput = {
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  price?: InputMaybe<Scalars["Float"]["input"]>;
  unitId: Scalars["OID"]["input"];
};

export type UpdateSymbolInput = {
  circuitId?: InputMaybe<Scalars["OID"]["input"]>;
  color?: InputMaybe<Scalars["String"]["input"]>;
  defId?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  knxEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  label?: InputMaybe<Scalars["String"]["input"]>;
  locked?: InputMaybe<Scalars["Boolean"]["input"]>;
  mountHeightCm?: InputMaybe<Scalars["Float"]["input"]>;
  roomId?: InputMaybe<Scalars["String"]["input"]>;
  rotation?: InputMaybe<Scalars["Float"]["input"]>;
  unitId: Scalars["OID"]["input"];
};

export type UpdateUnitBackgroundInput = {
  dataUrl?: InputMaybe<Scalars["String"]["input"]>;
  heightCm?: InputMaybe<Scalars["Float"]["input"]>;
  locked?: InputMaybe<Scalars["Boolean"]["input"]>;
  opacity?: InputMaybe<Scalars["Float"]["input"]>;
  rotation?: InputMaybe<Scalars["Float"]["input"]>;
  scale?: InputMaybe<Scalars["Float"]["input"]>;
  unitId: Scalars["OID"]["input"];
  widthCm?: InputMaybe<Scalars["Float"]["input"]>;
  x?: InputMaybe<Scalars["Float"]["input"]>;
  y?: InputMaybe<Scalars["Float"]["input"]>;
};
