import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useLab } from "@/lib/lab/store";
import type { Session } from "@/lib/lab/types";
import { EmptyState, PageHeader, StatusPill, fmtTs } from "@/components/lab/ui";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/sessions")({
  head: () => ({
    meta: [
      { title: "UE Sessions — 5G SA Core Lab Console" },
      { name: "description", content: "UE registration and PDU session state with UE IP, DNN and last event (fictional subscribers)." },
      { property: "og:title", content: "UE Sessions — 5G SA Core Lab Console" },
      { property: "og:description", content: "Searchable UE registration and PDU session table." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Sessions,
});

function Sessions() {
  const { sessions } = useLab();
  const [q, setQ] = useState("");
  const [reg, setReg] = useState("all");
  const [pdu, setPdu] = useState("all");
  const [open, setOpen] = useState<Session | null>(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return sessions.filter(
      (r) =>
        (reg === "all" || r.regState === reg) &&
        (pdu === "all" || r.pduState === pdu) &&
        (!s || [r.id, r.supi, r.ueIp ?? "", r.lastEvent, r.dnn].some((v) => v.toLowerCase().includes(s))),
    );
  }, [sessions, q, reg, pdu]);

  return (
    <>
      <PageHeader title="Sessions" subtitle="Subscriber identifiers are masked and fictional (test PLMN 999/70). Select a row for details." />
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
        <Input aria-label="Search sessions" placeholder="Search UE id, SUPI, IP, event…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={reg} onValueChange={setReg}>
          <SelectTrigger aria-label="Filter registration state"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All registration</SelectItem>
            {["REGISTERED", "REGISTERING", "DEREGISTERED", "REG_FAILED"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={pdu} onValueChange={setPdu}>
          <SelectTrigger aria-label="Filter PDU session state"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PDU states</SelectItem>
            {["ACTIVE", "INACTIVE", "FAILED", "NONE"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No sessions match these filters" hint="Clear the search or change the state filters." />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b text-left">
              <tr className="[&>th]:label-caps [&>th]:px-3 [&>th]:py-2">
                <th>UE</th><th>SUPI (masked)</th><th>Registration</th><th>PDU session</th><th>UE IP</th><th>Last event</th><th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} tabIndex={0} onClick={() => setOpen(r)} onKeyDown={(e) => e.key === "Enter" && setOpen(r)} className="cursor-pointer border-b last:border-0 hover:bg-accent/50 focus:bg-accent/50 focus:outline-none [&>td]:px-3 [&>td]:py-2">
                  <td className="font-mono">{r.id}</td>
                  <td className="font-mono text-xs">{r.supi}</td>
                  <td><StatusPill value={r.regState} /></td>
                  <td><StatusPill value={r.pduState} /></td>
                  <td className="font-mono text-xs">{r.ueIp ?? "—"}</td>
                  <td className="max-w-[280px] truncate text-muted-foreground">{r.lastEvent}</td>
                  <td className="whitespace-nowrap font-mono text-xs">{fmtTs(r.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{rows.length} of {sessions.length} sessions</p>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{open.id}</SheetTitle>
                <SheetDescription>Session detail from the current dataset.</SheetDescription>
              </SheetHeader>
              <dl className="mt-4 grid grid-cols-[120px_minmax(0,1fr)] gap-y-2.5 px-4 text-sm">
                {[
                  ["SUPI", open.supi], ["gNB", open.gnb], ["DNN", open.dnn], ["S-NSSAI", `SST ${open.sst}`],
                  ["UE IP", open.ueIp ?? "not assigned"], ["Timestamp", fmtTs(open.timestamp)],
                ].map(([k, v]) => (
                  <div key={k} className="contents"><dt className="label-caps pt-0.5">{k}</dt><dd className="break-all font-mono text-xs">{v}</dd></div>
                ))}
                <dt className="label-caps pt-0.5">Registration</dt><dd><StatusPill value={open.regState} /></dd>
                <dt className="label-caps pt-0.5">PDU session</dt><dd><StatusPill value={open.pduState} /></dd>
              </dl>
              <div className="mx-4 mt-4 rounded border bg-sidebar p-3">
                <p className="label-caps">Last event</p>
                <p className="mt-1 text-sm">{open.lastEvent}</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
