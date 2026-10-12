import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, Network, Users, Bell, Wrench, FlaskConical, Database, Info, RadioTower } from "lucide-react";
import { DataModeBadge } from "./ui";
import { useLab } from "@/lib/lab/store";

const NAV = [
  { to: "/", label: "Overview", icon: Activity },
  { to: "/topology", label: "Topology", icon: Network },
  { to: "/sessions", label: "Sessions", icon: Users },
  { to: "/events", label: "Events & Alarms", icon: Bell },
  { to: "/troubleshooting", label: "Troubleshooting", icon: Wrench },
  { to: "/tests", label: "Test Runs", icon: FlaskConical },
  { to: "/settings", label: "Data Source", icon: Database },
  { to: "/about", label: "About & Docs", icon: Info },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { mode } = useLab();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
          <RadioTower className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">5G SA Core Lab</p>
            <p className="truncate text-[11px] text-muted-foreground">Monitoring & Troubleshooting</p>
          </div>
        </div>
        <nav aria-label="Main" className="flex-1 space-y-0.5 p-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-2.5 rounded px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-primary font-medium" }}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">
          Console for an external Open5GS + UERANSIM lab. Not a 5G core or 3GPP simulator.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {mode === "demo" && <div className="demo-stripes h-1 w-full" aria-hidden />}
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 lg:px-6">
            <p className="truncate font-mono text-xs text-muted-foreground">
              <span className="lg:hidden font-sans font-semibold text-foreground">5G SA Core Lab · </span>
              PLMN 999/70 · Open5GS + UERANSIM (Ubuntu)
            </p>
            <DataModeBadge />
          </div>
          <nav aria-label="Main mobile" className="flex gap-1 overflow-x-auto border-t px-2 py-1.5 lg:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="whitespace-nowrap rounded px-2.5 py-1 text-xs text-muted-foreground"
                activeProps={{ className: "bg-accent text-primary" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
