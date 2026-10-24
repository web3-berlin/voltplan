import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "planvolt/electrical-plan",
  name: "Electrical Plan",
  author: {
    name: "Planvolt",
    website: "https://openplan3d.com",
  },
  extension: "epl",
  description:
    "DIN 18015 installation plan, circuits, BOM, cabinet layout, KNX group addresses and inspection protocol for openPlan3D.",
  specifications: [
    {
      state: {
        local: {
          schema: "",
          examples: [],
          initialValue: "",
        },
        global: {
          schema:
            "type ElectricalPlanState {\n  name: String!\n  activeUnitId: OID!\n  units: [ElectricalUnit!]!\n  circuits: [ElectricalCircuit!]!\n  routes: [CableRoute!]\n  distributors: [ElectricalDistributor!]!\n  cabinetDevices: [CabinetDevice!]!\n  groupAddresses: [GroupAddress!]!\n  reports: [InspectionReport!]!\n  settings: ElectricalSettings!\n  nextCircuitNumber: Int!\n}\n\ntype ElectricalUnit {\n  id: OID!\n  name: String!\n  level: Int!\n  background: PlanBackground\n  rooms: [ElectricalRoom!]\n  symbols: [ElectricalSymbol!]!\n}\n\ntype ElectricalRoom {\n  id: OID!\n  name: String!\n  points: [Position!]!\n  fillColor: String\n  labelX: Float!\n  labelY: Float!\n  locked: Boolean\n}\n\ntype PlanBackground {\n  dataUrl: String\n  widthCm: Float\n  heightCm: Float\n  x: Float!\n  y: Float!\n  scale: Float!\n  opacity: Float!\n  rotation: Float!\n  locked: Boolean!\n}\n\ntype Position {\n  x: Float!\n  y: Float!\n}\n\ntype KnxBinding {\n  enabled: Boolean!\n  participantName: String\n  groupAddressIds: [OID!]\n}\n\ntype ItemDetails {\n  note: String\n  price: Float\n  photos: [String!]\n}\n\ntype ElectricalSymbol {\n  id: OID!\n  defId: String!\n  position: Position!\n  rotation: Float!\n  mountHeightCm: Float\n  circuitId: OID\n  roomId: String\n  label: String\n  color: String\n  locked: Boolean\n  knx: KnxBinding\n  details: ItemDetails\n}\n\ntype ElectricalBreaker {\n  poles: Int!\n  ratingA: Float!\n  characteristic: String!\n  rcdMa: Int\n  rcbo: Boolean\n}\n\ntype ElectricalCable {\n  type: String!\n  crossSectionMm2: Float!\n  lengthM: Float\n}\n\ntype ElectricalCircuit {\n  id: OID!\n  skNumber: Int!\n  name: String!\n  kind: String!\n  distributorId: OID\n  breaker: ElectricalBreaker!\n  cable: ElectricalCable!\n  phases: [String!]\n  color: String\n  notes: String\n  installationMethod: String\n  ambientTempC: Float\n  groupedCircuits: Int\n}\n\ntype CableRoute {\n  id: OID!\n  circuitId: OID!\n  unitId: OID!\n  points: [Position!]!\n  reservePercent: Float\n}\n\ntype ElectricalDistributor {\n  id: OID!\n  name: String!\n  rows: Int!\n  tePerRow: Int!\n  reservePercent: Float!\n  location: String\n}\n\ntype CabinetDevice {\n  id: OID!\n  distributorId: OID!\n  circuitId: OID\n  kind: String!\n  label: String!\n  teWidth: Int!\n  row: Int\n  startTe: Int\n  phases: [String!]\n  article: String\n  price: Float\n}\n\ntype GroupAddress {\n  id: OID!\n  main: Int!\n  middle: Int!\n  sub: Int!\n  name: String!\n  dpt: String!\n  fixtureId: OID\n  functionKey: String\n  description: String\n}\n\ntype InspectionReport {\n  id: OID!\n  circuitId: OID!\n  result: String!\n  rcdTripMs: Float\n  rcdTestCurrentMa: Float\n  insulationMohm: Float\n  insulationTestVoltageV: Int\n  continuityOhm: Float\n  loopImpedanceOhm: Float\n  rotatingField: String\n  visualInspection: String\n  tester: String\n  testedAt: String\n  nextTestDue: String\n  signature: String\n  notes: String\n}\n\ntype ElectricalSettings {\n  symbolStyle: String!\n  showCircuitBadges: Boolean!\n  showMountHeights: Boolean!\n}\n\ninput PositionInput {\n  x: Float!\n  y: Float!\n}\n\ninput RoomInput {\n  id: OID!\n  name: String!\n  points: [PositionInput!]!\n  fillColor: String\n  labelX: Float!\n  labelY: Float!\n  locked: Boolean\n}\n\ninput ElectricalSettingsInput {\n  symbolStyle: String\n  showCircuitBadges: Boolean\n  showMountHeights: Boolean\n}\n\ninput SymbolInput {\n  id: OID!\n  defId: String!\n  knxEnabled: Boolean\n  position: PositionInput!\n  rotation: Float!\n  mountHeightCm: Float\n  circuitId: OID\n  roomId: String\n  label: String\n  color: String\n  locked: Boolean\n}\n\ninput BreakerInput {\n  poles: Int!\n  ratingA: Float!\n  characteristic: String!\n  rcdMa: Int\n  rcbo: Boolean\n}\n\ninput CableInput {\n  type: String!\n  crossSectionMm2: Float!\n  lengthM: Float\n}\n\ninput CircuitInput {\n  id: OID!\n  skNumber: Int!\n  name: String!\n  kind: String!\n  distributorId: OID\n  breaker: BreakerInput!\n  cable: CableInput!\n  phases: [String!]\n  color: String\n  notes: String\n  installationMethod: String\n  ambientTempC: Float\n  groupedCircuits: Int\n}\n\ninput CableRouteInput {\n  id: OID!\n  circuitId: OID!\n  unitId: OID!\n  points: [PositionInput!]!\n  reservePercent: Float\n}\n\ninput DistributorInput {\n  id: OID!\n  name: String!\n  rows: Int!\n  tePerRow: Int!\n  reservePercent: Float!\n  location: String\n}\n\ninput CabinetDeviceInput {\n  id: OID!\n  distributorId: OID!\n  circuitId: OID\n  kind: String!\n  label: String!\n  teWidth: Int!\n  row: Int\n  startTe: Int\n  phases: [String!]\n  article: String\n  price: Float\n}\n\ninput GroupAddressInput {\n  id: OID!\n  main: Int!\n  middle: Int!\n  sub: Int!\n  name: String!\n  dpt: String!\n  fixtureId: OID\n  functionKey: String\n  description: String\n}\n\ninput ReportInput {\n  id: OID!\n  circuitId: OID!\n  result: String!\n  rcdTripMs: Float\n  rcdTestCurrentMa: Float\n  insulationMohm: Float\n  insulationTestVoltageV: Int\n  continuityOhm: Float\n  loopImpedanceOhm: Float\n  rotatingField: String\n  visualInspection: String\n  tester: String\n  testedAt: String\n  nextTestDue: String\n  signature: String\n  notes: String\n}\n\ninput BackgroundInput {\n  dataUrl: String\n  widthCm: Float\n  heightCm: Float\n  x: Float!\n  y: Float!\n  scale: Float!\n  opacity: Float!\n  rotation: Float!\n  locked: Boolean!\n}",
          examples: [],
          initialValue:
            '{"name": "Untitled Project", "units": [{"id": "unit_1", "name": "Ground Floor", "level": 0, "symbols": [], "background": null, "rooms": []}], "circuits": [], "distributors": [], "cabinetDevices": [], "groupAddresses": [], "reports": [], "settings": {"symbolStyle": "simple", "showCircuitBadges": true, "showMountHeights": false}, "nextCircuitNumber": 1, "activeUnitId": "unit_1", "routes": []}',
        },
      },
      modules: [
        {
          id: "e7c01998-73e6-4b28-beec-26c6fe4fc83c",
          name: "installation-plan",
          description: "Units and DIN symbols",
          operations: [
            {
              id: "bc727cec-7f89-499e-83db-218d003078c8",
              name: "ADD_UNIT",
              description: "Add a storey or apartment",
              schema:
                "input AddUnitInput { id: OID! name: String! level: Int! }",
              template: "",
              reducer:
                'if (!action.input.name.trim())\n  throw new InvalidUnitError("A unit needs a name");\nif (state.units.some((u) => u.id === action.input.id))\n  throw new DuplicateIdError("Unit id already exists");\nstate.units.push({\n  id: action.input.id,\n  name: action.input.name,\n  level: action.input.level,\n  symbols: [],\n  rooms: [],\n  background: null,\n});',
              errors: [
                {
                  id: "3b1270aa-40f3-4f19-b1af-2ce6a5a2d398",
                  name: "InvalidUnitError",
                  code: "INVALID_UNIT",
                  description: "The unit name is empty",
                  template: "",
                },
                {
                  id: "904bc505-5bdb-4def-8c9c-868c8c72c0a6",
                  name: "DuplicateIdError",
                  code: "DUPLICATE_ID",
                  description: "The id is already in use",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "dede5bbd-df72-47ad-966f-bf6e859d3f39",
              name: "RENAME_UNIT",
              description: "Rename a storey",
              schema: "input RenameUnitInput { id: OID! name: String! }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.id);\nif (!u) throw new UnknownUnitError("Unknown unit");\nif (!action.input.name.trim())\n  throw new InvalidUnitError("A unit needs a name");\nu.name = action.input.name;',
              errors: [
                {
                  id: "dd7f1430-d328-4f6d-9c21-e244200e3f33",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "39488a18-be42-4c69-b412-3f2776b73daa",
                  name: "InvalidUnitError",
                  code: "INVALID_UNIT",
                  description: "The unit name is empty",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "09a0d656-001a-471f-82c5-026acff06dd1",
              name: "ADD_ROOM",
              description: "Add a room polygon",
              schema: "input AddRoomInput { unitId: OID! room: RoomInput! }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nconst r = action.input.room;\nif (!r.name.trim()) throw new InvalidRoomError("A room needs a name");\nif (r.points.length < 3)\n  throw new InvalidRoomError("A room needs at least three points");\nif (!r.points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)))\n  throw new InvalidRoomError("Room points must be finite");\nu.rooms = u.rooms ?? [];\nif (u.rooms.some((x) => x.id === r.id))\n  throw new DuplicateIdError("Room id already exists");\nu.rooms.push({\n  id: r.id,\n  name: r.name.trim(),\n  points: r.points.map((point) => ({ x: point.x, y: point.y })),\n  fillColor: r.fillColor ?? null,\n  labelX: r.labelX,\n  labelY: r.labelY,\n  locked: r.locked ?? null,\n});',
              errors: [
                {
                  id: "4c4de3f7-c1b5-488c-9e5f-c7efbe734fb5",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "276f0b36-7243-463c-bfd3-66dd75e0bd9e",
                  name: "DuplicateIdError",
                  code: "DUPLICATE_ID",
                  description: "The room id is already in use",
                  template: "",
                },
                {
                  id: "49ca19fa-259b-463e-9c5c-8620b9ed76a9",
                  name: "InvalidRoomError",
                  code: "INVALID_ROOM",
                  description: "The room name or points are invalid",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "9a692684-ac57-481a-b5f8-dd197ddcd3e9",
              name: "UPDATE_ROOM",
              description: "Rename, recolour, reshape, relabel or lock a room",
              schema:
                "input UpdateRoomInput { unitId: OID! id: OID! name: String fillColor: String points: [PositionInput!] labelX: Float labelY: Float locked: Boolean }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nconst r = (u.rooms ?? []).find((x) => x.id === action.input.id);\nif (!r) throw new UnknownRoomError("Unknown room");\nconst i = action.input;\nif (i.name != null) {\n  if (!i.name.trim()) throw new InvalidRoomError("A room needs a name");\n  r.name = i.name.trim();\n}\nif (i.fillColor !== undefined) r.fillColor = i.fillColor;\nif (i.points != null) {\n  if (i.points.length < 3)\n    throw new InvalidRoomError("A room needs at least three points");\n  if (!i.points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)))\n    throw new InvalidRoomError("Room points must be finite");\n  r.points = i.points.map((point) => ({ x: point.x, y: point.y }));\n}\nif (i.labelX !== undefined && i.labelX !== null) r.labelX = i.labelX;\nif (i.labelY !== undefined && i.labelY !== null) r.labelY = i.labelY;\nif (i.locked !== undefined) r.locked = i.locked;',
              errors: [
                {
                  id: "42d3c50e-006b-4987-8488-71e9715563f9",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "7aec0ac8-0c20-4f5f-93b1-f1f36906f1fb",
                  name: "UnknownRoomError",
                  code: "UNKNOWN_ROOM",
                  description: "The room does not exist",
                  template: "",
                },
                {
                  id: "b90412b2-2489-48ac-b331-2967b9f807b8",
                  name: "InvalidRoomError",
                  code: "INVALID_ROOM",
                  description: "The room name or points are invalid",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "a492163f-640b-455b-ac77-b47d0f0dd876",
              name: "REMOVE_ROOM",
              description: "Remove a room polygon from a floor",
              schema: "input RemoveRoomInput { unitId: OID! id: OID! }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nif (!(u.rooms ?? []).some((x) => x.id === action.input.id)) throw new UnknownRoomError("Unknown room");\nu.rooms = (u.rooms ?? []).filter((x) => x.id !== action.input.id);\nfor (const s of u.symbols) if (s.roomId === action.input.id) s.roomId = null;',
              errors: [
                {
                  id: "157a8ddd-7fee-4f79-94ca-7d5c18822d5a",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "b4fd424d-249c-4984-ab66-56b4dbddfc4c",
                  name: "UnknownRoomError",
                  code: "UNKNOWN_ROOM",
                  description: "The room does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "93c0516d-e269-47f4-8065-8128dea818af",
              name: "ADD_SYMBOL",
              description: "Place a DIN 18015 symbol",
              schema:
                "input AddSymbolInput { unitId: OID! symbol: SymbolInput! }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nif (\n  state.units.some((x) =>\n    x.symbols.some((s) => s.id === action.input.symbol.id),\n  )\n)\n  throw new DuplicateIdError("Symbol id already exists");\nconst symbol = action.input.symbol;\nif (\n  symbol.circuitId != null &&\n  __omp_shell("state.circuits.some((c) => c.id === symbol.circuitId)")\n)\n  throw new UnknownCircuitError("Unknown circuit");\nif (\n  symbol.roomId != null &&\n  __omp_shell("(u.rooms ?? []).some((r) => r.id === symbol.roomId)")\n)\n  throw new UnknownRoomError("Unknown room");\nu.symbols.push({\n  id: symbol.id,\n  defId: symbol.defId,\n  position: { x: symbol.position.x, y: symbol.position.y },\n  rotation: symbol.rotation,\n  mountHeightCm: symbol.mountHeightCm ?? null,\n  label: symbol.label ?? null,\n  color: symbol.color ?? null,\n  locked: symbol.locked ?? null,\n  circuitId: symbol.circuitId ?? null,\n  roomId: symbol.roomId ?? null,\n  details: null,\n  knx: symbol.knxEnabled\n    ? { enabled: true, groupAddressIds: [], participantName: null }\n    : null,\n});',
              errors: [
                {
                  id: "f49f6f73-1362-4a5f-b863-6cba6d2b6b3c",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "14ed02c5-055e-4953-b9ab-9f94b76da7f1",
                  name: "DuplicateIdError",
                  code: "DUPLICATE_ID",
                  description: "The symbol id is already in use",
                  template: "",
                },
                {
                  id: "a3ed4754-7f47-4ba7-87a5-cc2376f83cc2",
                  name: "UnknownCircuitError",
                  code: "UNKNOWN_CIRCUIT",
                  description: "The circuit does not exist",
                  template: "",
                },
                {
                  id: "4c48d684-a750-491c-8b9d-f311a535acfd",
                  name: "UnknownRoomError",
                  code: "UNKNOWN_ROOM",
                  description: "The room does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "8c50a7ea-2a4b-467b-ac35-7b4e08960c58",
              name: "UPDATE_SYMBOL",
              description: "Change a placed symbol",
              schema:
                "input UpdateSymbolInput { unitId: OID! id: OID! defId: String circuitId: OID roomId: String label: String color: String rotation: Float mountHeightCm: Float locked: Boolean knxEnabled: Boolean }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nconst s = u.symbols.find((x) => x.id === action.input.id);\nif (!s) throw new UnknownSymbolError("Unknown symbol");\nconst i = action.input;\nif (i.defId !== undefined && i.defId !== null) s.defId = i.defId;\nif (i.circuitId !== undefined) {\n  if (\n    i.circuitId != null &&\n    __omp_shell("state.circuits.some((c) => c.id === i.circuitId)")\n  )\n    throw new UnknownCircuitError("Unknown circuit");\n  s.circuitId = i.circuitId;\n}\nif (i.roomId !== undefined) {\n  if (\n    i.roomId != null &&\n    __omp_shell("(u.rooms ?? []).some((r) => r.id === i.roomId)")\n  )\n    throw new UnknownRoomError("Unknown room");\n  s.roomId = i.roomId;\n}\nif (i.label !== undefined) s.label = i.label;\nif (i.color !== undefined) s.color = i.color;\nif (i.rotation !== undefined && i.rotation !== null)\n  s.rotation = i.rotation;\nif (i.mountHeightCm !== undefined) s.mountHeightCm = i.mountHeightCm;\nif (i.locked !== undefined && i.locked !== null) s.locked = i.locked;\nif (i.knxEnabled !== undefined && i.knxEnabled !== null) {\n  s.knx = {\n    enabled: i.knxEnabled,\n    groupAddressIds: i.knxEnabled ? (s.knx?.groupAddressIds ?? []) : [],\n    participantName: s.knx?.participantName ?? null,\n  };\n  if (!i.knxEnabled)\n    state.groupAddresses = state.groupAddresses.filter(\n      (address) => address.fixtureId !== s.id,\n    );\n}',
              errors: [
                {
                  id: "309453c1-3fb4-42a4-b812-17e0ec018b4c",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "f1f532ee-de4e-48bb-9452-833fd1b34e13",
                  name: "UnknownSymbolError",
                  code: "UNKNOWN_SYMBOL",
                  description: "The symbol does not exist",
                  template: "",
                },
                {
                  id: "d42745a3-c749-48d1-932d-78643456d952",
                  name: "UnknownCircuitError",
                  code: "UNKNOWN_CIRCUIT",
                  description: "The circuit does not exist",
                  template: "",
                },
                {
                  id: "ba798623-8a78-41eb-a206-739a897f042a",
                  name: "UnknownRoomError",
                  code: "UNKNOWN_ROOM",
                  description: "The room does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "1b66fe73-8ebf-4837-b003-2b350c9c3f69",
              name: "UPDATE_SYMBOL_DETAILS",
              description: "Edit price and note for a placed symbol",
              schema:
                "input UpdateSymbolDetailsInput { unitId: OID! id: OID! price: Float note: String }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nconst s = u.symbols.find((x) => x.id === action.input.id);\nif (!s) throw new UnknownSymbolError("Unknown symbol");\nconst i = action.input;\ns.details = {\n  photos: s.details?.photos ?? null,\n  price: i.price !== undefined ? i.price : (s.details?.price ?? null),\n  note: i.note !== undefined ? i.note : (s.details?.note ?? null),\n};',
              errors: [
                {
                  id: "41c16b17-7de2-47ab-85e4-b5368cc9cfa1",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "3c60e155-9b07-4317-8afa-a46de1040959",
                  name: "UnknownSymbolError",
                  code: "UNKNOWN_SYMBOL",
                  description: "The symbol does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "3fd7107b-4994-4442-ac99-6325bdbd7bff",
              name: "MOVE_SYMBOL",
              description: "Move a placed symbol",
              schema:
                "input MoveSymbolInput { unitId: OID! id: OID! x: Float! y: Float! }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nconst s = u.symbols.find((x) => x.id === action.input.id);\nif (!s) throw new UnknownSymbolError("Unknown symbol");\ns.position = { x: action.input.x, y: action.input.y };',
              errors: [
                {
                  id: "dbed52ee-8913-4323-bf34-e258a4c2bddc",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "5de54214-e127-4e3c-ad85-83343d9188a0",
                  name: "UnknownSymbolError",
                  code: "UNKNOWN_SYMBOL",
                  description: "The symbol does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "296837fb-eee2-4c7e-8314-c53839dca6b5",
              name: "REMOVE_SYMBOL",
              description: "Remove a placed symbol",
              schema: "input RemoveSymbolInput { unitId: OID! id: OID! }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nif (!u.symbols.some((s) => s.id === action.input.id))\n  throw new UnknownSymbolError("Unknown symbol");\nu.symbols = u.symbols.filter((s) => s.id !== action.input.id);\nstate.groupAddresses = state.groupAddresses.filter(\n  (ga) => ga.fixtureId !== action.input.id,\n);',
              errors: [
                {
                  id: "10cc80de-b5e4-4129-9324-9a06a604c441",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "57fc9345-99c0-4ce2-bcf0-be6176bcf8d7",
                  name: "UnknownSymbolError",
                  code: "UNKNOWN_SYMBOL",
                  description: "The symbol does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "6b2247e0-7222-4e41-a716-3de0a4cb4672",
              name: "SET_PROJECT_NAME",
              description: "Change the project name stored in the document",
              schema: "input SetProjectNameInput { name: String! }",
              template: "",
              reducer:
                'if (!action.input.name.trim())\n  throw new InvalidUnitError("A project needs a name");\nstate.name = action.input.name;',
              errors: [
                {
                  id: "3e2f0f03-d71b-4dcf-90ca-8b5a5a85d358",
                  name: "InvalidUnitError",
                  code: "INVALID_UNIT",
                  description: "The name is empty",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "b26b58c7-60e3-4ce5-883d-ad3468345a56",
              name: "SET_ACTIVE_UNIT",
              description: "Activate a storey",
              schema: "input SetActiveUnitInput { unitId: OID! }",
              template: "",
              reducer:
                'if (!state.units.some((u) => u.id === action.input.unitId))\n  throw new UnknownUnitError("Unknown unit");\nstate.activeUnitId = action.input.unitId;',
              errors: [
                {
                  id: "03d1c9f9-877f-46bf-9e05-a56c6fe07f73",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "d7b359f8-39d1-40a5-b720-3106d22bd90b",
              name: "SET_UNIT_BACKGROUND",
              description: "Attach or clear the floor-plan underlay",
              schema:
                "input SetUnitBackgroundInput { unitId: OID! background: BackgroundInput }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nconst background = action.input.background;\nu.background = background\n  ? {\n      dataUrl: background.dataUrl ?? null,\n      widthCm: background.widthCm ?? null,\n      heightCm: background.heightCm ?? null,\n      x: background.x,\n      y: background.y,\n      scale: background.scale,\n      opacity: background.opacity,\n      rotation: background.rotation,\n      locked: background.locked,\n    }\n  : null;',
              errors: [
                {
                  id: "e12d8a08-29cc-494a-ae2a-65e146eed3b4",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "2a78e842-333d-44e2-8d1e-9cba1e7a1372",
              name: "UPDATE_UNIT_BACKGROUND",
              description: "Calibrate/move the underlay",
              schema:
                "input UpdateUnitBackgroundInput { unitId: OID! dataUrl: String widthCm: Float heightCm: Float x: Float y: Float scale: Float opacity: Float rotation: Float locked: Boolean }",
              template: "",
              reducer:
                'const u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nif (!u.background)\n  u.background = {\n    dataUrl: null,\n    widthCm: null,\n    heightCm: null,\n    x: 0,\n    y: 0,\n    scale: 1,\n    opacity: 0.5,\n    rotation: 0,\n    locked: false,\n  };\nconst i = action.input;\nconst b = u.background;\nif (i.dataUrl !== undefined) b.dataUrl = i.dataUrl;\nif (i.widthCm !== undefined) b.widthCm = i.widthCm;\nif (i.heightCm !== undefined) b.heightCm = i.heightCm;\nif (i.x != null) b.x = i.x;\nif (i.y != null) b.y = i.y;\nif (i.scale != null) b.scale = i.scale;\nif (i.opacity != null) b.opacity = i.opacity;\nif (i.rotation != null) b.rotation = i.rotation;\nif (i.locked != null) b.locked = i.locked;',
              errors: [
                {
                  id: "230fd24d-a265-4975-8e2e-726e2c5ae3d0",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "56b89164-fc07-414a-bc69-4c16c393b653",
              name: "UPDATE_SETTINGS",
              description: "Change plan display settings",
              schema:
                "input UpdateSettingsInput { settings: ElectricalSettingsInput! }",
              template: "",
              reducer:
                "const s = action.input.settings;\nif (s.symbolStyle != null) state.settings.symbolStyle = s.symbolStyle;\nif (s.showCircuitBadges != null) state.settings.showCircuitBadges = s.showCircuitBadges;\nif (s.showMountHeights != null) state.settings.showMountHeights = s.showMountHeights;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "d1c4c92f-8b97-4270-a8e9-366052907ea5",
          name: "circuits",
          description: "Circuits, protection and cable",
          operations: [
            {
              id: "28a4229b-623e-49d0-9dab-18f8fe7c4c53",
              name: "ADD_CIRCUIT",
              description: "Add a circuit to the topology",
              schema: "input AddCircuitInput { circuit: CircuitInput! }",
              template: "",
              reducer:
                'if (state.circuits.some((c) => c.id === action.input.circuit.id))\n  throw new DuplicateIdError("Circuit id already exists");\nif (\n  state.circuits.some((c) => c.skNumber === action.input.circuit.skNumber)\n)\n  throw new DuplicateCircuitNumberError("Circuit number already exists");\nconst c = action.input.circuit;\nif (!Number.isInteger(c.skNumber) || c.skNumber < 1)\n  throw new InvalidCircuitError("Circuit number must be a positive integer");\nif (!c.name.trim()) throw new InvalidCircuitError("A circuit needs a name");\nif (!c.kind.trim()) throw new InvalidCircuitError("A circuit needs a kind");\nif (!c.breaker.characteristic.trim())\n  throw new InvalidCircuitError("A breaker needs a characteristic");\nif (!Number.isInteger(c.breaker.poles) || c.breaker.poles < 1 || c.breaker.poles > 3)\n  throw new InvalidCircuitError("Breaker poles must be 1, 2 or 3");\nif (!Number.isFinite(c.breaker.ratingA) || c.breaker.ratingA <= 0)\n  throw new InvalidCircuitError("Breaker rating must be positive");\nif (\n  c.breaker.rcdMa != null &&\n  (!Number.isFinite(c.breaker.rcdMa) ||\n    c.breaker.rcdMa < 0 ||\n    c.breaker.rcdMa > 300)\n)\n  throw new InvalidCircuitError("RCD rating must be between 0 and 300 mA");\nif (!c.cable.type.trim()) throw new InvalidCircuitError("A cable needs a type");\nif (!Number.isFinite(c.cable.crossSectionMm2) || c.cable.crossSectionMm2 <= 0)\n  throw new InvalidCircuitError("Cable cross-section must be positive");\nif (\n  c.cable.lengthM != null &&\n  (!Number.isFinite(c.cable.lengthM) || c.cable.lengthM < 0)\n)\n  throw new InvalidCircuitError("Cable length must be non-negative");\nif (c.ambientTempC != null && !Number.isFinite(c.ambientTempC))\n  throw new InvalidCircuitError("Ambient temperature must be finite");\nif (\n  c.groupedCircuits != null &&\n  (!Number.isInteger(c.groupedCircuits) || c.groupedCircuits < 1)\n)\n  throw new InvalidCircuitError("Grouped circuits must be a positive integer");\nif (\n  c.distributorId != null &&\n  __omp_shell("state.distributors.some((d) => d.id === c.distributorId)")\n)\n  throw new UnknownDistributorError("Unknown distribution board");\nstate.circuits.push({\n  id: c.id,\n  skNumber: c.skNumber,\n  name: c.name,\n  kind: c.kind,\n  distributorId: c.distributorId ?? null,\n  color: c.color ?? null,\n  notes: c.notes ?? null,\n  phases: c.phases ?? null,\n  breaker: {\n    characteristic: c.breaker.characteristic,\n    poles: c.breaker.poles,\n    ratingA: c.breaker.ratingA,\n    rcbo: c.breaker.rcbo ?? false,\n    rcdMa: c.breaker.rcdMa ?? null,\n  },\n  cable: {\n    type: c.cable.type,\n    crossSectionMm2: c.cable.crossSectionMm2,\n    lengthM: c.cable.lengthM ?? null,\n  },\n  installationMethod: c.installationMethod ?? "B2",\n  ambientTempC: c.ambientTempC ?? 30,\n  groupedCircuits: c.groupedCircuits ?? 1,\n});\nstate.nextCircuitNumber = Math.max(\n  state.nextCircuitNumber,\n  c.skNumber + 1,\n);',
              errors: [
                {
                  id: "c64733ae-404f-45ce-9bf1-96645faf37bc",
                  name: "DuplicateIdError",
                  code: "DUPLICATE_ID",
                  description: "The circuit id is already in use",
                  template: "",
                },
                {
                  id: "583048fe-b574-4caa-98cd-39fb3551c4fa",
                  name: "DuplicateCircuitNumberError",
                  code: "DUPLICATE_SK",
                  description: "The circuit number is already in use",
                  template: "",
                },
                {
                  id: "89abc309-931b-417a-beff-35cb6f10eb79",
                  name: "InvalidCircuitError",
                  code: "INVALID_CIRCUIT",
                  description: "Circuit fields are invalid",
                  template: "",
                },
                {
                  id: "68abe8be-b96c-48fe-ba25-85fc56b2b753",
                  name: "UnknownDistributorError",
                  code: "UNKNOWN_DISTRIBUTOR",
                  description: "The distribution board does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "5a59a89b-732d-47da-98b0-6721208eee25",
              name: "UPDATE_CIRCUIT",
              description: "Update a circuit",
              schema:
                "input UpdateCircuitInput { id: OID! name: String kind: String distributorId: OID color: String ratingA: Float characteristic: String poles: Int rcdMa: Int rcbo: Boolean phases: [String!] cableType: String crossSectionMm2: Float lengthM: Float notes: String installationMethod: String ambientTempC: Float groupedCircuits: Int }",
              template: "",
              reducer:
                'const c = state.circuits.find((x) => x.id === action.input.id);\nif (!c) throw new UnknownCircuitError("Unknown circuit");\nconst i = action.input;\nif (i.name != null) {\n  if (!i.name.trim()) throw new InvalidCircuitError("A circuit needs a name");\n  c.name = i.name;\n}\nif (i.kind != null) {\n  if (!i.kind.trim()) throw new InvalidCircuitError("A circuit needs a kind");\n  c.kind = i.kind;\n}\nif (i.color !== undefined) c.color = i.color;\nif (i.phases !== undefined) c.phases = i.phases;\nif (i.distributorId !== undefined) {\n  if (\n    i.distributorId != null &&\n    __omp_shell("state.distributors.some((d) => d.id === i.distributorId)")\n  )\n    throw new UnknownDistributorError("Unknown distribution board");\n  c.distributorId = i.distributorId;\n}\nif (i.ratingA != null) {\n  if (!Number.isFinite(i.ratingA) || i.ratingA <= 0)\n    throw new InvalidCircuitError("Breaker rating must be positive");\n  c.breaker.ratingA = i.ratingA;\n}\nif (i.characteristic != null) {\n  if (!i.characteristic.trim())\n    throw new InvalidCircuitError("A breaker needs a characteristic");\n  c.breaker.characteristic = i.characteristic;\n}\nif (i.poles != null) {\n  if (!Number.isInteger(i.poles) || i.poles < 1 || i.poles > 3)\n    throw new InvalidCircuitError("Breaker poles must be 1, 2 or 3");\n  c.breaker.poles = i.poles;\n}\nif (i.rcdMa !== undefined) {\n  if (\n    i.rcdMa != null &&\n    (!Number.isFinite(i.rcdMa) || i.rcdMa < 0 || i.rcdMa > 300)\n  )\n    throw new InvalidCircuitError("RCD rating must be between 0 and 300 mA");\n  c.breaker.rcdMa = i.rcdMa;\n}\nif (i.rcbo !== undefined && i.rcbo !== null) c.breaker.rcbo = i.rcbo;\nif (i.cableType != null) {\n  if (!i.cableType.trim()) throw new InvalidCircuitError("A cable needs a type");\n  c.cable.type = i.cableType;\n}\nif (i.crossSectionMm2 != null) {\n  if (!Number.isFinite(i.crossSectionMm2) || i.crossSectionMm2 <= 0)\n    throw new InvalidCircuitError("Cable cross-section must be positive");\n  c.cable.crossSectionMm2 = i.crossSectionMm2;\n}\nif (i.lengthM !== undefined) {\n  if (i.lengthM != null && (!Number.isFinite(i.lengthM) || i.lengthM < 0))\n    throw new InvalidCircuitError("Cable length must be non-negative");\n  c.cable.lengthM = i.lengthM;\n}\nif (i.notes !== undefined) c.notes = i.notes;\nif (i.installationMethod !== undefined)\n  c.installationMethod = i.installationMethod;\nif (i.ambientTempC !== undefined) {\n  if (i.ambientTempC != null && !Number.isFinite(i.ambientTempC))\n    throw new InvalidCircuitError("Ambient temperature must be finite");\n  c.ambientTempC = i.ambientTempC;\n}\nif (i.groupedCircuits !== undefined) {\n  if (\n    i.groupedCircuits != null &&\n    (!Number.isInteger(i.groupedCircuits) || i.groupedCircuits < 1)\n  )\n    throw new InvalidCircuitError("Grouped circuits must be a positive integer");\n  c.groupedCircuits = i.groupedCircuits;\n}',
              errors: [
                {
                  id: "b3c48627-1fe4-483a-8e24-ad0cc92d419d",
                  name: "UnknownCircuitError",
                  code: "UNKNOWN_CIRCUIT",
                  description: "The circuit does not exist",
                  template: "",
                },
                {
                  id: "1a496a55-1033-49e8-a9a1-ff424839d3ed",
                  name: "InvalidCircuitError",
                  code: "INVALID_CIRCUIT",
                  description: "Circuit fields are invalid",
                  template: "",
                },
                {
                  id: "2037e86a-f664-4e0b-b77c-94dc16b0e1be",
                  name: "UnknownDistributorError",
                  code: "UNKNOWN_DISTRIBUTOR",
                  description: "The distribution board does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "a17b0419-cdac-4d53-9d5d-36670d81d013",
              name: "REMOVE_CIRCUIT",
              description: "",
              schema: "input RemoveCircuitInput { id: OID! }",
              template: "",
              reducer:
                'if (!state.circuits.some((c) => c.id === action.input.id))\n  throw new UnknownCircuitError("Unknown circuit");\nstate.circuits = state.circuits.filter((c) => c.id !== action.input.id);\nstate.routes = (state.routes ?? []).filter(\n  (r) => r.circuitId !== action.input.id,\n);\nstate.cabinetDevices = state.cabinetDevices.filter(\n  (d) => d.circuitId !== action.input.id,\n);\nstate.reports = state.reports.filter(\n  (r) => r.circuitId !== action.input.id,\n);\nfor (const u of state.units)\n  for (const s of u.symbols)\n    if (s.circuitId === action.input.id) s.circuitId = null;',
              errors: [
                {
                  id: "5ebe4c6d-c43e-4430-b719-3803203509d9",
                  name: "UnknownCircuitError",
                  code: "UNKNOWN_CIRCUIT",
                  description: "The circuit does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "2438f546-8e28-4bcf-a9c1-0bb568007ff9",
              name: "ASSIGN_SYMBOL_CIRCUIT",
              description: "Attach a symbol to a circuit",
              schema:
                "input AssignSymbolCircuitInput { unitId: OID! symbolId: OID! circuitId: OID }",
              template: "",
              reducer:
                'if (\n  action.input.circuitId &&\n  !state.circuits.some((c) => c.id === action.input.circuitId)\n)\n  throw new UnknownCircuitError("Unknown circuit");\nconst u = state.units.find((x) => x.id === action.input.unitId);\nif (!u) throw new UnknownUnitError("Unknown unit");\nconst s = u.symbols.find((x) => x.id === action.input.symbolId);\nif (!s) throw new UnknownSymbolError("Unknown symbol");\ns.circuitId = action.input.circuitId;',
              errors: [
                {
                  id: "86dd3cef-bcdd-45e7-9b46-84c3a019d80b",
                  name: "UnknownCircuitError",
                  code: "UNKNOWN_CIRCUIT",
                  description: "The circuit does not exist",
                  template: "",
                },
                {
                  id: "e27a76e3-0b74-4e56-805c-215827b7faeb",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "e36545e1-3019-491e-94dc-f87a1d5b558c",
                  name: "UnknownSymbolError",
                  code: "UNKNOWN_SYMBOL",
                  description: "The symbol does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "a1408281-1031-4758-92df-9032a1a5fb9e",
              name: "ADD_ROUTE",
              description: "Add a cable route polyline for a circuit",
              schema: "input AddRouteInput { route: CableRouteInput! }",
              template: "",
              reducer:
                'const r = action.input.route;\nif (!state.circuits.some((c) => c.id === r.circuitId))\n  throw new UnknownCircuitError("Unknown circuit");\nif (!state.units.some((u) => u.id === r.unitId))\n  throw new UnknownUnitError("Unknown unit");\nif (!r.points || r.points.length < 2)\n  throw new InvalidRouteError("A route needs at least two points");\nif (!r.points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)))\n  throw new InvalidRouteError("Route points must be finite");\nif (r.reservePercent != null && (!Number.isFinite(r.reservePercent) || r.reservePercent < 0))\n  throw new InvalidRouteError("Route reserve must be non-negative");\nstate.routes = state.routes ?? [];\nif (state.routes.some((x) => x.id === r.id))\n  throw new DuplicateIdError("Route id already exists");\nstate.routes.push({\n  id: r.id,\n  circuitId: r.circuitId,\n  unitId: r.unitId,\n  points: r.points.map((point) => ({ x: point.x, y: point.y })),\n  reservePercent: r.reservePercent ?? 10,\n});',
              errors: [
                {
                  id: "5732e44d-1fd6-4156-be3d-2dd54ef99ad0",
                  name: "UnknownCircuitError",
                  code: "UNKNOWN_CIRCUIT",
                  description: "The circuit does not exist",
                  template: "",
                },
                {
                  id: "46c439b8-77f0-4f2f-8346-96eb6b006d38",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "1b9af54b-f926-4c66-bf49-bddbde55f758",
                  name: "DuplicateIdError",
                  code: "DUPLICATE_ID",
                  description: "The route id is already in use",
                  template: "",
                },
                {
                  id: "e7ef3418-beba-4aa0-84be-da0dc5577625",
                  name: "InvalidRouteError",
                  code: "INVALID_ROUTE",
                  description: "Route points or reserve are invalid",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "dd56af40-4f72-4278-ade4-03f4e33c4062",
              name: "UPDATE_ROUTE",
              description: "Update a cable route polyline",
              schema:
                "input UpdateRouteInput { id: OID! circuitId: OID unitId: OID points: [PositionInput!] reservePercent: Float }",
              template: "",
              reducer:
                'const r = (state.routes ?? []).find((x) => x.id === action.input.id);\nif (!r) throw new UnknownRouteError("Unknown route");\nconst i = action.input;\nif (i.circuitId != null) {\n  if (!state.circuits.some((c) => c.id === i.circuitId))\n    throw new UnknownCircuitError("Unknown circuit");\n  r.circuitId = i.circuitId;\n}\nif (i.unitId != null) {\n  if (!state.units.some((u) => u.id === i.unitId))\n    throw new UnknownUnitError("Unknown unit");\n  r.unitId = i.unitId;\n}\nif (i.points != null) {\n  if (i.points.length < 2)\n    throw new InvalidRouteError("A route needs at least two points");\n  if (!i.points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)))\n    throw new InvalidRouteError("Route points must be finite");\n  r.points = i.points.map((point) => ({ x: point.x, y: point.y }));\n}\nif (i.reservePercent !== undefined) {\n  if (i.reservePercent != null && (!Number.isFinite(i.reservePercent) || i.reservePercent < 0))\n    throw new InvalidRouteError("Route reserve must be non-negative");\n  r.reservePercent = i.reservePercent;\n}',
              errors: [
                {
                  id: "6546eb4b-2e81-4a8c-aa59-831b2d9fe30d",
                  name: "UnknownRouteError",
                  code: "UNKNOWN_ROUTE",
                  description: "The route does not exist",
                  template: "",
                },
                {
                  id: "faef4f0d-69f6-4933-b4a7-138fbbb8204f",
                  name: "UnknownCircuitError",
                  code: "UNKNOWN_CIRCUIT",
                  description: "The circuit does not exist",
                  template: "",
                },
                {
                  id: "0ac3e20a-88d3-496d-9ca5-bda1f0605dbb",
                  name: "UnknownUnitError",
                  code: "UNKNOWN_UNIT",
                  description: "The unit does not exist",
                  template: "",
                },
                {
                  id: "3f85d92c-9d22-4b1c-ad23-6ceb5f045d66",
                  name: "InvalidRouteError",
                  code: "INVALID_ROUTE",
                  description: "Route points or reserve are invalid",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "b32227cc-4ac2-4d0c-8832-a67b06ff17fd",
              name: "REMOVE_ROUTE",
              description: "Remove a cable route polyline",
              schema: "input RemoveRouteInput { id: OID! }",
              template: "",
              reducer:
                'if (!(state.routes ?? []).some((x) => x.id === action.input.id))\n  throw new UnknownRouteError("Unknown route");\nstate.routes = (state.routes ?? []).filter(\n  (x) => x.id !== action.input.id,\n);',
              errors: [
                {
                  id: "57228705-6a10-4ac4-aa61-933d01f053e3",
                  name: "UnknownRouteError",
                  code: "UNKNOWN_ROUTE",
                  description: "The route does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "ef69200d-635b-43fc-a8b7-9ffc3bedd39a",
          name: "cabinet-knx-protocol",
          description: "Cabinet, KNX and inspection data",
          operations: [
            {
              id: "03dabde3-f108-4c42-9c99-ee2d7e1ff2da",
              name: "ADD_DISTRIBUTOR",
              description: "Add a distribution board",
              schema:
                "input AddDistributorInput { distributor: DistributorInput! }",
              template: "",
              reducer:
                'if (state.distributors.some((d) => d.id === action.input.distributor.id))\n  throw new DuplicateIdError("Distribution board id already exists");\nconst d = action.input.distributor;\nif (!d.name.trim()) throw new InvalidDistributorError("A distribution board needs a name");\nif (!Number.isInteger(d.rows) || d.rows < 1)\n  throw new InvalidDistributorError("Rows must be a positive integer");\nif (!Number.isInteger(d.tePerRow) || d.tePerRow < 1)\n  throw new InvalidDistributorError("TE per row must be a positive integer");\nif (\n  __omp_shell("Number.isFinite(d.reservePercent) ||")\n  d.reservePercent < 0 ||\n  d.reservePercent > 100\n)\n  throw new InvalidDistributorError("Reserve must be between 0 and 100 percent");\nstate.distributors.push({\n  ...d,\n  location: d.location ?? null,\n});',
              errors: [
                {
                  id: "adb0de5b-01a1-4abc-8394-c2d194eb0486",
                  name: "DuplicateIdError",
                  code: "DUPLICATE_ID",
                  description: "The distribution board id is already in use",
                  template: "",
                },
                {
                  id: "1d6c2fbb-e208-44fa-910e-eddc3a87ceb4",
                  name: "InvalidDistributorError",
                  code: "INVALID_DISTRIBUTOR",
                  description: "Distribution board fields are invalid",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "657f66fc-477f-4aed-bd06-3f83610231de",
              name: "UPDATE_DISTRIBUTOR",
              description: "Edit a distribution board",
              schema:
                "input UpdateDistributorInput { id: OID! name: String rows: Int tePerRow: Int reservePercent: Float location: String }",
              template: "",
              reducer:
                'const d = state.distributors.find((x) => x.id === action.input.id);\nif (!d) throw new UnknownDistributorError("Unknown distribution board");\nconst i = action.input;\nif (i.name != null) {\n  if (!i.name.trim()) throw new InvalidDistributorError("A distribution board needs a name");\n  d.name = i.name;\n}\nif (i.rows !== undefined && i.rows !== null) {\n  if (!Number.isInteger(i.rows) || i.rows < 1)\n    throw new InvalidDistributorError("Rows must be a positive integer");\n  d.rows = i.rows;\n}\nif (i.tePerRow !== undefined && i.tePerRow !== null) {\n  if (!Number.isInteger(i.tePerRow) || i.tePerRow < 1)\n    throw new InvalidDistributorError("TE per row must be a positive integer");\n  d.tePerRow = i.tePerRow;\n}\nif (i.reservePercent !== undefined && i.reservePercent !== null) {\n  if (!Number.isFinite(i.reservePercent) || i.reservePercent < 0 || i.reservePercent > 100)\n    throw new InvalidDistributorError("Reserve must be between 0 and 100 percent");\n  d.reservePercent = i.reservePercent;\n}\nif (i.location !== undefined) d.location = i.location;',
              errors: [
                {
                  id: "bf3fd299-8096-49b0-ada9-114083332103",
                  name: "UnknownDistributorError",
                  code: "UNKNOWN_DISTRIBUTOR",
                  description: "The board does not exist",
                  template: "",
                },
                {
                  id: "9564d23f-78a3-41aa-a625-a6003acdb441",
                  name: "InvalidDistributorError",
                  code: "INVALID_DISTRIBUTOR",
                  description: "Distribution board fields are invalid",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "bc783cb9-3712-4349-93a3-0f05c1f6fffc",
              name: "PLAN_CABINET",
              description: "Replace the cabinet proposal for a board",
              schema:
                "input PlanCabinetInput { distributorId: OID! devices: [CabinetDeviceInput!]! }",
              template: "",
              reducer:
                'const d = state.distributors.find(\n  (x) => x.id === action.input.distributorId,\n);\nif (!d) throw new UnknownDistributorError("Unknown distribution board");\nfor (const x of action.input.devices) {\n  if (!Number.isInteger(x.teWidth) || x.teWidth < 1)\n    throw new InvalidDistributorError("Device width must be a positive integer");\n  if (x.row != null && (!Number.isInteger(x.row) || x.row < 0))\n    throw new InvalidDistributorError("Device row must be a non-negative integer");\n  if (x.startTe != null && (!Number.isInteger(x.startTe) || x.startTe < 1))\n    throw new InvalidDistributorError("Device start TE must be a positive integer");\n  if (\n    x.circuitId != null &&\n    __omp_shell("state.circuits.some((c) => c.id === x.circuitId)")\n  )\n    throw new UnknownCircuitError("Unknown circuit");\n}\nstate.cabinetDevices = [\n  ...state.cabinetDevices.filter((x) => x.distributorId !== d.id),\n  ...action.input.devices.map((x) => ({\n    ...x,\n    distributorId: d.id,\n    article: x.article ?? null,\n    circuitId: x.circuitId ?? null,\n    phases: x.phases ?? null,\n    price: x.price ?? null,\n    row: x.row ?? null,\n    startTe: x.startTe ?? null,\n  })),\n];',
              errors: [
                {
                  id: "9fb70bb4-6d1d-4366-affe-79d22afe7e1a",
                  name: "UnknownDistributorError",
                  code: "UNKNOWN_DISTRIBUTOR",
                  description: "The board does not exist",
                  template: "",
                },
                {
                  id: "e51cd5e4-17b0-4969-a3fe-2407c37e1392",
                  name: "InvalidDistributorError",
                  code: "INVALID_DISTRIBUTOR",
                  description: "Cabinet device fields are invalid",
                  template: "",
                },
                {
                  id: "946cdfc3-0a58-4831-b08b-db63b400bcdd",
                  name: "UnknownCircuitError",
                  code: "UNKNOWN_CIRCUIT",
                  description: "The circuit does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "3c7c42dc-edd3-4387-a391-fdbf079a94f1",
              name: "SET_GROUP_ADDRESSES",
              description: "Replace the KNX group-address plan",
              schema:
                "input SetGroupAddressesInput { addresses: [GroupAddressInput!]! }",
              template: "",
              reducer:
                'const seen = new Set();\nfor (const ga of action.input.addresses) {\n  if (!Number.isInteger(ga.main) || ga.main < 0 || ga.main > 31)\n    throw new InvalidGroupAddressError("Main group must be 0..31");\n  if (!Number.isInteger(ga.middle) || ga.middle < 0 || ga.middle > 7)\n    throw new InvalidGroupAddressError("Middle group must be 0..7");\n  if (!Number.isInteger(ga.sub) || ga.sub < 0 || ga.sub > 255)\n    throw new InvalidGroupAddressError("Sub group must be 0..255");\n  const key = `${ga.main}/${ga.middle}/${ga.sub}`;\n  if (seen.has(key))\n    throw new DuplicateGroupAddressError("Duplicate group address");\n  seen.add(key);\n}\nstate.groupAddresses = action.input.addresses.map((ga) => ({\n  ...ga,\n  description: ga.description ?? null,\n  fixtureId: ga.fixtureId ?? null,\n  functionKey: ga.functionKey ?? null,\n}));',
              errors: [
                {
                  id: "7952b23c-2d26-4dc5-9a69-13031d048ed9",
                  name: "DuplicateGroupAddressError",
                  code: "DUPLICATE_GROUP_ADDRESS",
                  description: "The group address is already in use",
                  template: "",
                },
                {
                  id: "437d26c0-671f-4fee-bc22-ff00b81c49f8",
                  name: "InvalidGroupAddressError",
                  code: "INVALID_GROUP_ADDRESS",
                  description: "The group address range is invalid",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "c6184fd3-0cb8-4f6a-8944-19faaa148735",
              name: "UPDATE_REPORT",
              description: "Record an inspection result",
              schema: "input UpdateReportInput { report: ReportInput! }",
              template: "",
              reducer:
                'if (!state.circuits.some((c) => c.id === action.input.report.circuitId))\n  throw new UnknownCircuitError("Unknown circuit");\nconst r = action.input.report;\nstate.reports = [\n  ...state.reports.filter((item) => item.circuitId !== r.circuitId),\n  {\n    ...r,\n    continuityOhm: r.continuityOhm ?? null,\n    insulationMohm: r.insulationMohm ?? null,\n    insulationTestVoltageV: r.insulationTestVoltageV ?? null,\n    loopImpedanceOhm: r.loopImpedanceOhm ?? null,\n    nextTestDue: r.nextTestDue ?? null,\n    rcdTestCurrentMa: r.rcdTestCurrentMa ?? null,\n    rotatingField: r.rotatingField ?? null,\n    signature: r.signature ?? null,\n    visualInspection: r.visualInspection ?? null,\n    notes: r.notes ?? null,\n    rcdTripMs: r.rcdTripMs ?? null,\n    testedAt: r.testedAt ?? null,\n    tester: r.tester ?? null,\n  },\n];',
              errors: [
                {
                  id: "85b473cf-c4fc-41d9-bef5-6742fba836b0",
                  name: "UnknownCircuitError",
                  code: "UNKNOWN_CIRCUIT",
                  description: "The circuit does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
