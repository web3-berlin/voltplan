export type ErrorCode =
  | "UnknownUnitError"
  | "InvalidRiserError"
  | "DuplicateIdError"
  | "UnknownRiserError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UnknownUnitError extends Error implements ReducerError {
  errorCode = "UnknownUnitError" as ErrorCode;
  constructor(message = "UnknownUnitError") {
    super(message);
  }
}

export class InvalidRiserError extends Error implements ReducerError {
  errorCode = "InvalidRiserError" as ErrorCode;
  constructor(message = "InvalidRiserError") {
    super(message);
  }
}

export class DuplicateIdError extends Error implements ReducerError {
  errorCode = "DuplicateIdError" as ErrorCode;
  constructor(message = "DuplicateIdError") {
    super(message);
  }
}

export class UnknownRiserError extends Error implements ReducerError {
  errorCode = "UnknownRiserError" as ErrorCode;
  constructor(message = "UnknownRiserError") {
    super(message);
  }
}

export const errors = {
  AddRiser: { UnknownUnitError, InvalidRiserError, DuplicateIdError },

  UpdateRiser: { UnknownUnitError, UnknownRiserError, InvalidRiserError },

  RemoveRiser: { UnknownUnitError, UnknownRiserError },
};
