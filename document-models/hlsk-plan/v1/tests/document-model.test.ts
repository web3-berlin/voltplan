/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsHlskPlanDocument,
  assertIsHlskPlanState,
  hlskPlanDocumentType,
  initialGlobalState,
  initialLocalState,
  isHlskPlanDocument,
  isHlskPlanState,
  utils,
} from "document-models/hlsk-plan/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("HlskPlan Document Model", () => {
  it("should create a new HlskPlan document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(hlskPlanDocumentType);
  });

  it("should create a new HlskPlan document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isHlskPlanDocument(document)).toBe(true);
    expect(isHlskPlanState(document.state)).toBe(true);
  });
  it("should reject a document that is not a HlskPlan document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsHlskPlanDocument(wrongDocumentType)).toThrow();
      expect(isHlskPlanDocument(wrongDocumentType)).toBe(false);
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
    expect(isHlskPlanState(wrongState.state)).toBe(false);
    expect(assertIsHlskPlanState(wrongState.state)).toThrow();
    expect(isHlskPlanDocument(wrongState)).toBe(false);
    expect(assertIsHlskPlanDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isHlskPlanState(wrongInitialState.state)).toBe(false);
    expect(assertIsHlskPlanState(wrongInitialState.state)).toThrow();
    expect(isHlskPlanDocument(wrongInitialState)).toBe(false);
    expect(assertIsHlskPlanDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isHlskPlanDocument(missingIdInHeader)).toBe(false);
    expect(assertIsHlskPlanDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isHlskPlanDocument(missingNameInHeader)).toBe(false);
    expect(assertIsHlskPlanDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isHlskPlanDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(assertIsHlskPlanDocument(missingCreatedAtUtcIsoInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isHlskPlanDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsHlskPlanDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
