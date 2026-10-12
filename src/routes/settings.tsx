import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { exportLab, importLabJson, resetToDemo, useLab, type ImportResult } from "@/lib/lab/store";
import { CodeBlock, DataModeBadge, PageHeader, Panel, fmtTs } from "@/components/lab/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Data Source — 5G SA Core Lab Console" },
      { name: "description", content: "Current data mode, JSON import with validation, and the future local collector integration contract." },
      { property: "og:title", content: "Data Source — 5G SA Core Lab Console" },
      { property: "og:description", content: "Demo data mode and JSON import for the 5G SA lab console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

const CONTRACT = `POST /api/v1/lab/snapshot        (PLANNED — not implemented)
Content-Type: application/json
Authorization: Bearer <token kept on the collector host / server only>

{
  "nfs":      [{ "nf": "AMF", "state": "up", "version": "Open5GS 2.7.x",
                 "uptimeSec": 3600, "lastHeartbeat": "2026-10-12T20:00:00Z",
                 "detail": "NGAP: 1 gNB connected" }],
  "sessions": [{ "id": "ue-01", "supi": "imsi-99970000000***1",
                 "gnb": "UERANSIM-gnb-999-70-1", "regState": "REGISTERED",
                 "pduState": "ACTIVE", "dnn": "internet", "sst": 1,
                 "ueIp": "10.45.0.2", "lastEvent": "PDU Session Establishment Accept",
                 "timestamp": "2026-10-12T20:00:00Z" }],
  "events":   [{ "id": "ev-1", "ts": "2026-10-12T20:00:00Z", "severity": "info",
                 "nf": "SMF", "type": "PDU_SESSION_ESTABLISHED",
                 "message": "...", "status": "open" }],
  "testRuns": [{ "id": "tr-1", "ts": "2026-10-12T20:00:00Z", "kind": "registration",
                 "target": "ue-01", "outcome": "pass", "durationMs": 700,
                 "notes": "...", "simulated": false }]
}

Enums
  nf state:   up | degraded | down
  regState:   REGISTERED | REGISTERING | DEREGISTERED | REG_FAILED
  pduState:   ACTIVE | INACTIVE | FAILED | NONE
  severity:   critical | major | minor | info
  event nf:   AMF SMF UPF AUSF UDM NRF gNB UE
  test kind:  registration | pdu_session | user_plane | nf_health`;

function Settings() {
  const { mode, importedAt } = useLab();
  const [text, setText] = useState("");
  const [res, setRes] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (f?: File) => {
    if (!f) return;
    if (f.size > 2_000_000) return setRes({ ok: false, errors: ["File is larger than 2 MB."] });
    setText(await f.text());
    setRes(null);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportLab()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = "5g-lab-snapshot.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Data source & settings" subtitle="This console has no live connection to any 5G core. Data is either the built-in demo set or a JSON snapshot you import." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Current mode">
          <div className="flex flex-wrap items-center gap-3">
            <DataModeBadge />
            <span className="text-sm text-muted-foreground">
              {mode === "demo" ? "Demo data (seeded, fictional)" : `Imported JSON snapshot${importedAt ? ` · ${fmtTs(importedAt)}` : ""}`}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Live connection: <span className="font-mono text-foreground">none</span>. State and your ack/resolve actions are stored in this browser only.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={download}>Export current JSON</Button>
            <Button variant="secondary" onClick={() => { resetToDemo(); setRes(null); }}>Reset to demo data</Button>
          </div>
        </Panel>

        <Panel title="Import JSON snapshot">
          <label htmlFor="json-in" className="sr-only">JSON snapshot</label>
          <Textarea id="json-in" value={text} onChange={(e) => { setText(e.target.value); setRes(null); }} placeholder='{"nfs": [], "sessions": [], "events": [], "testRuns": []}' className="h-40 font-mono text-xs" />
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} aria-label="Choose JSON file" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>Choose file…</Button>
            <Button onClick={() => setRes(importLabJson(text))} disabled={!text.trim()}>Validate & import</Button>
          </div>
          <div aria-live="polite" className="mt-3">
            {res?.ok === false && (
              <div role="alert" className="rounded border border-critical/50 bg-critical/10 p-3 text-sm">
                <p className="font-medium text-critical">Import rejected — data unchanged</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 font-mono text-xs">{res.errors.map((e) => <li key={e}>{e}</li>)}</ul>
              </div>
            )}
            {res?.ok && (
              <div className="rounded border border-success/50 bg-success/10 p-3 text-sm text-success">
                Imported: {Object.entries(res.counts).map(([k, v]) => `${v} ${k}`).join(", ")}.
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Future integration contract (local collector → API)" className="xl:col-span-2">
          <p className="mb-3 text-sm text-muted-foreground">
            Planned design: a small collector on the Ubuntu lab host reads Open5GS logs / systemd state and UERANSIM output, maps them to the schema below, and POSTs a snapshot. The endpoint is <strong>not implemented</strong> in this version; the same schema is accepted by the JSON import above today.
          </p>
          <CodeBlock>{CONTRACT}</CodeBlock>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Secrets (tokens) belong on the collector host and server side, never in this frontend.</li>
            <li>Mask SUPI/IMSI values before sending; never export K/OPc or other subscriber keys.</li>
            <li>Collector should be read-only: it observes the lab and never changes core configuration.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
