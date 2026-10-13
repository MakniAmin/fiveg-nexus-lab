import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock, PageHeader, Panel, Pill } from "@/components/lab/ui";

export const Route = createFileRoute("/signaling")({
  head: () => ({
    meta: [
      { title: "Signaling & Packet Analysis — 5G SA Core Lab" },
      {
        name: "description",
        content: "Evidence-based NGAP, PFCP and GTP-U analysis from an Open5GS and UERANSIM lab.",
      },
    ],
  }),
  component: SignalingPage,
});

const ngapMessages = [
  ["SCTP association", "gNB → AMF", "172.22.0.23:45571 → 172.22.0.10:38412"],
  ["NG Setup Request", "gNB → AMF", "PLMN 001/01 · gNB ID 1 · TAC 1 · SST 1"],
  ["NG Setup Response", "AMF → gNB", "AMF name: open5gs-amf0 · setup successful"],
  ["Initial UE Message", "gNB → AMF", "Registration request observed"],
  ["Authentication exchange", "AMF ↔ UE via gNB", "Authentication and security messages observed"],
  ["PDU Session Resource Setup", "AMF ↔ gNB", "Request and response observed"],
];

const pfcpMessages = [
  ["Session Deletion Request", "SMF → UPF", "Observed in capture"],
  ["Session Deletion Response", "UPF → SMF", "Observed in capture"],
  ["Heartbeat Request / Response", "SMF ↔ UPF", "Association liveness messages observed"],
  ["Session Establishment Request", "SMF → UPF", "Network Instance: internet"],
  ["Session Establishment Response", "UPF → SMF", "Response observed"],
  ["Session Modification Request / Response", "SMF ↔ UPF", "Both messages observed"],
];

