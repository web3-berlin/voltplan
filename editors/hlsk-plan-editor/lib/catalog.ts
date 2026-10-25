import type {
  Discipline,
  DuctKindDef,
  FixtureDef,
  FixturePart,
  PipeKindDef,
  Point,
  RiserKindDef,
} from "./types.js";

const pt = (x: number, y: number): Point => ({ x, y });

function L(
  points: [number, number][],
  opts: { closed?: boolean; fill?: boolean; stroke?: boolean } = {},
): FixturePart {
  return { kind: "line", points: points.map(([x, y]) => pt(x, y)), ...opts };
}
function C(
  cx: number,
  cy: number,
  r: number,
  opts: { fill?: boolean; stroke?: boolean } = {},
): FixturePart {
  return { kind: "circle", cx, cy, r, ...opts };
}
function A(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
  opts: { fill?: boolean; stroke?: boolean } = {},
): FixturePart {
  return { kind: "arc", cx, cy, r, start, end, ...opts };
}
function R(
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fill?: boolean; stroke?: boolean } = {},
): FixturePart {
  return { kind: "rect", x, y, w, h, ...opts };
}
const SANITARY = "#0284c7";
const HEATING = "#dc2626";
const VENTILATION = "#0f766e";
const CLIMATE = "#7c3aed";

export const DISCIPLINES: {
  id: Discipline;
  name: string;
  description: string;
  color: string;
}[] = [
  {
    id: "sanitary",
    name: "Sanitary",
    description: "Toilets, washbasins, showers, drains and waste water.",
    color: SANITARY,
  },
  {
    id: "heating",
    name: "Heating",
    description: "Radiators, underfloor heating, heat source and hot water.",
    color: HEATING,
  },
  {
    id: "ventilation",
    name: "Ventilation",
    description: "Fresh air supply, exhaust air and ductwork.",
    color: VENTILATION,
  },
  {
    id: "climate",
    name: "Climate",
    description: "Air-conditioning, room temperature and humidity control.",
    color: CLIMATE,
  },
];

