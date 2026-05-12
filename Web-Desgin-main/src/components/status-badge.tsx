import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/store/app-store";

const map: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-accent text-accent-foreground" },
  approved: { label: "Approved", className: "bg-buy text-buy-foreground" },
  rejected: { label: "Rejected", className: "bg-destructive text-destructive-foreground" },
  completed: { label: "Completed", className: "bg-muted text-foreground" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = map[status];
  return <Badge className={cfg.className + " hover:" + cfg.className}>{cfg.label}</Badge>;
}
