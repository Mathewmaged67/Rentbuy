// Product detail page — image gallery, buy/rent, wishlist, contact seller, related products
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import {
  Heart,
  Star,
  ShoppingBag,
  Calendar,
  ShieldCheck,
  Truck,
  ArrowLeft,
  MessageCircle,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useApp } from "@/store/app-store";
import { PRODUCTS, findProduct } from "@/data/products";
import { RentalCalculator } from "@/components/rental-calculator";
import { MessageForm } from "@/components/message-form";
import { ProductCard } from "@/components/product-card";
import { RecommendedProducts } from "@/components/recommended-products";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import { rateProduct, getMyRating } from "@/lib/api";
import { toast } from "sonner";

import { API_URL } from "@/lib/api";

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    let product = findProduct(params.productId);
    if (!product) {
      try {
        const res = await fetch(`${API_URL}/api/products/${params.productId}`);
        if (res.ok) {
          product = await res.json();
        }
      } catch (e) {
        console.error("Failed to fetch product:", e);
      }
    }
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — RentBuy` },
          { name: "description", content: loaderData.product.tagline },
          { property: "og:title", content: `${loaderData.product.name} — RentBuy` },
          { property: "og:description", content: loaderData.product.tagline },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Product not found</h1>
      <Link to="/browse" className="mt-4 inline-block text-sm underline">
        Back to browse
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-2xl">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product: loaderProduct } = Route.useLoaderData();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Prefer the live store version (may have fresher data from backend)
  const product =
    state.products.find((p) => p.id === loaderProduct.id) ?? loaderProduct;
  const [type, setType] = React.useState<"buy" | "rent">(product.mode === "rent" ? "rent" : "buy");
  const [days, setDays] = React.useState(3);
  const [payment, setPayment] = React.useState<"cod" | "online">("online");
  const [activeImg, setActiveImg] = React.useState(0);
  const [showMsg, setShowMsg] = React.useState(false);
  const [userRating, setUserRating] = React.useState<number | null>(null);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = React.useState(false);

  // Fetch the user's existing rating when the product changes
  React.useEffect(() => {
    if (state.role === "customer" && state.token !== "demo-token") {
      getMyRating(product.id).then(setUserRating);
    }
  }, [product.id, state.role, state.token]);

  async function submitRating(stars: number) {
    if (state.role !== "customer") return;
    setRatingLoading(true);
    try {
      const result = await rateProduct(product.id, stars);
      setUserRating(result.userRating);
      toast.success("Rating saved! ⭐");
    } catch {
      toast.error("Could not save rating. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  }


  // Reset when product changes (navigating between products)
  React.useEffect(() => {
    setType(product.mode === "rent" ? "rent" : "buy");
    setActiveImg(0);
    setShowMsg(false);
    dispatch({ type: "ADD_TO_VIEW_HISTORY", productId: product.id });
  }, [product.id, product.mode, dispatch]);

  const wished = state.wishlist.includes(product.id);
  const showBuy = product.mode === "buy" || product.mode === "both";
  const showRent = product.mode === "rent" || product.mode === "both";

  const total =
    type === "buy" ? product.price : product.rentPerDay * days + product.deposit;

  function addToCart() {
    dispatch({
      type: "ADD_TO_CART",
      item: {
        id: crypto.randomUUID(),
        productId: product.id,
        type,
        days: type === "rent" ? days : undefined,
        qty: 1,
      },
    });
    toast.success(`${product.name} added to cart!`, {
      action: { label: "View cart", onClick: () => navigate({ to: "/cart" }) },
    });
  }

  function toggleWishlist() {
    dispatch({ type: "TOGGLE_WISHLIST", productId: product.id });
    toast(wished ? "Removed from wishlist" : "Added to wishlist ❤️");
  }

  // Related products — same category, excluding this one (from live store)
  const related = state.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      {/* Back link */}
      <Link
        to="/browse"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to browse
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* === GALLERY === */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-muted">
            <img
              src={product.gallery[activeImg] ?? product.image}
              alt={product.name}
              width={1000}
              height={1000}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.gallery.length > 1 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {product.gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "overflow-hidden rounded-xl border-2 transition-all",
                    i === activeImg ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <img src={g} alt="" className="size-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* === DETAILS === */}
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">{product.brand}</Badge>
            {product.isNew && (
              <Badge className="bg-buy text-buy-foreground hover:bg-buy">New</Badge>
            )}
            {product.featured && <Badge>Featured</Badge>}
            {!product.available && (
              <Badge variant="destructive">Unavailable</Badge>
            )}
          </div>

          <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-muted-foreground">{product.tagline}</p>

          {/* Rating + seller */}
          <div className="mt-3 space-y-2">
            {/* Average rating display */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-rent">
                <Star className="size-4 fill-current" /> {product.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                · {product.reviews.toLocaleString()} reviews
              </span>
            </div>

            {/* Interactive star rating for customers */}
            {state.role === "customer" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Your rating:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = (hoverRating ?? userRating ?? 0) >= star;
                    return (
                      <button
                        key={star}
                        disabled={ratingLoading}
                        onClick={() => submitRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="transition-transform hover:scale-110 disabled:opacity-50"
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={cn(
                            "size-5 transition-colors",
                            filled ? "fill-rent text-rent" : "text-muted-foreground"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                {userRating && (
                  <span className="text-xs text-muted-foreground">
                    (you rated {userRating}★)
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-foreground/80">{product.description}</p>

          {/* Buy / Rent tabs */}
          <Tabs
            value={type}
            onValueChange={(v) => setType(v as "buy" | "rent")}
            className="mt-6"
          >
            <TabsList>
              {showBuy && (
                <TabsTrigger value="buy">Buy · {formatPrice(product.price)}</TabsTrigger>
              )}
              {showRent && (
                <TabsTrigger value="rent">Rent · {formatPrice(product.rentPerDay)}/day</TabsTrigger>
              )}
            </TabsList>
            {showBuy && (
              <TabsContent
                value="buy"
                className="mt-4 rounded-xl border border-border bg-muted/40 p-4"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold">{formatPrice(product.price)}</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Free shipping. 14-day returns.</p>
              </TabsContent>
            )}
            {showRent && (
              <TabsContent value="rent" className="mt-4">
                <RentalCalculator
                  pricePerDay={product.rentPerDay}
                  deposit={product.deposit}
                  defaultDays={days}
                  onChange={({ days: d }) => setDays(d)}
                />
              </TabsContent>
            )}
          </Tabs>

          {/* Payment method */}
          <div className="mt-5">
            <div className="mb-2 text-sm font-medium">Payment method</div>
            <RadioGroup
              value={payment}
              onValueChange={(v) => setPayment(v as "cod" | "online")}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="pay-online"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 hover:bg-muted"
              >
                <RadioGroupItem id="pay-online" value="online" /> Online (simulated)
              </Label>
              <Label
                htmlFor="pay-cod"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 hover:bg-muted"
              >
                <RadioGroupItem id="pay-cod" value="cod" /> Cash on delivery
              </Label>
            </RadioGroup>
          </div>

          {/* CTA buttons */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
            <Button
              size="lg"
              onClick={addToCart}
              disabled={!product.available}
              className={
                type === "buy"
                  ? "bg-gradient-buy text-buy-foreground"
                  : "bg-gradient-rent text-rent-foreground"
              }
            >
              {type === "buy" ? (
                <><ShoppingBag className="size-4" /> Add to cart · {formatPrice(total)}</>
              ) : (
                <><Calendar className="size-4" /> Add rental · {formatPrice(total)}</>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={toggleWishlist}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("size-4", wished && "fill-rent text-rent")} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowMsg((s) => !s)}>
              <MessageCircle className="size-4" /> Contact
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-buy" /> Deposit-protected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="size-4 text-buy" /> Ships in 24h
            </span>
          </div>

          {/* Seller info */}
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <div className="grid size-10 place-items-center rounded-full bg-gradient-ink text-cream">
              <Store className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{product.sellerName}</div>
              <div className="text-xs text-muted-foreground">Verified seller · Seller ID: {product.sellerId}</div>
            </div>
          </div>

          {/* Contact form */}
          {showMsg && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-semibold">Contact the seller</h3>
              <p className="text-sm text-muted-foreground">
                Ask about availability, accessories, or rental terms.
              </p>
              <div className="mt-4">
                <MessageForm
                  productId={product.id}
                  onSent={() => setTimeout(() => setShowMsg(false), 1500)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === RELATED PRODUCTS === */}
      {related.length > 0 && (
        <section className="mt-16 mb-16">
          <h2 className="font-display text-2xl font-semibold">
            More from {product.category}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* === RECOMMENDED PRODUCTS === */}
      <div className="mb-16">
        <RecommendedProducts currentProductId={product.id} />
      </div>
    </div>
  );
}
