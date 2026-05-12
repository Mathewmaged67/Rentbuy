import { Link } from "@tanstack/react-router";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useApp } from "@/store/app-store";

export function MobileBottomNav() {
  const { state } = useApp();
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/browse", label: "Browse", icon: Search },
    { to: "/dashboard", label: "Saved", icon: Heart, count: state.wishlist.length },
    { to: "/cart", label: "Cart", icon: ShoppingBag, count: state.cart.length },
    { to: state.role === "guest" ? "/auth" : "/dashboard", label: "Me", icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              to={it.to}
              className="relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              <it.icon className="size-5" />
              {it.label}
              {"count" in it && it.count ? (
                <span className="absolute right-4 top-1.5 grid size-4 place-items-center rounded-full bg-rent text-[10px] font-bold text-rent-foreground">
                  {it.count}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
