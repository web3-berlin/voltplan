import { cabinetSvg, circuitDiagramPages, electricalBom, protocolRows } from "./engine.js";
import type { ElectricalPlanGlobalState } from "./types.js";
import { formatEuro } from "./ui.js";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function section(title: string, content: string, breakAfter = true): string {
  return `<section style="${breakAfter ? "break-after: page;" : ""}"><h1>${escapeXml(title)}</h1>${content}</section>`;
}

export function projectReportHtml(state: ElectricalPlanGlobalState, currentPlanSvg: string, currentUnitName: string): string {
  const bom = electricalBom(state);
  const diagrams = circuitDiagramPages(state, state.name);
  const protocol = protocolRows(state);

  const bomRows = bom.lines.map((line) => `<tr><td>${escapeXml(line.article)}</td><td>${escapeXml(line.description)}</td><td>${escapeXml(line.category)}</td><td>${line.quantity} ${line.unit}</td><td>${formatEuro(line.unitPrice)}</td><td>${formatEuro(line.total)}</td><td>${escapeXml(line.roomBreakdown.map((room) => `${room.name} (${room.quantity})`).join(", "))}</td></tr>`).join("");
  const roomRows = bom.rooms.map((room) => `<tr><td>${escapeXml(room.unitName)}</td><td>${escapeXml(room.name)}</td><td>${room.areaM2.toFixed(1)} m²</td><td>${room.points}</td><td>${Math.round(room.watts)} W</td></tr>`).join("");
  const circuitRows = bom.circuits.map((circuit) => `<tr><td>SK${circuit.skNumber}</td><td>${escapeXml(circuit.name)}</td><td>${circuit.load?.points ?? 0}</td><td>${Math.round(circuit.load?.watts ?? 0)} W</td></tr>`).join("");
  const protocolRowsHtml = protocol.map((row) => `<tr><td>SK${row.skNumber}</td><td>${escapeXml(row.name)}</td><td>${escapeXml(row.breaker)}</td><td>${row.report.rcdTripMs ?? ""}</td><td>${row.report.insulationMohm ?? ""}</td><td>${row.report.continuityOhm ?? ""}</td><td>${escapeXml(row.report.result)}</td><td>${escapeXml(row.report.tester ?? "")}</td></tr>`).join("");

  const cabinetSections = state.distributors.map((distributor) => {
    const devices = state.cabinetDevices.filter((device) => device.distributorId === distributor.id);
    const rows = devices.map((device) => `<tr><td>${device.row != null ? device.row + 1 : "—"}</td><td>${device.startTe ?? "—"}</td><td>${device.teWidth}</td><td>${escapeXml(device.kind)}</td><td>${escapeXml(device.label)}</td><td>${escapeXml(device.article ?? "")}</td></tr>`).join("");
    return `<h2>${escapeXml(distributor.name)}</h2><div style="max-width:100%">${cabinetSvg(distributor, devices, 860)}</div><table><thead><tr><th>Row</th><th>Start TE</th><th>Width</th><th>Kind</th><th>Label</th><th>Article</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).join("");

  const diagramSections = diagrams.map((page) => `<div style="break-after: page"><h2>Circuit diagram · page ${page.page} / ${page.pages}</h2>${page.svg}</div>`).join("");

  return `
    <section>
      <h1>${escapeXml(state.name)}</h1>
      <div class="meta">${state.units.length} floor${state.units.length === 1 ? "" : "s"} · ${bom.totals.symbols} positions · ${bom.rooms.length} room${bom.rooms.length === 1 ? "" : "s"} · ${formatEuro(bom.totals.total)} material value</div>
      <table><tbody>
        <tr><th>Floors</th><td>${state.units.map((unit) => escapeXml(unit.name)).join(", ")}</td></tr>
        <tr><th>Circuits</th><td>${state.circuits.length}</td></tr>
        <tr><th>Distribution boards</th><td>${state.distributors.length}</td></tr>
        <tr><th>KNX group addresses</th><td>${state.groupAddresses.length}</td></tr>
        <tr><th>Protocol</th><td>${protocol.filter((row) => row.report.result === "pass").length} passed · ${protocol.filter((row) => row.report.result === "fail").length} failed</td></tr>
      </tbody></table>
    </section>
    ${currentPlanSvg ? section(`Installation plan — ${currentUnitName}`, currentPlanSvg) : ""}
    ${section("Bill of materials", `<div class="meta">${bom.totals.symbols} positions · ${bom.totals.lines} line items · ${formatEuro(bom.totals.total)}</div><table><thead><tr><th>Article</th><th>Description</th><th>Category</th><th>Qty</th><th>Unit price</th><th>Total</th><th>Rooms</th></tr></thead><tbody>${bomRows}</tbody></table><h2>Room schedule</h2><table><thead><tr><th>Floor</th><th>Room</th><th>Area</th><th>Points</th><th>Load</th></tr></thead><tbody>${roomRows}</tbody></table><h2>Circuit schedule</h2><table><thead><tr><th>SK</th><th>Name</th><th>Points</th><th>Load</th></tr></thead><tbody>${circuitRows}</tbody></table>`)}
    ${cabinetSections ? section("Distribution boards", cabinetSections) : ""}
    ${diagramSections ? section("Circuit diagrams", diagramSections) : ""}
    ${protocol.length ? section("Inspection protocol", `<table><thead><tr><th>SK</th><th>Circuit</th><th>Breaker / RCD</th><th>RCD ms</th><th>Insulation MΩ</th><th>Continuity Ω</th><th>Result</th><th>Tester</th></tr></thead><tbody>${protocolRowsHtml}</tbody></table>`, false) : ""}
  `;
}
