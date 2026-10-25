export type ErrorCode =
  | "UnknownUnitError"
  | "InvalidDuctRouteError"
  | "DuplicateIdError"
  | "UnknownDuctRouteError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UnknownUnitError extends Error implements ReducerError {
  errorCode = "UnknownUnitError" as ErrorCode;
  constructor(message = "UnknownUnitError") {
    super(message);
  }
}

export class InvalidDuctRouteError extends Error implements ReducerError {
  errorCode = "InvalidDuctRouteError" as ErrorCode;
  constructor(message = "InvalidDuctRouteError") {
    super(message);
  }
}

export class DuplicateIdError extends Error implements ReducerError {
  errorCode = "DuplicateIdError" as ErrorCode;
  constructor(message = "DuplicateIdError") {
    super(message);
  }
}

export class UnknownDuctRouteError extends Error implements ReducerError {
  errorCode = "UnknownDuctRouteError" as ErrorCode;
  constructor(message = "UnknownDuctRouteError") {
    super(message);
  }
}

export const errors = {
  AddDuctRoute: { UnknownUnitError, InvalidDuctRouteError, DuplicateIdError },

  UpdateDuctRoute: {
    UnknownUnitError,
    UnknownDuctRouteError,
    InvalidDuctRouteError,
  },

  RemoveDuctRoute: { UnknownUnitError, UnknownDuctRouteError },
};
