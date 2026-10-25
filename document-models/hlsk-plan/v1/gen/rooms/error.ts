export type ErrorCode =
  | "UnknownUnitError"
  | "InvalidRoomError"
  | "DuplicateIdError"
  | "UnknownRoomError";

export interface ReducerError {
  errorCode: ErrorCode;
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

export class DuplicateIdError extends Error implements ReducerError {
  errorCode = "DuplicateIdError" as ErrorCode;
  constructor(message = "DuplicateIdError") {
    super(message);
  }
}

export class UnknownRoomError extends Error implements ReducerError {
  errorCode = "UnknownRoomError" as ErrorCode;
  constructor(message = "UnknownRoomError") {
    super(message);
  }
}

export const errors = {
  AddRoom: { UnknownUnitError, InvalidRoomError, DuplicateIdError },

  UpdateRoom: { UnknownUnitError, UnknownRoomError, InvalidRoomError },

  RemoveRoom: { UnknownUnitError, UnknownRoomError, InvalidRoomError },
};
