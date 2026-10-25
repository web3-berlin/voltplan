/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddDuctRouteInput,
  AddFixtureInput,
  AddPipeRouteInput,
  AddRiserInput,
  AddRoomInput,
  AddUnitInput,
  BackgroundInput,
  DuctRoute,
  DuctRouteInput,
  FixtureInput,
  HlskFixture,
  HlskPlanState,
  HlskRoom,
  HlskSettings,
  HlskUnit,
  PipeRoute,
  PipeRouteInput,
  PlanBackground,
  Position,
  PositionInput,
  RemoveDuctRouteInput,
  RemoveFixtureInput,
  RemovePipeRouteInput,
  RemoveRiserInput,
  RemoveRoomInput,
  RemoveUnitInput,
  Riser,
  RiserInput,
  RoomInput,
  SetActiveUnitInput,
  SetProjectNameInput,
  SetUnitBackgroundInput,
  UpdateDuctRouteInput,
  UpdateFixtureInput,
  UpdatePipeRouteInput,
  UpdateRiserInput,
  UpdateRoomInput,
  UpdateSettingsInput,
  UpdateUnitBackgroundInput,
  UpdateUnitInput,
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

export function AddDuctRouteInputSchema(): z.ZodObject<
  Properties<AddDuctRouteInput>
> {
  return z.object({
    route: z.lazy(() => DuctRouteInputSchema()),
    unitId: z.string(),
  });
}

export function AddFixtureInputSchema(): z.ZodObject<
  Properties<AddFixtureInput>
> {
  return z.object({
    fixture: z.lazy(() => FixtureInputSchema()),
    unitId: z.string(),
  });
}

export function AddPipeRouteInputSchema(): z.ZodObject<
  Properties<AddPipeRouteInput>
> {
  return z.object({
    route: z.lazy(() => PipeRouteInputSchema()),
    unitId: z.string(),
  });
}

export function AddRiserInputSchema(): z.ZodObject<Properties<AddRiserInput>> {
  return z.object({
    riser: z.lazy(() => RiserInputSchema()),
    unitId: z.string(),
  });
}

