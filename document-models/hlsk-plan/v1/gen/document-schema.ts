/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { hlskPlanDocumentType } from "./document-type.js";
import { HlskPlanStateSchema } from "./schema/zod.js";
import type { HlskPlanDocument, HlskPlanPHState } from "./types.js";

/** Schema for validating the header object of a HlskPlan document */
export const HlskPlanDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(hlskPlanDocumentType),
});

/** Schema for validating the state object of a HlskPlan document */
export const HlskPlanPHStateSchema = BaseDocumentStateSchema.extend({
  global: HlskPlanStateSchema(),
});

export const HlskPlanDocumentSchema = z.object({
  header: HlskPlanDocumentHeaderSchema,
  state: HlskPlanPHStateSchema,
  initialState: HlskPlanPHStateSchema,
});

/** Simple helper function to check if a state object is a HlskPlan document state object */
export function isHlskPlanState(state: unknown): state is HlskPlanPHState {
  return HlskPlanPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a HlskPlan document state object */
export function assertIsHlskPlanState(
  state: unknown,
): asserts state is HlskPlanPHState {
  HlskPlanPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a HlskPlan document */
export function isHlskPlanDocument(
  document: unknown,
): document is HlskPlanDocument {
  return HlskPlanDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a HlskPlan document */
export function assertIsHlskPlanDocument(
  document: unknown,
): asserts document is HlskPlanDocument {
  HlskPlanDocumentSchema.parse(document);
}
