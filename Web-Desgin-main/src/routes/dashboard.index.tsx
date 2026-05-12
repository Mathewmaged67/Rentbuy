// Customer Dashboard — Orders, Wishlist, Inbox, Settings tabs
import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import * as React from "react";
import { ShoppingBag, Heart, Inbox, Mail, Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardSidebar, type DashItem } from "@/components/dashboard-sidebar";
import { StatusBadge } from "@/components/status-badge";
import { useApp } from "@/store/app-store";
import { findProduct } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { RecommendedProducts } from "@/components/recommended-products";
import { apiFetch } from "@/lib/api";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

interface S { tab?: "orders" | "wishlist" | "inbox" | "settings" }

export const Route = createFileRoute("/dashboard/")({
  validateSearch: (s: Record<string, unknown>): S => ({
    tab:
      s.tab === "wishlist" || s.tab === "inbox" || s.tab === "settings"
        ? s.tab
        : "orders",
  }),
  head: () => ({ meta: [{ title: "My dashboard — RentBuy" }] }),
  component: CustomerDashboard,
});

const items: DashItem[] = [
  { to: "/dashboard", search: { tab: "orders" }, label: "My Orders", icon: ShoppingBag },
  { to: "/dashboard", search: { tab: "wishlist" }, label: "Wishlist", icon: Heart },
  { to: "/dashboard", search: { tab: "inbox" }, label: "Inbox", icon: Inbox },
  { to: "/dashboard", search: { tab: "settings" }, label: "Settings", icon: Settings },
];

