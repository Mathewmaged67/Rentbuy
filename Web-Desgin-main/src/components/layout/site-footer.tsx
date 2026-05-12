import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-ink text-cream">
              <span className="font-display text-lg font-bold">R</span>
            </span>
            <span className="font-display text-lg font-semibold">
              Rent<span className="text-rent">Buy</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            <span className="font-serif-italic">A new way to own.</span> Buy the gadgets you love, or rent them only when you need them.
          </p>
          <div className="mt-5 flex items-center gap-3 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram className="size-5" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="size-5" /></a>
            <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="size-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/browse" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/browse" search={{ mode: "rent" } as never} className="hover:text-foreground">Rentals</Link></li>
            <li><Link to="/browse" search={{ mode: "buy" } as never} className="hover:text-foreground">For sale</Link></li>
            <li><Link to="/browse" search={{ status: "new" } as never} className="hover:text-foreground">New arrivals</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/blogs" className="hover:text-foreground">Journal</Link></li>
            <li><a href="#" className="hover:text-foreground">About</a></li>
            <li><a href="#" className="hover:text-foreground">Sellers</a></li>
            <li><a href="#" className="hover:text-foreground">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Shipping</a></li>
            <li><a href="#" className="hover:text-foreground">Returns</a></li>
            <li><a href="#" className="hover:text-foreground">Rental policy</a></li>
            <li><a href="#" className="hover:text-foreground">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} RentBuy Marketplace. Crafted with care.
      </div>
    </footer>
  );
}
