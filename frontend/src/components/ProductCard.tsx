import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/api";

type Props = {
  product: Product;
  onAdd?: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: Props) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block aspect-square overflow-hidden bg-zinc-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {product.category}
        </span>
        <Link
          to={`/products/${product.id}`}
          className="text-base font-semibold text-zinc-900 line-clamp-1 hover:underline"
        >
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-zinc-500">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold text-zinc-900">
            {formatPrice(product.price)}
          </span>
          {onAdd && (
            <button
              onClick={() => onAdd(product)}
              className="inline-flex h-9 items-center gap-1 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
