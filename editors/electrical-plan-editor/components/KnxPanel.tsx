import { useMemo, useState } from "react";
import { getElectricalDef } from "../lib/catalog.js";
import { generateKnx, knxBusLoad, knxCsv, knxXml } from "../lib/engine.js";
import type { ElectricalPlanGlobalState } from "../lib/types.js";
import { actions } from "document-models/electrical-plan";
import type { ElectricalPlanAction } from "document-models/electrical-plan/v1";
import { downloadText, printHtml, safeFilename } from "../lib/ui.js";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function KnxPanel({
  state,
  dispatch,
}: {
  state: ElectricalPlanGlobalState;
  dispatch: (action: ElectricalPlanAction) => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const result = useMemo(() => generateKnx(state), [state]);
  const bus = useMemo(() => knxBusLoad(state), [state]);
  const busDevices = useMemo(
    () =>
      state.units.flatMap((unit) =>
        unit.symbols
          .filter((symbol) => symbol.knx?.enabled)
          .map((symbol) => ({
            unit,
            symbol,
            def: getElectricalDef(symbol.defId),
          })),
      ),
    [state.units],
  );
  const busSymbols = bus.devices;
  const saved = state.groupAddresses;
  const savedKeys = new Set(
    saved.map((address) => `${address.main}/${address.middle}/${address.sub}`),
  );
  const previewDiffers =
    saved.length !== result.addresses.length ||
    result.addresses.some(
      (address) =>
        !savedKeys.has(`${address.main}/${address.middle}/${address.sub}`),
    );

  const generate = () => {
    const next = generateKnx(state);
    dispatch(actions.setGroupAddresses({ addresses: next.addresses }));
    setNotice(
      `Generated ${next.added} new group addresses. ${next.addresses.length} total.${next.conflicts.length ? ` ${next.conflicts.length} duplicates need attention.` : ""}`,
    );
  };

  const print = () => {
    const rows = saved
      .map(
        (address) =>
          `<tr><td>${address.main}/${address.middle}/${address.sub}</td><td>${escapeXml(address.name)}</td><td>${escapeXml(address.dpt)}</td><td>${escapeXml(address.description ?? "")}</td></tr>`,
      )
      .join("");
    printHtml(
      "KNX group addresses",
      `<h1>KNX group addresses</h1><div class="meta">${escapeXml(state.name)} · ${saved.length} addresses</div><table><thead><tr><th>Address</th><th>Name</th><th>DPT</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>`,
    );
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              KNX group addresses
            </h2>
            <p className="text-xs text-slate-500">
              Three-level addresses from KNX-capable symbols and their datapoint
              functions.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={generate}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Generate addresses
            </button>
            <button
              type="button"
              disabled={!saved.length}
              onClick={() =>
                downloadText(
                  `${safeFilename(state.name)}-knx.xml`,
                  knxXml(saved),
                  "application/xml",
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:text-slate-300"
            >
              XML
            </button>
            <button
              type="button"
              disabled={!saved.length}
              onClick={() =>
                downloadText(
                  `${safeFilename(state.name)}-knx.csv`,
                  knxCsv(saved),
                  "text/csv",
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:text-slate-300"
            >
              CSV
            </button>
            <button
              type="button"
              disabled={!saved.length}
              onClick={print}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:bg-slate-300"
            >
              Print
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Bus load
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {bus.loadMa} mA
            </p>
            <p className="text-[10px] text-slate-400">
              {bus.devices} devices · {bus.capacityMa} mA supply
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Saved
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {saved.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Proposed
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {result.addresses.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Conflicts
            </p>
            <p
              className={`mt-1 text-2xl font-semibold ${result.conflicts.length ? "text-red-600" : "text-emerald-600"}`}
            >
              {result.conflicts.length}
            </p>
          </div>
        </div>

        {bus.percent > 100 ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            Bus overload: {bus.loadMa} mA exceeds {bus.capacityMa} mA. Add a
            power supply or split the line.
          </div>
        ) : bus.percent > 80 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Bus load is above 80 % ({bus.loadMa} / {bus.capacityMa} mA). Keep
            reserve for commissioning and future devices.
          </div>
        ) : null}
        {bus.unknownDevices ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
            {bus.unknownDevices} KNX device{bus.unknownDevices === 1 ? "" : "s"}{" "}
            have no bus-load metadata; counted as 10 mA each.
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            {notice}
          </div>
        ) : null}
        {previewDiffers && result.addresses.length ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Preview only —{" "}
            {result.addresses.length - saved.length > 0
              ? `${result.addresses.length - saved.length} new address${result.addresses.length - saved.length === 1 ? "" : "es"}`
              : "address changes"}{" "}
            not saved yet. Click <strong>Generate addresses</strong> to persist
            them.
          </div>
        ) : null}
        {result.conflicts.length ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {result.conflicts.map((conflict) => (
              <p key={conflict}>{conflict}</p>
            ))}
          </div>
        ) : null}
        {!busSymbols ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-400">
            <p className="mb-1 text-sm font-medium text-slate-500">
              No KNX symbols selected.
            </p>
            <p>
              Place a KNX push button, actuator, thermostat or gateway, then
              generate addresses. The device binding is stored on the symbol.
            </p>
          </div>
        ) : (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Bus participants
              </h3>
              <span className="text-[10px] text-slate-400">
                {bus.devices} devices · {bus.loadMa} / {bus.capacityMa} mA
              </span>
            </header>
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Device</th>
                  <th className="px-4 py-2 font-medium">
                    Manufacturer / article
                  </th>
                  <th className="px-4 py-2 font-medium">Channels</th>
                  <th className="px-4 py-2 font-medium">Bus</th>
                  <th className="px-4 py-2 font-medium">Functions</th>
                </tr>
              </thead>
              <tbody>
                {busDevices.map(({ unit, symbol, def }) => {
                  if (!def) return null;
                  const loadMa =
                    def.busCurrentMa ??
                    (def.busLoads != null ? def.busLoads * 10 : 10);
                  return (
                    <tr
                      key={`${unit.id}:${symbol.id}`}
                      className="border-t border-slate-100"
                      title={def.application}
                    >
                      <td className="px-4 py-2 text-slate-700">
                        {symbol.label || def.name}
                        <span className="block text-[10px] text-slate-400">
                          {unit.name}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {def.manufacturer ?? "—"}
                        {def.orderNumber || def.article ? (
                          <span className="block font-mono text-[10px] text-slate-400">
                            {def.orderNumber ?? def.article}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {def.channels ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {def.busSupplyMa
                          ? `${def.busSupplyMa} mA supply`
                          : `${loadMa} mA`}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {def.knxFunctions?.length ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Group address preview
            </h3>
            <span className="text-[10px] text-slate-400">
              Main / Middle / Sub · saved exports use the document addresses
            </span>
          </header>
          {result.addresses.length === 0 ? (
            <p className="p-5 text-xs text-slate-400">
              Generate addresses to see them here.
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Address</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">DPT</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {result.addresses.map((address) => (
                  <tr key={address.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono text-[11px] font-semibold text-emerald-700">
                      {address.main}/{address.middle}/{address.sub}
                    </td>
                    <td className="px-4 py-2 text-slate-700">{address.name}</td>
                    <td className="px-4 py-2 font-mono text-[10px] text-slate-500">
                      {address.dpt}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-slate-500">
                      {address.description ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <p className="text-[11px] text-slate-400">
          The XML export follows the KNX Group Address Export schema. Addresses
          are stable per symbol and function once generated.
        </p>
      </div>
    </div>
  );
}
