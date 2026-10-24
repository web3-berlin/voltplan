import { generateMock } from "document-model/mock";
import {
  addRoom,
  AddRoomInputSchema,
  addSymbol,
  AddSymbolInputSchema,
  addUnit,
  AddUnitInputSchema,
  isElectricalPlanDocument,
  moveSymbol,
  MoveSymbolInputSchema,
  reducer,
  removeRoom,
  RemoveRoomInputSchema,
  removeSymbol,
  RemoveSymbolInputSchema,
  renameUnit,
  RenameUnitInputSchema,
  setActiveUnit,
  SetActiveUnitInputSchema,
  setProjectName,
  SetProjectNameInputSchema,
  setUnitBackground,
  SetUnitBackgroundInputSchema,
  updateRoom,
  UpdateRoomInputSchema,
  updateSettings,
  UpdateSettingsInputSchema,
  updateSymbol,
  updateSymbolDetails,
  UpdateSymbolDetailsInputSchema,
  UpdateSymbolInputSchema,
  updateUnitBackground,
  UpdateUnitBackgroundInputSchema,
  utils,
} from "document-models/electrical-plan/v1";
import { describe, expect, it } from "vitest";

describe("InstallationPlanOperations", () => {
  it("should handle addUnit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddUnitInputSchema());

    const updatedDocument = reducer(document, addUnit(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_UNIT");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle renameUnit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RenameUnitInputSchema());

    const updatedDocument = reducer(document, renameUnit(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RENAME_UNIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addSymbol operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddSymbolInputSchema());

    const updatedDocument = reducer(document, addSymbol(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_SYMBOL");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateSymbol operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateSymbolInputSchema());

    const updatedDocument = reducer(document, updateSymbol(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SYMBOL",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle moveSymbol operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MoveSymbolInputSchema());

    const updatedDocument = reducer(document, moveSymbol(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MOVE_SYMBOL",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeSymbol operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveSymbolInputSchema());

    const updatedDocument = reducer(document, removeSymbol(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SYMBOL",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setProjectName operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetProjectNameInputSchema());

    const updatedDocument = reducer(document, setProjectName(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
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

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_ACTIVE_UNIT",
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

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
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

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_UNIT_BACKGROUND",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addRoom operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRoomInputSchema());

    const updatedDocument = reducer(document, addRoom(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_ROOM");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateRoom operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateRoomInputSchema());

    const updatedDocument = reducer(document, updateRoom(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_ROOM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeRoom operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveRoomInputSchema());

    const updatedDocument = reducer(document, removeRoom(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_ROOM",
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

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SETTINGS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setProjectName operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetProjectNameInputSchema());

    const updatedDocument = reducer(document, setProjectName(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PROJECT_NAME",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateSymbolDetails operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateSymbolDetailsInputSchema());

    const updatedDocument = reducer(document, updateSymbolDetails(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SYMBOL_DETAILS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
