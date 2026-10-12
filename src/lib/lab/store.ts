import { useSyncExternalStore } from "react";
import { makeSeed } from "./seed";
import { labDataSchema, type LabEvent, type LabState, type TestRun } from "./types";

const KEY = "5g-lab-console-state-v1";
let serverState: LabState | null = null;
let state: LabState | null = null;
const listeners = new Set<() => void>();

function getState(): LabState {
  if (!state) state = { ...makeSeed(), mode: "demo" };
  return state;
}
function getServer(): LabState {
  if (!serverState) serverState = { ...makeSeed(), mode: "demo" };
  return serverState;
}
function set(next: LabState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

export function useLab(): LabState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getState,
    getServer,
  );
}

/** Call once from an effect after hydration. */
export function hydrateLab() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const data = labDataSchema.safeParse(parsed);
    if (!data.success) return;
    state = { ...data.data, mode: parsed.mode === "imported" ? "imported" : "demo", importedAt: parsed.importedAt };
    listeners.forEach((l) => l());
  } catch {
    /* ignore corrupt storage */
  }
}

export function setEventStatus(id: string, status: LabEvent["status"]) {
  const s = getState();
  set({ ...s, events: s.events.map((e) => (e.id === id ? { ...e, status } : e)) });
}

const KIND_TARGET: Record<TestRun["kind"], string> = {
  registration: "Simulated UE registration",
  pdu_session: "Simulated PDU session (DNN internet)",
  user_plane: "Simulated ping via uesimtun0",
  nf_health: "Simulated NF health check",
};

export function runDemoTest(kind: TestRun["kind"]): TestRun {
  const s = getState();
  const pass = Math.random() > 0.25;
  const run: TestRun = {
    id: `sim-${Date.now()}`,
    ts: new Date().toISOString(),
    kind,
    target: KIND_TARGET[kind],
    outcome: pass ? "pass" : "fail",
    durationMs: Math.round(300 + Math.random() * 1200),
    notes: pass
      ? "SIMULATED in browser — no core network was contacted."
      : "SIMULATED failure in browser — no core network was contacted. Use Troubleshooting to practise diagnosis.",
    simulated: true,
  };
  set({ ...s, testRuns: [run, ...s.testRuns] });
  return run;
}

export type ImportResult = { ok: true; counts: Record<string, number> } | { ok: false; errors: string[] };

export function importLabJson(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { ok: false, errors: [`Invalid JSON: ${(e as Error).message}`] };
  }
  const r = labDataSchema.safeParse(parsed);
  if (!r.success) {
    return {
      ok: false,
      errors: r.error.issues.slice(0, 12).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    };
  }
  set({ ...r.data, mode: "imported", importedAt: new Date().toISOString() });
  return {
    ok: true,
    counts: { nfs: r.data.nfs.length, sessions: r.data.sessions.length, events: r.data.events.length, testRuns: r.data.testRuns.length },
  };
}

export function resetToDemo() {
  set({ ...makeSeed(), mode: "demo" });
}

export function exportLab(): string {
  const { nfs, sessions, events, testRuns } = getState();
  return JSON.stringify({ nfs, sessions, events, testRuns }, null, 2);
}
