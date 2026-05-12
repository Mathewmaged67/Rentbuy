// Site header — with SmartSearch, RTL/Arabic support, and live suggestions
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Heart, ShoppingBag, Sun, Moon, Globe, User, Menu, DollarSign } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SmartSearch } from "@/components/smart-search";
import { useApp } from "@/store/app-store";
import { useCurrency } from "@/hooks/useCurrency";
import { CATEGORIES } from "@/data/products";
import { cn } from "@/lib/utils";

// Arabic translations
const T = {
  en: {
    browse: "Browse",
    categories: "Categories",
    journal: "Journal",
    searchPlaceholder: "Search gadgets, brands, categories",
    home: "Home",
    signIn: "Sign in",
    createAccount: "Create account",
    dashboard: "Dashboard",
    switchRole: "Switch role (demo)",
    customer: "Customer Dashboard",
    seller: "Seller Dashboard",
    admin: "Admin Dashboard",
    signOut: "Sign out",
  },
  ar: {
    browse: "تصفح",
    categories: "التصنيفات",
    journal: "المجلة",
    searchPlaceholder: "ابحث عن أجهزة، ماركات، تصنيفات",
    home: "الرئيسية",
    signIn: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
    dashboard: "لوحة التحكم",
    switchRole: "تغيير الدور (تجريبي)",
    customer: "لوحة تحكم العميل",
    seller: "لوحة تحكم البائع",
    admin: "لوحة تحكم المشرف",
    signOut: "تسجيل الخروج",
  },
} as const;

export function SiteHeader() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  const lang = state.lang;
  const t = T[lang];
  const cartCount = state.cart.length;
  const wishCount = state.wishlist.length;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        {/* Mobile nav drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={lang === "ar" ? "right" : "left"} className="w-72">
            <nav className="mt-8 flex flex-col gap-1">
              <Link to="/" className="rounded-md px-3 py-2 hover:bg-muted">{t.home}</Link>
              <Link to="/browse" className="rounded-md px-3 py-2 hover:bg-muted">{t.browse}</Link>
              <Link to="/blogs" className="rounded-md px-3 py-2 hover:bg-muted">{t.journal}</Link>
              <div className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.categories}
              </div>
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to="/browse"
                  search={{ category: c.slug } as never}
                  className="rounded-md px-3 py-2 hover:bg-muted"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-ink text-cream">
            <span className="font-display text-lg font-bold">R</span>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Rent<span className="text-rent">Buy</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Link
            to="/browse"
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
              location.pathname.startsWith("/browse") && "bg-muted",
            )}
          >
            {t.browse}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
                {t.categories}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {CATEGORIES.map((c) => (
                <DropdownMenuItem
                  key={c.slug}
                  onClick={() => navigate({ to: "/browse", search: { category: c.slug } as never })}
                >
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            to="/blogs"
            className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {t.journal}
          </Link>
        </nav>

        {/* Smart Search — desktop */}
        <SmartSearch className="ml-auto hidden flex-1 max-w-md md:block" />

        {/* Action icons */}
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "TOGGLE_THEME" })}
            aria-label="Toggle theme"
          >
            {state.theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          {/* Currency switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="font-medium text-xs px-2">
                {currency}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableCurrencies.map(c => (
                <DropdownMenuItem key={c} onClick={() => setCurrency(c)}>
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Language">
                <Globe className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => dispatch({ type: "SET_LANG", lang: "en" })}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch({ type: "SET_LANG", lang: "ar" })}>
                العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wishlist */}
          <Link to="/dashboard" search={{ tab: "wishlist" } as never}>
            <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
              <Heart className="size-5" />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-rent text-[10px] font-bold text-rent-foreground">
                  {wishCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Cart */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-buy text-[10px] font-bold text-buy-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {state.role === "guest" ? (
                <>
                  <DropdownMenuItem onClick={() => navigate({ to: "/auth" })}>
                    {t.signIn}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/auth", search: { mode: "register" } as never })}
                  >
                    {t.createAccount}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Signed in as{" "}
                    <span className="font-semibold text-foreground">{state.user?.name}</span>
                    <div className="mt-0.5 capitalize">{state.role}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      dispatch({
                        type: "SET_ROLE",
                        role: "customer",
                        user: state.user ?? { name: "Demo Customer", email: "demo@rentbuy.app" },
                      });
                      navigate({ to: "/dashboard" });
                    }}
                  >
                    {t.customer}
                  </DropdownMenuItem>
                  {state.user?.email && ['mosab@gmail.com', 'dawy@gmail.com', 'sohja@gmail.com'].includes(state.user.email) && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          dispatch({
                            type: "SET_ROLE",
                            role: "seller",
                            user: state.user ?? { name: "Demo Seller", email: "seller@rentbuy.app" },
                          });
                          navigate({ to: "/dashboard/seller" });
                        }}
                      >
                        {t.seller}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          dispatch({
                            type: "SET_ROLE",
                            role: "admin",
                            user: state.user ?? { name: "Demo Admin", email: "admin@rentbuy.app" },
                          });
                          navigate({ to: "/dashboard/admin" });
                        }}
                      >
                        {t.admin}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    dispatch({ type: "LOGOUT" });
                    navigate({ to: "/auth" });
                  }}>
                    {t.signOut}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
