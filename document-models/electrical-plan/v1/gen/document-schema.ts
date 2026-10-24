/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { electricalPlanDocumentType } from "./document-type.js";
import { ElectricalPlanStateSchema } from "./schema/zod.js";
import type { ElectricalPlanDocument, ElectricalPlanPHState } from "./types.js";

/** Schema for validating the header object of a ElectricalPlan document */
export const ElectricalPlanDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(electricalPlanDocumentType),
  });

/** Schema for validating the state object of a ElectricalPlan document */
export const ElectricalPlanPHStateSchema = BaseDocumentStateSchema.extend({
  global: ElectricalPlanStateSchema(),
});

export const ElectricalPlanDocumentSchema = z.object({
  header: ElectricalPlanDocumentHeaderSchema,
  state: ElectricalPlanPHStateSchema,
  initialState: ElectricalPlanPHStateSchema,
});

/** Simple helper function to check if a state object is a ElectricalPlan document state object */
export function isElectricalPlanState(
  state: unknown,
): state is ElectricalPlanPHState {
  return ElectricalPlanPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a ElectricalPlan document state object */
export function assertIsElectricalPlanState(
  state: unknown,
): asserts state is ElectricalPlanPHState {
  ElectricalPlanPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a ElectricalPlan document */
export function isElectricalPlanDocument(
  document: unknown,
): document is ElectricalPlanDocument {
  return ElectricalPlanDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a ElectricalPlan document */
export function assertIsElectricalPlanDocument(
  document: unknown,
): asserts document is ElectricalPlanDocument {
  ElectricalPlanDocumentSchema.parse(document);
}
