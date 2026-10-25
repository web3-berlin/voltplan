export type ErrorCode =
  | "UnknownUnitError"
  | "InvalidPipeRouteError"
  | "DuplicateIdError"
  | "UnknownPipeRouteError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UnknownUnitError extends Error implements ReducerError {
  errorCode = "UnknownUnitError" as ErrorCode;
  constructor(message = "UnknownUnitError") {
    super(message);
  }
}

export class InvalidPipeRouteError extends Error implements ReducerError {
  errorCode = "InvalidPipeRouteError" as ErrorCode;
  constructor(message = "InvalidPipeRouteError") {
    super(message);
  }
}

export class DuplicateIdError extends Error implements ReducerError {
  errorCode = "DuplicateIdError" as ErrorCode;
  constructor(message = "DuplicateIdError") {
    super(message);
  }
}

export class UnknownPipeRouteError extends Error implements ReducerError {
  errorCode = "UnknownPipeRouteError" as ErrorCode;
  constructor(message = "UnknownPipeRouteError") {
    super(message);
  }
}

export const errors = {
  AddPipeRoute: { UnknownUnitError, InvalidPipeRouteError, DuplicateIdError },

  UpdatePipeRoute: {
    UnknownUnitError,
    UnknownPipeRouteError,
    InvalidPipeRouteError,
  },

  RemovePipeRoute: { UnknownUnitError, UnknownPipeRouteError },
};
