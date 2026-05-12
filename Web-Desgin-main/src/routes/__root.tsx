import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AppProvider, useApp } from "@/store/app-store";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import { AIChatbot } from "@/components/ai-chatbot";
import * as React from "react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RentBuy — Buy or rent the best gadgets" },
      { name: "description", content: "RentBuy is a marketplace for premium electronics. Buy outright or rent by the day with deposit-protected checkout." },
      { name: "author", content: "RentBuy" },
      { property: "og:title", content: "RentBuy — Buy or rent the best gadgets" },
      { property: "og:description", content: "RentBuy is a marketplace for premium electronics. Buy outright or rent by the day with deposit-protected checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RentBuy — Buy or rent the best gadgets" },
      { name: "twitter:description", content: "RentBuy is a marketplace for premium electronics. Buy outright or rent by the day with deposit-protected checkout." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/820ad9d5-427d-4548-adcd-1448d842d243/id-preview-75145433--6b4915bf-46f7-4f9d-99dc-415920e43a6d.lovable.app-1777554439572.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/820ad9d5-427d-4548-adcd-1448d842d243/id-preview-75145433--6b4915bf-46f7-4f9d-99dc-415920e43a6d.lovable.app-1777554439572.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

// Separate inner component so it can access AppProvider context
function AppInner() {
  const { state } = useApp();
  const isAr = state.lang === "ar";

  // Apply RTL direction and lang attribute to document root
  React.useEffect(() => {
    document.documentElement.lang = isAr ? "ar" : "en";
    document.documentElement.dir = isAr ? "rtl" : "ltr";
  }, [isAr]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileBottomNav />
      <Toaster richColors position="top-right" />
      <AIChatbot />
    </div>
  );
}
