// Smart search with live suggestion dropdown
import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function SmartSearch({ className }: Props) {
  const { state } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Derive suggestions
  const suggestions = React.useMemo(() => {
    if (!q.trim()) return [];
    const t = q.toLowerCase();
    return state.products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.brand.toLowerCase().includes(t) ||
          p.category.toLowerCase().includes(t),
      )
      .slice(0, 6);
  }, [q, state.products]);

  // Close on outside click
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    navigate({ to: "/browse", search: { q } as never });
  }

  function selectProduct(id: string) {
    setOpen(false);
    setQ("");
    navigate({ to: "/products/$productId", params: { productId: id } });
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={submitSearch}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="smart-search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => q.trim() && setOpen(true)}
            placeholder="Search gadgets, brands, categories"
            className="h-10 rounded-full pl-9"
            autoComplete="off"
          />
        </div>
      </form>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
          {suggestions.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProduct(p.id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
            >
              <img
                src={p.image}
                alt=""
                className="size-9 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="truncate text-xs capitalize text-muted-foreground">
                  {p.category} · {p.brand}
                </div>
              </div>
              <div className="ml-auto shrink-0 text-xs text-muted-foreground">
                ${p.price}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
