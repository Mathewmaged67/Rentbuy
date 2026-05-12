import { Link } from "@tanstack/react-router";
import { Heart, Star, ShoppingBag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/store/app-store";
import { useCurrency } from "@/hooks/useCurrency";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { state, dispatch } = useApp();
  const { formatPrice } = useCurrency();
  const wished = state.wishlist.includes(product.id);

  const addBuy = () => {
    dispatch({
      type: "ADD_TO_CART",
      item: { id: crypto.randomUUID(), productId: product.id, type: "buy", qty: 1 },
    });
  };
  const addRent = () => {
    dispatch({
      type: "ADD_TO_CART",
      item: { id: crypto.randomUUID(), productId: product.id, type: "rent", qty: 1, days: 3 },
    });
  };

  const showBuy = product.mode === "buy" || product.mode === "both";
  const showRent = product.mode === "rent" || product.mode === "both";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover-elevate">
      <Link
        to="/products/$productId"
        params={{ productId: product.id }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <Badge className="bg-buy text-buy-foreground hover:bg-buy">New</Badge>}
          {product.featured && <Badge variant="secondary">Featured</Badge>}
          {!product.available && <Badge variant="destructive">Unavailable</Badge>}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => dispatch({ type: "TOGGLE_WISHLIST", productId: product.id })}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 backdrop-blur transition-colors",
          wished ? "text-rent" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Heart className={cn("size-5", wished && "fill-current")} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{product.brand}</span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-current text-rent" />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          className="line-clamp-2 font-display text-base font-semibold leading-snug hover:underline"
        >
          {product.name}
        </Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">{product.tagline}</p>

        <div className="mt-2 flex items-baseline gap-2">
          {showBuy && (
            <span className="font-display text-xl font-semibold">{formatPrice(product.price)}</span>
          )}
          {showRent && (
            <span className="text-xs text-muted-foreground">
              · {formatPrice(product.rentPerDay || 0)}/day
            </span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {showBuy ? (
            <Button size="sm" onClick={addBuy} disabled={!product.available} className="bg-gradient-buy text-buy-foreground hover:opacity-90">
              <ShoppingBag className="size-4" /> Buy
            </Button>
          ) : (
            <span />
          )}
          {showRent ? (
            <Button size="sm" variant="outline" onClick={addRent} disabled={!product.available} className="border-rent/40 text-foreground hover:bg-rent/10">
              <Calendar className="size-4" /> Rent
            </Button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </article>
  );
}
