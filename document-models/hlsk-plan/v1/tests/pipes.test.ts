import { generateMock } from "document-model/mock";
import {
  addPipeRoute,
  AddPipeRouteInputSchema,
  isHlskPlanDocument,
  reducer,
  removePipeRoute,
  RemovePipeRouteInputSchema,
  updatePipeRoute,
  UpdatePipeRouteInputSchema,
  utils,
} from "document-models/hlsk-plan/v1";
import { describe, expect, it } from "vitest";

describe("PipesOperations", () => {
  it("should handle addPipeRoute operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddPipeRouteInputSchema());

    const updatedDocument = reducer(document, addPipeRoute(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_PIPE_ROUTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updatePipeRoute operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdatePipeRouteInputSchema());

    const updatedDocument = reducer(document, updatePipeRoute(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_PIPE_ROUTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removePipeRoute operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemovePipeRouteInputSchema());

    const updatedDocument = reducer(document, removePipeRoute(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_PIPE_ROUTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
