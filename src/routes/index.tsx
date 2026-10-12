import { createFileRoute, Link } from "@tanstack/react-router";
import { useLab } from "@/lib/lab/store";
import { Dot, EmptyState, PageHeader, Panel, Pill, StatusPill, fmtTs, fmtUptime, toneFor } from "@/components/lab/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — 5G SA Core Lab Console" },
      { name: "description", content: "Network function status, UE registrations, PDU sessions and alarms for an Open5GS lab (demo data)." },
      { property: "og:title", content: "Overview — 5G SA Core Lab Console" },
      { property: "og:description", content: "NOC overview of a 5G Standalone Open5GS + UERANSIM lab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="panel p-4">
      <p className="label-caps">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Overview() {
  const { nfs, sessions, events, testRuns, mode } = useLab();
  const registered = sessions.filter((s) => s.regState === "REGISTERED").length;
  const failed = sessions.filter((s) => s.regState === "REG_FAILED").length;
  const activePdu = sessions.filter((s) => s.pduState === "ACTIVE").length;
  const attempted = registered + failed;
  const rate = attempted ? Math.round((registered / attempted) * 100) : 0;
  const open = events.filter((e) => e.status !== "resolved");
  const passes = testRuns.filter((t) => t.outcome === "pass").length;
  const maxUp = Math.max(0, ...nfs.map((n) => n.uptimeSec));

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle={mode === "demo" ? "All values below are seeded demo data, not live telemetry from a 5G core." : "Values below come from an imported JSON snapshot, not a live connection."}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="UE registered" value={`${registered}/${sessions.length}`} sub={`${failed} failed`} />
        <Kpi label="PDU sessions active" value={String(activePdu)} sub="DNN internet / SST 1" />
        <Kpi label="Registration success" value={`${rate}%`} sub={`${registered} of ${attempted} attempts`} />
        <Kpi label="Open alarms" value={String(open.length)} sub={`${open.filter((e) => e.severity === "critical" || e.severity === "major").length} major/critical`} />
        <Kpi label="Test runs passed" value={`${passes}/${testRuns.length}`} sub={testRuns[0] ? `last ${fmtTs(testRuns[0].ts).slice(11)}` : "none yet"} />
        <Kpi label="Longest NF uptime" value={fmtUptime(maxUp)} sub="reported by snapshot" />
      </div>

      <h2 className="label-caps mb-2 mt-6">Core network functions</h2>
      {nfs.length === 0 ? (
        <EmptyState title="No network function status in this dataset" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {nfs.map((n) => (
            <div key={n.nf} className="panel p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Dot tone={toneFor(n.state)} />
                  <span className="font-mono text-base font-semibold">{n.nf}</span>
                </div>
                <StatusPill value={n.state} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{n.detail}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
                <span>up {fmtUptime(n.uptimeSec)}</span>
                <span>{n.version}</span>
                <span>hb {fmtTs(n.lastHeartbeat).slice(11)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Recent alarms" right={<Link to="/events" className="text-xs text-primary hover:underline">All events →</Link>}>
          {open.length === 0 ? (
            <EmptyState title="No open alarms" />
          ) : (
            <ul className="divide-y">
              {open.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
                  <Pill tone={toneFor(e.severity)} className="mt-0.5">{e.severity}</Pill>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm"><span className="font-mono text-primary">{e.nf}</span> · {e.message}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{fmtTs(e.ts)} · {e.type}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent test runs" right={<Link to="/tests" className="text-xs text-primary hover:underline">Test runs →</Link>}>
          {testRuns.length === 0 ? (
            <EmptyState title="No test runs" />
          ) : (
            <ul className="divide-y">
              {testRuns.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <StatusPill value={t.outcome} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{t.target}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{fmtTs(t.ts)} · {t.kind} · {t.durationMs}ms{t.simulated ? " · simulated" : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
