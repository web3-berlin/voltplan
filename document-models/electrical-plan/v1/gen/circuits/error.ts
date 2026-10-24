export type ErrorCode =
  | "DuplicateIdError"
  | "DuplicateCircuitNumberError"
  | "InvalidCircuitError"
  | "UnknownDistributorError"
  | "UnknownCircuitError"
  | "UnknownUnitError"
  | "UnknownSymbolError"
  | "InvalidRouteError"
  | "UnknownRouteError";

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

export class InvalidCircuitError extends Error implements ReducerError {
  errorCode = "InvalidCircuitError" as ErrorCode;
  constructor(message = "InvalidCircuitError") {
    super(message);
  }
}

export class UnknownDistributorError extends Error implements ReducerError {
  errorCode = "UnknownDistributorError" as ErrorCode;
  constructor(message = "UnknownDistributorError") {
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

export class InvalidRouteError extends Error implements ReducerError {
  errorCode = "InvalidRouteError" as ErrorCode;
  constructor(message = "InvalidRouteError") {
    super(message);
  }
}

export class UnknownRouteError extends Error implements ReducerError {
  errorCode = "UnknownRouteError" as ErrorCode;
  constructor(message = "UnknownRouteError") {
    super(message);
  }
}

export const errors = {
  AddCircuit: {
    DuplicateIdError,
    DuplicateCircuitNumberError,
    InvalidCircuitError,
    UnknownDistributorError,
  },

  UpdateCircuit: {
    UnknownCircuitError,
    InvalidCircuitError,
    UnknownDistributorError,
  },

  RemoveCircuit: { UnknownCircuitError },

  AssignSymbolCircuit: {
    UnknownCircuitError,
    UnknownUnitError,
    UnknownSymbolError,
  },

  AddRoute: {
    UnknownCircuitError,
    UnknownUnitError,
    DuplicateIdError,
    InvalidRouteError,
  },

  UpdateRoute: {
    UnknownRouteError,
    UnknownCircuitError,
    UnknownUnitError,
    InvalidRouteError,
  },

  RemoveRoute: { UnknownRouteError },
};
