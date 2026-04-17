import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { api, ApiError, type Product } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getProduct(Number(id))
      .then(setProduct)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!product) return;
    if (!user) {
      navigate("/login", { state: { from: `/products/${product.id}` } });
      return;
    }
    try {
      await addToCart(product.id, qty);
      toast.show(`Added ${qty} × "${product.name}" to cart`, "success");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Failed to add", "error");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-red-600">{error ?? "Product not found"}</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-zinc-400">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-zinc-900">
            {formatPrice(product.price)}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-zinc-600">
            {product.description}
          </p>

          <div className="mt-6 text-sm">
            <span
              className={
                product.stock > 0 ? "text-emerald-600" : "text-red-600"
              }
            >
              {product.stock > 0
                ? `In stock — ${product.stock} available`
                : "Out of stock"}
            </span>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center overflow-hidden rounded-md border border-zinc-200">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-10 w-10 place-items-center text-zinc-600 hover:bg-zinc-100"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-10 w-10 place-items-center text-zinc-600 hover:bg-zinc-100"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
