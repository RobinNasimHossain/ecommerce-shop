import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";

export function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-zinc-400" />
        <h1 className="mt-4 text-xl font-semibold">Sign in to view your cart</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Your cart is saved to your account.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/login"
            className="inline-flex h-10 items-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex h-10 items-center rounded-md border border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-100"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdate = async (itemId: number, quantity: number) => {
    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Failed to update", "error");
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await removeItem(itemId);
      toast.show("Removed from cart", "info");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Failed to remove", "error");
    }
  };

  if (loading && cart.items.length === 0) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500">Loading…</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-zinc-400" />
        <h1 className="mt-4 text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Browse the shop and add something you love.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const shipping = cart.subtotal >= 75 ? 0 : 7.99;
  const tax = +(cart.subtotal * 0.08).toFixed(2);
  const total = +(cart.subtotal + shipping + tax).toFixed(2);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Your cart</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {cart.items.map((item) => (
            <li key={item.id} className="flex gap-4 p-4">
              <Link
                to={`/products/${item.product.id}`}
                className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100"
              >
                {item.product.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      to={`/products/${item.product.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-xs uppercase tracking-wide text-zinc-400">
                      {item.product.category}
                    </p>
                  </div>
                  <span className="font-semibold text-zinc-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center overflow-hidden rounded-md border border-zinc-200">
                    <button
                      onClick={() => handleUpdate(item.id, Math.max(1, item.quantity - 1))}
                      className="grid h-8 w-8 place-items-center text-zinc-600 hover:bg-zinc-100"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      className="grid h-8 w-8 place-items-center text-zinc-600 hover:bg-zinc-100"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-600">
              <dt>Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-zinc-600">
              <dt>Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between text-zinc-600">
              <dt>Tax (estimated)</dt>
              <dd>{formatPrice(tax)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          {cart.subtotal < 75 && (
            <p className="mt-4 text-xs text-zinc-500">
              Add {formatPrice(75 - cart.subtotal)} more for free shipping.
            </p>
          )}
          <Link
            to="/checkout"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Checkout
          </Link>
          <Link
            to="/"
            className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-zinc-200 text-sm font-medium hover:bg-zinc-100"
          >
            Keep shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
