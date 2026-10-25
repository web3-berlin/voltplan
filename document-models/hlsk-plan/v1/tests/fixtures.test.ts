import { generateMock } from "document-model/mock";
import {
  addFixture,
  AddFixtureInputSchema,
  isHlskPlanDocument,
  reducer,
  removeFixture,
  RemoveFixtureInputSchema,
  updateFixture,
  UpdateFixtureInputSchema,
  utils,
} from "document-models/hlsk-plan/v1";
import { describe, expect, it } from "vitest";

describe("FixturesOperations", () => {
  it("should handle addFixture operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddFixtureInputSchema());

    const updatedDocument = reducer(document, addFixture(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_FIXTURE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateFixture operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateFixtureInputSchema());

    const updatedDocument = reducer(document, updateFixture(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_FIXTURE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeFixture operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveFixtureInputSchema());

    const updatedDocument = reducer(document, removeFixture(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_FIXTURE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