function SignalingPage() {
  return (
    <>
      <PageHeader
        title="Signaling & Packet Analysis"
        subtitle="Protocol evidence from packet captures collected in the local Open5GS + UERANSIM lab. This page is a static analysis record, not live telemetry."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Pill tone="success">GTP-U capture verified</Pill>
        <Pill tone="muted">PLMN 001/01</Pill>
        <Pill tone="muted">SST 1</Pill>
        <Pill tone="warning">Static evidence · Not live</Pill>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel title="NGAP · N2 control plane">
          <p className="font-mono text-sm font-semibold">SCTP / 38412</p>
          <p className="mt-2 text-sm text-muted-foreground">
            NG Setup Request and Response were decoded successfully. The capture also contains UE
            registration and PDU-session resource setup signaling.
          </p>
          <div className="mt-3">
            <Pill tone="success">Setup successful</Pill>
          </div>
        </Panel>

        <Panel title="PFCP · N4 session control">
          <p className="font-mono text-sm font-semibold">UDP / 8805</p>
          <p className="mt-2 text-sm text-muted-foreground">
            SMF–UPF heartbeat, session establishment, and session modification request/response
            messages were observed.
          </p>
          <div className="mt-3">
            <Pill tone="success">Session exchange observed</Pill>
          </div>
        </Panel>

        <Panel title="GTP-U · N3 user plane">
          <p className="font-mono text-sm font-semibold">UDP / 2152</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Captured uplink and downlink GTP-U packets encapsulating ICMP traffic for the UE tunnel.
          </p>
          <div className="mt-3">
            <Pill tone="success">Uplink and downlink observed</Pill>
          </div>
        </Panel>
      </div>

      <Panel title="NGAP message evidence" className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Source: the SCTP/NGAP captures collected during gNB setup and UE registration. The entries
          below summarize decoded messages; they are not a live event stream.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b text-left">
              <tr className="[&>th]:label-caps [&>th]:px-3 [&>th]:py-2">
                <th>Message / exchange</th>
                <th>Direction</th>
                <th>Observed details</th>
              </tr>
            </thead>
            <tbody>
              {ngapMessages.map(([name, direction, details]) => (
                <tr key={name} className="border-b last:border-0 [&>td]:px-3 [&>td]:py-2">
                  <td className="font-medium">{name}</td>
                  <td className="font-mono text-xs">{direction}</td>
                  <td className="text-muted-foreground">{details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="PFCP session evidence" className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">
          SMF endpoint: 172.22.0.7 · UPF endpoint: 172.22.0.8. The capture includes a deletion
          exchange followed by establishment and modification messages; this list preserves the
          observed sequence without assuming every message belongs to one uninterrupted session.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b text-left">
              <tr className="[&>th]:label-caps [&>th]:px-3 [&>th]:py-2">
                <th>Message</th>
                <th>Direction</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {pfcpMessages.map(([name, direction, details]) => (
                <tr key={name} className="border-b last:border-0 [&>td]:px-3 [&>td]:py-2">
                  <td className="font-medium">{name}</td>
                  <td className="font-mono text-xs">{direction}</td>
                  <td className="text-muted-foreground">{details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <p className="mb-2 label-caps">Decoded session-establishment details</p>
          <CodeBlock>
            {`SMF Node ID:       172.22.0.7
Network Instance:  internet
PDR 1 source:      Core
PDR 2 source:      Access
PDR 2 F-TEID:      CHOOSE (CHOOSE_ID 05)
FAR / URR / QER:   referenced by PDR 1`}
          </CodeBlock>
          <p className="mt-2 text-xs text-muted-foreground">
            This is a summary of fields observed in the Session Establishment Request. Inspect the
            original capture to verify individual FAR actions and forwarding parameters.
          </p>
        </div>
      </Panel>

      <Panel title="GTP-U tunnel evidence" className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Source: captures/gtpu.pcapng. The decoded capture contained GTP-U packets carrying inner
          ICMP requests and replies.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead className="border-b text-left">
              <tr className="[&>th]:label-caps [&>th]:px-3 [&>th]:py-2">
                <th>Direction</th>
                <th>Outer tunnel endpoints</th>
                <th>Inner IP traffic</th>
                <th>TEID</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b [&>td]:px-3 [&>td]:py-3">
                <td>
                  <Pill tone="info">Uplink</Pill>
                </td>
                <td className="font-mono text-xs">gNB .23 → UPF .8</td>
                <td className="font-mono text-xs">192.168.100.3 → 8.8.8.8</td>
                <td className="font-mono text-xs">0x0000b7f6</td>
              </tr>
              <tr className="[&>td]:px-3 [&>td]:py-3">
                <td>
                  <Pill tone="info">Downlink</Pill>
                </td>
                <td className="font-mono text-xs">UPF .8 → gNB .23</td>
                <td className="font-mono text-xs">8.8.8.8 → 192.168.100.3</td>
                <td className="font-mono text-xs">0x00000002</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <p className="mb-2 label-caps">Capture filter used for decoding</p>
          <CodeBlock>{`gtp && icmp`}</CodeBlock>
          <p className="mt-2 text-sm text-muted-foreground">
            Eight ICMP request/reply exchanges were recorded in the inspected capture, consistent
            with the successful tunnel ping test. The TEIDs above are capture observations, not
            universal or permanent identifiers.
          </p>
        </div>
      </Panel>

      <Panel title="Evidence files and limitations" className="mt-4">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <span className="font-mono text-foreground">captures/gtpu.pcapng</span> — local GTP-U
            capture used to verify the packet counts and uplink/downlink tunnel details. Raw capture
            files are excluded from Git to reduce the risk of publishing traffic metadata.
          </li>
          <li>
            NGAP and PFCP findings are historical observations recorded during earlier packet
            analysis. Their original temporary capture files are not currently available at the
            previously recorded paths, so those findings cannot presently be reproduced from this
            repository alone.
          </li>
          <li>
            This page presents static, manually recorded evidence. It does not parse PCAP files,
            poll Open5GS, or refresh automatically.
          </li>
          <li>Subscriber authentication keys and OPc values are intentionally excluded.</li>
        </ul>
      </Panel>
    </>
  );
}