export function AddRoomInputSchema(): z.ZodObject<Properties<AddRoomInput>> {
  return z.object({
    room: z.lazy(() => RoomInputSchema()),
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

export function DuctRouteSchema(): z.ZodObject<Properties<DuctRoute>> {
  return z.object({
    __typename: z.literal("DuctRoute").optional(),
    airflowM3h: z.number().nullish(),
    heightMm: z.number(),
    id: z.string(),
    kind: z.string(),
    notes: z.string().nullish(),
    points: z.array(z.lazy(() => PositionSchema())),
    widthMm: z.number(),
  });
}

export function DuctRouteInputSchema(): z.ZodObject<
  Properties<DuctRouteInput>
> {
  return z.object({
    airflowM3h: z.number().nullish(),
    heightMm: z.number(),
    id: z.string(),
    kind: z.string(),
    notes: z.string().nullish(),
    points: z.array(z.lazy(() => PositionInputSchema())),
    widthMm: z.number(),
  });
}

export function FixtureInputSchema(): z.ZodObject<Properties<FixtureInput>> {
  return z.object({
    discipline: z.string(),
    id: z.string(),
    kind: z.string(),
    locked: z.boolean().nullish(),
    mountHeightCm: z.number().nullish(),
    name: z.string(),
    notes: z.string().nullish(),
    position: z.lazy(() => PositionInputSchema()),
    roomId: z.string().nullish(),
    rotation: z.number(),
  });
}

export function HlskFixtureSchema(): z.ZodObject<Properties<HlskFixture>> {
  return z.object({
    __typename: z.literal("HlskFixture").optional(),
    discipline: z.string(),
    id: z.string(),
    kind: z.string(),
    locked: z.boolean().nullish(),
    mountHeightCm: z.number().nullish(),
    name: z.string(),
    notes: z.string().nullish(),
    position: z.lazy(() => PositionSchema()),
    roomId: z.string().nullish(),
    rotation: z.number(),
  });
}

export function HlskPlanStateSchema(): z.ZodObject<Properties<HlskPlanState>> {
  return z.object({
    __typename: z.literal("HlskPlanState").optional(),
    activeUnitId: z.string(),
    name: z.string(),
    nextFixtureNumber: z.number(),
    settings: z.lazy(() => HlskSettingsSchema()),
    units: z.array(z.lazy(() => HlskUnitSchema())),
  });
}

export function HlskRoomSchema(): z.ZodObject<Properties<HlskRoom>> {
  return z.object({
    __typename: z.literal("HlskRoom").optional(),
    fillColor: z.string().nullish(),
    id: z.string(),
    labelX: z.number(),
    labelY: z.number(),
    locked: z.boolean().nullish(),
    name: z.string(),
    points: z.array(z.lazy(() => PositionSchema())),
  });
}

export function HlskSettingsSchema(): z.ZodObject<Properties<HlskSettings>> {
  return z.object({
    __typename: z.literal("HlskSettings").optional(),
    pipeDiameterMm: z.number(),
    showLabels: z.boolean(),
    showMountHeights: z.boolean(),
  });
}

export function HlskUnitSchema(): z.ZodObject<Properties<HlskUnit>> {
  return z.object({
    __typename: z.literal("HlskUnit").optional(),
    background: z.lazy(() => PlanBackgroundSchema().nullish()),
    ductRoutes: z.array(z.lazy(() => DuctRouteSchema())),
    fixtures: z.array(z.lazy(() => HlskFixtureSchema())),
    id: z.string(),
    level: z.number(),
    name: z.string(),
    pipeRoutes: z.array(z.lazy(() => PipeRouteSchema())),
    risers: z.array(z.lazy(() => RiserSchema())),
    rooms: z.array(z.lazy(() => HlskRoomSchema())).nullish(),
  });
}

export function PipeRouteSchema(): z.ZodObject<Properties<PipeRoute>> {
  return z.object({
    __typename: z.literal("PipeRoute").optional(),
    diameterMm: z.number(),
    id: z.string(),
    insulation: z.boolean().nullish(),
    kind: z.string(),
    notes: z.string().nullish(),
    points: z.array(z.lazy(() => PositionSchema())),
    slopePercent: z.number().nullish(),
  });
}

export function PipeRouteInputSchema(): z.ZodObject<
  Properties<PipeRouteInput>
> {
  return z.object({
    diameterMm: z.number(),
    id: z.string(),
    insulation: z.boolean().nullish(),
    kind: z.string(),
    notes: z.string().nullish(),
    points: z.array(z.lazy(() => PositionInputSchema())),
    slopePercent: z.number().nullish(),
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

export function RemoveDuctRouteInputSchema(): z.ZodObject<
  Properties<RemoveDuctRouteInput>
> {
  return z.object({
    id: z.string(),
    unitId: z.string(),
  });
}

export function RemoveFixtureInputSchema(): z.ZodObject<
  Properties<RemoveFixtureInput>
> {
  return z.object({
    id: z.string(),
    unitId: z.string(),
  });
}

export function RemovePipeRouteInputSchema(): z.ZodObject<
  Properties<RemovePipeRouteInput>
> {
  return z.object({
    id: z.string(),
    unitId: z.string(),
  });
}

export function RemoveRiserInputSchema(): z.ZodObject<
  Properties<RemoveRiserInput>
> {
  return z.object({
    id: z.string(),
    unitId: z.string(),
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

export function RemoveUnitInputSchema(): z.ZodObject<
  Properties<RemoveUnitInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RiserSchema(): z.ZodObject<Properties<Riser>> {
  return z.object({
    __typename: z.literal("Riser").optional(),
    id: z.string(),
    kind: z.string(),
    label: z.string().nullish(),
    notes: z.string().nullish(),
    x: z.number(),
    y: z.number(),
  });
}

export function RiserInputSchema(): z.ZodObject<Properties<RiserInput>> {
  return z.object({
    id: z.string(),
    kind: z.string(),
    label: z.string().nullish(),
    notes: z.string().nullish(),
    x: z.number(),
    y: z.number(),
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
    background: z.lazy(() => BackgroundInputSchema()),
    unitId: z.string(),
  });
}

export function UpdateDuctRouteInputSchema(): z.ZodObject<
  Properties<UpdateDuctRouteInput>
> {
  return z.object({
    airflowM3h: z.number().nullish(),
    heightMm: z.number().nullish(),
    id: z.string(),
    kind: z.string().nullish(),
    notes: z.string().nullish(),
    points: z.array(z.lazy(() => PositionInputSchema())).nullish(),
    unitId: z.string(),
    widthMm: z.number().nullish(),
  });
}

export function UpdateFixtureInputSchema(): z.ZodObject<
  Properties<UpdateFixtureInput>
> {
  return z.object({
    discipline: z.string().nullish(),
    id: z.string(),
    kind: z.string().nullish(),
    locked: z.boolean().nullish(),
    mountHeightCm: z.number().nullish(),
    name: z.string().nullish(),
    notes: z.string().nullish(),
    position: z.lazy(() => PositionInputSchema().nullish()),
    roomId: z.string().nullish(),
    rotation: z.number().nullish(),
    unitId: z.string(),
  });
}

export function UpdatePipeRouteInputSchema(): z.ZodObject<
  Properties<UpdatePipeRouteInput>
> {
  return z.object({
    diameterMm: z.number().nullish(),
    id: z.string(),
    insulation: z.boolean().nullish(),
    kind: z.string().nullish(),
    notes: z.string().nullish(),
    points: z.array(z.lazy(() => PositionInputSchema())).nullish(),
    slopePercent: z.number().nullish(),
    unitId: z.string(),
  });
}

export function UpdateRiserInputSchema(): z.ZodObject<
  Properties<UpdateRiserInput>
> {
  return z.object({
    id: z.string(),
    kind: z.string().nullish(),
    label: z.string().nullish(),
    notes: z.string().nullish(),
    unitId: z.string(),
    x: z.number().nullish(),
    y: z.number().nullish(),
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

export function UpdateSettingsInputSchema(): z.ZodObject<
  Properties<UpdateSettingsInput>
> {
  return z.object({
    pipeDiameterMm: z.number().nullish(),
    showLabels: z.boolean().nullish(),
    showMountHeights: z.boolean().nullish(),
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

export function UpdateUnitInputSchema(): z.ZodObject<
  Properties<UpdateUnitInput>
> {
  return z.object({
    id: z.string(),
    level: z.number().nullish(),
    name: z.string().nullish(),
  });
}
