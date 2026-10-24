# Planvolt

Planvolt is a Powerhouse document-model package for electrical planning. It turns a floor plan into a structured electrical document: DIN 18015 / DIN EN 60617-inspired symbols, circuits, bill of materials, DIN-rail cabinet layout, KNX group addresses, an inspection protocol and an auto-generated single-line diagram.

The package is built as a Powerhouse document model plus a React editor, so it runs in Connect and can be consumed by reactors, processors and subgraphs the same way as other Powerhouse packages.

## What is included

| Area | Features |
|---|---|
| Installation plan | 102 DIN symbols, searchable palette, click-to-place, drag to move, rotate, lock, duplicate, delete, label, mounting height, circuit badge, cable-route polylines with automatic length, multi-floor documents, PDF/PNG/JPG/WebP underlay with page selection, opacity, lock and width calibration, drag-and-drop import, zoom controls, right-drag pan, middle-click rotate, zoom-independent and enlarged socket/switch icon glyphs |
| Rooms | Polygon drawing on the plan, automatic symbol assignment, room colours, area in m², rename/delete, draggable labels, **select and reshape rooms** (drag body or vertices, double-click an edge to add a vertex, Alt-click a vertex to remove it, Ctrl+C / Ctrl+V duplicates a room, lock/unlock prevents moving and reshaping), room schedule with points and load, room assignment in properties |
| Circuits | SK numbering, circuit kinds, colour, phase, breaker characteristic/rating/poles, RCD/RCBO, cable type/cross-section/length (manual or from route), live load aggregation, current calculation, voltage-drop estimate, overload/protection warnings, recommendation button, duplicate-number detection |
| BOM | Groups by category, symbol and cabinet quantities, cable lengths, room breakdown, room schedule, per-symbol price overrides and notes, material totals, CSV and print/PDF |
| KNX | Bus participant flag on symbols, MDT device catalogue (Glastaster II Smart with temperature sensor, switch/dimmer/blind/heating actuators), manufacturer/order number/channel metadata, line bus-load calculation with reserve warnings, stable three-level group-address generation, DPT mapping, duplicate detection, KNX XML export (Group Address Export schema) and CSV |
| Cabinet | Distribution boards, rows × TE, auto-plan (main switch, SPD, meter, RCD banks, MCBs/RCBOs, terminal blocks, KNX actuator proposal), manual add/delete devices, reserve check, DIN-rail SVG preview, CSV and print |
| Protocol | Per-circuit RCD trip time and test current, insulation resistance and test voltage, continuity, loop impedance, rotating field, visual inspection, result, tester, signature, test/next-test dates and notes; CSV and print/PDF |
| Diagram | Auto-generated single-line diagram grouped by distribution board, paginated, SVG per page and print/PDF |
| Exports | Plan SVG and PNG (underlay embedded), plan print/PDF, combined project PDF (summary, plan, BOM, rooms, cabinet, diagrams, protocol), BOM CSV/print, KNX XML/CSV, cabinet SVG/CSV/print, protocol CSV/print, diagram SVG/print |

## Architecture

```
specs/electrical-plan.json                  canonical document-model spec
document-models/electrical-plan/v1/
  gen/                                      generated GraphQL/Zod/action code
  src/reducers/                             document operations (normalisation, validation)
editors/electrical-plan-editor/
  editor.tsx                                editor shell: floors, tabs, import, keyboard
  components/                               plan canvas, palette, properties, panels
  lib/catalog.ts                            89 electrical symbols
  lib/engine.ts                             circuits, routes, BOM, KNX, cabinet, protocol, diagram
  lib/rooms.ts                              room geometry, area, hit testing
  lib/report.ts                             combined project PDF HTML
  lib/engine.test.ts                        engine tests
powerhouse.manifest.json                    package manifest
```

The document model owns the data. All UI mutations go through generated actions (`addSymbol`, `assignSymbolCircuit`, `planCabinet`, `setGroupAddresses`, `updateReport`, …), which are persisted by the host. The editor never keeps a second source of truth for the plan.

Coordinates are centimetres. A background is calibrated by `widthCm`/`heightCm`; symbols store position, rotation, mount height, label, colour, lock, circuit and room assignment. A unit is one floor and owns its background, rooms and symbols. Documents created before rooms existed remain readable: `rooms` is nullable in the schema and treated as empty by the editor.

## Getting started

```bash
pnpm install
pnpm connect        # Connect at http://localhost:3000
```

Create a drive, then **Create New Document → Electrical Plan v1**.

Other useful commands:

```bash
pnpm test           # Vitest
pnpm tsc            # typecheck
pnpm build          # package build
pnpm generate       # regenerate model/editor code from specs/
```

## Importing a floor plan

Use **Import plan** in the editor header and choose a PDF, PNG, JPG or WebP. For a multi-page PDF you are asked which page to use. The rendered page is stored as a JPEG data URL in the document, with a default width of 1200 cm. Adjust **Width (cm)** in the plan settings to calibrate against a known dimension. The plan image is included in plan SVG and print/PDF exports.

## Current boundaries

- The underlay is raster. Rooms are manually drawn polygons; there is no wall tracing, OCR or automatic room recognition.
- Cable routes are polyline runs on the installation plan; they feed length, BOM and voltage-drop calculations. Automatic routing around walls and reserved cable trays is not implemented.
- The circuit diagram is generated from circuit topology; it is not a free-form multi-page schematic editor and has no cross-reference editor yet.
- Voltage drop is a cold-cable estimate from the entered length, current and cross-section. Cable ampacity uses planning tables for installation method, ambient temperature and grouping; final selection must follow the cable manufacturer and DIN VDE 0298-4. Loop impedance is recorded in the protocol but disconnection conditions are not calculated yet.
- KNX bus load is summed per project; line topology, couplers and per-line segmentation are not modelled yet. ETS project import/export remains out of scope.
- KNX addresses are generated and exported, but ETS project import/export and participant programming are not implemented.
- BOM prices default to the built-in catalogue values; each placed symbol can override the price and carry a note.
- The combined project PDF uses the browser print dialog, not a server-side PDF renderer.

## License

AGPL-3.0-only.
