import { z } from "zod";

export const NF_NAMES = ["AMF", "SMF", "UPF", "AUSF", "UDM", "NRF"] as const;
export type NfName = (typeof NF_NAMES)[number];

export const nfStatusSchema = z.object({
  nf: z.enum(NF_NAMES),
  state: z.enum(["up", "degraded", "down"]),
  version: z.string(),
  uptimeSec: z.number().nonnegative(),
  lastHeartbeat: z.string(),
  detail: z.string(),
});

export const sessionSchema = z.object({
  id: z.string(),
  supi: z.string(),
  gnb: z.string(),
  regState: z.enum(["REGISTERED", "REGISTERING", "DEREGISTERED", "REG_FAILED"]),
  pduState: z.enum(["ACTIVE", "INACTIVE", "FAILED", "NONE"]),
  dnn: z.string(),
  sst: z.number().int(),
  ueIp: z.string().nullable(),
  lastEvent: z.string(),
  timestamp: z.string(),
});

export const SEVERITIES = ["critical", "major", "minor", "info"] as const;
export const eventSchema = z.object({
  id: z.string(),
  ts: z.string(),
  severity: z.enum(SEVERITIES),
  nf: z.enum([...NF_NAMES, "gNB", "UE"] as const),
  type: z.string(),
  message: z.string(),
  status: z.enum(["open", "acknowledged", "resolved"]),
});

export const testRunSchema = z.object({
  id: z.string(),
  ts: z.string(),
  kind: z.enum(["registration", "pdu_session", "user_plane", "nf_health"]),
  target: z.string(),
  outcome: z.enum(["pass", "fail"]),
  durationMs: z.number().nonnegative(),
  notes: z.string(),
  simulated: z.boolean(),
});

export const labDataSchema = z.object({
  nfs: z.array(nfStatusSchema),
  sessions: z.array(sessionSchema),
  events: z.array(eventSchema),
  testRuns: z.array(testRunSchema),
});

export type NfStatus = z.infer<typeof nfStatusSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type LabEvent = z.infer<typeof eventSchema>;
export type Severity = LabEvent["severity"];
export type TestRun = z.infer<typeof testRunSchema>;
export type LabData = z.infer<typeof labDataSchema>;
export type DataMode = "demo" | "imported";
export type LabState = LabData & { mode: DataMode; importedAt?: string };
