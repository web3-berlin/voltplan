export type {
  DuctRoute,
  HlskFixture,
  HlskPlanGlobalState,
  HlskRoom,
  HlskSettings,
  HlskUnit,
  PipeRoute,
  PlanBackground,
  Position,
  Riser,
} from "document-models/hlsk-plan/v1";

export type Discipline = "sanitary" | "heating" | "ventilation" | "climate";

export type DrawMode =
  | { type: "room" }
  | { type: "pipe"; kind: string }
  | { type: "duct"; kind: string }
  | { type: "riser"; kind: string };

export interface Point {
  x: number;
  y: number;
}

export type FixturePart =
  | {
      kind: "line";
      points: Point[];
      closed?: boolean;
      fill?: boolean;
      stroke?: boolean;
    }
  | {
      kind: "circle";
      cx: number;
      cy: number;
      r: number;
      fill?: boolean;
      stroke?: boolean;
    }
  | {
      kind: "arc";
      cx: number;
      cy: number;
      r: number;
      start: number;
      end: number;
      stroke?: boolean;
      fill?: boolean;
    }
  | {
      kind: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      fill?: boolean;
      stroke?: boolean;
    }
  | {
      kind: "text";
      x: number;
      y: number;
      text: string;
      size?: number;
      weight?: "normal" | "bold";
    };

export interface FixtureDef {
  id: string;
  kind: string;
  discipline: Discipline;
  name: string;
  description: string;
  defaultHeightCm: number;
  widthCm: number;
  heightCm: number;
  color: string;
  parts: FixturePart[];
}

export interface PipeKindDef {
  id: string;
  name: string;
  short: string;
  description: string;
  color: string;
  defaultDiameterMm: number;
  requiresSlope: boolean;
}

export interface DuctKindDef {
  id: string;
  name: string;
  short: string;
  description: string;
  color: string;
}

export interface RiserKindDef {
  id: string;
  name: string;
  short: string;
  description: string;
  color: string;
}
