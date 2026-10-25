import type { PHDocument } from "document-model";
import type { Node } from "@powerhousedao/shared";
import { showCreateDocumentModal } from "@powerhousedao/reactor-browser";

export interface PlanCard {
  node: Node;
  document: PHDocument;
  name: string;
  meta: string;
  status: string;
  tone: "ok" | "warn" | "neutral";
  openUrl: string;
}

interface Props {
  driveName: string;
  title: string;
  subtitle: string;
  createLabel: string;
  documentType: string;
  stats: { label: string; value: string | number; hint: string }[];
  plans: PlanCard[];
  emptyTitle: string;
  emptyBody: string;
}

export function TradeDriveDashboard({
  driveName,
  title,
  subtitle,
  createLabel,
  documentType,
  stats,
  plans,
  emptyTitle,
  emptyBody,
}: Props) {
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">
              Planvolt
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">
              {title}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Drive:{" "}
              <span className="font-medium text-slate-700">{driveName}</span> ·{" "}
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => showCreateDocumentModal(documentType)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            {createLabel}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-5xl space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-slate-500">
                  {stat.hint}
                </p>
              </div>
            ))}
          </div>

          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Plans in this drive
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Open a plan to continue planning. New plans appear here after
                  they are created.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                {plans.length} plan{plans.length === 1 ? "" : "s"}
              </span>
            </div>

            {plans.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  {emptyTitle}
                </p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                  {emptyBody}
                </p>
                <button
                  type="button"
                  onClick={() => showCreateDocumentModal(documentType)}
                  className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {createLabel}
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {plans.map((plan) => (
                  <li
                    key={plan.document.header.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {plan.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {plan.meta}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                          plan.tone === "warn"
                            ? "bg-amber-50 text-amber-800"
                            : plan.tone === "ok"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {plan.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => window.location.assign(plan.openUrl)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Open plan
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-relaxed text-slate-500">
            <p className="font-semibold text-slate-700">How this drive works</p>
            <p className="mt-1">
              Plans are Powerhouse documents. The trade view only lists the
              plans that belong to this trade, so the electrician and HLSK teams
              can work in separate drives without mixing their schedules.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
