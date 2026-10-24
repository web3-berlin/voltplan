/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddCircuitInput,
  AddDistributorInput,
  AddRoomInput,
  AddRouteInput,
  AddSymbolInput,
  AddUnitInput,
  AssignSymbolCircuitInput,
  BackgroundInput,
  BreakerInput,
  CabinetDevice,
  CabinetDeviceInput,
  CableInput,
  CableRoute,
  CableRouteInput,
  CircuitInput,
  DistributorInput,
  ElectricalBreaker,
  ElectricalCable,
  ElectricalCircuit,
  ElectricalDistributor,
  ElectricalPlanState,
  ElectricalRoom,
  ElectricalSettings,
  ElectricalSettingsInput,
  ElectricalSymbol,
  ElectricalUnit,
  GroupAddress,
  GroupAddressInput,
  InspectionReport,
  ItemDetails,
  KnxBinding,
  MoveSymbolInput,
  PlanBackground,
  PlanCabinetInput,
  Position,
  PositionInput,
  RemoveCircuitInput,
  RemoveRoomInput,
  RemoveRouteInput,
  RemoveSymbolInput,
  RenameUnitInput,
  ReportInput,
  RoomInput,
  SetActiveUnitInput,
  SetGroupAddressesInput,
  SetProjectNameInput,
  SetUnitBackgroundInput,
  SymbolInput,
  UpdateCircuitInput,
  UpdateDistributorInput,
  UpdateReportInput,
  UpdateRoomInput,
  UpdateRouteInput,
  UpdateSettingsInput,
  UpdateSymbolDetailsInput,
  UpdateSymbolInput,
  UpdateUnitBackgroundInput,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export function AddCircuitInputSchema(): z.ZodObject<
  Properties<AddCircuitInput>
> {
  return z.object({
    circuit: z.lazy(() => CircuitInputSchema()),
  });
}

export function AddDistributorInputSchema(): z.ZodObject<
  Properties<AddDistributorInput>
> {
  return z.object({
    distributor: z.lazy(() => DistributorInputSchema()),
  });
}

export function AddRoomInputSchema(): z.ZodObject<Properties<AddRoomInput>> {
  return z.object({
    room: z.lazy(() => RoomInputSchema()),
    unitId: z.string(),
  });
}

export function AddRouteInputSchema(): z.ZodObject<Properties<AddRouteInput>> {
  return z.object({
    route: z.lazy(() => CableRouteInputSchema()),
  });
}

export function AddSymbolInputSchema(): z.ZodObject<
  Properties<AddSymbolInput>
> {
  return z.object({
    symbol: z.lazy(() => SymbolInputSchema()),
    unitId: z.string(),
  });
}

export function AddUnitInputSchema(): z.ZodObject<Properties<AddUnitInput>> {
  return z.object({
    id: z.string(),
    level: z.number(),
    name: z.string(),
  });
}

export function AssignSymbolCircuitInputSchema(): z.ZodObject<
  Properties<AssignSymbolCircuitInput>
> {
  return z.object({
    circuitId: z.string().nullish(),
    symbolId: z.string(),
    unitId: z.string(),
  });
}

export function BackgroundInputSchema(): z.ZodObject<
  Properties<BackgroundInput>
> {
  return z.object({
    dataUrl: z.string().nullish(),
    heightCm: z.number().nullish(),
    locked: z.boolean(),
    opacity: z.number(),
    rotation: z.number(),
    scale: z.number(),
    widthCm: z.number().nullish(),
    x: z.number(),
    y: z.number(),
  });
}

export function BreakerInputSchema(): z.ZodObject<Properties<BreakerInput>> {
  return z.object({
    characteristic: z.string(),
    poles: z.number(),
    ratingA: z.number(),
    rcbo: z.boolean().nullish(),
    rcdMa: z.number().nullish(),
  });
}

export function CabinetDeviceSchema(): z.ZodObject<Properties<CabinetDevice>> {
  return z.object({
    __typename: z.literal("CabinetDevice").optional(),
    article: z.string().nullish(),
    circuitId: z.string().nullish(),
    distributorId: z.string(),
    id: z.string(),
    kind: z.string(),
    label: z.string(),
    phases: z.array(z.string()).nullish(),
    price: z.number().nullish(),
    row: z.number().nullish(),
    startTe: z.number().nullish(),
    teWidth: z.number(),
  });
}

export function CabinetDeviceInputSchema(): z.ZodObject<
  Properties<CabinetDeviceInput>
