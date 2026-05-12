// Home page — with Arabic i18n for hero, categories, and product grids
import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product-card";
import { SkeletonCardGrid } from "@/components/skeleton-card";
import { RecommendedProducts } from "@/components/recommended-products";
import { useApp } from "@/store/app-store";
import { CATEGORIES } from "@/data/products";
import { useReveal } from "@/hooks/use-reveal";
import heroImg from "@/assets/hero-gadgets.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RentBuy — Buy or rent the best gadgets" },
      {
        name: "description",
        content:
          "Premium electronics marketplace with two ways to own: buy outright or rent by the day.",
      },
      { property: "og:title", content: "RentBuy — Buy or rent the best gadgets" },
      {
        property: "og:description",
        content:
          "Premium electronics marketplace with two ways to own: buy outright or rent by the day.",
      },
    ],
  }),
  component: HomePage,
});

const T = {
  en: {
    badge: "Two ways to own",
    heroLine1: "Buy what you love.",
    heroLine2Prefix: "",
    rent: "Rent",
    heroLine2Suffix: " what you need.",
    heroCopy:
      "From cinema-grade cameras to studio headphones — get the gear without the long-term commitment. Deposit-protected, delivered fast.",
    shopCta: "Shop the marketplace",
    browseCta: "Browse rentals",
    feat1: "Deposit-protected",
    feat2: "Fast delivery",
    feat3: "14-day returns",
    shopByCategory: "Shop by category",
    shopByCategorySub: "Curated picks across the gear that matters.",
    viewAll: "View all",
    rentPromo: "Try the gear before you commit.",
    rentPromoCopy:
      "Daily rates, refundable deposits, and rapid delivery. Perfect for a shoot, a trip, or a weekend project.",
    browseRentals: "Browse rentals",
    buyPromo: "Latest releases, curated.",
    buyPromoCopy:
      "Only the gear we'd buy ourselves — vetted by experts, backed by a 14-day return.",
    shopNow: "Shop now",
    trending: "Trending now",
    seeAll: "See all",
    tabNew: "New",
    tabBest: "Best Selling",
    tabFeatured: "Featured",
  },
  ar: {
    badge: "طريقتان للتملك",
    heroLine1: "اشترِ ما تحب.",
    heroLine2Prefix: "",
    rent: "استأجر",
    heroLine2Suffix: " ما تحتاج.",
    heroCopy:
      "من كاميرات السينما إلى سماعات الاستوديو — احصل على المعدات بدون التزامات طويلة الأمد. محمية بالإيداع، وتُسلَّم بسرعة.",
    shopCta: "تسوّق في السوق",
    browseCta: "تصفح الإيجارات",
    feat1: "محمية بالإيداع",
    feat2: "توصيل سريع",
    feat3: "إرجاع خلال 14 يومًا",
    shopByCategory: "تسوق حسب الفئة",
    shopByCategorySub: "اختيارات مُنتقاة من أفضل المعدات.",
    viewAll: "عرض الكل",
    rentPromo: "جرّب المعدات قبل أن تلتزم.",
    rentPromoCopy: "أسعار يومية، ودائع قابلة للاسترداد، وتوصيل سريع.",
    browseRentals: "تصفح الإيجارات",
    buyPromo: "أحدث الإصدارات، منتقاة بعناية.",
    buyPromoCopy: "فقط المعدات التي نشتريها بأنفسنا — خبراء يدعمونها، مع حق الإرجاع.",
    shopNow: "تسوق الآن",
    trending: "الأكثر رواجًا",
    seeAll: "عرض الكل",
    tabNew: "جديد",
    tabBest: "الأكثر مبيعًا",
    tabFeatured: "مميز",
  },
} as const;

