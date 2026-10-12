import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { setEventStatus, useLab } from "@/lib/lab/store";
import { SEVERITIES } from "@/lib/lab/types";
import { EmptyState, PageHeader, Pill, StatusPill, fmtTs, toneFor } from "@/components/lab/ui";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Alarms — 5G SA Core Lab Console" },
      { name: "description", content: "Filter, acknowledge and resolve network function events and alarms." },
      { property: "og:title", content: "Events & Alarms — 5G SA Core Lab Console" },
      { property: "og:description", content: "Alarm list with severity and network function filters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Events,
});

function Events() {
  const { events } = useLab();
  const [sev, setSev] = useState("all");
  const [nf, setNf] = useState("all");
  const [st, setSt] = useState("all");
  const nfs = useMemo(() => Array.from(new Set(events.map((e) => e.nf))).sort(), [events]);
  const rows = events.filter((e) => (sev === "all" || e.severity === sev) && (nf === "all" || e.nf === nf) && (st === "all" || e.status === st));

  return (
    <>
      <PageHeader title="Events & alarms" subtitle="Acknowledge and resolve actions update this browser only (saved locally); nothing is sent to a core network." />
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:max-w-2xl">
        <Select value={sev} onValueChange={setSev}>
          <SelectTrigger aria-label="Filter severity"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All severities</SelectItem>{SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={nf} onValueChange={setNf}>
          <SelectTrigger aria-label="Filter network function"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All functions</SelectItem>{nfs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={st} onValueChange={setSt}>
          <SelectTrigger aria-label="Filter status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{["open", "acknowledged", "resolved"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No events match these filters" />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b text-left">
              <tr className="[&>th]:label-caps [&>th]:px-3 [&>th]:py-2">
                <th>Severity</th><th>Timestamp</th><th>NF</th><th>Event type</th><th>Message</th><th>Status</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b last:border-0 [&>td]:px-3 [&>td]:py-2">
                  <td><Pill tone={toneFor(e.severity)}>{e.severity}</Pill></td>
                  <td className="whitespace-nowrap font-mono text-xs">{fmtTs(e.ts)}</td>
                  <td className="font-mono text-primary">{e.nf}</td>
                  <td className="font-mono text-xs">{e.type}</td>
                  <td className="text-muted-foreground">{e.message}</td>
                  <td><StatusPill value={e.status} /></td>
                  <td className="whitespace-nowrap text-right">
                    <div className="inline-flex gap-1.5">
                      <Button size="sm" variant="outline" disabled={e.status !== "open"} onClick={() => setEventStatus(e.id, "acknowledged")} aria-label={`Acknowledge ${e.type}`}>Ack</Button>
                      <Button size="sm" variant="secondary" disabled={e.status === "resolved"} onClick={() => setEventStatus(e.id, "resolved")} aria-label={`Resolve ${e.type}`}>Resolve</Button>
                      {e.status !== "open" && <Button size="sm" variant="ghost" onClick={() => setEventStatus(e.id, "open")} aria-label={`Reopen ${e.type}`}>Reopen</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
