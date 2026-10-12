import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLab } from "@/lib/lab/store";

type Tone = "success" | "warning" | "critical" | "info" | "muted" | "primary";
const toneCls: Record<Tone, string> = {
  success: "text-success border-success/40 bg-success/10",
  warning: "text-warning border-warning/40 bg-warning/10",
  critical: "text-critical border-critical/40 bg-critical/10",
  info: "text-info border-info/40 bg-info/10",
  primary: "text-primary border-primary/40 bg-primary/10",
  muted: "text-muted-foreground border-border bg-muted",
};

export function Pill({ tone = "muted", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase", toneCls[tone], className)}>
      {children}
    </span>
  );
}

export function toneFor(v: string): Tone {
  switch (v) {
    case "up": case "REGISTERED": case "ACTIVE": case "pass": case "resolved": return "success";
    case "degraded": case "REGISTERING": case "major": case "acknowledged": case "minor": return "warning";
    case "down": case "REG_FAILED": case "FAILED": case "fail": case "critical": case "open": return "critical";
    case "info": return "info";
    default: return "muted";
  }
}

export function StatusPill({ value }: { value: string }) {
  return <Pill tone={toneFor(value)}>{value.replace("_", " ")}</Pill>;
}

export function Dot({ tone }: { tone: Tone }) {
  const c = { success: "bg-success", warning: "bg-warning", critical: "bg-critical", info: "bg-info", primary: "bg-primary", muted: "bg-muted-foreground" }[tone];
  return <span aria-hidden className={cn("inline-block h-2 w-2 shrink-0 rounded-full", c)} />;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, right, children, className }: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("panel", className)}>
      {title && (
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <h2 className="label-caps">{title}</h2>
          {right}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function DataModeBadge() {
  const { mode } = useLab();
  return mode === "demo" ? (
    <span className="inline-flex items-center gap-2 rounded bg-demo px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-demo-foreground" role="status">
      DEMO DATA · SIMULATED
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded border border-info/50 bg-info/10 px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-info" role="status">
      IMPORTED JSON · OFFLINE SNAPSHOT
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded border border-dashed px-4 py-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function fmtTs(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").slice(0, 19) + "Z";
}

export function fmtUptime(sec: number) {
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded border bg-sidebar p-3 font-mono text-xs leading-relaxed text-foreground">
      <code>{children}</code>
    </pre>
  );
}
