import { createFileRoute, useSearch } from "@tanstack/react-router";
import * as React from "react";
import { Boxes, Inbox, ShoppingBag, Plus, Mail, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DashboardSidebar, type DashItem } from "@/components/dashboard-sidebar";
import { StatusBadge } from "@/components/status-badge";
import { useApp } from "@/store/app-store";
import { CATEGORIES, findProduct, type Product } from "@/data/products";
import { toast } from "sonner";
import { createProduct, uploadImage } from "@/lib/api";
import { Upload } from "lucide-react";



interface S { tab?: "products" | "orders" | "inbox" }

export const Route = createFileRoute("/dashboard/seller")({
  validateSearch: (s: Record<string, unknown>): S => ({
    tab: s.tab === "orders" || s.tab === "inbox" ? s.tab : "products",
  }),
  head: () => ({ meta: [{ title: "Seller dashboard — RentBuy" }] }),
  component: SellerDashboard,
});

const items: DashItem[] = [
  { to: "/dashboard/seller", search: { tab: "products" }, label: "My Products", icon: Boxes },
  { to: "/dashboard/seller", search: { tab: "orders" }, label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/seller", search: { tab: "inbox" }, label: "Inbox", icon: Inbox },
];

function SellerDashboard() {
  const { tab } = useSearch({ from: "/dashboard/seller" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl font-semibold md:text-4xl">Seller dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your products, orders, and customer messages.</p>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <DashboardSidebar items={items} title="Seller" />
        <div className="flex-1">
          {tab === "products" && <ProductsTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "inbox" && <InboxTab />}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCTS TAB ────────────────────────────────────────────────────────────
function ProductsTab() {
  const { state, dispatch } = useApp();
  const [name, setName] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [price, setPrice] = React.useState(199);

  const [rentPerDay, setRentPerDay] = React.useState(9);
  const [deposit, setDeposit] = React.useState(50);
  const [category, setCategory] = React.useState(CATEGORIES[0].slug);
  const [mode, setMode] = React.useState<"buy" | "rent" | "both">("both");
  const [loading, setLoading] = React.useState(false);


  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      let finalImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop";
      
      if (imageFile) {
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
        const b64 = await base64Promise;
        const uploadRes = await uploadImage(b64, imageFile.name);
        finalImageUrl = uploadRes.url;
      }
      
      const pData = {
        name,
        tagline: tagline || "New listing",
        description: description || tagline || "Listed by a RentBuy seller.",
        category,
        brand: state.user?.name ?? "Seller",
        image: finalImageUrl,
        gallery: [finalImageUrl],
        price,
        rentPerDay,
        deposit,
        rating: 5,
        reviews: 0,
        mode,
        available: true,
        isNew: true,
      };

      const savedProduct = await createProduct(pData);
      dispatch({ type: "ADD_PRODUCT", product: savedProduct });
      toast.success("Product listed and notifications sent! 🚀");
      setName(""); setTagline(""); setImageFile(null); setDescription("");
    } catch (err: any) {
      toast.error(err.message || "Failed to list product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Plus className="size-4" /> Add a new product</h2>
        <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Tagline</Label><Input value={tagline} onChange={(e) => setTagline(e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Product Image</Label>
            <div className="flex items-center gap-3">
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {imageFile && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{imageFile.name}</span>}
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>


          <div className="space-y-1.5"><Label>Sale price ($)</Label><Input type="number" min={0} value={price} onChange={(e) => setPrice(+e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Rent / day ($)</Label><Input type="number" min={0} value={rentPerDay} onChange={(e) => setRentPerDay(+e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Deposit ($)</Label><Input type="number" min={0} value={deposit} onChange={(e) => setDeposit(+e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Buy &amp; rent</SelectItem>
                <SelectItem value="buy">Buy only</SelectItem>
                <SelectItem value="rent">Rent only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2"><Button type="submit" disabled={loading} className="bg-gradient-ink">{loading ? "Listing..." : "List product"}</Button></div>
        </form>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Your catalog</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Rent/day</th>
                <th className="px-4 py-3">Available</th>
              </tr>
            </thead>
            <tbody>
              {state.products.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.image} alt="" className="size-10 rounded-md object-cover" /><span className="font-medium">{p.name}</span></div></td>
                  <td className="px-4 py-3 capitalize">{p.category}</td>
                  <td className="px-4 py-3">${p.price}</td>
                  <td className="px-4 py-3">${p.rentPerDay}</td>
                  <td className="px-4 py-3">
                    <Switch checked={p.available} onCheckedChange={() => dispatch({ type: "TOGGLE_PRODUCT_AVAIL", id: p.id })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const { state, dispatch } = useApp();

  if (state.orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <h3 className="font-display text-lg">No incoming orders</h3>
        <p className="mt-1 text-sm text-muted-foreground">Orders placed by customers will appear here.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {state.orders.map((o) => {
        const p = findProduct(o.productId, state.products);
        return (
          <div key={o.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
            <img src={p?.image} alt="" className="size-16 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="font-medium">{p?.name}</div>
              <div className="text-xs text-muted-foreground">{o.id} · {o.type}{o.days ? ` · ${o.days}d` : ""} · ${o.total}</div>
            </div>
            <StatusBadge status={o.status} />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => dispatch({ type: "SET_ORDER_STATUS", id: o.id, status: "approved" })}><CheckCircle2 className="size-4" /> Approve</Button>
              <Button size="sm" variant="outline" onClick={() => dispatch({ type: "SET_ORDER_STATUS", id: o.id, status: "rejected" })}><XCircle className="size-4" /> Reject</Button>
              <Button size="sm" onClick={() => dispatch({ type: "SET_ORDER_STATUS", id: o.id, status: "completed" })}><Clock className="size-4" /> Complete</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── INBOX TAB ────────────────────────────────────────────────────────────────
function InboxTab() {
  const { state } = useApp();

  return (
    <div className="space-y-3">
      {state.messages.map((m) => {
        const p = findProduct(m.productId, state.products);
        return (
          <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              <span className="font-medium">{p?.name}</span>
              <span className="text-xs text-muted-foreground">from {m.fromName}</span>
            </div>
            <p className="mt-2 text-sm">{m.body}</p>
            <ReplyForm id={m.id} existing={m.reply} />
          </div>
        );
      })}
    </div>
  );
}

// ─── REPLY FORM ───────────────────────────────────────────────────────────────
function ReplyForm({ id, existing }: { id: string; existing?: string }) {
  const { dispatch } = useApp();
  const [text, setText] = React.useState(existing ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: "REPLY_MESSAGE", id, reply: text });
        toast.success("Reply sent");
      }}
      className="mt-3 space-y-2"
    >
      <Textarea rows={2} placeholder="Write a reply…" value={text} onChange={(e) => setText(e.target.value)} />
      <Button size="sm" type="submit">Send reply</Button>
    </form>
  );
}