> {
  return z.object({
    article: z.string().nullish(),
    circuitId: z.string().nullish(),
    distributorId: z.string(),
    id: z.string(),
    kind: z.string(),
    label: z.string(),
    phases: z.array(z.string()).nullish(),
    price: z.number().nullish(),
    row: z.number().nullish(),
    startTe: z.number().nullish(),
    teWidth: z.number(),
  });
}

export function CableInputSchema(): z.ZodObject<Properties<CableInput>> {
  return z.object({
    crossSectionMm2: z.number(),
    lengthM: z.number().nullish(),
    type: z.string(),
  });
}

export function CableRouteSchema(): z.ZodObject<Properties<CableRoute>> {
  return z.object({
    __typename: z.literal("CableRoute").optional(),
    circuitId: z.string(),
    id: z.string(),
    points: z.array(z.lazy(() => PositionSchema())),
    reservePercent: z.number().nullish(),
    unitId: z.string(),
  });
}

export function CableRouteInputSchema(): z.ZodObject<
  Properties<CableRouteInput>
> {
  return z.object({
    circuitId: z.string(),
    id: z.string(),
    points: z.array(z.lazy(() => PositionInputSchema())),
    reservePercent: z.number().nullish(),
    unitId: z.string(),
  });
}

export function CircuitInputSchema(): z.ZodObject<Properties<CircuitInput>> {
  return z.object({
    ambientTempC: z.number().nullish(),
    breaker: z.lazy(() => BreakerInputSchema()),
    cable: z.lazy(() => CableInputSchema()),
    color: z.string().nullish(),
    distributorId: z.string().nullish(),
    groupedCircuits: z.number().nullish(),
    id: z.string(),
    installationMethod: z.string().nullish(),
    kind: z.string(),
    name: z.string(),
    notes: z.string().nullish(),
    phases: z.array(z.string()).nullish(),
    skNumber: z.number(),
  });
}

export function DistributorInputSchema(): z.ZodObject<
  Properties<DistributorInput>
> {
  return z.object({
    id: z.string(),
    location: z.string().nullish(),
    name: z.string(),
    reservePercent: z.number(),
    rows: z.number(),
    tePerRow: z.number(),
  });
}

export function ElectricalBreakerSchema(): z.ZodObject<
  Properties<ElectricalBreaker>
> {
  return z.object({
    __typename: z.literal("ElectricalBreaker").optional(),
    characteristic: z.string(),
    poles: z.number(),
    ratingA: z.number(),
    rcbo: z.boolean().nullish(),
    rcdMa: z.number().nullish(),
  });
}

export function ElectricalCableSchema(): z.ZodObject<
  Properties<ElectricalCable>
> {
  return z.object({
    __typename: z.literal("ElectricalCable").optional(),
    crossSectionMm2: z.number(),
    lengthM: z.number().nullish(),
    type: z.string(),
  });
}

export function ElectricalCircuitSchema(): z.ZodObject<
  Properties<ElectricalCircuit>
> {
  return z.object({
    __typename: z.literal("ElectricalCircuit").optional(),
    ambientTempC: z.number().nullish(),
    breaker: z.lazy(() => ElectricalBreakerSchema()),
    cable: z.lazy(() => ElectricalCableSchema()),
    color: z.string().nullish(),
    distributorId: z.string().nullish(),
    groupedCircuits: z.number().nullish(),
    id: z.string(),
    installationMethod: z.string().nullish(),
    kind: z.string(),
    name: z.string(),
    notes: z.string().nullish(),
    phases: z.array(z.string()).nullish(),
    skNumber: z.number(),
  });
}

export function ElectricalDistributorSchema(): z.ZodObject<
  Properties<ElectricalDistributor>
> {
  return z.object({
    __typename: z.literal("ElectricalDistributor").optional(),
    id: z.string(),
    location: z.string().nullish(),
    name: z.string(),
    reservePercent: z.number(),
    rows: z.number(),
    tePerRow: z.number(),
  });
}

export function ElectricalPlanStateSchema(): z.ZodObject<
  Properties<ElectricalPlanState>
