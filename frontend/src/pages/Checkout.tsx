import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { api, type ShippingInfo } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/Toast";

export function CheckoutPage() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<ShippingInfo>({
    shipping_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_zip: "",
    shipping_country: "United States",
  });
  const [submitting, setSubmitting] = useState(false);

  const shipping = cart.subtotal >= 75 ? 0 : 7.99;
  const tax = +(cart.subtotal * 0.08).toFixed(2);
  const total = +(cart.subtotal + shipping + tax).toFixed(2);

  const update = (key: keyof ShippingInfo, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      toast.show("Your cart is empty", "error");
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.checkout(form);
      await refresh();
      toast.show("Order placed!", "success");
      navigate(`/orders/${order.id}`);
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Checkout failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Keep shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>

      <form
        onSubmit={placeOrder}
        className="mt-6 grid gap-8 lg:grid-cols-[2fr_1fr]"
      >
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Shipping details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" className="sm:col-span-2">
              <input
                required
                value={form.shipping_name}
                onChange={(e) => update("shipping_name", e.target.value)}
                className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              />
            </Field>
            <Field label="Street address" className="sm:col-span-2">
              <input
                required
                value={form.shipping_address}
                onChange={(e) => update("shipping_address", e.target.value)}
                className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              />
            </Field>
            <Field label="City">
              <input
                required
                value={form.shipping_city}
                onChange={(e) => update("shipping_city", e.target.value)}
                className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              />
            </Field>
            <Field label="ZIP / Postal code">
              <input
                required
                value={form.shipping_zip}
                onChange={(e) => update("shipping_zip", e.target.value)}
                className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              />
            </Field>
            <Field label="Country" className="sm:col-span-2">
              <input
                required
                value={form.shipping_country}
                onChange={(e) => update("shipping_country", e.target.value)}
                className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              />
            </Field>
          </div>

          <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
            <p className="font-medium text-zinc-700">Demo payment</p>
            <p className="mt-1">
              This is a demo storefront. Placing an order does not charge a real
              card.
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 divide-y divide-zinc-200 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3">
                <span className="flex-1">
                  {item.product.name}
                  <span className="ml-1 text-zinc-500">× {item.quantity}</span>
                </span>
                <span>{formatPrice(item.product.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm">
            <div className="flex justify-between text-zinc-600">
              <dt>Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-zinc-600">
              <dt>Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between text-zinc-600">
              <dt>Tax</dt>
              <dd>{formatPrice(tax)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <span className="text-zinc-600">{label}</span>
      {children}
    </label>
  );
}
