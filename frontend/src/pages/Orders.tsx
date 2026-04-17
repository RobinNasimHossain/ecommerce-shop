import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { api, type Order } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500">
        Loading orders…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Package className="mx-auto h-10 w-10 text-zinc-400" />
        <h1 className="mt-4 text-xl font-semibold">No orders yet</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Once you place an order, it will show up here.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Your orders</h1>
      <ul className="mt-6 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              to={`/orders/${order.id}`}
              className="flex flex-col gap-2 p-5 transition hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-zinc-900">Order #{order.id}</p>
                <p className="text-xs text-zinc-500">
                  {formatDate(order.created_at)} ·{" "}
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700">
                  {order.status}
                </span>
                <span className="font-semibold text-zinc-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