function HomePage() {
  const { state } = useApp();
  useReveal();

  const lang = state.lang;
  const t = T[lang];

  const isLoading = state.productsLoading;

  const featured = state.products.filter((p) => p.featured).slice(0, 8);
  const bestSelling = state.products.filter((p) => p.bestSelling).slice(0, 8);
  const newest = state.products.filter((p) => p.isNew).slice(0, 8);

  return (
    <div className="space-y-24">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero opacity-90" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-14 md:px-6 md:py-24">
          <div>
            <Badge className="bg-foreground/10 text-foreground hover:bg-foreground/10">
              <Sparkles className="size-3.5" /> {t.badge}
            </Badge>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              {t.heroLine1} <br />
              {t.heroLine2Prefix}
              <span className="font-serif-italic text-rent">{t.rent}</span>
              {t.heroLine2Suffix}
            </h1>
            <p className="mt-5 max-w-lg text-base text-foreground/70 md:text-lg">
              {t.heroCopy}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-gradient-ink text-cream shadow-soft">
                <Link to="/browse">{t.shopCta} <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-foreground/20">
                <Link to="/browse" search={{ mode: "rent" } as never}>{t.browseCta}</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/70">
              <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-buy" /> {t.feat1}</li>
              <li className="flex items-center gap-2"><Truck className="size-4 text-buy" /> {t.feat2}</li>
              <li className="flex items-center gap-2"><RefreshCw className="size-4 text-buy" /> {t.feat3}</li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-rent opacity-20 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 shadow-elevated">
              <img
                src={heroImg}
                alt="Premium gadgets — headphones, camera, drone, smartwatch"
                width={1536}
                height={1152}
                className="w-full object-cover"
              />
              <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-2">
                <span className="rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
                  ★ 4.8 · 12,400+ reviews
                </span>
                <span className="rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
                  Free shipping over $50
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 reveal-on-scroll">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {t.shopByCategory}
            </h2>
            <p className="mt-2 text-muted-foreground">{t.shopByCategorySub}</p>
          </div>
          <Link to="/browse" className="hidden text-sm font-medium hover:underline md:inline-flex items-center gap-1">
            {t.viewAll} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              to="/browse"
              search={{ category: c.slug } as never}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-foreground hover:text-background"
            >
              <div className="text-xs text-muted-foreground group-hover:text-background/70">0{i + 1}</div>
              <div className="mt-8 font-display text-base font-semibold">{c.name}</div>
              <ArrowRight className="absolute bottom-4 right-4 size-4 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* PROMO CARDS */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 md:grid-cols-2 md:px-6 reveal-on-scroll">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-rent p-8 text-rent-foreground md:p-10">
          <div className="max-w-sm">
            <Badge className="bg-foreground/15 text-foreground hover:bg-foreground/15">Rent</Badge>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">{t.rentPromo}</h3>
            <p className="mt-2 text-foreground/80">{t.rentPromoCopy}</p>
            <Button asChild className="mt-5 bg-foreground text-background hover:opacity-90">
              <Link to="/browse" search={{ mode: "rent" } as never}>{t.browseRentals}</Link>
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-buy p-8 text-buy-foreground md:p-10">
          <div className="max-w-sm">
            <Badge className="bg-background/15 text-background hover:bg-background/15">Buy</Badge>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">{t.buyPromo}</h3>
            <p className="mt-2 text-background/85">{t.buyPromoCopy}</p>
            <Button asChild variant="secondary" className="mt-5">
              <Link to="/browse" search={{ mode: "buy" } as never}>{t.shopNow}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* RECOMMENDED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 reveal-on-scroll">
        <RecommendedProducts />
      </section>

      {/* TRENDING TABS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 reveal-on-scroll">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{t.trending}</h2>
          <Link to="/browse" className="text-sm font-medium hover:underline">{t.seeAll}</Link>
        </div>
        {isLoading ? (
          <div className="mt-6">
            <SkeletonCardGrid count={8} />
          </div>
        ) : (
          <Tabs defaultValue="new" className="mt-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="new">{t.tabNew}</TabsTrigger>
              <TabsTrigger value="best">{t.tabBest}</TabsTrigger>
              <TabsTrigger value="featured">{t.tabFeatured}</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="mt-6">
              <ProductGrid products={newest.length ? newest : featured} />
            </TabsContent>
            <TabsContent value="best" className="mt-6">
              <ProductGrid products={bestSelling} />
            </TabsContent>
            <TabsContent value="featured" className="mt-6">
              <ProductGrid products={featured} />
            </TabsContent>
          </Tabs>
        )}
      </section>
    </div>
  );
}

function ProductGrid({ products }: { products: React.ComponentProps<typeof ProductCard>["product"][] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
