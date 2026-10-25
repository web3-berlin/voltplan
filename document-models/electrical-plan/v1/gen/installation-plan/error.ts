export type ErrorCode =
  | "InvalidUnitError"
  | "DuplicateIdError"
  | "UnknownUnitError"
  | "InvalidRoomError"
  | "UnknownRoomError"
  | "UnknownCircuitError"
  | "UnknownSymbolError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidUnitError extends Error implements ReducerError {
  errorCode = "InvalidUnitError" as ErrorCode;
  constructor(message = "InvalidUnitError") {
    super(message);
  }
}

export class DuplicateIdError extends Error implements ReducerError {
  errorCode = "DuplicateIdError" as ErrorCode;
  constructor(message = "DuplicateIdError") {
    super(message);
  }
}

export class UnknownUnitError extends Error implements ReducerError {
  errorCode = "UnknownUnitError" as ErrorCode;
  constructor(message = "UnknownUnitError") {
    super(message);
  }
}

export class InvalidRoomError extends Error implements ReducerError {
  errorCode = "InvalidRoomError" as ErrorCode;
  constructor(message = "InvalidRoomError") {
    super(message);
  }
}

export class UnknownRoomError extends Error implements ReducerError {
  errorCode = "UnknownRoomError" as ErrorCode;
  constructor(message = "UnknownRoomError") {
    super(message);
  }
}

export class UnknownCircuitError extends Error implements ReducerError {
  errorCode = "UnknownCircuitError" as ErrorCode;
  constructor(message = "UnknownCircuitError") {
    super(message);
  }
}

export class UnknownSymbolError extends Error implements ReducerError {
  errorCode = "UnknownSymbolError" as ErrorCode;
  constructor(message = "UnknownSymbolError") {
    super(message);
  }
}

export const errors = {
  AddUnit: { InvalidUnitError, DuplicateIdError },

  RenameUnit: { UnknownUnitError, InvalidUnitError },

  AddRoom: { UnknownUnitError, DuplicateIdError, InvalidRoomError },

  UpdateRoom: { UnknownUnitError, UnknownRoomError, InvalidRoomError },

  RemoveRoom: { UnknownUnitError, UnknownRoomError },

  AddSymbol: {
    UnknownUnitError,
    DuplicateIdError,
    UnknownCircuitError,
    UnknownRoomError,
  },

  UpdateSymbol: {
    UnknownUnitError,
    UnknownSymbolError,
    UnknownCircuitError,
    UnknownRoomError,
  },

  UpdateSymbolDetails: { UnknownUnitError, UnknownSymbolError },

  MoveSymbol: { UnknownUnitError, UnknownSymbolError },

  RemoveSymbol: { UnknownUnitError, UnknownSymbolError },

  SetProjectName: { InvalidUnitError },

  SetActiveUnit: { UnknownUnitError },

  SetUnitBackground: { UnknownUnitError },

  UpdateUnitBackground: { UnknownUnitError },
};
