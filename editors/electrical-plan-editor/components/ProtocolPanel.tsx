import { useMemo } from "react";
import { protocolCsv, protocolRows } from "../lib/engine.js";
import type {
  ElectricalPlanGlobalState,
  InspectionReport,
} from "../lib/types.js";
import { actions } from "document-models/electrical-plan";
import type { ElectricalPlanAction } from "document-models/electrical-plan/v1";
import { downloadText, printHtml, safeFilename } from "../lib/ui.js";

const inputClass =
  "w-full rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";
const RESULT_LABELS: Partial<Record<string, string>> = {
  not_tested: "Not tested",
  pass: "Pass",
  fail: "Fail",
};
const FIELD_LABELS: Partial<Record<string, string>> = {
  not_tested: "Not tested",
  clockwise: "Clockwise",
  counterclockwise: "Counter-clockwise",
};

function numberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ProtocolPanel({
  state,
  dispatch,
}: {
  state: ElectricalPlanGlobalState;
  dispatch: (action: ElectricalPlanAction) => void;
}) {
  const rows = useMemo(() => protocolRows(state), [state]);
  const passed = rows.filter((row) => row.report.result === "pass").length;
  const failed = rows.filter((row) => row.report.result === "fail").length;

  const update = (report: InspectionReport) =>
    dispatch(
      actions.updateReport({
        report: {
          id: report.id,
          circuitId: report.circuitId,
          result: report.result,
          rcdTripMs: report.rcdTripMs,
          rcdTestCurrentMa: report.rcdTestCurrentMa,
          insulationMohm: report.insulationMohm,
          insulationTestVoltageV: report.insulationTestVoltageV,
          continuityOhm: report.continuityOhm,
          loopImpedanceOhm: report.loopImpedanceOhm,
          rotatingField: report.rotatingField,
          visualInspection: report.visualInspection,
          tester: report.tester,
          testedAt: report.testedAt,
          nextTestDue: report.nextTestDue,
          signature: report.signature,
          notes: report.notes,
        },
      }),
    );

  const print = () => {
    const bodyRows = rows
      .map(
        (row) =>
          `<tr><td>SK${row.skNumber}</td><td>${escapeXml(row.name)}</td><td>${escapeXml(row.breaker)}</td><td>${row.report.rcdTripMs ?? ""} ms / ${row.report.rcdTestCurrentMa ?? ""} mA</td><td>${row.report.insulationMohm ?? ""} MΩ / ${row.report.insulationTestVoltageV ?? ""} V</td><td>${row.report.continuityOhm ?? ""} Ω / ${row.report.loopImpedanceOhm ?? ""} Ω Zs</td><td>${escapeXml(FIELD_LABELS[row.report.rotatingField ?? "not_tested"] ?? row.report.rotatingField ?? "")}</td><td>${escapeXml(RESULT_LABELS[row.report.visualInspection ?? "not_tested"] ?? row.report.visualInspection ?? "")}</td><td>${escapeXml(RESULT_LABELS[row.report.result] ?? row.report.result)}</td><td>${escapeXml(row.report.tester ?? "")}<br>${escapeXml(row.report.signature ?? "")}</td><td>${escapeXml(row.report.testedAt ?? "")}<br>${escapeXml(row.report.nextTestDue ?? "")}</td><td>${escapeXml(row.report.notes ?? "")}</td></tr>`,
      )
      .join("");
    printHtml(
      "Inspection protocol",
      `<h1>Inspection protocol</h1><div class="meta">${escapeXml(state.name)} · ${rows.length} circuits · ${passed} passed · ${failed} failed</div><table><thead><tr><th>SK</th><th>Circuit</th><th>Breaker</th><th>RCD</th><th>Insulation</th><th>Continuity / Zs</th><th>Field</th><th>Visual</th><th>Result</th><th>Tester / signature</th><th>Tested / next</th><th>Notes</th></tr></thead><tbody>${bodyRows}</tbody></table>`,
    );
  };

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Inspection protocol
            </h2>
            <p className="text-xs text-slate-500">
              Record RCD trip time and test current, insulation and test
              voltage, continuity, loop impedance, rotating field, visual
              inspection, result, signature and next test date.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                downloadText(
                  `${safeFilename(state.name)}-protocol.csv`,
                  protocolCsv(rows),
                  "text/csv",
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={print}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Print / PDF
            </button>
          </div>
        </header>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Circuits
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {rows.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Passed
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">
              {passed}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Failed
            </p>
            <p className="mt-1 text-2xl font-semibold text-red-600">{failed}</p>
          </div>
        </div>
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-400">
            Create circuits to start the protocol.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[1220px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">SK</th>
                  <th className="px-3 py-2 font-medium">Circuit</th>
                  <th className="px-3 py-2 font-medium">Breaker / RCD</th>
                  <th className="px-3 py-2 font-medium">RCD ms / test mA</th>
                  <th className="px-3 py-2 font-medium">Insulation MΩ / V</th>
                  <th className="px-3 py-2 font-medium">Continuity / Zs Ω</th>
                  <th className="px-3 py-2 font-medium">
                    Result / visual / field
                  </th>
                  <th className="px-3 py-2 font-medium">Tester / signature</th>
                  <th className="px-3 py-2 font-medium">Tested / next</th>
                  <th className="px-3 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.circuitId}
                    className="border-t border-slate-100 align-top"
                  >
                    <td className="px-3 py-2 font-semibold text-slate-700">
                      SK{row.skNumber}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-700">
                        {row.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {row.cable}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-slate-600">{row.breaker}</div>
                      <div className="text-[10px] text-slate-400">
                        {row.rcd}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <input
                          key={`${row.report.id}-rcd-${row.report.rcdTripMs}`}
                          type="number"
                          step="0.1"
                          placeholder="ms"
                          defaultValue={row.report.rcdTripMs ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              rcdTripMs: numberOrNull(event.target.value),
                            })
                          }
                        />
                        <input
                          key={`${row.report.id}-rcdma-${row.report.rcdTestCurrentMa}`}
                          type="number"
                          step="1"
                          placeholder="test mA"
                          defaultValue={row.report.rcdTestCurrentMa ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              rcdTestCurrentMa: numberOrNull(
                                event.target.value,
                              ),
                            })
                          }
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <input
                          key={`${row.report.id}-ins-${row.report.insulationMohm}`}
                          type="number"
                          step="0.1"
                          placeholder="MΩ"
                          defaultValue={row.report.insulationMohm ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              insulationMohm: numberOrNull(event.target.value),
                            })
                          }
                        />
                        <input
                          key={`${row.report.id}-insv-${row.report.insulationTestVoltageV}`}
                          type="number"
                          step="50"
                          placeholder="test V"
                          defaultValue={row.report.insulationTestVoltageV ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              insulationTestVoltageV: numberOrNull(
                                event.target.value,
                              ),
                            })
                          }
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <input
                          key={`${row.report.id}-con-${row.report.continuityOhm}`}
                          type="number"
                          step="0.01"
                          placeholder="Ω"
                          defaultValue={row.report.continuityOhm ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              continuityOhm: numberOrNull(event.target.value),
                            })
                          }
                        />
                        <input
                          key={`${row.report.id}-zs-${row.report.loopImpedanceOhm}`}
                          type="number"
                          step="0.01"
                          placeholder="Zs Ω"
                          defaultValue={row.report.loopImpedanceOhm ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              loopImpedanceOhm: numberOrNull(
                                event.target.value,
                              ),
                            })
                          }
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <select
                          value={row.report.result}
                          className={inputClass}
                          onChange={(event) =>
                            update({
                              ...row.report,
                              result: event.target.value,
                            })
                          }
                        >
                          {Object.entries(RESULT_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                        <select
                          value={row.report.visualInspection ?? "not_tested"}
                          className={inputClass}
                          onChange={(event) =>
                            update({
                              ...row.report,
                              visualInspection: event.target.value,
                            })
                          }
                        >
                          {Object.entries(RESULT_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                Visual: {label}
                              </option>
                            ),
                          )}
                        </select>
                        <select
                          value={row.report.rotatingField ?? "not_tested"}
                          className={inputClass}
                          onChange={(event) =>
                            update({
                              ...row.report,
                              rotatingField: event.target.value,
                            })
                          }
                        >
                          {Object.entries(FIELD_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                Field: {label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <input
                          key={`${row.report.id}-tester-${row.report.tester}`}
                          placeholder="Tester"
                          defaultValue={row.report.tester ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              tester: event.target.value,
                            })
                          }
                        />
                        <input
                          key={`${row.report.id}-sig-${row.report.signature}`}
                          placeholder="Signature"
                          defaultValue={row.report.signature ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              signature: event.target.value,
                            })
                          }
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <input
                          key={`${row.report.id}-date-${row.report.testedAt}`}
                          type="date"
                          defaultValue={row.report.testedAt ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              testedAt: event.target.value,
                            })
                          }
                        />
                        <input
                          key={`${row.report.id}-next-${row.report.nextTestDue}`}
                          type="date"
                          defaultValue={row.report.nextTestDue ?? ""}
                          className={inputClass}
                          onBlur={(event) =>
                            update({
                              ...row.report,
                              nextTestDue: event.target.value,
                            })
                          }
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        key={`${row.report.id}-notes-${row.report.notes}`}
                        defaultValue={row.report.notes ?? ""}
                        className={inputClass}
                        onBlur={(event) =>
                          update({ ...row.report, notes: event.target.value })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
