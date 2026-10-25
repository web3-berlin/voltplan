import { generateMock } from "document-model/mock";
import {
  addDuctRoute,
  AddDuctRouteInputSchema,
  isHlskPlanDocument,
  reducer,
  removeDuctRoute,
  RemoveDuctRouteInputSchema,
  updateDuctRoute,
  UpdateDuctRouteInputSchema,
  utils,
} from "document-models/hlsk-plan/v1";
import { describe, expect, it } from "vitest";

describe("DuctsOperations", () => {
  it("should handle addDuctRoute operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddDuctRouteInputSchema());

    const updatedDocument = reducer(document, addDuctRoute(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_DUCT_ROUTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateDuctRoute operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateDuctRouteInputSchema());

    const updatedDocument = reducer(document, updateDuctRoute(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_DUCT_ROUTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeDuctRoute operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveDuctRouteInputSchema());

    const updatedDocument = reducer(document, removeDuctRoute(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_DUCT_ROUTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
