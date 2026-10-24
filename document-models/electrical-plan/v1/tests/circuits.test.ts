import { generateMock } from "document-model/mock";
import {
  addCircuit,
  AddCircuitInputSchema,
  addRoute,
  AddRouteInputSchema,
  assignSymbolCircuit,
  AssignSymbolCircuitInputSchema,
  isElectricalPlanDocument,
  reducer,
  removeCircuit,
  RemoveCircuitInputSchema,
  removeRoute,
  RemoveRouteInputSchema,
  updateCircuit,
  UpdateCircuitInputSchema,
  updateRoute,
  UpdateRouteInputSchema,
  utils,
} from "document-models/electrical-plan/v1";
import { describe, expect, it } from "vitest";

describe("CircuitsOperations", () => {
  it("should handle addCircuit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddCircuitInputSchema());

    const updatedDocument = reducer(document, addCircuit(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_CIRCUIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateCircuit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateCircuitInputSchema());

    const updatedDocument = reducer(document, updateCircuit(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_CIRCUIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeCircuit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveCircuitInputSchema());

    const updatedDocument = reducer(document, removeCircuit(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_CIRCUIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle assignSymbolCircuit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AssignSymbolCircuitInputSchema());

    const updatedDocument = reducer(document, assignSymbolCircuit(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ASSIGN_SYMBOL_CIRCUIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addRoute operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRouteInputSchema());

    const updatedDocument = reducer(document, addRoute(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_ROUTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateRoute operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateRouteInputSchema());

    const updatedDocument = reducer(document, updateRoute(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_ROUTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeRoute operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveRouteInputSchema());

    const updatedDocument = reducer(document, removeRoute(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_ROUTE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
