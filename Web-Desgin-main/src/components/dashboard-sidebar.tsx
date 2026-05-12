// Dashboard sidebar — active state checks both pathname AND search.tab
import { Link, useLocation, useSearch } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface DashItem {
  to: string;
  search?: Record<string, string>;
  label: string;
  icon: LucideIcon;
}

export function DashboardSidebar({ items, title }: { items: DashItem[]; title: string }) {
  const location = useLocation();
  // useSearch with strict:false safely returns search params on any route
  const searchParams = useSearch({ strict: false }) as Record<string, unknown>;
  const currentTab = typeof searchParams.tab === "string" ? searchParams.tab : undefined;

  return (
    <aside className="md:w-60">
      <div className="mb-4 px-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {items.map((it) => {
          const pathMatch = location.pathname === it.to;
          const tabActive = it.search?.tab
            ? it.search.tab === currentTab
            : !currentTab; // no tab search means "default" tab
          const active = pathMatch && tabActive;
          return (
            <Link
              key={it.label}
              to={it.to}
              search={it.search as never}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <it.icon className="size-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
