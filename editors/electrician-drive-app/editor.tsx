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
import { isElectricalPlanDocument } from "document-models/electrical-plan/v1";

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
  let circuitCount = 0;
  let symbolCount = 0;

  for (const node of nodes.filter(isFileNodeKind)) {
    if (node.documentType !== "planvolt/electrical-plan") continue;
    const document = documents.find((item) => item.header.id === node.id);
    if (!document || !isElectricalPlanDocument(document)) continue;
    const global = document.state.global;
    const floors = global.units.length;
    const circuits = global.circuits.length;
    const symbols = global.units.reduce(
      (sum, unit) => sum + unit.symbols.length,
      0,
    );
    floorCount += floors;
    circuitCount += circuits;
    symbolCount += symbols;
    plans.push({
      node,
      document,
      name: document.header.name.trim() || node.name,
      meta: `${floors} floor${floors === 1 ? "" : "s"} · ${circuits} circuit${circuits === 1 ? "" : "s"} · ${symbols} position${symbols === 1 ? "" : "s"}`,
      status: circuits > 0 ? "Plan started" : "Needs circuits",
      tone: circuits > 0 ? "ok" : "warn",
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
        title="Electrician plans"
        subtitle="Electrical installation plans for the electrician"
        createLabel="New electrical plan"
        documentType="planvolt/electrical-plan"
        stats={[
          {
            label: "Electrical plans",
            value: plans.length,
            hint: "Plans in this drive",
          },
          { label: "Floors", value: floorCount, hint: "Across all plans" },
          { label: "Circuits", value: circuitCount, hint: "Planned circuits" },
          {
            label: "Positions",
            value: symbolCount,
            hint: "Sockets, lights and devices",
          },
        ]}
        plans={plans}
        emptyTitle="No electrical plans yet"
        emptyBody="Create an electrical plan to start placing circuits, sockets and lighting. The HLSK team uses a separate drive for sanitary, heating and ventilation work."
      />
    </div>
  );
}
