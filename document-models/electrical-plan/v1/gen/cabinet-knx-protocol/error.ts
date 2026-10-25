export type ErrorCode =
  | "DuplicateIdError"
  | "InvalidDistributorError"
  | "UnknownDistributorError"
  | "UnknownCircuitError"
  | "DuplicateGroupAddressError"
  | "InvalidGroupAddressError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateIdError extends Error implements ReducerError {
  errorCode = "DuplicateIdError" as ErrorCode;
  constructor(message = "DuplicateIdError") {
    super(message);
  }
}

export class InvalidDistributorError extends Error implements ReducerError {
  errorCode = "InvalidDistributorError" as ErrorCode;
  constructor(message = "InvalidDistributorError") {
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

export class DuplicateGroupAddressError extends Error implements ReducerError {
  errorCode = "DuplicateGroupAddressError" as ErrorCode;
  constructor(message = "DuplicateGroupAddressError") {
    super(message);
  }
}

export class InvalidGroupAddressError extends Error implements ReducerError {
  errorCode = "InvalidGroupAddressError" as ErrorCode;
  constructor(message = "InvalidGroupAddressError") {
    super(message);
  }
}

export const errors = {
  AddDistributor: { DuplicateIdError, InvalidDistributorError },

  UpdateDistributor: { UnknownDistributorError, InvalidDistributorError },

  PlanCabinet: {
    UnknownDistributorError,
    InvalidDistributorError,
    UnknownCircuitError,
  },

  SetGroupAddresses: { DuplicateGroupAddressError, InvalidGroupAddressError },

  UpdateReport: { UnknownCircuitError },
};
