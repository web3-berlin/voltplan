import { generateMock } from "document-model/mock";
import {
  addUnit,
  AddUnitInputSchema,
  isHlskPlanDocument,
  reducer,
  removeUnit,
  RemoveUnitInputSchema,
  setActiveUnit,
  SetActiveUnitInputSchema,
  setProjectName,
  SetProjectNameInputSchema,
  setUnitBackground,
  SetUnitBackgroundInputSchema,
  updateSettings,
  UpdateSettingsInputSchema,
  updateUnit,
  updateUnitBackground,
  UpdateUnitBackgroundInputSchema,
  UpdateUnitInputSchema,
  utils,
} from "document-models/hlsk-plan/v1";
import { describe, expect, it } from "vitest";

describe("CoreOperations", () => {
  it("should handle setProjectName operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetProjectNameInputSchema());

    const updatedDocument = reducer(document, setProjectName(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PROJECT_NAME",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setActiveUnit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetActiveUnitInputSchema());

    const updatedDocument = reducer(document, setActiveUnit(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_ACTIVE_UNIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addUnit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddUnitInputSchema());

    const updatedDocument = reducer(document, addUnit(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_UNIT");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateUnit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateUnitInputSchema());

    const updatedDocument = reducer(document, updateUnit(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_UNIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeUnit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveUnitInputSchema());

    const updatedDocument = reducer(document, removeUnit(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_UNIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setUnitBackground operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetUnitBackgroundInputSchema());

    const updatedDocument = reducer(document, setUnitBackground(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_UNIT_BACKGROUND",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateUnitBackground operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateUnitBackgroundInputSchema());

    const updatedDocument = reducer(document, updateUnitBackground(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_UNIT_BACKGROUND",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateSettings operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateSettingsInputSchema());

    const updatedDocument = reducer(document, updateSettings(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SETTINGS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
