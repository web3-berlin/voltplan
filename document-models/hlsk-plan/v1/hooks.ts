/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  HlskPlanAction,
  HlskPlanDocument,
} from "document-models/hlsk-plan/v1";
import {
  assertIsHlskPlanDocument,
  isHlskPlanDocument,
} from "./gen/document-schema.js";

/** Hook to get a HlskPlan document by its id */
export function useHlskPlanDocumentById(
  documentId: string | null | undefined,
):
  | [HlskPlanDocument, DocumentDispatch<HlskPlanAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isHlskPlanDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected HlskPlan document */
export function useSelectedHlskPlanDocument(): [
  HlskPlanDocument,
  DocumentDispatch<HlskPlanAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsHlskPlanDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all HlskPlan documents in the selected drive */
export function useHlskPlanDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isHlskPlanDocument);
}

/** Hook to get all HlskPlan documents in the selected folder */
export function useHlskPlanDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isHlskPlanDocument);
}