> {
  return z.object({
    __typename: z.literal("ElectricalPlanState").optional(),
    activeUnitId: z.string(),
    cabinetDevices: z.array(z.lazy(() => CabinetDeviceSchema())),
    circuits: z.array(z.lazy(() => ElectricalCircuitSchema())),
    distributors: z.array(z.lazy(() => ElectricalDistributorSchema())),
    groupAddresses: z.array(z.lazy(() => GroupAddressSchema())),
    name: z.string(),
    nextCircuitNumber: z.number(),
    reports: z.array(z.lazy(() => InspectionReportSchema())),
    routes: z.array(z.lazy(() => CableRouteSchema())).nullish(),
    settings: z.lazy(() => ElectricalSettingsSchema()),
    units: z.array(z.lazy(() => ElectricalUnitSchema())),
  });
}

export function ElectricalRoomSchema(): z.ZodObject<
  Properties<ElectricalRoom>
> {
  return z.object({
    __typename: z.literal("ElectricalRoom").optional(),
    fillColor: z.string().nullish(),
    id: z.string(),
    labelX: z.number(),
    labelY: z.number(),
    locked: z.boolean().nullish(),
    name: z.string(),
    points: z.array(z.lazy(() => PositionSchema())),
  });
}

export function ElectricalSettingsSchema(): z.ZodObject<
  Properties<ElectricalSettings>
> {
  return z.object({
    __typename: z.literal("ElectricalSettings").optional(),
    showCircuitBadges: z.boolean(),
    showMountHeights: z.boolean(),
    symbolStyle: z.string(),
  });
}

export function ElectricalSettingsInputSchema(): z.ZodObject<
  Properties<ElectricalSettingsInput>
> {
  return z.object({
    showCircuitBadges: z.boolean().nullish(),
    showMountHeights: z.boolean().nullish(),
    symbolStyle: z.string().nullish(),
  });
}

export function ElectricalSymbolSchema(): z.ZodObject<
  Properties<ElectricalSymbol>
> {
  return z.object({
    __typename: z.literal("ElectricalSymbol").optional(),
    circuitId: z.string().nullish(),
    color: z.string().nullish(),
    defId: z.string(),
    details: z.lazy(() => ItemDetailsSchema().nullish()),
    id: z.string(),
    knx: z.lazy(() => KnxBindingSchema().nullish()),
    label: z.string().nullish(),
    locked: z.boolean().nullish(),
    mountHeightCm: z.number().nullish(),
    position: z.lazy(() => PositionSchema()),
    roomId: z.string().nullish(),
    rotation: z.number(),
  });
}

export function ElectricalUnitSchema(): z.ZodObject<
  Properties<ElectricalUnit>
> {
  return z.object({
    __typename: z.literal("ElectricalUnit").optional(),
    background: z.lazy(() => PlanBackgroundSchema().nullish()),
    id: z.string(),
    level: z.number(),
    name: z.string(),
    rooms: z.array(z.lazy(() => ElectricalRoomSchema())).nullish(),
    symbols: z.array(z.lazy(() => ElectricalSymbolSchema())),
  });
}

export function GroupAddressSchema(): z.ZodObject<Properties<GroupAddress>> {
  return z.object({
    __typename: z.literal("GroupAddress").optional(),
    description: z.string().nullish(),
    dpt: z.string(),
    fixtureId: z.string().nullish(),
    functionKey: z.string().nullish(),
    id: z.string(),
    main: z.number(),
    middle: z.number(),
    name: z.string(),
    sub: z.number(),
  });
}

export function GroupAddressInputSchema(): z.ZodObject<
  Properties<GroupAddressInput>
> {
  return z.object({
    description: z.string().nullish(),
    dpt: z.string(),
    fixtureId: z.string().nullish(),
    functionKey: z.string().nullish(),
    id: z.string(),
    main: z.number(),
    middle: z.number(),
    name: z.string(),
    sub: z.number(),
  });
}

export function InspectionReportSchema(): z.ZodObject<
  Properties<InspectionReport>
> {
  return z.object({
    __typename: z.literal("InspectionReport").optional(),
    circuitId: z.string(),
    continuityOhm: z.number().nullish(),
    id: z.string(),
    insulationMohm: z.number().nullish(),
    insulationTestVoltageV: z.number().nullish(),
    loopImpedanceOhm: z.number().nullish(),
    nextTestDue: z.string().nullish(),
    notes: z.string().nullish(),
    rcdTestCurrentMa: z.number().nullish(),
    rcdTripMs: z.number().nullish(),
    result: z.string(),
    rotatingField: z.string().nullish(),
    signature: z.string().nullish(),
    testedAt: z.string().nullish(),
    tester: z.string().nullish(),
    visualInspection: z.string().nullish(),
  });
}

