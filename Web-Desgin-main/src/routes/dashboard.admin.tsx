// Admin dashboard — with live stats from backend API + user/product management
import { createFileRoute, useSearch } from "@tanstack/react-router";
import * as React from "react";
import { BarChart3, Users, Boxes, Trash2, ShieldCheck, Ban, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebar, type DashItem } from "@/components/dashboard-sidebar";
import { useApp } from "@/store/app-store";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface S { tab?: "stats" | "users" | "products" }

export const Route = createFileRoute("/dashboard/admin")({
  validateSearch: (s: Record<string, unknown>): S => ({
    tab: s.tab === "users" || s.tab === "products" ? s.tab : "stats",
  }),
  head: () => ({ meta: [{ title: "Admin dashboard — RentBuy" }] }),
  component: AdminDashboard,
});

const adminItems: DashItem[] = [
  { to: "/dashboard/admin", search: { tab: "stats" }, label: "Stats", icon: BarChart3 },
  { to: "/dashboard/admin", search: { tab: "users" }, label: "Users", icon: Users },
  { to: "/dashboard/admin", search: { tab: "products" }, label: "Products", icon: Boxes },
];

const FAKE_USERS = [
  { id: "u1", name: "Sara Khan", email: "sara@example.com", role: "customer", active: true },
  { id: "u2", name: "Aurora Audio Co.", email: "team@aurora.com", role: "seller", active: true },
  { id: "u3", name: "Lumen Imaging", email: "hello@lumen.io", role: "seller", active: true },
  { id: "u4", name: "Mike Chen", email: "mike@example.com", role: "customer", active: false },
];

interface BackendStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

function AdminDashboard() {
  const { tab } = useSearch({ from: "/dashboard/admin" });
  const { dispatch } = useApp();
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl font-semibold md:text-4xl">Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">Platform health and moderation.</p>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <DashboardSidebar items={adminItems} title="Admin" />
        <div className="flex-1">
          {tab === "stats" && <StatsTab />}
          {tab === "users" && <UsersTab />}
          {tab === "products" && <ProductsTab onRemove={setConfirmId} />}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Remove this product?"
        description="This will hide it from the marketplace immediately."
        confirmLabel="Remove product"
        onConfirm={() => {
          if (confirmId) {
            dispatch({ type: "REMOVE_PRODUCT", id: confirmId });
            toast.success("Product removed");
          }
          setConfirmId(null);
        }}
      />
    </div>
  );
}

// ─── STATS TAB ────────────────────────────────────────────────────────────────
function StatsTab() {
  const { state } = useApp();
  const [backendStats, setBackendStats] = React.useState<BackendStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object" && "totalProducts" in data) {
          setBackendStats(data as BackendStats);
        }
      })
      .catch(() => {
        // Backend not reachable — fall back to local state
      })
      .finally(() => setLoading(false));
  }, []);

  const localRevenue = state.orders.reduce((sum, o) => sum + o.total, 0);

  const statsCards = [
    {
      label: "Total Products",
      value: backendStats?.totalProducts ?? state.products.length,
      icon: Package,
      color: "text-buy",
      bg: "bg-buy/10",
    },
    {
      label: "Total Customers",
      value: backendStats?.totalCustomers ?? FAKE_USERS.filter((u) => u.role === "customer").length,
      icon: Users,
      color: "text-rent",
      bg: "bg-rent/10",
    },
    {
      label: "Total Orders",
      value: backendStats?.totalOrders ?? state.orders.length,
      icon: ShoppingBagIcon,
      color: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "Revenue",
      value: `$${(backendStats?.totalRevenue ?? localRevenue).toFixed(0)}`,
      icon: DollarSign,
      color: "text-buy",
      bg: "bg-buy/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statsCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <div className={`inline-grid size-9 place-items-center rounded-xl ${s.bg}`}>
                <Icon className={`size-5 ${s.color}`} />
              </div>
              <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 font-display text-3xl font-bold">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-base font-semibold">Platform overview</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-xl bg-muted/50 p-3">
            <div className="text-muted-foreground">Messages</div>
            <div className="mt-1 font-display text-2xl font-bold">{state.messages.length}</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <div className="text-muted-foreground">Wishlist items</div>
            <div className="mt-1 font-display text-2xl font-bold">{state.wishlist.length}</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <div className="text-muted-foreground">Cart items</div>
            <div className="mt-1 font-display text-2xl font-bold">{state.cart.length}</div>
          </div>
        </div>
      </div>

      {/* Orders status breakdown */}
      {state.orders.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-base font-semibold">Orders by status</h3>
          <div className="mt-4 space-y-2">
            {(["pending", "approved", "completed", "rejected"] as const).map((status) => {
              const count = state.orders.filter((o) => o.status === status).length;
              const pct = state.orders.length ? Math.round((count / state.orders.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3 text-sm">
                  <div className="w-24 capitalize text-muted-foreground">{status}</div>
                  <div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-ink rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = React.useState(FAKE_USERS);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium">{u.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3 capitalize">{u.role}</td>
              <td className="px-4 py-3">
                {u.active ? (
                  <Badge className="bg-buy text-buy-foreground hover:bg-buy">Active</Badge>
                ) : (
                  <Badge variant="secondary">Suspended</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setUsers((p) =>
                        p.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)),
                      )
                    }
                  >
                    {u.active ? (
                      <><Ban className="size-4" /> Suspend</>
                    ) : (
                      <><ShieldCheck className="size-4" /> Activate</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setUsers((p) => p.filter((x) => x.id !== u.id))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── PRODUCTS TAB ─────────────────────────────────────────────────────────────
function ProductsTab({ onRemove }: { onRemove: (id: string) => void }) {
  const { state } = useApp();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {state.products.map((p) => (
        <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex gap-3">
            <img src={p.image} alt="" className="size-16 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">By {p.sellerName}</div>
              <div className="mt-1 text-xs">
                <Badge variant={p.available ? "outline" : "destructive"} className="text-[10px]">
                  {p.available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(p.id)}
          >
            <Trash2 className="size-4" /> Remove
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
