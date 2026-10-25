import { generateMock } from "document-model/mock";
import {
  addRiser,
  AddRiserInputSchema,
  isHlskPlanDocument,
  reducer,
  removeRiser,
  RemoveRiserInputSchema,
  updateRiser,
  UpdateRiserInputSchema,
  utils,
} from "document-models/hlsk-plan/v1";
import { describe, expect, it } from "vitest";

describe("RisersOperations", () => {
  it("should handle addRiser operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRiserInputSchema());

    const updatedDocument = reducer(document, addRiser(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_RISER");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateRiser operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateRiserInputSchema());

    const updatedDocument = reducer(document, updateRiser(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_RISER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeRiser operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveRiserInputSchema());

    const updatedDocument = reducer(document, removeRiser(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_RISER",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
