// Cart page — fully updated to use new checkout flow (all items, no ?itemId)
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, ShoppingBag, ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";
import { useCurrency } from "@/hooks/useCurrency";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — RentBuy" },
      { name: "description", content: "Review your buy and rental items before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Look up product from store (covers both static & backend products)
  const items = state.cart
    .map((ci) => {
      const p = state.products.find((x) => x.id === ci.productId);
      if (!p) return null;
      const subtotal =
        ci.type === "buy" ? p.price : p.rentPerDay * (ci.days ?? 1) + p.deposit;
      return { ci, p, subtotal };
    })
    .filter(Boolean) as {
    ci: (typeof state.cart)[0];
    p: (typeof state.products)[0];
    subtotal: number;
  }[];

  const total = items.reduce((sum, x) => sum + x.subtotal, 0);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-muted">
          <ShoppingBag className="size-10 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-3 max-w-sm mx-auto text-muted-foreground">
          Discover gadgets to buy or rent — your next setup is one click away.
        </p>
        <Button asChild className="mt-8 bg-gradient-ink" size="lg">
          <Link to="/browse">Start shopping <ArrowRight className="size-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl font-semibold md:text-4xl">Your cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* ── Items list ── */}
        <div className="space-y-3">
          {items.map(({ ci, p, subtotal }) => (
            <div
              key={ci.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row"
            >
              <Link
                to="/products/$productId"
                params={{ productId: p.id }}
                className="block size-28 shrink-0 overflow-hidden rounded-xl bg-muted"
              >
                <img src={p.image} alt={p.name} className="size-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to="/products/$productId"
                      params={{ productId: p.id }}
                      className="font-display text-base font-semibold hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {ci.type === "buy" ? "Buy" : `Rent · ${ci.days} days`}
                      {ci.type === "rent" && (
                        <span className="ml-1 text-muted-foreground">· {formatPrice(p.deposit)} deposit</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch({ type: "REMOVE_CART", id: ci.id })}
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="font-display text-lg font-semibold">{formatPrice(subtotal)}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate({ to: "/checkout" })}
                  >
                    Checkout <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Summary sidebar ── */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {items.map(({ ci, p, subtotal }) => (
              <div key={ci.id} className="flex justify-between gap-2 text-muted-foreground">
                <dt className="truncate">
                  {p.name} · {ci.type === "buy" ? "buy" : `${ci.days}d rental`}
                </dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-medium">Estimated total</span>
            <span className="font-display text-2xl font-bold">{formatPrice(total)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Rental deposits are refundable upon return.
          </p>
          <Button
            className="mt-5 w-full bg-gradient-ink"
            size="lg"
            onClick={() => navigate({ to: "/checkout" })}
          >
            <PackageCheck className="size-4" /> Checkout all items
          </Button>
          <Button
            variant="outline"
            className="mt-2 w-full text-muted-foreground hover:text-destructive"
            onClick={() => dispatch({ type: "CLEAR_CART" })}
          >
            Clear cart
          </Button>
        </aside>
      </div>
    </div>
  );
}
