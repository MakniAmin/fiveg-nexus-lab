import type { LabData } from "./types";

// Fictional demo data. PLMN 999/70 is the test PLMN used in Open5GS/UERANSIM sample configs.
// IMSIs are masked; IPs come from the default Open5GS UE pool 10.45.0.0/16.
const T = (m: number) => new Date(Date.UTC(2026, 9, 12, 20, m, 0)).toISOString();

export function makeSeed(): LabData {
  return {
    nfs: [
      { nf: "NRF", state: "up", version: "Open5GS 2.7.x", uptimeSec: 186400, lastHeartbeat: T(58), detail: "7 NF profiles registered" },
      { nf: "AMF", state: "up", version: "Open5GS 2.7.x", uptimeSec: 186380, lastHeartbeat: T(58), detail: "NGAP: 1 gNB connected" },
      { nf: "SMF", state: "up", version: "Open5GS 2.7.x", uptimeSec: 186375, lastHeartbeat: T(58), detail: "PFCP association with UPF established" },
      { nf: "UPF", state: "degraded", version: "Open5GS 2.7.x", uptimeSec: 7210, lastHeartbeat: T(57), detail: "Restarted 2h ago; N3 packet loss observed" },
      { nf: "AUSF", state: "up", version: "Open5GS 2.7.x", uptimeSec: 186370, lastHeartbeat: T(58), detail: "5G-AKA handled normally" },
      { nf: "UDM", state: "up", version: "Open5GS 2.7.x", uptimeSec: 186370, lastHeartbeat: T(58), detail: "Subscriber data via UDR" },
    ],
    sessions: [
      { id: "ue-01", supi: "imsi-99970000000***1", gnb: "UERANSIM-gnb-999-70-1", regState: "REGISTERED", pduState: "ACTIVE", dnn: "internet", sst: 1, ueIp: "10.45.0.2", lastEvent: "PDU Session Establishment Accept", timestamp: T(52) },
      { id: "ue-02", supi: "imsi-99970000000***2", gnb: "UERANSIM-gnb-999-70-1", regState: "REGISTERED", pduState: "ACTIVE", dnn: "internet", sst: 1, ueIp: "10.45.0.3", lastEvent: "PDU Session Establishment Accept", timestamp: T(50) },
      { id: "ue-03", supi: "imsi-99970000000***3", gnb: "UERANSIM-gnb-999-70-1", regState: "REGISTERED", pduState: "INACTIVE", dnn: "internet", sst: 1, ueIp: null, lastEvent: "Registration Accept", timestamp: T(47) },
      { id: "ue-04", supi: "imsi-99970000000***4", gnb: "UERANSIM-gnb-999-70-1", regState: "REG_FAILED", pduState: "NONE", dnn: "internet", sst: 1, ueIp: null, lastEvent: "Registration Reject (5GMM cause #3: Illegal UE)", timestamp: T(44) },
      { id: "ue-05", supi: "imsi-99970000000***5", gnb: "UERANSIM-gnb-999-70-1", regState: "REGISTERED", pduState: "FAILED", dnn: "ims", sst: 1, ueIp: null, lastEvent: "PDU Session Establishment Reject (5GSM cause #27: Missing or unknown DNN)", timestamp: T(41) },
      { id: "ue-06", supi: "imsi-99970000000***6", gnb: "UERANSIM-gnb-999-70-1", regState: "DEREGISTERED", pduState: "NONE", dnn: "internet", sst: 1, ueIp: null, lastEvent: "Deregistration Accept (UE originating)", timestamp: T(35) },
      { id: "ue-07", supi: "imsi-99970000000***7", gnb: "UERANSIM-gnb-999-70-1", regState: "REGISTERED", pduState: "ACTIVE", dnn: "internet", sst: 1, ueIp: "10.45.0.4", lastEvent: "PDU Session Establishment Accept", timestamp: T(30) },
      { id: "ue-08", supi: "imsi-99970000000***8", gnb: "UERANSIM-gnb-999-70-1", regState: "REGISTERING", pduState: "NONE", dnn: "internet", sst: 1, ueIp: null, lastEvent: "Authentication Request sent", timestamp: T(57) },
    ],
    events: [
      { id: "ev-12", ts: T(57), severity: "major", nf: "UPF", type: "N3_PACKET_LOSS", message: "GTP-U echo responses missing from gNB for 30s (simulated)", status: "open" },
      { id: "ev-11", ts: T(44), severity: "minor", nf: "AMF", type: "REGISTRATION_REJECT", message: "Registration Reject for imsi-***4: authentication failed (MAC failure)", status: "open" },
      { id: "ev-10", ts: T(41), severity: "minor", nf: "SMF", type: "PDU_SESSION_REJECT", message: "DNN 'ims' not configured for imsi-***5", status: "acknowledged" },
      { id: "ev-09", ts: T(38), severity: "critical", nf: "UPF", type: "NF_RESTART", message: "open5gs-upfd restarted; PFCP association re-established", status: "resolved" },
      { id: "ev-08", ts: T(37), severity: "major", nf: "SMF", type: "PFCP_ASSOC_LOST", message: "PFCP heartbeat timeout towards UPF 127.0.0.7:8805", status: "resolved" },
      { id: "ev-07", ts: T(30), severity: "info", nf: "SMF", type: "PDU_SESSION_ESTABLISHED", message: "UE IP 10.45.0.4 allocated, DNN internet, S-NSSAI SST 1", status: "resolved" },
      { id: "ev-06", ts: T(22), severity: "info", nf: "NRF", type: "NF_REGISTERED", message: "UDM instance registered with NRF", status: "resolved" },
      { id: "ev-05", ts: T(18), severity: "info", nf: "gNB", type: "NG_SETUP", message: "NG Setup Response received from AMF (N2/NGAP)", status: "resolved" },
      { id: "ev-04", ts: T(10), severity: "minor", nf: "AUSF", type: "AUTH_SLOW", message: "5G-AKA round trip 420ms exceeds 300ms lab threshold", status: "open" },
    ],
    testRuns: [
      { id: "tr-06", ts: T(55), kind: "user_plane", target: "ue-01 via uesimtun0 → 10.45.0.1", outcome: "fail", durationMs: 5020, notes: "3/5 ICMP replies lost (seeded sample)", simulated: true },
      { id: "tr-05", ts: T(49), kind: "pdu_session", target: "ue-05 DNN ims", outcome: "fail", durationMs: 1310, notes: "5GSM cause #27 (seeded sample)", simulated: true },
      { id: "tr-04", ts: T(45), kind: "registration", target: "ue-04", outcome: "fail", durationMs: 980, notes: "MAC failure: K/OPc mismatch suspected (seeded sample)", simulated: true },
      { id: "tr-03", ts: T(31), kind: "pdu_session", target: "ue-07 DNN internet", outcome: "pass", durationMs: 640, notes: "UE IP 10.45.0.4 (seeded sample)", simulated: true },
      { id: "tr-02", ts: T(20), kind: "registration", target: "ue-01", outcome: "pass", durationMs: 720, notes: "Initial registration OK (seeded sample)", simulated: true },
      { id: "tr-01", ts: T(15), kind: "nf_health", target: "NRF NF list", outcome: "pass", durationMs: 120, notes: "6 core NFs reported (seeded sample)", simulated: true },
    ],
  };
}
