import { polygonAreaM2 } from "../lib/geometry.js";
import type { HlskFixture, HlskRoom } from "../lib/types.js";

interface Props {
  rooms: HlskRoom[];
  fixtures: HlskFixture[];
  selectedRoomId: string | null;
  onSelect: (id: string) => void;
  onDrawRoom: () => void;
}

export function RoomList({
  rooms,
  fixtures,
  selectedRoomId,
  onSelect,
  onDrawRoom,
}: Props) {
  return (
    <div className="border-t border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Rooms</h3>
        <button
          type="button"
          onClick={onDrawRoom}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          Draw room
        </button>
      </div>
      {rooms.length === 0 ? (
        <p className="mt-2 text-[11px] leading-snug text-slate-500">
          No rooms yet. Draw an outline so fixtures can be assigned to rooms.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {rooms.map((room) => {
            const count = fixtures.filter(
              (fixture) => fixture.roomId === room.id,
            ).length;
            return (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => onSelect(room.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                    selectedRoomId === room.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: room.fillColor ?? "#0ea5e9" }}
                    />
                    <span className="truncate font-medium text-slate-800">
                      {room.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-500">
                    {polygonAreaM2(room.points).toFixed(1)} m² · {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
