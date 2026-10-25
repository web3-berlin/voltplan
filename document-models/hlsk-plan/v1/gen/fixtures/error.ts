export type ErrorCode =
  | "UnknownUnitError"
  | "InvalidFixtureError"
  | "UnknownRoomError"
  | "DuplicateIdError"
  | "UnknownFixtureError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UnknownUnitError extends Error implements ReducerError {
  errorCode = "UnknownUnitError" as ErrorCode;
  constructor(message = "UnknownUnitError") {
    super(message);
  }
}

export class InvalidFixtureError extends Error implements ReducerError {
  errorCode = "InvalidFixtureError" as ErrorCode;
  constructor(message = "InvalidFixtureError") {
    super(message);
  }
}

export class UnknownRoomError extends Error implements ReducerError {
  errorCode = "UnknownRoomError" as ErrorCode;
  constructor(message = "UnknownRoomError") {
    super(message);
  }
}

export class DuplicateIdError extends Error implements ReducerError {
  errorCode = "DuplicateIdError" as ErrorCode;
  constructor(message = "DuplicateIdError") {
    super(message);
  }
}

export class UnknownFixtureError extends Error implements ReducerError {
  errorCode = "UnknownFixtureError" as ErrorCode;
  constructor(message = "UnknownFixtureError") {
    super(message);
  }
}

export const errors = {
  AddFixture: {
    UnknownUnitError,
    InvalidFixtureError,
    UnknownRoomError,
    DuplicateIdError,
  },

  UpdateFixture: {
    UnknownUnitError,
    UnknownFixtureError,
    InvalidFixtureError,
    UnknownRoomError,
  },

  RemoveFixture: { UnknownUnitError, UnknownFixtureError },
};
