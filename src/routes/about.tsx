import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock, PageHeader, Panel } from "@/components/lab/ui";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Architecture — 5G SA Core Lab Console" },
      { name: "description", content: "Purpose, Open5GS/UERANSIM context, architecture, simulated data, limitations and integration notes." },
      { property: "og:title", content: "About & Architecture — 5G SA Core Lab Console" },
      { property: "og:description", content: "Documentation for the 5G Standalone Core Network Lab monitoring console." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader title="5G Standalone Core Network Lab with Monitoring and Troubleshooting" subtitle="Portfolio project: a monitoring and troubleshooting console for a separate Open5GS + UERANSIM lab on Ubuntu." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Purpose">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Demonstrates practical 5G SA core concepts — UE registration, authentication, PDU session setup, control- vs user-plane separation — and a structured NOC troubleshooting approach. The web app does <strong className="text-foreground">not</strong> deploy, run or emulate a 5G core and is not a 3GPP simulator.
          </p>
        </Panel>
        <Panel title="Lab context">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Open5GS</strong>: open-source 5G Core (AMF, SMF, UPF, AUSF, UDM, UDR, NRF, PCF, …) installed as systemd services on Ubuntu, with a WebUI and MongoDB for subscribers.</li>
            <li><strong className="text-foreground">UERANSIM</strong>: open-source UE (nr-ue) and gNB (nr-gnb) simulator that connects to the core over N2 and N3.</li>
            <li>The architecture is the 5G Core SBA, distinct from the 4G EPC (MME/SGW/PGW/HSS).</li>
          </ul>
        </Panel>
        <Panel title="Architecture" className="xl:col-span-2">
          <CodeBlock>{`  Ubuntu lab host (separate)                      This web app
 ┌───────────────────────────────┐            ┌──────────────────────────────┐
 │ UERANSIM nr-ue ── nr-gnb      │            │ Browser console (React)      │
 │        N2 │      │ N3         │  JSON       │  - Demo dataset (seeded)     │
 │ Open5GS AMF/SMF/UPF/AUSF/     │  snapshot   │  - JSON import + validation  │
 │         UDM/NRF (systemd)     │ ─────────▶ │  - Local state (browser)     │
 │ (future) read-only collector  │  (manual    │  - Planned: POST endpoint    │
 └───────────────────────────────┘   today)    └──────────────────────────────┘`}</CodeBlock>
        </Panel>
        <Panel title="What is simulated">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>All seeded NF states, uptimes, heartbeats, sessions, events and test runs.</li>
            <li>Registration success rate and KPIs are computed from the loaded dataset only.</li>
            <li>“Run demo test” results are random, generated in the browser and labelled simulated.</li>
            <li>Ack/resolve actions change local browser state only.</li>
          </ul>
        </Panel>
        <Panel title="Limitations">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>No live telemetry, no polling, no connection to any core network.</li>
            <li>No authentication; do not import real subscriber data.</li>
            <li>Topology is a fixed logical diagram of a single-gNB lab.</li>
            <li>Troubleshooting commands are examples; verify paths and addresses against your own configs.</li>
          </ul>
        </Panel>
        <Panel title="Setup & integration notes" className="xl:col-span-2">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Install Open5GS on Ubuntu (packages), add a test subscriber via the WebUI with PLMN 999/70.</li>
            <li>Build UERANSIM, align MCC/MNC, TAC, S-NSSAI and AMF/UPF addresses in the gNB and UE YAML files.</li>
            <li>Start nr-gnb, then nr-ue; confirm uesimtun0 and ping through it.</li>
            <li>Export observations as JSON following the contract on the Data Source page and import them here.</li>
            <li>Future: a read-only collector POSTs snapshots to a server endpoint that validates the same schema and holds any token server-side.</li>
          </ol>
        </Panel>
      </div>
    </>
  );
}
