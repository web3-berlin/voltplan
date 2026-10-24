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
  ElectricalPlanAction,
  ElectricalPlanDocument,
} from "document-models/electrical-plan/v1";
import {
  assertIsElectricalPlanDocument,
  isElectricalPlanDocument,
} from "./gen/document-schema.js";

/** Hook to get a ElectricalPlan document by its id */
export function useElectricalPlanDocumentById(
  documentId: string | null | undefined,
):
  | [ElectricalPlanDocument, DocumentDispatch<ElectricalPlanAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isElectricalPlanDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected ElectricalPlan document */
export function useSelectedElectricalPlanDocument(): [
  ElectricalPlanDocument,
  DocumentDispatch<ElectricalPlanAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsElectricalPlanDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all ElectricalPlan documents in the selected drive */
export function useElectricalPlanDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isElectricalPlanDocument);
}

/** Hook to get all ElectricalPlan documents in the selected folder */
export function useElectricalPlanDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isElectricalPlanDocument);
}
