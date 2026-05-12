import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { ProductCard } from "@/components/product-card";
import { SkeletonCardGrid } from "@/components/skeleton-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useApp } from "@/store/app-store";
import { CATEGORIES } from "@/data/products";
import { Search, SlidersHorizontal } from "lucide-react";

interface BrowseSearch {
  q?: string;
  category?: string;
  status?: "new" | "all";
  mode?: "buy" | "rent" | "all";
}

export const Route = createFileRoute("/browse")({
  validateSearch: (s: Record<string, unknown>): BrowseSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    status: s.status === "new" ? "new" : "all",
    mode: s.mode === "buy" || s.mode === "rent" ? s.mode : "all",
  }),
  head: () => ({
    meta: [
      { title: "Browse — RentBuy" },
      { name: "description", content: "Search and filter premium gadgets to buy or rent." },
      { property: "og:title", content: "Browse — RentBuy" },
      { property: "og:description", content: "Search and filter premium gadgets to buy or rent." },
    ],
  }),
  component: BrowsePage,
});

const PAGE_SIZE = 8;

function BrowsePage() {
  const search = useSearch({ from: "/browse" }) as BrowseSearch;
  const navigate = useNavigate({ from: "/browse" });
  const { state } = useApp();

  const [q, setQ] = React.useState(search.q ?? "");
  const [category, setCategory] = React.useState(search.category ?? "all");
  const [mode, setMode] = React.useState<"all" | "buy" | "rent">(search.mode ?? "all");
  const [onlyAvailable, setOnlyAvailable] = React.useState(false);
  const [onlyNew, setOnlyNew] = React.useState(search.status === "new");
  const [price, setPrice] = React.useState<[number, number]>([0, 2000]);
  const [minRating, setMinRating] = React.useState(0);
  const [sort, setSort] = React.useState("featured");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setQ(search.q ?? "");
    setCategory(search.category ?? "all");
    setMode(search.mode ?? "all");
    setOnlyNew(search.status === "new");
    setPage(1);
  }, [search.q, search.category, search.mode, search.status]);

  const filtered = React.useMemo(() => {
    let r = state.products.slice();
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t) || p.tagline.toLowerCase().includes(t));
    }
    if (category !== "all") r = r.filter((p) => p.category === category);
    if (mode !== "all") r = r.filter((p) => p.mode === mode || p.mode === "both");
    if (onlyAvailable) r = r.filter((p) => p.available);
    if (onlyNew) r = r.filter((p) => p.isNew);
    r = r.filter((p) => p.price >= price[0] && p.price <= price[1]);
    r = r.filter((p) => p.rating >= minRating);

    switch (sort) {
      case "price-asc": r.sort((a, b) => a.price - b.price); break;
      case "price-desc": r.sort((a, b) => b.price - a.price); break;
      case "rating": r.sort((a, b) => b.rating - a.rating); break;
      default: r.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return r;
  }, [state.products, q, category, mode, onlyAvailable, onlyNew, price, minRating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Browse the marketplace</h1>
        <p className="text-muted-foreground">Filter by category, price, and rating — for buying or renting.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* FILTERS */}
        <aside className="space-y-6 rounded-2xl border border-border bg-card p-5 h-fit">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4" /> Filters
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search…"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v: "all" | "buy" | "rent") => { setMode(v); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Buy or rent</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Price</Label>
              <span className="text-xs text-muted-foreground">${price[0]} – ${price[1]}</span>
            </div>
            <Slider min={0} max={2000} step={50} value={price} onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Min rating</Label>
              <span className="text-xs text-muted-foreground">{minRating.toFixed(1)}★</span>
            </div>
            <Slider min={0} max={5} step={0.5} value={[minRating]} onValueChange={(v) => setMinRating(v[0])} />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={onlyAvailable} onCheckedChange={(v) => setOnlyAvailable(!!v)} />
              In stock only
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={onlyNew} onCheckedChange={(v) => setOnlyNew(!!v)} />
              New arrivals
            </label>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setQ(""); setCategory("all"); setMode("all"); setOnlyAvailable(false);
              setOnlyNew(false); setPrice([0, 2000]); setMinRating(0);
              navigate({ search: {} });
            }}
          >
            Reset filters
          </Button>
        </aside>

        {/* RESULTS */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Sort</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                  <SelectItem value="rating">Top rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {state.productsLoading ? (
            <div className="mt-6">
              <SkeletonCardGrid count={6} />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-lg">No products match your filters.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try clearing filters or broadening your search.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