export function ItemDetailsSchema(): z.ZodObject<Properties<ItemDetails>> {
  return z.object({
    __typename: z.literal("ItemDetails").optional(),
    note: z.string().nullish(),
    photos: z.array(z.string()).nullish(),
    price: z.number().nullish(),
  });
}

export function KnxBindingSchema(): z.ZodObject<Properties<KnxBinding>> {
  return z.object({
    __typename: z.literal("KnxBinding").optional(),
    enabled: z.boolean(),
    groupAddressIds: z.array(z.string()).nullish(),
    participantName: z.string().nullish(),
  });
}

export function MoveSymbolInputSchema(): z.ZodObject<
  Properties<MoveSymbolInput>
> {
  return z.object({
    id: z.string(),
    unitId: z.string(),
    x: z.number(),
    y: z.number(),
  });
}

export function PlanBackgroundSchema(): z.ZodObject<
  Properties<PlanBackground>
> {
  return z.object({
    __typename: z.literal("PlanBackground").optional(),
    dataUrl: z.string().nullish(),
    heightCm: z.number().nullish(),
    locked: z.boolean(),
    opacity: z.number(),
    rotation: z.number(),
    scale: z.number(),
    widthCm: z.number().nullish(),
    x: z.number(),
    y: z.number(),
  });
}

export function PlanCabinetInputSchema(): z.ZodObject<
  Properties<PlanCabinetInput>
> {
  return z.object({
    devices: z.array(z.lazy(() => CabinetDeviceInputSchema())),
    distributorId: z.string(),
  });
}

export function PositionSchema(): z.ZodObject<Properties<Position>> {
  return z.object({
    __typename: z.literal("Position").optional(),
    x: z.number(),
    y: z.number(),
  });
}

export function PositionInputSchema(): z.ZodObject<Properties<PositionInput>> {
  return z.object({
    x: z.number(),
    y: z.number(),
  });
}

export function RemoveCircuitInputSchema(): z.ZodObject<
  Properties<RemoveCircuitInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveRoomInputSchema(): z.ZodObject<
  Properties<RemoveRoomInput>
> {
  return z.object({
    id: z.string(),
    unitId: z.string(),
  });
}

export function RemoveRouteInputSchema(): z.ZodObject<
  Properties<RemoveRouteInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveSymbolInputSchema(): z.ZodObject<
  Properties<RemoveSymbolInput>
> {
  return z.object({
    id: z.string(),
    unitId: z.string(),
  });
}

export function RenameUnitInputSchema(): z.ZodObject<
  Properties<RenameUnitInput>
> {
  return z.object({
    id: z.string(),
    name: z.string(),
  });
}

export function ReportInputSchema(): z.ZodObject<Properties<ReportInput>> {
  return z.object({
    circuitId: z.string(),
    continuityOhm: z.number().nullish(),
    id: z.string(),
    insulationMohm: z.number().nullish(),
    insulationTestVoltageV: z.number().nullish(),
    loopImpedanceOhm: z.number().nullish(),
    nextTestDue: z.string().nullish(),
    notes: z.string().nullish(),
    rcdTestCurrentMa: z.number().nullish(),
    rcdTripMs: z.number().nullish(),
    result: z.string(),
    rotatingField: z.string().nullish(),
    signature: z.string().nullish(),
    testedAt: z.string().nullish(),
    tester: z.string().nullish(),
    visualInspection: z.string().nullish(),
  });
}

export function RoomInputSchema(): z.ZodObject<Properties<RoomInput>> {
  return z.object({
    fillColor: z.string().nullish(),
    id: z.string(),
    labelX: z.number(),
    labelY: z.number(),
    locked: z.boolean().nullish(),
    name: z.string(),
    points: z.array(z.lazy(() => PositionInputSchema())),
  });
}

export function SetActiveUnitInputSchema(): z.ZodObject<
  Properties<SetActiveUnitInput>
> {
  return z.object({
    unitId: z.string(),
  });
}

export function SetGroupAddressesInputSchema(): z.ZodObject<
  Properties<SetGroupAddressesInput>
> {
  return z.object({
    addresses: z.array(z.lazy(() => GroupAddressInputSchema())),
  });
}

export function SetProjectNameInputSchema(): z.ZodObject<
  Properties<SetProjectNameInput>
> {
  return z.object({
    name: z.string(),
  });
}

export function SetUnitBackgroundInputSchema(): z.ZodObject<
  Properties<SetUnitBackgroundInput>
