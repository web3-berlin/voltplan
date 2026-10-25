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

export type AddDuctRouteInput = {
  route: DuctRouteInput;
  unitId: Scalars["OID"]["input"];
};

export type AddFixtureInput = {
  fixture: FixtureInput;
  unitId: Scalars["OID"]["input"];
};

export type AddPipeRouteInput = {
  route: PipeRouteInput;
  unitId: Scalars["OID"]["input"];
};

export type AddRiserInput = {
  riser: RiserInput;
  unitId: Scalars["OID"]["input"];
};

export type AddRoomInput = {
  room: RoomInput;
  unitId: Scalars["OID"]["input"];
};

export type AddUnitInput = {
  id: Scalars["OID"]["input"];
  level: Scalars["Int"]["input"];
  name: Scalars["String"]["input"];
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

export type DuctRoute = {
  airflowM3h: Maybe<Scalars["Float"]["output"]>;
  heightMm: Scalars["Float"]["output"];
  id: Scalars["OID"]["output"];
  kind: Scalars["String"]["output"];
  notes: Maybe<Scalars["String"]["output"]>;
  points: Array<Position>;
  widthMm: Scalars["Float"]["output"];
};

export type DuctRouteInput = {
  airflowM3h?: InputMaybe<Scalars["Float"]["input"]>;
  heightMm: Scalars["Float"]["input"];
  id: Scalars["OID"]["input"];
  kind: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  points: Array<PositionInput>;
  widthMm: Scalars["Float"]["input"];
};

export type FixtureInput = {
  discipline: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  kind: Scalars["String"]["input"];
  locked?: InputMaybe<Scalars["Boolean"]["input"]>;
  mountHeightCm?: InputMaybe<Scalars["Float"]["input"]>;
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  position: PositionInput;
  roomId?: InputMaybe<Scalars["String"]["input"]>;
  rotation: Scalars["Float"]["input"];
};

export type HlskFixture = {
  discipline: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  kind: Scalars["String"]["output"];
  locked: Maybe<Scalars["Boolean"]["output"]>;
  mountHeightCm: Maybe<Scalars["Float"]["output"]>;
  name: Scalars["String"]["output"];
  notes: Maybe<Scalars["String"]["output"]>;
  position: Position;
  roomId: Maybe<Scalars["String"]["output"]>;
  rotation: Scalars["Float"]["output"];
};

export type HlskPlanState = {
  activeUnitId: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  nextFixtureNumber: Scalars["Int"]["output"];
  settings: HlskSettings;
  units: Array<HlskUnit>;
};

export type HlskRoom = {
  fillColor: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  labelX: Scalars["Float"]["output"];
  labelY: Scalars["Float"]["output"];
  locked: Maybe<Scalars["Boolean"]["output"]>;
  name: Scalars["String"]["output"];
  points: Array<Position>;
};

export type HlskSettings = {
  pipeDiameterMm: Scalars["Float"]["output"];
  showLabels: Scalars["Boolean"]["output"];
  showMountHeights: Scalars["Boolean"]["output"];
};

export type HlskUnit = {
  background: Maybe<PlanBackground>;
  ductRoutes: Array<DuctRoute>;
  fixtures: Array<HlskFixture>;
  id: Scalars["OID"]["output"];
  level: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
  pipeRoutes: Array<PipeRoute>;
  risers: Array<Riser>;
  rooms: Maybe<Array<HlskRoom>>;
};

export type PipeRoute = {
  diameterMm: Scalars["Float"]["output"];
  id: Scalars["OID"]["output"];
  insulation: Maybe<Scalars["Boolean"]["output"]>;
  kind: Scalars["String"]["output"];
  notes: Maybe<Scalars["String"]["output"]>;
  points: Array<Position>;
  slopePercent: Maybe<Scalars["Float"]["output"]>;
};

export type PipeRouteInput = {
  diameterMm: Scalars["Float"]["input"];
  id: Scalars["OID"]["input"];
  insulation?: InputMaybe<Scalars["Boolean"]["input"]>;
  kind: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  points: Array<PositionInput>;
  slopePercent?: InputMaybe<Scalars["Float"]["input"]>;
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

export type Position = {
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

export type PositionInput = {
  x: Scalars["Float"]["input"];
  y: Scalars["Float"]["input"];
};

export type RemoveDuctRouteInput = {
  id: Scalars["OID"]["input"];
  unitId: Scalars["OID"]["input"];
};

export type RemoveFixtureInput = {
  id: Scalars["OID"]["input"];
  unitId: Scalars["OID"]["input"];
};

export type RemovePipeRouteInput = {
  id: Scalars["OID"]["input"];
  unitId: Scalars["OID"]["input"];
};

export type RemoveRiserInput = {
  id: Scalars["OID"]["input"];
  unitId: Scalars["OID"]["input"];
};

export type RemoveRoomInput = {
  id: Scalars["OID"]["input"];
  unitId: Scalars["OID"]["input"];
};

export type RemoveUnitInput = {
  id: Scalars["OID"]["input"];
};

export type Riser = {
  id: Scalars["OID"]["output"];
  kind: Scalars["String"]["output"];
  label: Maybe<Scalars["String"]["output"]>;
  notes: Maybe<Scalars["String"]["output"]>;
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

export type RiserInput = {
  id: Scalars["OID"]["input"];
  kind: Scalars["String"]["input"];
  label?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  x: Scalars["Float"]["input"];
  y: Scalars["Float"]["input"];
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

export type SetProjectNameInput = {
  name: Scalars["String"]["input"];
};

export type SetUnitBackgroundInput = {
  background: BackgroundInput;
  unitId: Scalars["OID"]["input"];
};

export type UpdateDuctRouteInput = {
  airflowM3h?: InputMaybe<Scalars["Float"]["input"]>;
  heightMm?: InputMaybe<Scalars["Float"]["input"]>;
  id: Scalars["OID"]["input"];
  kind?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  points?: InputMaybe<Array<PositionInput>>;
  unitId: Scalars["OID"]["input"];
  widthMm?: InputMaybe<Scalars["Float"]["input"]>;
};

export type UpdateFixtureInput = {
  discipline?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  kind?: InputMaybe<Scalars["String"]["input"]>;
  locked?: InputMaybe<Scalars["Boolean"]["input"]>;
  mountHeightCm?: InputMaybe<Scalars["Float"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  position?: InputMaybe<PositionInput>;
  roomId?: InputMaybe<Scalars["String"]["input"]>;
  rotation?: InputMaybe<Scalars["Float"]["input"]>;
  unitId: Scalars["OID"]["input"];
};

export type UpdatePipeRouteInput = {
  diameterMm?: InputMaybe<Scalars["Float"]["input"]>;
  id: Scalars["OID"]["input"];
  insulation?: InputMaybe<Scalars["Boolean"]["input"]>;
  kind?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  points?: InputMaybe<Array<PositionInput>>;
  slopePercent?: InputMaybe<Scalars["Float"]["input"]>;
  unitId: Scalars["OID"]["input"];
};

export type UpdateRiserInput = {
  id: Scalars["OID"]["input"];
  kind?: InputMaybe<Scalars["String"]["input"]>;
  label?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  unitId: Scalars["OID"]["input"];
  x?: InputMaybe<Scalars["Float"]["input"]>;
  y?: InputMaybe<Scalars["Float"]["input"]>;
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

export type UpdateSettingsInput = {
  pipeDiameterMm?: InputMaybe<Scalars["Float"]["input"]>;
  showLabels?: InputMaybe<Scalars["Boolean"]["input"]>;
  showMountHeights?: InputMaybe<Scalars["Boolean"]["input"]>;
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

export type UpdateUnitInput = {
  id: Scalars["OID"]["input"];
  level?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};
