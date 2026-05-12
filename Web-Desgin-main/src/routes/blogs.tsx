import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "Journal — RentBuy" },
      { name: "description", content: "Decision guides, reviews, and care tips for premium electronics." },
      { property: "og:title", content: "Journal — RentBuy" },
      { property: "og:description", content: "Decision guides, reviews, and care tips for premium electronics." },
    ],
  }),
  component: BlogsPage,
});

const POSTS = [
  { id: 1, tag: "Decision Guide", title: "Buy or rent? A simple framework for your next gadget", excerpt: "Three questions that tell you exactly which path makes the most sense — and the most cents.", read: "5 min read" },
  { id: 2, tag: "Review", title: "Aurora Pro vs. Lumen X1 — which travel kit wins?", excerpt: "Two flagship pieces, one trip. We took both for a week and tracked everything.", read: "8 min read" },
  { id: 3, tag: "Care", title: "Make your headphones last twice as long", excerpt: "Battery hygiene, ear-cup care, and the firmware updates most people skip.", read: "4 min read" },
  { id: 4, tag: "Decision Guide", title: "Renting drones for a one-off shoot: the smart way", excerpt: "Insurance, deposits, and the gear you actually need — versus what looks cool on paper.", read: "6 min read" },
  { id: 5, tag: "Inside RentBuy", title: "How we vet every seller on our marketplace", excerpt: "A peek behind the curtain at our seller onboarding and quality checks.", read: "3 min read" },
  { id: 6, tag: "Review", title: "Mira VR — comfort tested over 30 hours", excerpt: "Pancake lenses, balanced strap, and the games that justify the headset.", read: "7 min read" },
];

function BlogsPage() {
  const [hero, ...rest] = POSTS;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <BookOpen className="size-4" /> The RentBuy Journal
      </div>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        Stories, reviews, and <span className="font-serif-italic text-rent">how-to</span>.
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">A marketing content hub with decision guides, reviews, and care tips written by people who actually use the gear.</p>

      <article className="mt-10 grid grid-cols-1 gap-6 rounded-3xl border border-border bg-gradient-rent p-8 text-rent-foreground md:grid-cols-2 md:p-10">
        <div>
          <span className="rounded-full bg-foreground/15 px-3 py-1 text-xs font-medium">Featured · {hero.tag}</span>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-4xl">{hero.title}</h2>
          <p className="mt-3 text-foreground/85">{hero.excerpt}</p>
          <Link to="/blogs" className="mt-5 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
            Read article <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="hidden items-center justify-center md:flex">
          <div className="font-serif-italic text-7xl text-foreground/30">RentBuy</div>
        </div>
      </article>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <article key={p.id} className="group flex flex-col rounded-2xl border border-border bg-card p-6 hover-elevate">
            <span className="text-xs font-semibold uppercase tracking-wide text-rent">{p.tag}</span>
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{p.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.excerpt}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{p.read}</span>
              <ArrowRight className="size-4 -translate-x-1 transition group-hover:translate-x-0" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
