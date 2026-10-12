import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { runDemoTest, useLab } from "@/lib/lab/store";
import type { TestRun } from "@/lib/lab/types";
import { EmptyState, PageHeader, Pill, StatusPill, fmtTs } from "@/components/lab/ui";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/tests")({
  head: () => ({
    meta: [
      { title: "Test Runs — 5G SA Core Lab Console" },
      { name: "description", content: "History of registration, PDU session and user-plane checks, with a simulated demo test runner." },
      { property: "og:title", content: "Test Runs — 5G SA Core Lab Console" },
      { property: "og:description", content: "Registration and session test history for a 5G SA lab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tests,
});

const KINDS: { v: TestRun["kind"]; l: string }[] = [
  { v: "registration", l: "UE registration" },
  { v: "pdu_session", l: "PDU session" },
  { v: "user_plane", l: "User-plane ping" },
  { v: "nf_health", l: "NF health" },
];

function Tests() {
  const { testRuns } = useLab();
  const [kind, setKind] = useState<TestRun["kind"]>("registration");
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<TestRun | null>(null);

  const run = () => {
    setBusy(true);
    setTimeout(() => {
      setLast(runDemoTest(kind));
      setBusy(false);
    }, 900);
  };

  return (
    <>
      <PageHeader
        title="Test runs"
        subtitle="“Run demo test” generates a random SIMULATED result in your browser. It does not contact any core network."
        actions={
          <>
            <Select value={kind} onValueChange={(v) => setKind(v as TestRun["kind"])}>
              <SelectTrigger className="w-44" aria-label="Test type"><SelectValue /></SelectTrigger>
              <SelectContent>{KINDS.map((k) => <SelectItem key={k.v} value={k.v}>{k.l}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={run} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Play aria-hidden />}
              {busy ? "Simulating…" : "Run demo test"}
            </Button>
          </>
        }
      />
      <div aria-live="polite">
        {last && !busy && (
          <div className="panel mb-3 flex flex-wrap items-center gap-2 p-3 text-sm">
            <Pill tone="warning">simulated</Pill>
            <StatusPill value={last.outcome} />
            <span>{last.target} — {last.durationMs}ms. Added to history below.</span>
          </div>
        )}
      </div>
      {testRuns.length === 0 ? (
        <EmptyState title="No test runs yet" hint="Run a demo test or import a JSON snapshot." />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-left">
              <tr className="[&>th]:label-caps [&>th]:px-3 [&>th]:py-2"><th>Outcome</th><th>Timestamp</th><th>Type</th><th>Target</th><th>Duration</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {testRuns.map((t) => (
                <tr key={t.id} className="border-b last:border-0 [&>td]:px-3 [&>td]:py-2">
                  <td><div className="flex gap-1"><StatusPill value={t.outcome} />{t.simulated && <Pill tone="warning">sim</Pill>}</div></td>
                  <td className="whitespace-nowrap font-mono text-xs">{fmtTs(t.ts)}</td>
                  <td className="font-mono text-xs">{t.kind}</td>
                  <td>{t.target}</td>
                  <td className="font-mono text-xs">{t.durationMs}ms</td>
                  <td className="text-muted-foreground">{t.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
