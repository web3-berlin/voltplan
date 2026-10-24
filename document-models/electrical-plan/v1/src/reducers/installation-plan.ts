import type { ElectricalPlanInstallationPlanOperations } from "document-models/electrical-plan/v1";
import {
  DuplicateIdError,
  InvalidRoomError,
  InvalidUnitError,
  UnknownRoomError,
  UnknownSymbolError,
  UnknownUnitError,
} from "../../gen/installation-plan/error.js";

export const electricalPlanInstallationPlanOperations: ElectricalPlanInstallationPlanOperations =
  {
    addUnitOperation(state, action) {
      if (!action.input.name.trim())
        throw new InvalidUnitError("A unit needs a name");
      if (state.units.some((u) => u.id === action.input.id))
        throw new DuplicateIdError("Unit id already exists");
      state.units.push({
        id: action.input.id,
        name: action.input.name,
        level: action.input.level,
        symbols: [],
        rooms: [],
        background: null,
      });
    },
    renameUnitOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.id);
      if (!u) throw new UnknownUnitError("Unknown unit");
      if (!action.input.name.trim())
        throw new InvalidUnitError("A unit needs a name");
      u.name = action.input.name;
    },
    addSymbolOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      if (
        state.units.some((x) =>
          x.symbols.some((s) => s.id === action.input.symbol.id),
        )
      )
        throw new DuplicateIdError("Symbol id already exists");
      const symbol = action.input.symbol;
      u.symbols.push({
        ...symbol,
        circuitId: symbol.circuitId ?? null,
        color: symbol.color ?? null,
        label: symbol.label ?? null,
        locked: symbol.locked ?? null,
        mountHeightCm: symbol.mountHeightCm ?? null,
        roomId: symbol.roomId ?? null,
        details: null,
        knx: symbol.knxEnabled
          ? { enabled: true, groupAddressIds: [], participantName: null }
          : null,
      });
    },
    updateSymbolOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      const s = u.symbols.find((x) => x.id === action.input.id);
      if (!s) throw new UnknownSymbolError("Unknown symbol");
      const i = action.input;
      if (i.defId !== undefined && i.defId !== null) s.defId = i.defId;
      if (i.circuitId !== undefined) s.circuitId = i.circuitId;
      if (i.roomId !== undefined) s.roomId = i.roomId;
      if (i.label !== undefined) s.label = i.label;
      if (i.color !== undefined) s.color = i.color;
      if (i.rotation !== undefined && i.rotation !== null)
        s.rotation = i.rotation;
      if (i.mountHeightCm !== undefined) s.mountHeightCm = i.mountHeightCm;
      if (i.locked !== undefined && i.locked !== null) s.locked = i.locked;
      if (i.knxEnabled !== undefined && i.knxEnabled !== null) {
        s.knx = {
          enabled: i.knxEnabled,
          groupAddressIds: i.knxEnabled ? (s.knx?.groupAddressIds ?? []) : [],
          participantName: s.knx?.participantName ?? null,
        };
        if (!i.knxEnabled)
          state.groupAddresses = state.groupAddresses.filter(
            (address) => address.fixtureId !== s.id,
          );
      }
    },
    moveSymbolOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      const s = u.symbols.find((x) => x.id === action.input.id);
      if (!s) throw new UnknownSymbolError("Unknown symbol");
      s.position = { x: action.input.x, y: action.input.y };
    },
    removeSymbolOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      u.symbols = u.symbols.filter((s) => s.id !== action.input.id);
      state.groupAddresses = state.groupAddresses.filter(
        (ga) => ga.fixtureId !== action.input.id,
      );
    },
    setActiveUnitOperation(state, action) {
      if (!state.units.some((u) => u.id === action.input.unitId))
        throw new UnknownUnitError("Unknown unit");
      state.activeUnitId = action.input.unitId;
    },
    setUnitBackgroundOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      const background = action.input.background;
      u.background = background
        ? {
            dataUrl: background.dataUrl ?? null,
            widthCm: background.widthCm ?? null,
            heightCm: background.heightCm ?? null,
            x: background.x,
            y: background.y,
            scale: background.scale,
            opacity: background.opacity,
            rotation: background.rotation,
            locked: background.locked,
          }
        : null;
    },
    updateUnitBackgroundOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      if (!u.background)
        u.background = {
          dataUrl: null,
          widthCm: null,
          heightCm: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.5,
          rotation: 0,
          locked: false,
        };
      const i = action.input;
      const b = u.background;
      if (i.dataUrl !== undefined) b.dataUrl = i.dataUrl;
      if (i.widthCm !== undefined) b.widthCm = i.widthCm;
      if (i.heightCm !== undefined) b.heightCm = i.heightCm;
      if (i.x != null) b.x = i.x;
      if (i.y != null) b.y = i.y;
      if (i.scale != null) b.scale = i.scale;
      if (i.opacity != null) b.opacity = i.opacity;
      if (i.rotation != null) b.rotation = i.rotation;
      if (i.locked != null) b.locked = i.locked;
    },
    addRoomOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      const r = action.input.room;
      if (!r.name.trim()) throw new InvalidRoomError("A room needs a name");
      if (r.points.length < 3)
        throw new InvalidRoomError("A room needs at least three points");
      u.rooms = u.rooms ?? [];
      if (u.rooms.some((x) => x.id === r.id))
        throw new DuplicateIdError("Room id already exists");
      u.rooms.push({
        id: r.id,
        name: r.name.trim(),
        points: r.points.map((point) => ({ x: point.x, y: point.y })),
        fillColor: r.fillColor ?? null,
        labelX: r.labelX,
        labelY: r.labelY,
        locked: r.locked ?? null,
      });
    },
    updateRoomOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      const r = (u.rooms ?? []).find((x) => x.id === action.input.id);
      if (!r) throw new UnknownRoomError("Unknown room");
      const i = action.input;
      if (i.name != null) {
        if (!i.name.trim()) throw new InvalidRoomError("A room needs a name");
        r.name = i.name.trim();
      }
      if (i.fillColor !== undefined) r.fillColor = i.fillColor;
      if (i.points != null)
        r.points = i.points.map((point) => ({ x: point.x, y: point.y }));
      if (i.labelX !== undefined && i.labelX !== null) r.labelX = i.labelX;
      if (i.labelY !== undefined && i.labelY !== null) r.labelY = i.labelY;
      if (i.locked !== undefined) r.locked = i.locked;
    },
    removeRoomOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      if (!(u.rooms ?? []).some((x) => x.id === action.input.id))
        throw new UnknownRoomError("Unknown room");
      u.rooms = (u.rooms ?? []).filter((x) => x.id !== action.input.id);
      for (const s of u.symbols)
        if (s.roomId === action.input.id) s.roomId = null;
    },
    updateSettingsOperation(state, action) {
      const s = action.input.settings;
      if (s.symbolStyle != null) state.settings.symbolStyle = s.symbolStyle;
      if (s.showCircuitBadges != null)
        state.settings.showCircuitBadges = s.showCircuitBadges;
      if (s.showMountHeights != null)
        state.settings.showMountHeights = s.showMountHeights;
    },
    setProjectNameOperation(state, action) {
      if (!action.input.name.trim())
        throw new InvalidUnitError("A project needs a name");
      state.name = action.input.name;
    },
    updateSymbolDetailsOperation(state, action) {
      const u = state.units.find((x) => x.id === action.input.unitId);
      if (!u) throw new UnknownUnitError("Unknown unit");
      const s = u.symbols.find((x) => x.id === action.input.id);
      if (!s) throw new UnknownSymbolError("Unknown symbol");
      const i = action.input;
      s.details = {
        photos: s.details?.photos ?? null,
        price: i.price !== undefined ? i.price : (s.details?.price ?? null),
        note: i.note !== undefined ? i.note : (s.details?.note ?? null),
      };
    },
  };
