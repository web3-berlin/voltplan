import type { EditorProps } from "document-model";
import {
  createUrlWithPreservedParams,
  isFileNodeKind,
  makeDriveUrlComponent,
  makeNodeSlug,
  useDocumentsInSelectedDrive,
  useNodesInSelectedDrive,
  useSelectedDriveSafe,
  useSetPHAppConfig,
} from "@powerhousedao/reactor-browser";
import { DocumentToolbar } from "@powerhousedao/design-system/connect/index";
import { isHlskPlanDocument } from "document-models/hlsk-plan/v1";

import { hlskChecks } from "../hlsk-plan-editor/lib/engine.js";
import { TradeDriveDashboard } from "../drive-app-shared.js";
import type { PlanCard } from "../drive-app-shared.js";
import { editorConfig } from "./config.js";

export default function Editor(props: EditorProps) {
  useSetPHAppConfig(editorConfig);
  const [drive] = useSelectedDriveSafe();
  const nodes = useNodesInSelectedDrive() ?? [];
  const documents = useDocumentsInSelectedDrive() ?? [];

  if (props.children) {
    return <div className="h-full overflow-hidden">{props.children}</div>;
  }

  const drivePath = makeDriveUrlComponent(drive);
  const plans: PlanCard[] = [];
  let floorCount = 0;
  let fixtureCount = 0;
  let pipeCount = 0;
  let ductCount = 0;
  let warningCount = 0;

  for (const node of nodes.filter(isFileNodeKind)) {
    if (node.documentType !== "planvolt/hlsk-plan") continue;
    const document = documents.find((item) => item.header.id === node.id);
    if (!document || !isHlskPlanDocument(document)) continue;
    const global = document.state.global;
    const floors = global.units.length;
    const fixtures = global.units.reduce(
      (sum, unit) => sum + unit.fixtures.length,
      0,
    );
    const pipes = global.units.reduce(
      (sum, unit) => sum + unit.pipeRoutes.length,
      0,
    );
    const ducts = global.units.reduce(
      (sum, unit) => sum + unit.ductRoutes.length,
      0,
    );
    const checks = hlskChecks(global);
    const warnings = checks.filter(
      (check) => check.severity === "warning",
    ).length;
    floorCount += floors;
    fixtureCount += fixtures;
    pipeCount += pipes;
    ductCount += ducts;
    warningCount += warnings;
    plans.push({
      node,
      document,
      name: document.header.name.trim() || node.name,
      meta: `${floors} floor${floors === 1 ? "" : "s"} · ${fixtures} fixture${fixtures === 1 ? "" : "s"} · ${pipes} pipe route${pipes === 1 ? "" : "s"} · ${ducts} duct route${ducts === 1 ? "" : "s"}`,
      status:
        warnings > 0
          ? `${warnings} check${warnings === 1 ? "" : "s"}`
          : "Checks pass",
      tone: warnings > 0 ? "warn" : "ok",
      openUrl: createUrlWithPreservedParams(
        `${drivePath}/${makeNodeSlug(node)}`,
      ),
    });
  }

  return (
    <div className="flex h-[100dvh] min-h-[600px] flex-col overflow-hidden">
      <DocumentToolbar />
      <TradeDriveDashboard
        driveName={drive?.state.global.name ?? "Selected drive"}
        title="HLSK plans"
        subtitle="Sanitary, heating, ventilation and climate execution plans"
        createLabel="New HLSK plan"
        documentType="planvolt/hlsk-plan"
        stats={[
          {
            label: "HLSK plans",
            value: plans.length,
            hint: "Plans in this drive",
          },
          { label: "Floors", value: floorCount, hint: "Across all plans" },
          {
            label: "Fixtures",
            value: fixtureCount,
            hint: "Sanitary, heating and air devices",
          },
          {
            label: "Check warnings",
            value: warningCount,
            hint: "Open a plan to review them",
          },
        ]}
        plans={plans}
        emptyTitle="No HLSK plans yet"
        emptyBody="Create an HLSK plan to place sanitary, heating, ventilation and climate fixtures, draw pipe and duct routes, and mark risers."
      />
    </div>
  );
}