> {
  return z.object({
    background: z.lazy(() => BackgroundInputSchema().nullish()),
    unitId: z.string(),
  });
}

export function SymbolInputSchema(): z.ZodObject<Properties<SymbolInput>> {
  return z.object({
    circuitId: z.string().nullish(),
    color: z.string().nullish(),
    defId: z.string(),
    id: z.string(),
    knxEnabled: z.boolean().nullish(),
    label: z.string().nullish(),
    locked: z.boolean().nullish(),
    mountHeightCm: z.number().nullish(),
    position: z.lazy(() => PositionInputSchema()),
    roomId: z.string().nullish(),
    rotation: z.number(),
  });
}

export function UpdateCircuitInputSchema(): z.ZodObject<
  Properties<UpdateCircuitInput>
> {
  return z.object({
    ambientTempC: z.number().nullish(),
    cableType: z.string().nullish(),
    characteristic: z.string().nullish(),
    color: z.string().nullish(),
    crossSectionMm2: z.number().nullish(),
    distributorId: z.string().nullish(),
    groupedCircuits: z.number().nullish(),
    id: z.string(),
    installationMethod: z.string().nullish(),
    kind: z.string().nullish(),
    lengthM: z.number().nullish(),
    name: z.string().nullish(),
    notes: z.string().nullish(),
    phases: z.array(z.string()).nullish(),
    poles: z.number().nullish(),
    ratingA: z.number().nullish(),
    rcbo: z.boolean().nullish(),
    rcdMa: z.number().nullish(),
  });
}

export function UpdateDistributorInputSchema(): z.ZodObject<
  Properties<UpdateDistributorInput>
> {
  return z.object({
    id: z.string(),
    location: z.string().nullish(),
    name: z.string().nullish(),
    reservePercent: z.number().nullish(),
    rows: z.number().nullish(),
    tePerRow: z.number().nullish(),
  });
}

export function UpdateReportInputSchema(): z.ZodObject<
  Properties<UpdateReportInput>
> {
  return z.object({
    report: z.lazy(() => ReportInputSchema()),
  });
}

export function UpdateRoomInputSchema(): z.ZodObject<
  Properties<UpdateRoomInput>
> {
  return z.object({
    fillColor: z.string().nullish(),
    id: z.string(),
    labelX: z.number().nullish(),
    labelY: z.number().nullish(),
    locked: z.boolean().nullish(),
    name: z.string().nullish(),
    points: z.array(z.lazy(() => PositionInputSchema())).nullish(),
    unitId: z.string(),
  });
}

export function UpdateRouteInputSchema(): z.ZodObject<
  Properties<UpdateRouteInput>
> {
  return z.object({
    circuitId: z.string().nullish(),
    id: z.string(),
    points: z.array(z.lazy(() => PositionInputSchema())).nullish(),
    reservePercent: z.number().nullish(),
    unitId: z.string().nullish(),
  });
}

export function UpdateSettingsInputSchema(): z.ZodObject<
  Properties<UpdateSettingsInput>
> {
  return z.object({
    settings: z.lazy(() => ElectricalSettingsInputSchema()),
  });
}

export function UpdateSymbolDetailsInputSchema(): z.ZodObject<
  Properties<UpdateSymbolDetailsInput>
> {
  return z.object({
    id: z.string(),
    note: z.string().nullish(),
    price: z.number().nullish(),
    unitId: z.string(),
  });
}

export function UpdateSymbolInputSchema(): z.ZodObject<
  Properties<UpdateSymbolInput>
> {
  return z.object({
    circuitId: z.string().nullish(),
    color: z.string().nullish(),
    defId: z.string().nullish(),
    id: z.string(),
    knxEnabled: z.boolean().nullish(),
    label: z.string().nullish(),
    locked: z.boolean().nullish(),
    mountHeightCm: z.number().nullish(),
    roomId: z.string().nullish(),
    rotation: z.number().nullish(),
    unitId: z.string(),
  });
}

export function UpdateUnitBackgroundInputSchema(): z.ZodObject<
  Properties<UpdateUnitBackgroundInput>
> {
  return z.object({
    dataUrl: z.string().nullish(),
    heightCm: z.number().nullish(),
    locked: z.boolean().nullish(),
    opacity: z.number().nullish(),
    rotation: z.number().nullish(),
    scale: z.number().nullish(),
    unitId: z.string(),
    widthCm: z.number().nullish(),
    x: z.number().nullish(),
    y: z.number().nullish(),
  });
}
