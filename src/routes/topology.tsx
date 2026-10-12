import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLab } from "@/lib/lab/store";
import { PageHeader, Panel, StatusPill } from "@/components/lab/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/topology")({
  head: () => ({
    meta: [
      { title: "5G Core Topology — 5G SA Core Lab Console" },
      { name: "description", content: "UE, UERANSIM gNB and Open5GS AMF, SMF, UPF, AUSF, UDM, NRF with control- and user-plane interfaces." },
      { property: "og:title", content: "5G Core Topology — 5G SA Core Lab Console" },
      { property: "og:description", content: "Control-plane vs user-plane view of a 5G SA lab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Topology,
});

type NodeId = "UE" | "gNB" | "AMF" | "SMF" | "UPF" | "AUSF" | "UDM" | "NRF" | "DN";
const NODES: Record<NodeId, { x: number; y: number; title: string; desc: string }> = {
  UE: { x: 70, y: 330, title: "UE (UERANSIM nr-ue)", desc: "Simulated user equipment. Performs NAS registration (N1, carried via the gNB) and requests PDU sessions. Creates a uesimtun interface once a session is up." },
  gNB: { x: 230, y: 330, title: "gNB (UERANSIM nr-gnb)", desc: "Simulated 5G base station. Connects to the AMF over N2 (NGAP over SCTP, port 38412) and tunnels user traffic to the UPF over N3 (GTP-U, UDP 2152)." },
  AMF: { x: 400, y: 200, title: "AMF — Access & Mobility Management", desc: "Terminates N1/N2. Handles registration, connection and mobility management, and selects AUSF for authentication and SMF for sessions." },
  SMF: { x: 620, y: 200, title: "SMF — Session Management", desc: "Manages PDU sessions, allocates UE IP addresses, and programs the UPF over N4 (PFCP, UDP 8805)." },
  UPF: { x: 620, y: 330, title: "UPF — User Plane Function", desc: "Forwards user traffic between N3 (from gNB) and N6 (data network). In Open5GS it uses the ogstun TUN interface." },
  AUSF: { x: 400, y: 60, title: "AUSF — Authentication Server", desc: "Runs 5G-AKA / EAP-AKA' with the UDM for UE authentication." },
  UDM: { x: 560, y: 60, title: "UDM — Unified Data Management", desc: "Generates authentication vectors and provides subscription data (backed by UDR / MongoDB in Open5GS)." },
  NRF: { x: 720, y: 60, title: "NRF — NF Repository Function", desc: "Service registry for the Service-Based Architecture. NFs register here and discover each other over SBI (HTTP/2)." },
  DN: { x: 800, y: 330, title: "Data Network (N6)", desc: "External network such as the internet, reached from the UPF via N6 (NAT on the Ubuntu host in a typical lab)." },
};

type Link = { a: NodeId; b: NodeId; label: string; plane: "cp" | "up" | "sbi" | "radio" };
const LINKS: Link[] = [
  { a: "UE", b: "gNB", label: "Uu (simulated radio)", plane: "radio" },
  { a: "gNB", b: "AMF", label: "N2 · NGAP/SCTP", plane: "cp" },
  { a: "SMF", b: "UPF", label: "N4 · PFCP", plane: "cp" },
  { a: "gNB", b: "UPF", label: "N3 · GTP-U", plane: "up" },
  { a: "UPF", b: "DN", label: "N6", plane: "up" },
  { a: "AMF", b: "AUSF", label: "SBI", plane: "sbi" },
  { a: "AMF", b: "SMF", label: "SBI (N11)", plane: "sbi" },
  { a: "AUSF", b: "UDM", label: "SBI", plane: "sbi" },
  { a: "UDM", b: "NRF", label: "SBI", plane: "sbi" },
  { a: "SMF", b: "NRF", label: "SBI", plane: "sbi" },
];

const strokeFor = { cp: "var(--color-primary)", sbi: "var(--color-info)", up: "var(--color-userplane)", radio: "var(--color-muted-foreground)" };
const dashFor = { cp: "6 4", sbi: "2 4", up: "", radio: "3 3" };

function Topology() {
  const { nfs } = useLab();
  const [sel, setSel] = useState<NodeId>("AMF");
  const stateOf = (id: NodeId) => nfs.find((n) => n.nf === id)?.state;

  return (
    <>
      <PageHeader title="5G Core topology" subtitle="Logical view of the external Open5GS + UERANSIM lab. This diagram is static documentation with status overlays from the current dataset; it does not simulate 3GPP signalling." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Logical topology">
          <div className="overflow-x-auto">
            <svg viewBox="0 0 880 400" className="min-w-[640px] w-full" role="img" aria-label="5G SA topology diagram">
              {LINKS.map((l, i) => {
                const A = NODES[l.a], B = NODES[l.b];
                const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
                return (
                  <g key={i}>
                    <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={strokeFor[l.plane]} strokeWidth={l.plane === "up" ? 3 : 1.6} strokeDasharray={dashFor[l.plane]} />
                    <text x={mx} y={my - 6} textAnchor="middle" fontSize="11" fill="var(--color-muted-foreground)" fontFamily="var(--font-mono)">{l.label}</text>
                  </g>
                );
              })}
              {(Object.keys(NODES) as NodeId[]).map((id) => {
                const n = NODES[id];
                const st = stateOf(id);
                const ring = st === "up" ? "var(--color-success)" : st === "degraded" ? "var(--color-warning)" : st === "down" ? "var(--color-critical)" : "var(--color-border)";
                return (
                  <g key={id} role="button" tabIndex={0} aria-label={`Select ${id}`} className="cursor-pointer outline-none" onClick={() => setSel(id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(id)}>
                    <rect x={n.x - 42} y={n.y - 20} width={84} height={40} rx={6} fill={sel === id ? "var(--color-accent)" : "var(--color-sidebar)"} stroke={sel === id ? "var(--color-primary)" : ring} strokeWidth={sel === id ? 2.5 : 1.8} />
                    <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--color-foreground)" fontFamily="var(--font-mono)">{id}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Legend color="bg-primary" label="Control plane (N2, N4)" dashed />
            <Legend color="bg-info" label="Service-Based Interface (HTTP/2)" dashed />
            <Legend color="bg-userplane" label="User plane (N3, N6)" />
            <span>N1 (NAS) runs UE↔AMF, transported over the radio and N2.</span>
          </div>
        </Panel>
        <Panel title="Selected element">
          <p className="font-mono text-lg font-semibold text-primary">{sel}</p>
          <p className="mt-1 text-sm font-medium">{NODES[sel].title}</p>
          {stateOf(sel) && <div className="mt-2"><StatusPill value={stateOf(sel)!} /></div>}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{NODES[sel].desc}</p>
          <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
            This is a 5G Core (5GC) with a Service-Based Architecture — not the 4G EPC (MME/SGW/PGW).
          </p>
        </Panel>
      </div>
    </>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("h-0.5 w-6", color, dashed && "opacity-70")} />
      {label}
    </span>
  );
}