function CustomerDashboard() {
  const { tab } = useSearch({ from: "/dashboard/" });
  const { state } = useApp();

  const isBirthday = React.useMemo(() => {
    if (!state.user?.dob) return false;
    const bday = new Date(state.user.dob);
    const today = new Date();
    return bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate();
  }, [state.user?.dob]);

  const [activeCoupon, setActiveCoupon] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (state.token && isBirthday) {
      apiFetch("/api/coupons/active")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setActiveCoupon(data[0].code);
          }
        })
        .catch(err => console.error("Failed to fetch coupons:", err));
    }
  }, [state.token, isBirthday]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      {isBirthday && (
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-1 shadow-xl animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex flex-col items-center justify-between gap-4 rounded-[22px] bg-white/10 p-6 backdrop-blur-md md:flex-row md:p-8">
            <div className="text-center md:text-left">
              <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
                🎉 Happy Birthday, {state.user?.name}!
              </h2>
              <p className="mt-2 text-white/90">
                It's your special day! We've got a gift just for you.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl bg-white/20 px-6 py-3 border border-white/30 backdrop-blur-sm">
                <span className="block text-[10px] uppercase tracking-widest text-white/70">Your Coupon</span>
                <span className="text-2xl font-black tracking-tighter text-white">{activeCoupon || "HBD10"}</span>
              </div>
              <p className="text-xs font-medium text-white/80">Use at checkout for 10% OFF</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">My account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {state.user ? (
              `Welcome, ${state.user.name}`
            ) : (
              <Link to="/auth" className="underline">Sign in</Link>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <DashboardSidebar items={items} title="Customer" />
        <div className="flex-1">
          {tab === "orders" && <OrdersTab />}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "inbox" && <InboxTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────
function OrdersTab() {
  const { state } = useApp();
  const { formatPrice } = useCurrency();

  return (
    <div className="space-y-12">
      {state.orders.length === 0 ? (
        <DashEmpty
          title="No orders yet"
          icon="🛍️"
          body="Once you place an order, it'll show up here."
          cta={
            <Button asChild className="bg-gradient-ink">
              <Link to="/browse">Browse products</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.orders.map((o) => {
                const p = findProduct(o.productId, state.products);
                return (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p && (
                          <img src={p.image} alt="" className="size-8 rounded-md object-cover" />
                        )}
                        <span>{p?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {o.type}
                      {o.days ? ` · ${o.days}d` : ""}
                    </td>
                    <td className="px-4 py-3 font-display font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <RecommendedProducts />
    </div>
  );
}

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
function WishlistTab() {
  const { state, dispatch } = useApp();
  const list = state.wishlist
    .map((id) => findProduct(id, state.products))
    .filter(Boolean) as NonNullable<ReturnType<typeof findProduct>>[];

  if (list.length === 0) {
    return (
      <DashEmpty
        title="Your wishlist is empty"
        icon="❤️"
        body="Tap the heart on any product to save it here for later."
        cta={
          <Button asChild className="bg-gradient-ink">
            <Link to="/browse">Find something you love</Link>
          </Button>
        }
      />
    );
  }
  // dispatch is used by ProductCard internally via useApp()
  void dispatch;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// ─── INBOX ────────────────────────────────────────────────────────────────────
function InboxTab() {
  const { state, dispatch } = useApp();

  if (state.messages.length === 0) {
    return (
      <DashEmpty
        title="Inbox empty"
        icon="📬"
        body="Messages between you and sellers appear here."
      />
    );
  }
  return (
    <div className="space-y-3">
      {state.messages.map((m) => {
        const p = findProduct(m.productId, state.products);
        return (
          <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="font-medium">{p?.name}</span>
                  {m.unread && (
                    <span className="rounded-full bg-rent px-2 py-0.5 text-[10px] font-bold text-rent-foreground">
                      NEW
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  From {m.fromName} · {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dispatch({ type: "MARK_READ", id: m.id })}
              >
                Mark read
              </Button>
            </div>
            <p className="mt-3 text-sm">{m.body}</p>
            {m.reply && (
              <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
                <div className="mb-1 text-xs font-medium text-muted-foreground">Seller reply</div>
                {m.reply}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function SettingsTab() {
  const { state, dispatch } = useApp();

  const [profile, setProfile] = React.useState({
    name: state.user?.name ?? "",
    email: state.user?.email ?? "",
    phone: "",
    address: "",
  });
  const [profileSaving, setProfileSaving] = React.useState(false);

  const [pwd, setPwd] = React.useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = React.useState(false);
  const [pwdSaving, setPwdSaving] = React.useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setProfileSaving(true);
    try {
      if (state.token) {
        const res = await apiFetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            address: profile.address,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { message?: string };
          throw new Error(err.message ?? "Failed to update profile");
        }
      }
      dispatch({
        type: "LOGIN",
        user: { name: profile.name, email: profile.email, id: state.user?.id ?? "" },
        role: state.role,
        token: state.token ?? "",
      });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pwd.current) { toast.error("Enter your current password."); return; }
    if (pwd.next.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    if (pwd.next !== pwd.confirm) { toast.error("Passwords do not match."); return; }
    setPwdSaving(true);
    try {
      if (state.token) {
        const res = await apiFetch("/api/profile/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { message?: string };
          throw new Error(err.message ?? "Failed to change password");
        }
      }
      setPwd({ current: "", next: "", confirm: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Profile information</h2>
        <form onSubmit={saveProfile} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="settings-name">Full name</Label>
              <Input
                id="settings-name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-phone">Phone</Label>
              <Input
                id="settings-phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="settings-address">Address</Label>
              <Textarea
                id="settings-address"
                value={profile.address}
                onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                rows={2}
                placeholder="123 Main St, City, Country"
              />
            </div>
          </div>
          <Button type="submit" className="bg-gradient-ink" disabled={profileSaving}>
            {profileSaving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Change password</h2>
        <form onSubmit={changePassword} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pwd-current">Current password</Label>
            <div className="relative">
              <Input
                id="pwd-current"
                type={showPwd ? "text" : "password"}
                value={pwd.current}
                onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pwd-new">New password</Label>
            <Input
              id="pwd-new"
              type={showPwd ? "text" : "password"}
              value={pwd.next}
              onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pwd-confirm">Confirm new password</Label>
            <Input
              id="pwd-confirm"
              type={showPwd ? "text" : "password"}
              value={pwd.confirm}
              onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          <p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
          <Button type="submit" variant="outline" disabled={pwdSaving}>
            {pwdSaving ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-destructive/30 bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign out of your account on this device.
        </p>
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => dispatch({ type: "LOGOUT" })}
        >
          Sign out
        </Button>
      </section>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function DashEmpty({
  title,
  body,
  icon,
  cta,
}: {
  title: string;
  body: string;
  icon?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      {icon && <div className="text-5xl">{icon}</div>}
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
