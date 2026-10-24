export type ErrorCode =
  | "DuplicateIdError"
  | "DuplicateCircuitNumberError"
  | "UnknownCircuitError"
  | "UnknownUnitError"
  | "UnknownSymbolError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateIdError extends Error implements ReducerError {
  errorCode = "DuplicateIdError" as ErrorCode;
  constructor(message = "DuplicateIdError") {
    super(message);
  }
}

export class DuplicateCircuitNumberError extends Error implements ReducerError {
  errorCode = "DuplicateCircuitNumberError" as ErrorCode;
  constructor(message = "DuplicateCircuitNumberError") {
    super(message);
  }
}

export class UnknownCircuitError extends Error implements ReducerError {
  errorCode = "UnknownCircuitError" as ErrorCode;
  constructor(message = "UnknownCircuitError") {
    super(message);
  }
}

export class UnknownUnitError extends Error implements ReducerError {
  errorCode = "UnknownUnitError" as ErrorCode;
  constructor(message = "UnknownUnitError") {
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
  AddCircuit: { DuplicateIdError, DuplicateCircuitNumberError },

  UpdateCircuit: { UnknownCircuitError },

  AssignSymbolCircuit: {
    UnknownCircuitError,
    UnknownUnitError,
    UnknownSymbolError,
  },
};
