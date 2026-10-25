import { generateMock } from "document-model/mock";
import {
  addRoom,
  AddRoomInputSchema,
  isHlskPlanDocument,
  reducer,
  removeRoom,
  RemoveRoomInputSchema,
  updateRoom,
  UpdateRoomInputSchema,
  utils,
} from "document-models/hlsk-plan/v1";
import { describe, expect, it } from "vitest";

describe("RoomsOperations", () => {
  it("should handle addRoom operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRoomInputSchema());

    const updatedDocument = reducer(document, addRoom(input));

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
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

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
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

    expect(isHlskPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_ROOM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