export const FIXTURES: FixtureDef[] = [
  {
    id: "wc",
    kind: "wc",
    discipline: "sanitary",
    name: "Toilet",
    description:
      "Flush toilet. Needs a waste pipe with fall and a cold-water supply.",
    defaultHeightCm: 0,
    widthCm: 38,
    heightCm: 70,
    color: SANITARY,
    parts: [
      R(-15, -20, 30, 11, { stroke: true }),
      C(0, 5, 12, { stroke: true }),
      C(0, 5, 7, { stroke: true }),
      L(
        [
          [0, -9],
          [0, -3],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "washbasin",
    kind: "washbasin",
    discipline: "sanitary",
    name: "Washbasin",
    description: "Hand washbasin, usually mounted at about 80–85 cm height.",
    defaultHeightCm: 82,
    widthCm: 60,
    heightCm: 45,
    color: SANITARY,
    parts: [
      R(-16, -8, 32, 16, { stroke: true }),
      C(0, 2, 4, { stroke: true }),
      L(
        [
          [0, -8],
          [0, -14],
          [7, -14],
        ],
        { stroke: true },
      ),
      L(
        [
          [-5, -14],
          [5, -14],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "shower",
    kind: "shower",
    discipline: "sanitary",
    name: "Shower",
    description: "Shower area with floor drain. Needs a waste pipe with fall.",
    defaultHeightCm: 0,
    widthCm: 90,
    heightCm: 90,
    color: SANITARY,
    parts: [
      R(-15, -15, 30, 30, { stroke: true }),
      L(
        [
          [-15, -15],
          [15, 15],
        ],
        { stroke: true },
      ),
      L(
        [
          [-15, 15],
          [15, -15],
        ],
        { stroke: true },
      ),
      C(0, -10, 4, { stroke: true }),
      L(
        [
          [0, -6],
          [0, 0],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "bathtub",
    kind: "bathtub",
    discipline: "sanitary",
    name: "Bathtub",
    description: "Bathtub with waste outlet. Needs a waste pipe with fall.",
    defaultHeightCm: 0,
    widthCm: 170,
    heightCm: 75,
    color: SANITARY,
    parts: [
      R(-20, -10, 40, 20, { stroke: true }),
      R(-15, -6, 30, 12, { stroke: true }),
      C(13, 0, 3, { stroke: true }),
      L(
        [
          [-18, -12],
          [-18, -3],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "floor_drain",
    kind: "floor_drain",
    discipline: "sanitary",
    name: "Floor drain",
    description:
      "Lowest point of a wet room. Connect it to the waste pipe with fall.",
    defaultHeightCm: 0,
    widthCm: 15,
    heightCm: 15,
    color: SANITARY,
    parts: [
      R(-7, -7, 14, 14, { stroke: true }),
      L(
        [
          [-7, -7],
          [7, 7],
        ],
        { stroke: true },
      ),
      L(
        [
          [-7, 7],
          [7, -7],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "washing_machine",
    kind: "washing_machine",
    discipline: "sanitary",
    name: "Washing machine",
    description: "Washing machine with cold-water supply and waste connection.",
    defaultHeightCm: 0,
    widthCm: 60,
    heightCm: 60,
    color: SANITARY,
    parts: [
      R(-14, -16, 28, 32, { stroke: true }),
      C(0, 2, 8, { stroke: true }),
      L(
        [
          [-10, -12],
          [10, -12],
        ],
        { stroke: true },
      ),
      L(
        [
          [-8, -12],
          [-8, -9],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "sink",
    kind: "sink",
    discipline: "sanitary",
    name: "Kitchen sink",
    description: "Kitchen sink with cold-water supply and waste outlet.",
    defaultHeightCm: 90,
    widthCm: 80,
    heightCm: 50,
    color: SANITARY,
    parts: [
      R(-18, -10, 36, 20, { stroke: true }),
      C(0, 0, 4, { stroke: true }),
      L(
        [
          [8, -10],
          [8, -16],
          [14, -16],
        ],
        { stroke: true },
      ),
      L(
        [
          [4, -16],
          [12, -16],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "urinal",
    kind: "urinal",
    discipline: "sanitary",
    name: "Urinal",
    description: "Wall urinal with waste connection and cold-water supply.",
    defaultHeightCm: 60,
    widthCm: 35,
    heightCm: 40,
    color: SANITARY,
    parts: [
      R(-10, -15, 20, 30, { stroke: true }),
      A(0, 3, 9, 0, Math.PI, { stroke: true }),
      L(
        [
          [-10, -15],
          [10, -15],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "radiator",
    kind: "radiator",
    discipline: "heating",
    name: "Radiator",
    description:
      "Wall radiator for room heating. Connect it to the heating flow and return.",
    defaultHeightCm: 30,
    widthCm: 100,
    heightCm: 60,
    color: HEATING,
    parts: [
      R(-20, -10, 40, 20, { stroke: true }),
      L(
        [
          [-15, -10],
          [-15, 10],
        ],
        { stroke: true },
      ),
      L(
        [
          [-8, -10],
          [-8, 10],
        ],
        { stroke: true },
      ),
      L(
        [
          [0, -10],
          [0, 10],
        ],
        { stroke: true },
      ),
      L(
        [
          [8, -10],
          [8, 10],
        ],
        { stroke: true },
      ),
      L(
        [
          [15, -10],
          [15, 10],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "underfloor_heating",
    kind: "underfloor_heating",
    discipline: "heating",
    name: "Underfloor heating",
    description:
      "Heating loop laid in the floor. Connect it to the heating manifold.",
    defaultHeightCm: 0,
    widthCm: 120,
    heightCm: 100,
    color: HEATING,
    parts: [
      L(
        [
          [-18, -10],
          [18, -10],
          [18, -4],
          [-18, -4],
          [-18, 2],
          [18, 2],
          [18, 8],
          [-18, 8],
        ],
        { stroke: true },
      ),
      L(
        [
          [18, -10],
          [22, -10],
        ],
        { stroke: true },
      ),
      L(
        [
          [-18, 8],
          [-22, 8],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "heat_pump",
    kind: "heat_pump",
    discipline: "heating",
    name: "Heat pump",
    description:
      "Main heat source. Needs space outdoors or in a technical room.",
    defaultHeightCm: 0,
    widthCm: 120,
    heightCm: 90,
    color: HEATING,
    parts: [
      R(-20, -14, 40, 28, { stroke: true }),
      C(0, 0, 10, { stroke: true }),
      L(
        [
          [0, -10],
          [0, 10],
        ],
        { stroke: true },
      ),
      L(
        [
          [-10, 0],
          [10, 0],
        ],
        { stroke: true },
      ),
      L(
        [
          [-15, 14],
          [15, 14],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "boiler",
    kind: "boiler",
    discipline: "heating",
    name: "Boiler",
    description:
      "Hot-water boiler. Needs a cold-water supply, heating connection and waste drain.",
    defaultHeightCm: 0,
    widthCm: 70,
    heightCm: 120,
    color: HEATING,
    parts: [
      R(-12, -20, 24, 40, { stroke: true }),
      C(0, -5, 7, { stroke: true }),
      L(
        [
          [-10, 12],
          [10, 12],
        ],
        { stroke: true },
      ),
      L(
        [
          [0, -20],
          [0, -28],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "buffer_tank",
    kind: "buffer_tank",
    discipline: "heating",
    name: "Buffer tank",
    description: "Stores hot water and balances heating output.",
    defaultHeightCm: 0,
    widthCm: 80,
    heightCm: 140,
    color: HEATING,
    parts: [
      R(-12, -22, 24, 44, { stroke: true }),
      L(
        [
          [-12, -12],
          [12, -12],
        ],
        { stroke: true },
      ),
      L(
        [
          [-12, 0],
          [12, 0],
        ],
        { stroke: true },
      ),
      L(
        [
          [-12, 12],
          [12, 12],
        ],
        { stroke: true },
      ),
      L(
        [
          [0, -22],
          [0, -30],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "towel_radiator",
    kind: "towel_radiator",
    discipline: "heating",
    name: "Towel radiator",
    description:
      "Warm towel rail in a bathroom. Connect it to the heating flow and return.",
    defaultHeightCm: 90,
    widthCm: 50,
    heightCm: 100,
    color: HEATING,
    parts: [
      L(
        [
          [-18, -12],
          [18, -12],
        ],
        { stroke: true },
      ),
      L(
        [
          [-18, 12],
          [18, 12],
        ],
        { stroke: true },
      ),
      L(
        [
          [-12, -12],
          [-12, 12],
        ],
        { stroke: true },
      ),
      L(
        [
          [0, -12],
          [0, 12],
        ],
        { stroke: true },
      ),
      L(
        [
          [12, -12],
          [12, 12],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "ventilation_unit",
    kind: "ventilation_unit",
    discipline: "ventilation",
    name: "Ventilation unit",
    description: "Central fresh-air unit. Connect supply and exhaust ducts.",
    defaultHeightCm: 220,
    widthCm: 100,
    heightCm: 70,
    color: VENTILATION,
    parts: [
      R(-20, -12, 40, 24, { stroke: true }),
      C(-9, 0, 8, { stroke: true }),
      C(9, 0, 8, { stroke: true }),
      L(
        [
          [-9, -8],
          [-9, 8],
        ],
        { stroke: true },
      ),
      L(
        [
          [9, -8],
          [9, 8],
        ],
        { stroke: true },
      ),
      L(
        [
          [-20, -12],
          [-24, -12],
        ],
        { stroke: true },
      ),
      L(
        [
          [20, -12],
          [24, -12],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "supply_diffuser",
    kind: "supply_diffuser",
    discipline: "ventilation",
    name: "Supply air diffuser",
    description: "Ceiling diffuser that supplies fresh air into the room.",
    defaultHeightCm: 260,
    widthCm: 60,
    heightCm: 60,
    color: VENTILATION,
    parts: [
      R(-14, -6, 28, 12, { stroke: true }),
      L(
        [
          [-8, -6],
          [-8, 6],
        ],
        { stroke: true },
      ),
      L(
        [
          [0, -6],
          [0, 6],
        ],
        { stroke: true },
      ),
      L(
        [
          [8, -6],
          [8, 6],
        ],
        { stroke: true },
      ),
      L(
        [
          [0, 6],
          [0, 14],
        ],
        { stroke: true },
      ),
      L(
        [
          [0, 14],
          [-4, 10],
        ],
        { stroke: true },
      ),
      L(
        [
          [0, 14],
          [4, 10],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "exhaust_grille",
    kind: "exhaust_grille",
    discipline: "ventilation",
    name: "Exhaust air grille",
    description: "Ceiling or wall grille that removes stale air.",
    defaultHeightCm: 250,
    widthCm: 50,
    heightCm: 30,
    color: VENTILATION,
    parts: [
      R(-14, -6, 28, 12, { stroke: true }),
      L(
        [
          [-10, -3],
          [10, -3],
        ],
        { stroke: true },
      ),
      L(
        [
          [-10, 0],
          [10, 0],
        ],
        { stroke: true },
      ),
      L(
        [
          [-10, 3],
          [10, 3],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "extract_fan",
    kind: "extract_fan",
    discipline: "ventilation",
    name: "Extract fan",
    description: "Bathroom extract fan. Needs an exhaust duct or wall outlet.",
    defaultHeightCm: 200,
    widthCm: 30,
    heightCm: 30,
    color: VENTILATION,
    parts: [
      C(0, 0, 12, { stroke: true }),
      L(
        [
          [0, -8],
          [0, 8],
        ],
        { stroke: true },
      ),
      L(
        [
          [-8, 0],
          [8, 0],
        ],
        { stroke: true },
      ),
      L(
        [
          [-6, -6],
          [6, 6],
        ],
        { stroke: true },
      ),
      L(
        [
          [-6, 6],
          [6, -6],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "ac_indoor",
    kind: "ac_indoor",
    discipline: "climate",
    name: "Air-conditioning indoor unit",
    description:
      "Wall unit that cools or heats a room. Needs a refrigerant line to the outdoor unit.",
    defaultHeightCm: 220,
    widthCm: 90,
    heightCm: 25,
    color: CLIMATE,
    parts: [
      R(-20, -6, 40, 12, { stroke: true }),
      L(
        [
          [-16, -2],
          [16, -2],
        ],
        { stroke: true },
      ),
      L(
        [
          [-16, 2],
          [16, 2],
        ],
        { stroke: true },
      ),
      L(
        [
          [12, 6],
          [20, 10],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "ac_outdoor",
    kind: "ac_outdoor",
    discipline: "climate",
    name: "Air-conditioning outdoor unit",
    description:
      "Outdoor condenser. Needs space outdoors and a refrigerant line to the indoor unit.",
    defaultHeightCm: 0,
    widthCm: 90,
    heightCm: 60,
    color: CLIMATE,
    parts: [
      R(-18, -14, 36, 28, { stroke: true }),
      C(0, 0, 10, { stroke: true }),
      L(
        [
          [0, -10],
          [0, 10],
        ],
        { stroke: true },
      ),
      L(
        [
          [-10, 0],
          [10, 0],
        ],
        { stroke: true },
      ),
      L(
        [
          [-14, 14],
          [14, 14],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "thermostat",
    kind: "thermostat",
    discipline: "climate",
    name: "Room thermostat",
    description:
      "Controls room temperature. Place it away from drafts and direct sun.",
    defaultHeightCm: 140,
    widthCm: 10,
    heightCm: 10,
    color: CLIMATE,
    parts: [
      C(0, 0, 8, { stroke: true }),
      C(0, 0, 3, { fill: true }),
      L(
        [
          [0, -8],
          [0, -12],
        ],
        { stroke: true },
      ),
    ],
  },
  {
    id: "humidity_sensor",
    kind: "humidity_sensor",
    discipline: "climate",
    name: "Humidity sensor",
    description: "Measures room humidity for ventilation and climate control.",
    defaultHeightCm: 150,
    widthCm: 10,
    heightCm: 10,
    color: CLIMATE,
    parts: [
      C(0, 0, 8, { stroke: true }),
      L(
        [
          [0, -5],
          [0, -1],
        ],
        { stroke: true },
      ),
      A(0, -1, 4, 0, Math.PI, { stroke: true }),
    ],
  },
];

export const PIPE_KINDS: PipeKindDef[] = [
  {
    id: "waste",
    name: "Waste water",
    short: "Waste",
    description:
      "Waste pipe that carries soiled water away. It needs at least 1% fall.",
    color: "#92400e",
    defaultDiameterMm: 50,
    requiresSlope: true,
  },
  {
    id: "cold_water",
    name: "Cold water",
    short: "Cold",
    description: "Drinking-water supply to sanitary fixtures and appliances.",
    color: "#2563eb",
    defaultDiameterMm: 15,
    requiresSlope: false,
  },
  {
    id: "hot_water",
    name: "Hot water",
    short: "Hot",
    description: "Hot-water supply to sanitary fixtures and appliances.",
    color: "#dc2626",
    defaultDiameterMm: 15,
    requiresSlope: false,
  },
  {
    id: "heating_supply",
    name: "Heating flow",
    short: "Flow",
    description:
      "Warm water flowing from the heat source to radiators or loops.",
    color: "#ea580c",
    defaultDiameterMm: 20,
    requiresSlope: false,
  },
  {
    id: "heating_return",
    name: "Heating return",
    short: "Return",
    description:
      "Cooler water returning from radiators or loops to the heat source.",
    color: "#f97316",
    defaultDiameterMm: 20,
    requiresSlope: false,
  },
  {
    id: "condensate",
    name: "Condensate drain",
    short: "Condensate",
    description:
      "Drain for condensation from heating or climate equipment. Needs fall.",
    color: "#64748b",
    defaultDiameterMm: 25,
    requiresSlope: true,
  },
];

export const DUCT_KINDS: DuctKindDef[] = [
  {
    id: "supply",
    name: "Supply air",
    short: "Supply",
    description: "Fresh, filtered air from the ventilation unit to the rooms.",
    color: "#0d9488",
  },
  {
    id: "exhaust",
    name: "Exhaust air",
    short: "Exhaust",
    description: "Stale air from the rooms back to the ventilation unit.",
    color: "#b45309",
  },
  {
    id: "fresh_air",
    name: "Fresh air intake",
    short: "Intake",
    description: "Outside air intake to the ventilation unit.",
    color: "#0891b2",
  },
  {
    id: "return_air",
    name: "Return air",
    short: "Return",
    description: "Air returning to the unit after passing through the rooms.",
    color: "#4b5563",
  },
];

export const RISER_KINDS: RiserKindDef[] = [
  {
    id: "cold_water",
    name: "Cold-water riser",
    short: "Cold",
    description: "Vertical cold-water pipe between floors.",
    color: "#2563eb",
  },
  {
    id: "hot_water",
    name: "Hot-water riser",
    short: "Hot",
    description: "Vertical hot-water pipe between floors.",
    color: "#dc2626",
  },
  {
    id: "waste",
    name: "Waste riser",
    short: "Waste",
    description: "Vertical waste pipe between floors.",
    color: "#92400e",
  },
  {
    id: "heating",
    name: "Heating riser",
    short: "Heating",
    description: "Vertical heating flow and return between floors.",
    color: "#ea580c",
  },
  {
    id: "supply_air",
    name: "Supply-air riser",
    short: "Supply",
    description: "Vertical supply-air duct between floors.",
    color: "#0d9488",
  },
  {
    id: "exhaust_air",
    name: "Exhaust-air riser",
    short: "Exhaust",
    description: "Vertical exhaust-air duct between floors.",
    color: "#b45309",
  },
];

export const DISCIPLINE_BY_ID = new Map(
  DISCIPLINES.map((item) => [item.id, item]),
);
export const FIXTURE_BY_ID = new Map(FIXTURES.map((item) => [item.id, item]));
export const PIPE_BY_ID = new Map(PIPE_KINDS.map((item) => [item.id, item]));
export const DUCT_BY_ID = new Map(DUCT_KINDS.map((item) => [item.id, item]));
export const RISER_BY_ID = new Map(RISER_KINDS.map((item) => [item.id, item]));

export function getFixtureDef(id: string): FixtureDef | undefined {
  return FIXTURE_BY_ID.get(id);
}

export function disciplineColor(discipline: Discipline): string {
  return DISCIPLINE_BY_ID.get(discipline)?.color ?? "#64748b";
}

export function pipeLabel(kind: string): string {
  return PIPE_BY_ID.get(kind)?.name ?? kind;
}

export function ductLabel(kind: string): string {
  return DUCT_BY_ID.get(kind)?.name ?? kind;
}

export function riserLabel(kind: string): string {
  return RISER_BY_ID.get(kind)?.name ?? kind;
}

export function disciplineLabel(discipline: string): string {
  return DISCIPLINE_BY_ID.get(discipline as Discipline)?.name ?? discipline;
}
