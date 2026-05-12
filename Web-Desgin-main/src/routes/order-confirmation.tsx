import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/store/app-store";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({ meta: [{ title: "Order confirmed — RentBuy" }] }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const state = useRouterState({ select: (s) => s.location.state }) as { order?: Order; productName?: string };
  const order = state?.order;

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-buy/15 text-buy">
        <CheckCircle2 className="size-9" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold md:text-4xl">Order confirmed</h1>
      <p className="mt-2 text-muted-foreground">
        Thanks for your order. {order ? `Your reference is ` : "Check your inbox for details."}
        {order && <span className="font-mono text-foreground">{order.id}</span>}.
      </p>

      {order && (
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-border bg-card p-5 text-left">
          <h2 className="font-display text-lg font-semibold">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Item</dt><dd className="font-medium">{state.productName}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Type</dt><dd className="capitalize">{order.type}{order.days ? ` · ${order.days}d` : ""}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Payment</dt><dd className="uppercase">{order.payment}</dd></div>
            <div className="flex justify-between border-t border-border pt-2"><dt>Total</dt><dd className="font-display text-lg font-bold">${order.total.toFixed(0)}</dd></div>
          </dl>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="outline"><Link to="/dashboard">View my orders</Link></Button>
        <Button asChild className="bg-gradient-ink"><Link to="/browse">Continue shopping</Link></Button>
      </div>
    </div>
  );
}
