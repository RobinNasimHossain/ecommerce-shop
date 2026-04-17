import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { api, type Order } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getOrder(Number(id))
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500">Loading…</div>;
  }
  if (error || !order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-red-600">{error ?? "Order not found"}</p>
        <Link to="/orders" className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Thanks for your order!
            </h1>
            <p className="mt-1 text-sm text-emerald-800">
              Order #{order.id} · placed {formatDate(order.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-zinc-200 bg-white">
          <h2 className="border-b border-zinc-200 px-6 py-4 text-lg font-semibold">
            Items
          </h2>
          <ul className="divide-y divide-zinc-200">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-zinc-900">{item.product_name}</p>
                  <p className="text-sm text-zinc-500">Qty {item.quantity}</p>
                </div>
                <span className="font-semibold text-zinc-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-zinc-900">Shipping to</h3>
            <div className="mt-2 text-sm text-zinc-600">
              <p>{order.shipping_name}</p>
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_zip}
              </p>
              <p>{order.shipping_country}</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-zinc-900">Order total</h3>
            <p className="mt-2 text-2xl font-bold text-zinc-900">
              {formatPrice(order.total)}
            </p>
            <p className="mt-1 text-xs capitalize text-emerald-700">
              Status: {order.status}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
