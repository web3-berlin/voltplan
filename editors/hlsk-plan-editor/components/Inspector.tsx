import { actions } from "document-models/hlsk-plan";
import type { HlskPlanAction } from "document-models/hlsk-plan/v1";

import {
  DUCT_KINDS,
  PIPE_KINDS,
  RISER_KINDS,
  disciplineLabel,
  ductLabel,
  getFixtureDef,
  pipeLabel,
  riserLabel,
} from "../lib/catalog.js";
import { polygonAreaM2, roomAt, unitRooms } from "../lib/geometry.js";
import type {
  DuctRoute,
  HlskFixture,
  HlskRoom,
  HlskUnit,
  PipeRoute,
  Riser,
} from "../lib/types.js";
import { FixtureGlyph } from "./FixtureGlyph.js";

export type InspectorSelection =
  | { kind: "fixture"; item: HlskFixture }
  | { kind: "room"; item: HlskRoom }
  | { kind: "pipe"; item: PipeRoute }
  | { kind: "duct"; item: DuctRoute }
  | { kind: "riser"; item: Riser };

interface Props {
  unit: HlskUnit;
  dispatch: (action: HlskPlanAction) => void;
  selection: InspectorSelection | null;
  onDeselect: () => void;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelClass =
  "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500";

function Hint({ children }: { children: string }) {
  return (
    <p className="mt-1 text-[11px] leading-snug text-slate-500">{children}</p>
  );
}

function DeleteButton({
  onClick,
  disabled,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
    >
      Delete
    </button>
  );
}

export function Inspector({ unit, dispatch, selection, onDeselect }: Props) {
  if (!selection) {
    return (
      <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-slate-900">Inspector</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Select a fixture, room, pipe, duct or riser on the plan to edit its
            details. Plain-language help appears here.
          </p>
          <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-snug text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">Fixtures</span> —
              drag them to move. Lock a fixture to avoid accidental moves.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Rooms</span> — draw
              an outline, then name it. Fixtures inside are assigned
              automatically.
            </p>
            <p>
              <span className="font-semibold text-slate-800">
                Pipes and ducts
              </span>{" "}
              — draw routes from one end to the other. Use the specialty tabs to
              focus each trade.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Risers</span> —
              mark the vertical shaft between floors.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  if (selection.kind === "fixture") {
    const fixture = selection.item;
    const definition = getFixtureDef(fixture.kind);
    const rooms = unitRooms(unit);
    return (
      <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              {definition ? (
                <svg
                  viewBox="-26 -26 52 52"
                  className="h-9 w-9"
                  aria-hidden="true"
                >
                  <FixtureGlyph
                    parts={definition.parts}
                    color={definition.color}
                  />
                </svg>
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {disciplineLabel(fixture.discipline)}
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-900">
                {definition?.name ?? fixture.name}
              </h2>
              <p className="mt-1 text-[11px] leading-snug text-slate-500">
                {definition?.description ?? "Fixture details"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-b border-slate-200 p-4">
          <label>
            <span className={labelClass}>Name shown on the plan</span>
            <input
              key={`${fixture.id}-${fixture.name}`}
              defaultValue={fixture.name}
              className={inputClass}
              onBlur={(event) => {
                const name = event.target.value.trim();
                if (name)
                  dispatch(
                    actions.updateFixture({
                      unitId: unit.id,
                      id: fixture.id,
                      name,
                    }),
                  );
              }}
            />
          </label>
          <label>
            <span className={labelClass}>Room</span>
            <select
              value={fixture.roomId ?? ""}
              className={inputClass}
              onChange={(event) =>
                dispatch(
                  actions.updateFixture({
                    unitId: unit.id,
                    id: fixture.id,
                    roomId: event.target.value || null,
                  }),
                )
              }
            >
              <option value="">No room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={labelClass}>Mount height (cm)</span>
              <input
                key={`${fixture.id}-${fixture.mountHeightCm}`}
                type="number"
                min="0"
                defaultValue={
                  fixture.mountHeightCm ?? definition?.defaultHeightCm ?? 0
                }
                className={inputClass}
                onBlur={(event) =>
                  dispatch(
                    actions.updateFixture({
                      unitId: unit.id,
                      id: fixture.id,
                      mountHeightCm: Number(event.target.value),
                    }),
                  )
                }
              />
            </label>
            <label>
              <span className={labelClass}>Rotation</span>
              <select
                value={fixture.rotation}
                className={inputClass}
                onChange={(event) =>
                  dispatch(
                    actions.updateFixture({
                      unitId: unit.id,
                      id: fixture.id,
                      rotation: Number(event.target.value),
                    }),
                  )
                }
              >
                <option value="0">0°</option>
                <option value="90">90°</option>
                <option value="180">180°</option>
                <option value="270">270°</option>
              </select>
            </label>
          </div>
          <label>
            <span className={labelClass}>Notes</span>
            <textarea
              key={`${fixture.id}-${fixture.notes}`}
              defaultValue={fixture.notes ?? ""}
              rows={2}
              className={inputClass}
              onBlur={(event) =>
                dispatch(
                  actions.updateFixture({
                    unitId: unit.id,
                    id: fixture.id,
                    notes: event.target.value.trim() || null,
                  }),
                )
              }
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={fixture.locked ?? false}
              onChange={(event) =>
                dispatch(
                  actions.updateFixture({
                    unitId: unit.id,
                    id: fixture.id,
                    locked: event.target.checked,
                  }),
                )
              }
            />
            Lock this fixture in place
          </label>
        </div>

        <div className="mt-auto p-4">
          <DeleteButton
            onClick={() => {
              dispatch(
                actions.removeFixture({ unitId: unit.id, id: fixture.id }),
              );
              onDeselect();
            }}
          />
        </div>
      </aside>
    );
  }

  if (selection.kind === "room") {
    const room = selection.item;
    const fixturesInRoom = unit.fixtures.filter(
      (fixture) => fixture.roomId === room.id,
    );
    return (
      <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Room
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-900">
            {room.name}
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">
            {polygonAreaM2(room.points).toFixed(1)} m² · {fixturesInRoom.length}{" "}
            fixture{fixturesInRoom.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="space-y-3 border-b border-slate-200 p-4">
          <label>
            <span className={labelClass}>Room name</span>
            <input
              key={`${room.id}-${room.name}`}
              defaultValue={room.name}
              className={inputClass}
              onBlur={(event) => {
                const name = event.target.value.trim();
                if (name)
                  dispatch(
                    actions.updateRoom({ unitId: unit.id, id: room.id, name }),
                  );
              }}
            />
          </label>
          <label>
            <span className={labelClass}>Room colour</span>
            <input
              type="color"
              value={room.fillColor ?? "#0ea5e9"}
              className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
              onChange={(event) =>
                dispatch(
                  actions.updateRoom({
                    unitId: unit.id,
                    id: room.id,
                    fillColor: event.target.value,
                  }),
                )
              }
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={room.locked ?? false}
              onChange={(event) =>
                dispatch(
                  actions.updateRoom({
                    unitId: unit.id,
                    id: room.id,
                    locked: event.target.checked,
                  }),
                )
              }
            />
            Lock this room
          </label>
          <Hint>
            Rooms are outlines. Draw a new room from the Floor plan tab.
            Fixtures inside a room are assigned automatically when placed.
          </Hint>
        </div>
        <div className="mt-auto p-4">
          {fixturesInRoom.length > 0 ? (
            <p className="mb-2 text-[11px] text-amber-700">
              This room still contains {fixturesInRoom.length} fixture
              {fixturesInRoom.length === 1 ? "" : "s"}. Move or delete them
              first.
            </p>
          ) : null}
          <DeleteButton
            disabled={fixturesInRoom.length > 0}
            title={
              fixturesInRoom.length > 0
                ? "Move or delete the fixtures first"
                : undefined
            }
            onClick={() => {
              dispatch(actions.removeRoom({ unitId: unit.id, id: room.id }));
              onDeselect();
            }}
          />
        </div>
      </aside>
    );
  }

  if (selection.kind === "pipe") {
    const route = selection.item;
    return (
      <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Pipe route
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-900">
            {pipeLabel(route.kind)}
          </h2>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            {PIPE_KINDS.find((kind) => kind.id === route.kind)?.description ??
              "Pipe route details"}
          </p>
        </div>
        <div className="space-y-3 border-b border-slate-200 p-4">
          <label>
            <span className={labelClass}>Pipe type</span>
            <select
              value={route.kind}
              className={inputClass}
              onChange={(event) =>
                dispatch(
                  actions.updatePipeRoute({
                    unitId: unit.id,
                    id: route.id,
                    kind: event.target.value,
                  }),
                )
              }
            >
              {PIPE_KINDS.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Diameter (mm)</span>
            <input
              key={`${route.id}-${route.diameterMm}`}
              type="number"
              min="1"
              defaultValue={route.diameterMm}
              className={inputClass}
              onBlur={(event) =>
                dispatch(
                  actions.updatePipeRoute({
                    unitId: unit.id,
                    id: route.id,
                    diameterMm: Number(event.target.value),
                  }),
                )
              }
            />
            <Hint>
              Use at least 15 mm for cold and hot water, and 50 mm for toilet
              waste.
            </Hint>
          </label>
          <label>
            <span className={labelClass}>Fall (%)</span>
            <input
              key={`${route.id}-${route.slopePercent}`}
              type="number"
              min="0"
              max="100"
              step="0.5"
              defaultValue={route.slopePercent ?? 0}
              className={inputClass}
              onBlur={(event) =>
                dispatch(
                  actions.updatePipeRoute({
                    unitId: unit.id,
                    id: route.id,
                    slopePercent: Number(event.target.value),
                  }),
                )
              }
            />
            <Hint>Waste water needs at least 1% fall so it drains away.</Hint>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={route.insulation ?? false}
              onChange={(event) =>
                dispatch(
                  actions.updatePipeRoute({
                    unitId: unit.id,
                    id: route.id,
                    insulation: event.target.checked,
                  }),
                )
              }
            />
            Insulate this pipe
          </label>
          <label>
            <span className={labelClass}>Notes</span>
            <textarea
              key={`${route.id}-${route.notes}`}
              defaultValue={route.notes ?? ""}
              rows={2}
              className={inputClass}
              onBlur={(event) =>
                dispatch(
                  actions.updatePipeRoute({
                    unitId: unit.id,
                    id: route.id,
                    notes: event.target.value.trim() || null,
                  }),
                )
              }
            />
          </label>
        </div>
        <div className="mt-auto p-4">
          <DeleteButton
            onClick={() => {
              dispatch(
                actions.removePipeRoute({ unitId: unit.id, id: route.id }),
              );
              onDeselect();
            }}
          />
        </div>
      </aside>
    );
  }

  if (selection.kind === "duct") {
    const route = selection.item;
    return (
      <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Duct route
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-900">
            {ductLabel(route.kind)}
          </h2>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            {DUCT_KINDS.find((kind) => kind.id === route.kind)?.description ??
              "Duct route details"}
          </p>
        </div>
        <div className="space-y-3 border-b border-slate-200 p-4">
          <label>
            <span className={labelClass}>Duct type</span>
            <select
              value={route.kind}
              className={inputClass}
              onChange={(event) =>
                dispatch(
                  actions.updateDuctRoute({
                    unitId: unit.id,
                    id: route.id,
                    kind: event.target.value,
                  }),
                )
              }
            >
              {DUCT_KINDS.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={labelClass}>Width (mm)</span>
              <input
                key={`${route.id}-${route.widthMm}`}
                type="number"
                min="1"
                defaultValue={route.widthMm}
                className={inputClass}
                onBlur={(event) =>
                  dispatch(
                    actions.updateDuctRoute({
                      unitId: unit.id,
                      id: route.id,
                      widthMm: Number(event.target.value),
                    }),
                  )
                }
              />
            </label>
            <label>
              <span className={labelClass}>Height (mm)</span>
              <input
                key={`${route.id}-${route.heightMm}`}
                type="number"
                min="1"
                defaultValue={route.heightMm}
                className={inputClass}
                onBlur={(event) =>
                  dispatch(
                    actions.updateDuctRoute({
                      unitId: unit.id,
                      id: route.id,
                      heightMm: Number(event.target.value),
                    }),
                  )
                }
              />
            </label>
          </div>
          <label>
            <span className={labelClass}>Airflow (m³/h)</span>
            <input
              key={`${route.id}-${route.airflowM3h}`}
              type="number"
              min="0"
              defaultValue={route.airflowM3h ?? 0}
              className={inputClass}
              onBlur={(event) =>
                dispatch(
                  actions.updateDuctRoute({
                    unitId: unit.id,
                    id: route.id,
                    airflowM3h: Number(event.target.value),
                  }),
                )
              }
            />
            <Hint>
              Enter the planned air volume for this duct. Leave 0 if it is not
              decided yet.
            </Hint>
          </label>
          <label>
            <span className={labelClass}>Notes</span>
            <textarea
              key={`${route.id}-${route.notes}`}
              defaultValue={route.notes ?? ""}
              rows={2}
              className={inputClass}
              onBlur={(event) =>
                dispatch(
                  actions.updateDuctRoute({
                    unitId: unit.id,
                    id: route.id,
                    notes: event.target.value.trim() || null,
                  }),
                )
              }
            />
          </label>
        </div>
        <div className="mt-auto p-4">
          <DeleteButton
            onClick={() => {
              dispatch(
                actions.removeDuctRoute({ unitId: unit.id, id: route.id }),
              );
              onDeselect();
            }}
          />
        </div>
      </aside>
    );
  }

  const riser = selection.item;
  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Riser
        </p>
        <h2 className="mt-0.5 text-sm font-semibold text-slate-900">
          {riserLabel(riser.kind)}
        </h2>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          {RISER_KINDS.find((kind) => kind.id === riser.kind)?.description ??
            "Vertical shaft marker"}
        </p>
      </div>
      <div className="space-y-3 border-b border-slate-200 p-4">
        <label>
          <span className={labelClass}>Riser type</span>
          <select
            value={riser.kind}
            className={inputClass}
            onChange={(event) =>
              dispatch(
                actions.updateRiser({
                  unitId: unit.id,
                  id: riser.id,
                  kind: event.target.value,
                }),
              )
            }
          >
            {RISER_KINDS.map((kind) => (
              <option key={kind.id} value={kind.id}>
                {kind.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>Label</span>
          <input
            key={`${riser.id}-${riser.label}`}
            defaultValue={riser.label ?? ""}
            placeholder={riserLabel(riser.kind)}
            className={inputClass}
            onBlur={(event) =>
              dispatch(
                actions.updateRiser({
                  unitId: unit.id,
                  id: riser.id,
                  label: event.target.value.trim() || null,
                }),
              )
            }
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className={labelClass}>X (cm)</span>
            <input
              key={`${riser.id}-${riser.x}`}
              type="number"
              defaultValue={riser.x}
              className={inputClass}
              onBlur={(event) =>
                dispatch(
                  actions.updateRiser({
                    unitId: unit.id,
                    id: riser.id,
                    x: Number(event.target.value),
                  }),
                )
              }
            />
          </label>
          <label>
            <span className={labelClass}>Y (cm)</span>
            <input
              key={`${riser.id}-${riser.y}`}
              type="number"
              defaultValue={riser.y}
              className={inputClass}
              onBlur={(event) =>
                dispatch(
                  actions.updateRiser({
                    unitId: unit.id,
                    id: riser.id,
                    y: Number(event.target.value),
                  }),
                )
              }
            />
          </label>
        </div>
        <label>
          <span className={labelClass}>Notes</span>
          <textarea
            key={`${riser.id}-${riser.notes}`}
            defaultValue={riser.notes ?? ""}
            rows={2}
            className={inputClass}
            onBlur={(event) =>
              dispatch(
                actions.updateRiser({
                  unitId: unit.id,
                  id: riser.id,
                  notes: event.target.value.trim() || null,
                }),
              )
            }
          />
        </label>
      </div>
      <div className="mt-auto p-4">
        <DeleteButton
          onClick={() => {
            dispatch(actions.removeRiser({ unitId: unit.id, id: riser.id }));
            onDeselect();
          }}
        />
      </div>
    </aside>
  );
}

export function selectedRoomItem(
  unit: HlskUnit,
  id: string | null,
): InspectorSelection | null {
  const room = unitRooms(unit).find((item) => item.id === id);
  return room ? { kind: "room", item: room } : null;
}

export function roomForPoint(unit: HlskUnit, x: number, y: number) {
  return roomAt(unit, { x, y });
}
