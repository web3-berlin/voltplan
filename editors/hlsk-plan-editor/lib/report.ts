import { DISCIPLINES, PIPE_KINDS, DUCT_KINDS, RISER_KINDS } from "./catalog.js";
import { hlskBom, hlskChecks } from "./engine.js";
import type { HlskPlanGlobalState } from "./types.js";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function section(title: string, content: string, breakAfter = true): string {
  return `<section style="${breakAfter ? "break-after: page;" : ""}"><h1>${escapeXml(title)}</h1>${content}</section>`;
}

export function hlskReportHtml(
  state: HlskPlanGlobalState,
  currentPlanSvg: string,
  currentUnitName: string,
): string {
  const bom = hlskBom(state);
  const checks = hlskChecks(state);

  const bomRows = bom.lines
    .map(
      (line) =>
        `<tr><td>${escapeXml(line.unit)}</td><td>${escapeXml(line.category)}</td><td>${escapeXml(line.item)}</td><td>${escapeXml(line.detail)}</td><td>${line.quantity}</td><td>${line.lengthM == null ? "—" : line.lengthM.toFixed(1) + " m"}</td></tr>`,
    )
    .join("");

  const checkRows = checks
    .map(
      (check) =>
        `<tr class="${check.severity === "warning" ? "warn" : "info"}"><td>${check.severity === "warning" ? "Warning" : "Info"}</td><td>${escapeXml(check.title)}</td><td>${escapeXml(check.message)}</td><td>${escapeXml(check.hint)}</td></tr>`,
    )
    .join("");

  const legend = [
    ...DISCIPLINES.map(
      (item) =>
        `<span style="display:inline-block;margin:0 12px 4px 0"><b style="color:${item.color}">■</b> ${escapeXml(item.name)}</span>`,
    ),
    ...PIPE_KINDS.map(
      (item) =>
        `<span style="display:inline-block;margin:0 12px 4px 0"><b style="color:${item.color}">—</b> ${escapeXml(item.name)}</span>`,
    ),
    ...DUCT_KINDS.map(
      (item) =>
        `<span style="display:inline-block;margin:0 12px 4px 0"><b style="color:${item.color}">▬</b> ${escapeXml(item.name)}</span>`,
    ),
    ...RISER_KINDS.map(
      (item) =>
        `<span style="display:inline-block;margin:0 12px 4px 0"><b style="color:${item.color}">●</b> ${escapeXml(item.name)}</span>`,
    ),
  ].join("");

  return `
    <section>
      <h1>${escapeXml(state.name)}</h1>
      <div class="meta">${state.units.length} floor${state.units.length === 1 ? "" : "s"} · ${bom.totals.fixtures} fixtures · ${bom.totals.pipes} pipe routes · ${bom.totals.ducts} duct routes · ${bom.totals.risers} risers</div>
      <table><tbody>
        <tr><th>Floors</th><td>${state.units.map((unit) => escapeXml(unit.name)).join(", ")}</td></tr>
        <tr><th>Pipe length</th><td>${bom.totals.pipeLengthM.toFixed(1)} m</td></tr>
        <tr><th>Duct length</th><td>${bom.totals.ductLengthM.toFixed(1)} m</td></tr>
        <tr><th>Checks</th><td>${checks.filter((check) => check.severity === "warning").length} warnings · ${checks.filter((check) => check.severity === "info").length} notes</td></tr>
      </tbody></table>
      <h2>Legend</h2>
      <div class="meta">${legend}</div>
    </section>
    ${currentPlanSvg ? section(`Floor plan — ${currentUnitName}`, currentPlanSvg) : ""}
    ${section("Materials and quantities", `<table><thead><tr><th>Floor</th><th>Category</th><th>Item</th><th>Detail</th><th>Quantity</th><th>Length</th></tr></thead><tbody>${bomRows}</tbody></table>`)}
    ${section("Plan checks", `<table><thead><tr><th>Level</th><th>Topic</th><th>What it means</th><th>What to do</th></tr></thead><tbody>${checkRows}</tbody></table>`, false)}
  `;
}
