export type ErrorCode =
  | "InvalidNameError"
  | "UnknownUnitError"
  | "InvalidUnitError"
  | "DuplicateIdError"
  | "InvalidSettingsError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidNameError extends Error implements ReducerError {
  errorCode = "InvalidNameError" as ErrorCode;
  constructor(message = "InvalidNameError") {
    super(message);
  }
}

export class UnknownUnitError extends Error implements ReducerError {
  errorCode = "UnknownUnitError" as ErrorCode;
  constructor(message = "UnknownUnitError") {
    super(message);
  }
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

export class InvalidSettingsError extends Error implements ReducerError {
  errorCode = "InvalidSettingsError" as ErrorCode;
  constructor(message = "InvalidSettingsError") {
    super(message);
  }
}

export const errors = {
  SetProjectName: { InvalidNameError },

  SetActiveUnit: { UnknownUnitError },

  AddUnit: { InvalidUnitError, DuplicateIdError },

  UpdateUnit: { UnknownUnitError, InvalidUnitError },

  RemoveUnit: { UnknownUnitError, InvalidUnitError },

  SetUnitBackground: { UnknownUnitError, InvalidUnitError },

  UpdateUnitBackground: { UnknownUnitError, InvalidUnitError },

  UpdateSettings: { InvalidSettingsError },
};
