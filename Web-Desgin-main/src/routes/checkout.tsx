// Checkout page — full cart checkout with form validation, success screen
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApp, type Order } from "@/store/app-store";
import { findProduct } from "@/data/products";
import { ShieldCheck, CheckCircle2, ShoppingBag, MapPin } from "lucide-react";
import { toast } from "sonner";
import { createOrder, initiatePayment } from "@/lib/api";

const EGYPT_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", 
  "Fayoum", "Gharbia", "Ismailia", "Menofia", "Minya", "Qaliubiya", 
  "New Valley", "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", 
  "Damietta", "Sharkia", "South Sinai", "Kafr Al Sheikh", "Matrouh", 
  "Luxor", "Qena", "North Sinai", "Sohag"
];

const GOVERNORATE_COORDS: Record<string, [number, number]> = {
  "Cairo": [30.0444, 31.2357],
  "Giza": [30.0131, 31.2089],
  "Alexandria": [31.2001, 29.9187],
  "Dakahlia": [31.0409, 31.3785],
  "Red Sea": [26.7292, 33.9365],
  "Beheira": [31.0364, 30.4611],
  "Fayoum": [29.3084, 30.8428],
  "Gharbia": [30.7865, 31.0004],
  "Ismailia": [30.5965, 32.2715],
  "Menofia": [30.5242, 30.9919],
  "Minya": [28.0991, 30.7503],
  "Qaliubiya": [30.4103, 31.1853],
  "New Valley": [24.5463, 27.1735],
  "Suez": [29.9668, 32.5498],
  "Aswan": [24.0889, 32.8998],
  "Assiut": [27.1783, 31.1859],
  "Beni Suef": [29.0744, 31.0979],
  "Port Said": [31.2565, 32.2841],
  "Damietta": [31.4165, 31.8133],
  "Sharkia": [30.7327, 31.7133],
  "South Sinai": [28.5063, 33.6697],
  "Kafr Al Sheikh": [31.1107, 30.9388],
  "Matrouh": [31.332, 27.2373],
  "Luxor": [25.6872, 32.6396],
  "Qena": [26.1551, 32.716],
  "North Sinai": [30.8525, 33.8225],
  "Sohag": [26.5591, 31.6957]
};


const CheckoutMap = React.lazy(() => import("@/components/checkout-map"));


export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — RentBuy" },
      { name: "description", content: "Complete your order." },
    ],
  }),
  component: CheckoutPage,
});

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  walletNumber?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  coupon?: string;
}



interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  walletNumber?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}


function validateForm(data: FormData, paymentMethod: string): FormErrors {
  const errors: FormErrors = {};
  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }
  if (!data.phone.trim() || !/^\+?[\d\s\-().]{7,20}$/.test(data.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!data.address.trim() || data.address.trim().length < 5) {
    errors.address = "Please enter a valid street address or pick from map.";
  }
  if (!data.city.trim()) {
    errors.city = "Please select your city.";
  }
  if (paymentMethod === "vodafone-cash") {
    if (!data.walletNumber?.trim() || !/^\d{11}$/.test(data.walletNumber.trim())) {
      errors.walletNumber = "Enter a valid 11-digit Vodafone Cash number.";
    }
  }
  if (paymentMethod === "visa") {
    if (!data.cardNumber?.trim() || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ""))) {
      errors.cardNumber = "Enter a valid 16-digit card number.";
    }
    if (!data.expiry?.trim() || !/^\d{2}\/\d{2}$/.test(data.expiry)) {
      errors.expiry = "Use MM/YY format.";
    }
    if (!data.cvv?.trim() || !/^\d{3}$/.test(data.cvv)) {
      errors.cvv = "3-digit CVV required.";
    }
  }
  return errors;
}

function CheckoutPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [payment, setPayment] = React.useState<"cod" | "visa" | "vodafone-cash">("visa");
  const [success, setSuccess] = React.useState<{ orderId: string } | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [position, setPosition] = React.useState<{ lat: number, lng: number } | null>(null);

  const [form, setForm] = React.useState<FormData>({
    fullName: state.user?.name ?? "",
    phone: "",
    address: "",
    city: "",
    walletNumber: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    coupon: "",
  });
  const [mapCenter, setMapCenter] = React.useState<[number, number] | null>(null);




  const handleLocationSelect = async (latlng: { lat: number, lng: number }) => {
    setPosition(latlng);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setField("address", data.display_name);
      }
    } catch (e) {
      console.error("Failed to reverse geocode", e);
    }
  };
  const [errors, setErrors] = React.useState<FormErrors>({});

  const items = state.cart
    .map((ci) => {
      // Search live store first, fall back to static list
      const p = findProduct(ci.productId, state.products);
      if (!p) return null;
      const subtotal =
        ci.type === "buy" ? p.price : p.rentPerDay * (ci.days ?? 1) + p.deposit;
      return { ci, p, subtotal };
    })
    .filter(Boolean) as {
    ci: (typeof state.cart)[0];
    p: NonNullable<ReturnType<typeof findProduct>>;
    subtotal: number;
  }[];

  const total = items.reduce((sum, x) => sum + x.subtotal, 0);

  // Empty cart state
  if (items.length === 0 && !success) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted">
          <ShoppingBag className="size-8 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your cart is empty. Add some items first.
        </p>
        <Button asChild className="mt-4">
          <Link to="/cart">Back to cart</Link>
        </Button>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-buy/15 text-buy">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold md:text-4xl">
          Order confirmed! 🎉
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your reference number is{" "}
          <span className="font-mono font-semibold text-foreground">{success.orderId}</span>.
          We'll get it packed and shipped to you soon.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/dashboard">View my orders</Link>
          </Button>
          <Button asChild className="bg-gradient-ink">
            <Link to="/browse">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));

    // Zoom map if city changes
    if (key === "city" && typeof value === "string" && GOVERNORATE_COORDS[value]) {
      setMapCenter(GOVERNORATE_COORDS[value]);
    }
  }


  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(form, payment);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the form errors before continuing.");
      return;
    }

    setSubmitting(true);

    try {
      let firstOrderId: number | string | null = null;
      
      // 1. Create orders on the backend
      for (const item of items) {
        const orderResult = await createOrder({
          productId: item.p.id,
          type: item.ci.type,
          days: item.ci.days,
          total: item.subtotal,
          payment: payment,
          coupon: form.coupon
        });
        if (!firstOrderId) firstOrderId = orderResult.id;
      }


      // 2. If online payment, initiate PayMob (Mocking Visa for now)
      if (payment === "vodafone-cash") {
        const payRes = await initiatePayment({
          orderId: firstOrderId!,
          paymentMethod: "wallet",
          walletNumber: form.walletNumber
        });
        if (payRes.url) {
          window.location.href = payRes.url;
          return;
        }
      } else if (payment === "visa") {
        // Mock success for Visa as requested
        toast.info("Visa test mode: Payment simulated successfully.");
        await new Promise(r => setTimeout(r, 1500));
      }


      // 3. If COD or success
      const orderId = "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      dispatch({ type: "CLEAR_CART" });
      setSuccess({ orderId });
    } catch (error: any) {
      toast.error(error.message || "Failed to process order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl font-semibold md:text-4xl">Checkout</h1>

      <form onSubmit={placeOrder} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* LEFT — shipping + payment */}
        <div className="space-y-6">
          {/* Shipping */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Shipping address</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Full name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="checkout-name">Full name *</Label>
                <Input
                  id="checkout-name"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  placeholder="Jane Smith"
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="checkout-phone">Phone number *</Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="+1 555 000 0000"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* City (Governorate) */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="checkout-city">City (Governorate) *</Label>
                <select
                  id="checkout-city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.city ? "border-destructive" : ""}`}
                >
                  <option value="" disabled>Select a governorate...</option>
                  {EGYPT_GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-xs text-destructive">{errors.city}</p>
                )}
              </div>

              {/* Map Picker */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Pick location on map (Optional)</Label>
                <div className="h-[200px] w-full overflow-hidden rounded-xl border border-border relative z-0">
                  {typeof window !== "undefined" && (
                    <React.Suspense fallback={<div className="flex h-full items-center justify-center bg-muted animate-pulse text-xs">Loading map...</div>}>
                      <CheckoutMap position={position} onLocationSelect={handleLocationSelect} center={mapCenter} />
                    </React.Suspense>
                  )}
                </div>

              </div>

              {/* Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="checkout-address">Street address *</Label>
                <Textarea
                  id="checkout-address"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="Or type your exact address here..."
                  rows={2}
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address}</p>
                )}
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Payment method</h2>
            <RadioGroup
              value={payment}
              onValueChange={(v) => setPayment(v as any)}
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              <Label
                htmlFor="pay-visa"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 hover:bg-muted"
              >
                <RadioGroupItem id="pay-visa" value="visa" /> Visa / Mastercard
              </Label>
              <Label
                htmlFor="pay-vodafone"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 hover:bg-muted"
              >
                <RadioGroupItem id="pay-vodafone" value="vodafone-cash" /> Vodafone Cash
              </Label>
              <Label
                htmlFor="pay-cod"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 hover:bg-muted"
              >
                <RadioGroupItem id="pay-cod" value="cod" /> Cash on delivery
              </Label>
            </RadioGroup>

            {payment === "visa" && (
              <div className="mt-5 space-y-4 rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-sm font-medium">Card Information (Test Mode)</div>
                <div className="space-y-1.5">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    value={form.cardNumber}
                    onChange={(e) => setField("cardNumber", e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className={errors.cardNumber ? "border-destructive bg-background" : "bg-background"}
                  />
                  {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
                    <Input
                      id="card-expiry"
                      value={form.expiry}
                      onChange={(e) => setField("expiry", e.target.value)}
                      placeholder="MM/YY"
                      className={errors.expiry ? "border-destructive bg-background" : "bg-background"}
                    />
                    {errors.expiry && <p className="text-xs text-destructive">{errors.expiry}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input
                      id="card-cvv"
                      value={form.cvv}
                      onChange={(e) => setField("cvv", e.target.value)}
                      placeholder="123"
                      maxLength={3}
                      className={errors.cvv ? "border-destructive bg-background" : "bg-background"}
                    />
                    {errors.cvv && <p className="text-xs text-destructive">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            )}

            {payment === "vodafone-cash" && (

              <div className="mt-5 space-y-3 rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-sm font-medium text-foreground">
                  رقم التحويل (Receiving Number): <span className="font-bold text-rent" dir="ltr">01060242799</span>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-wallet">Your Vodafone Cash Number *</Label>
                  <Input
                    id="checkout-wallet"
                    type="tel"
                    value={form.walletNumber}
                    onChange={(e) => setField("walletNumber", e.target.value)}
                    placeholder="010..."
                    className={errors.walletNumber ? "border-destructive bg-background" : "bg-background"}
                    dir="ltr"
                  />
                  {errors.walletNumber && (
                    <p className="text-xs text-destructive">{errors.walletNumber}</p>
                  )}
                </div>
              </div>
            )}

            {/* Coupon Code */}
            <div className="mt-5 space-y-1.5 rounded-xl border border-border bg-muted/40 p-4">
              <Label htmlFor="checkout-coupon">Do you have a coupon code?</Label>
              <div className="flex gap-2">
                <Input
                  id="checkout-coupon"
                  value={form.coupon}
                  onChange={(e) => setField("coupon", e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. HBD10)"
                  className="bg-background"
                />
              </div>
              {form.coupon === "HBD10" && (
                <p className="text-xs text-green-500 font-medium mt-1">🎉 10% Birthday Discount applied!</p>
              )}
            </div>
          </section>
        </div>


        {/* RIGHT — order summary */}
        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>

          <div className="space-y-3">
            {items.map(({ ci, p, subtotal }) => (
              <div key={ci.id} className="flex gap-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="size-16 shrink-0 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ci.type === "buy"
                      ? "Buy"
                      : `Rent · ${ci.days} days · $${p.deposit} deposit`}
                  </div>
                  <div className="mt-1 font-display font-semibold">${subtotal.toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-buy">Free</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-bold">${total.toFixed(0)}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-ink"
            size="lg"
            disabled={submitting}
          >
            {submitting ? "Placing order…" : "Place Order"}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-buy" /> Secure checkout · Refundable deposit
          </p>
        </aside>
      </form>
    </div>
  );
}
