/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsElectricalPlanDocument,
  assertIsElectricalPlanState,
  electricalPlanDocumentType,
  initialGlobalState,
  initialLocalState,
  isElectricalPlanDocument,
  isElectricalPlanState,
  utils,
} from "document-models/electrical-plan/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("ElectricalPlan Document Model", () => {
  it("should create a new ElectricalPlan document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(electricalPlanDocumentType);
  });

  it("should create a new ElectricalPlan document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isElectricalPlanDocument(document)).toBe(true);
    expect(isElectricalPlanState(document.state)).toBe(true);
  });
  it("should reject a document that is not a ElectricalPlan document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsElectricalPlanDocument(wrongDocumentType)).toThrow();
      expect(isElectricalPlanDocument(wrongDocumentType)).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });
  const wrongState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongState.state.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isElectricalPlanState(wrongState.state)).toBe(false);
    expect(assertIsElectricalPlanState(wrongState.state)).toThrow();
    expect(isElectricalPlanDocument(wrongState)).toBe(false);
    expect(assertIsElectricalPlanDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isElectricalPlanState(wrongInitialState.state)).toBe(false);
    expect(assertIsElectricalPlanState(wrongInitialState.state)).toThrow();
    expect(isElectricalPlanDocument(wrongInitialState)).toBe(false);
    expect(assertIsElectricalPlanDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isElectricalPlanDocument(missingIdInHeader)).toBe(false);
    expect(assertIsElectricalPlanDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isElectricalPlanDocument(missingNameInHeader)).toBe(false);
    expect(assertIsElectricalPlanDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isElectricalPlanDocument(missingCreatedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsElectricalPlanDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isElectricalPlanDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsElectricalPlanDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
