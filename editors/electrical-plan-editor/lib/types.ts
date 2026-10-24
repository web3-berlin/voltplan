export type {
  CableRoute,
  CabinetDevice,
  ElectricalBreaker,
  ElectricalCable,
  ElectricalCircuit,
  ElectricalDistributor,
  ElectricalPlanGlobalState,
  ElectricalRoom,
  ElectricalSettings,
  ElectricalSymbol,
  ElectricalUnit,
  GroupAddress,
  InspectionReport,
  PlanBackground,
  Position,
} from "document-models/electrical-plan/v1";

export type CircuitKind = "lighting" | "sockets" | "appliance" | "hvac" | "other";
export type ElectricalCategoryId =
  | "distribution"
  | "outlet"
  | "switch"
  | "lighting"
  | "appliance"
  | "data"
  | "safety"
  | "hvac"
  | "knx"
  | "other";
export type ElectricalMount = "wall" | "ceiling" | "floor" | "din";
export interface SymbolPoint { x: number; y: number; }
export type SymbolPart =
  | { kind: "line"; points: SymbolPoint[]; closed?: boolean; fill?: boolean; stroke?: boolean }
  | { kind: "circle"; cx: number; cy: number; r: number; fill?: boolean; stroke?: boolean }
  | { kind: "arc"; cx: number; cy: number; r: number; start: number; end: number; stroke?: boolean; fill?: boolean }
  | { kind: "rect"; x: number; y: number; w: number; h: number; fill?: boolean; stroke?: boolean }
  | { kind: "text"; x: number; y: number; text: string; size?: number; weight?: "normal" | "bold" };

export interface ElectricalKnxFunction {
  key: string;
  name: string;
  de: string;
  dpt: string;
}

export interface ElectricalSymbolDef {
  id: string;
  name: string;
  de: string;
  category: ElectricalCategoryId;
  mount: ElectricalMount;
  defaultHeightCm: number;
  widthCm: number;
  heightCm: number;
  powerW?: number;
  unit?: string;
  article?: string;
  price?: number;
  bus?: boolean;
  manufacturer?: string;
  orderNumber?: string;
  channels?: number;
  /** KNX bus load in 10 mA units (as used in KNX line planning). */
  busLoads?: number;
  /** Optional explicit typical bus current; overrides busLoads * 10 mA. */
  busCurrentMa?: number;
  /** Power supply output in mA, for devices that supply the bus. */
  busSupplyMa?: number;
  application?: string;
  knxFunctions?: ElectricalKnxFunction[];
  parts: SymbolPart[];
  tags?: string[];
}
