export function downloadText(
  filename: string,
  content: string,
  mime = "text/plain",
): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFilename(value: string, fallback = "plan"): string {
  return (
    value
      .trim()
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function printHtml(title: string, body: string): void {
  const popup = window.open("", "_blank", "width=1100,height=800");
  if (!popup) return;
  popup.document
    .write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page { margin: 12mm; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; color: #0f172a; margin: 0; }
    h1 { font-size: 18px; margin: 0 0 4px; } h2 { font-size: 14px; margin: 18px 0 6px; }
    .meta { color: #64748b; font-size: 11px; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; font-size: 10px; } th, td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; } svg { max-width: 100%; height: auto; }
    .warn { background: #fef3c7; } .info { background: #eff6ff; }
    @media print { .no-print { display: none; } }
  </style></head><body>${body}<script>window.onload=()=>{ setTimeout(()=>window.print(), 250); }</script></body></html>`);
  popup.document.close();
}

export function round1(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}
