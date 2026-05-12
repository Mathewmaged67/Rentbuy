import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  pricePerDay: number;
  deposit: number;
  defaultDays?: number;
  onChange?: (info: { days: number; total: number }) => void;
}

export function RentalCalculator({ pricePerDay, deposit, defaultDays = 3, onChange }: Props) {
  const [days, setDays] = React.useState(defaultDays);
  const base = pricePerDay * days;
  const total = base + deposit;

  React.useEffect(() => {
    onChange?.({ days, total });
  }, [days, total, onChange]);

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Rental period</div>
          <div className="text-xs text-muted-foreground">${pricePerDay} / day · ${deposit} deposit</div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="icon" variant="outline" onClick={() => setDays((d) => Math.max(1, d - 1))}>
            <Minus className="size-4" />
          </Button>
          <span className="w-10 text-center font-display text-lg font-semibold">{days}</span>
          <Button type="button" size="icon" variant="outline" onClick={() => setDays((d) => Math.min(60, d + 1))}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-background p-3">
          <dt className="text-xs text-muted-foreground">Base fee</dt>
          <dd className="mt-1 font-display font-semibold">${base.toFixed(0)}</dd>
        </div>
        <div className="rounded-lg bg-background p-3">
          <dt className="text-xs text-muted-foreground">Deposit</dt>
          <dd className="mt-1 font-display font-semibold">${deposit.toFixed(0)}</dd>
        </div>
        <div className="rounded-lg bg-gradient-rent p-3 text-rent-foreground">
          <dt className="text-xs opacity-80">Total</dt>
          <dd className="mt-1 font-display text-base font-bold">${total.toFixed(0)}</dd>
        </div>
      </dl>
    </div>
  );
}
