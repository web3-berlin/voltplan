import { generateMock } from "document-model/mock";
import {
  addDistributor,
  AddDistributorInputSchema,
  isElectricalPlanDocument,
  planCabinet,
  PlanCabinetInputSchema,
  reducer,
  setGroupAddresses,
  SetGroupAddressesInputSchema,
  updateDistributor,
  UpdateDistributorInputSchema,
  updateReport,
  UpdateReportInputSchema,
  utils,
} from "document-models/electrical-plan/v1";
import { describe, expect, it } from "vitest";

describe("CabinetKnxProtocolOperations", () => {
  it("should handle addDistributor operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddDistributorInputSchema());

    const updatedDocument = reducer(document, addDistributor(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_DISTRIBUTOR",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateDistributor operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateDistributorInputSchema());

    const updatedDocument = reducer(document, updateDistributor(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_DISTRIBUTOR",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle planCabinet operation", () => {
    const document = utils.createDocument();
    const input = generateMock(PlanCabinetInputSchema());

    const updatedDocument = reducer(document, planCabinet(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "PLAN_CABINET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setGroupAddresses operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetGroupAddressesInputSchema());

    const updatedDocument = reducer(document, setGroupAddresses(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_GROUP_ADDRESSES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateReport operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateReportInputSchema());

    const updatedDocument = reducer(document, updateReport(input));

    expect(isElectricalPlanDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_REPORT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
