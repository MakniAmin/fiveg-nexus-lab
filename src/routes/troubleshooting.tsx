import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CodeBlock, PageHeader, Panel } from "@/components/lab/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/troubleshooting")({
  head: () => ({
    meta: [
      { title: "Troubleshooting — 5G SA Core Lab Console" },
      { name: "description", content: "Runbooks for failed UE registration, PDU session failure, UPF connectivity and NF health in an Open5GS lab." },
      { property: "og:title", content: "Troubleshooting — 5G SA Core Lab Console" },
      { property: "og:description", content: "Symptoms, checks, log clues, causes and verification for 5G SA lab issues." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Troubleshooting,
});

type Scenario = { id: string; title: string; symptoms: string[]; checks: string[]; commands: string; clues: string[]; causes: string[]; verify: string[] };

const SCENARIOS: Scenario[] = [
  {
    id: "reg",
    title: "Failed UE registration",
    symptoms: ["nr-ue log shows Registration Reject or keeps retrying", "No uesimtun0 interface is created", "AMF log shows authentication or registration errors"],
    checks: ["Confirm gNB completed NG Setup with the AMF (N2)", "Compare MCC/MNC and TAC in amf.yaml, gNB and UE configs", "Confirm the subscriber IMSI, K and OPc exist in the Open5GS WebUI and match the UE config", "Confirm the S-NSSAI (SST/SD) in the UE matches AMF and subscriber profile"],
    commands: `# Service status and recent AMF / AUSF logs
sudo systemctl status open5gs-amfd open5gs-ausfd open5gs-udmd
sudo journalctl -u open5gs-amfd -n 100 --no-pager
sudo tail -n 100 /var/log/open5gs/amf.log

# Is the AMF listening for NGAP (SCTP 38412)?
sudo ss -Slnp | grep 38412

# Re-run the UE in the foreground to watch NAS messages
./build/nr-ue -c config/open5gs-ue.yaml`,
    clues: ["UE: \"Initial Registration failed [PLMN_NOT_ALLOWED]\" → PLMN mismatch", "AUSF/UDM: MAC failure or \"Cannot find SUCI\" → subscriber missing or K/OPc mismatch", "gNB: \"NG Setup procedure is failed\" → PLMN/TAC not served by the AMF"],
    causes: ["Subscriber not provisioned or wrong K/OPc/AMF value", "PLMN or TAC mismatch between gNB, UE and AMF", "Slice (S-NSSAI) not allowed", "AMF bound to an address the gNB cannot reach"],
    verify: ["nr-ue shows \"Initial Registration is successful\"", "AMF log shows the UE registered (gNB/UE context counts increase)", "Run a registration test and confirm a pass"],
  },
  {
    id: "pdu",
    title: "PDU session failure",
    symptoms: ["UE registers but no uesimtun0 interface or no IP", "PDU Session Establishment Reject in UE log"],
    checks: ["Confirm the DNN/APN in the UE config (e.g. internet) exists in smf.yaml and the subscriber profile", "Confirm SMF has a PFCP association with the UPF (N4)", "Check the UE IP pool (default 10.45.0.0/16) in smf.yaml / upf.yaml"],
    commands: `sudo systemctl status open5gs-smfd open5gs-upfd
sudo tail -n 100 /var/log/open5gs/smf.log
sudo tail -n 100 /var/log/open5gs/upf.log

# PFCP listening on UDP 8805?
sudo ss -ulnp | grep 8805`,
    clues: ["5GSM cause #27 \"Missing or unknown DNN\" → DNN mismatch", "SMF: \"No associated UPF\" / PFCP heartbeat timeout → N4 problem", "SMF: UE IP pool exhausted"],
    causes: ["DNN not configured in SMF or subscriber", "UPF down or PFCP addresses misconfigured", "S-NSSAI in session request not subscribed"],
    verify: ["ip addr show uesimtun0 shows an address from the UE pool", "SMF log shows the session created with that UE IP", "Run a PDU session test and confirm a pass"],
  },
  {
    id: "upf",
    title: "Unreachable UPF / no user-plane traffic",
    symptoms: ["uesimtun0 has an IP but ping through it fails", "PDU session is ACTIVE but no data flows"],
    checks: ["Confirm GTP-U (UDP 2152) on the UPF is reachable from the gNB host (N3)", "Confirm the ogstun interface exists and has the gateway address", "Confirm IP forwarding and NAT for the UE pool on the Ubuntu host (N6)"],
    commands: `ip addr show uesimtun0
ip addr show ogstun
sudo ss -ulnp | grep 2152

# Forwarding and NAT for the UE pool
sysctl net.ipv4.ip_forward
sudo iptables -t nat -S | grep 10.45.0.0

# Test the user plane through the UE tunnel
ping -I uesimtun0 -c 4 10.45.0.1
ping -I uesimtun0 -c 4 8.8.8.8`,
    clues: ["Ping to 10.45.0.1 works but internet fails → N6/NAT or forwarding", "No GTP-U in a capture on port 2152 → N3 address mismatch (gNB gtpIp vs UPF gtpu address)", "UPF log shows no session for the UE → N4 rule not installed"],
    causes: ["net.ipv4.ip_forward=0 or NAT rule missing", "Wrong gtpu address in upf.yaml or gtpIp in gNB config", "Host firewall (ufw) dropping UDP 2152 or forwarded traffic"],
    verify: ["Both pings succeed through uesimtun0", "Run a user-plane test and confirm a pass"],
  },
  {
    id: "nf",
    title: "Network function health check",
    symptoms: ["A dashboard NF card shows degraded or down", "Procedures fail with SBI or discovery errors"],
    checks: ["Check every Open5GS systemd unit is active", "Check NFs are registered with the NRF", "Check MongoDB is running (used by UDR/WebUI)"],
    commands: `systemctl list-units 'open5gs-*' --no-pager
sudo systemctl status mongod --no-pager

# Ask the NRF which NF instances are registered (default lab address)
curl -s --http2-prior-knowledge http://127.0.0.10:7777/nnrf-nfm/v1/nf-instances

# Restart a single NF (lab only)
sudo systemctl restart open5gs-upfd`,
    clues: ["\"NF not found\" / discovery failures → NF not registered with NRF", "Unit in failed state → read its journal for config parse errors", "Frequent restarts → check address conflicts in the YAML configs"],
    causes: ["YAML syntax or address error after a config edit", "NRF started after other NFs and registration did not retry", "MongoDB not running"],
    verify: ["All open5gs-* units active", "NRF lists AMF, SMF, UPF-related SMF peers, AUSF, UDM and others", "Re-run registration and PDU tests"],
  },
];

function Troubleshooting() {
  const [id, setId] = useState(SCENARIOS[0].id);
  const s = SCENARIOS.find((x) => x.id === id)!;
  return (
    <>
      <PageHeader title="Troubleshooting workspace" subtitle="Lab runbooks for Open5GS + UERANSIM on Ubuntu. Commands are examples to run yourself on your own lab host; this app does not execute them." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div role="tablist" aria-label="Scenarios" className="flex gap-2 overflow-x-auto lg:flex-col">
          {SCENARIOS.map((x) => (
            <button key={x.id} role="tab" aria-selected={x.id === id} onClick={() => setId(x.id)}
              className={cn("whitespace-nowrap rounded border px-3 py-2 text-left text-sm lg:whitespace-normal", x.id === id ? "border-primary bg-accent text-primary" : "bg-panel hover:bg-accent/60")}>
              {x.title}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <List title="Symptoms" items={s.symptoms} />
          <List title="Checks" items={s.checks} ordered />
          <Panel title="Example commands" className="xl:col-span-2"><CodeBlock>{s.commands}</CodeBlock></Panel>
          <List title="Log clues" items={s.clues} />
          <List title="Likely causes" items={s.causes} />
          <List title="Verification" items={s.verify} className="xl:col-span-2" />
        </div>
      </div>
    </>
  );
}

function List({ title, items, ordered, className }: { title: string; items: string[]; ordered?: boolean; className?: string }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Panel title={title} className={className}>
      <Tag className={cn("space-y-1.5 pl-5 text-sm", ordered ? "list-decimal" : "list-disc")}>
        {items.map((i) => <li key={i}>{i}</li>)}
      </Tag>
    </Panel>
  );
}
