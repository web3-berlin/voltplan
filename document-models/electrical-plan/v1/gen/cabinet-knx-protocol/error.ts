export type ErrorCode =
  | "DuplicateIdError"
  | "UnknownDistributorError"
  | "DuplicateGroupAddressError"
  | "UnknownCircuitError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateIdError extends Error implements ReducerError {
  errorCode = "DuplicateIdError" as ErrorCode;
  constructor(message = "DuplicateIdError") {
    super(message);
  }
}

export class UnknownDistributorError extends Error implements ReducerError {
  errorCode = "UnknownDistributorError" as ErrorCode;
  constructor(message = "UnknownDistributorError") {
    super(message);
  }
}

export class DuplicateGroupAddressError extends Error implements ReducerError {
  errorCode = "DuplicateGroupAddressError" as ErrorCode;
  constructor(message = "DuplicateGroupAddressError") {
    super(message);
  }
}

export class UnknownCircuitError extends Error implements ReducerError {
  errorCode = "UnknownCircuitError" as ErrorCode;
  constructor(message = "UnknownCircuitError") {
    super(message);
  }
}

export const errors = {
  AddDistributor: { DuplicateIdError },

  UpdateDistributor: { UnknownDistributorError },

  PlanCabinet: { UnknownDistributorError },

  SetGroupAddresses: { DuplicateGroupAddressError },

  UpdateReport: { UnknownCircuitError },
};
