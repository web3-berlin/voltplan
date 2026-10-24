/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "planvolt/electrical-plan" document type */
export const ElectricalPlanEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["planvolt/electrical-plan"],
  config: {
    id: "electrical-plan-editor",
    name: "electrical-plan-editor",
  },
};
