import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { api, type Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          api.listProducts(),
          api.listCategories(),
        ]);
        if (!cancelled) {
          setProducts(prods);
          setCategories(cats);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeCategory === "all" || p.category === activeCategory;
      const matchesQuery =
        !query || p.name.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [products, activeCategory, query]);

  const handleAdd = async (product: Product) => {
    if (!user) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.show(`Added "${product.name}" to cart`, "success");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Failed to add", "error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-14 text-white sm:px-12">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Curated goods, delivered quickly
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Everyday essentials, thoughtfully designed.
          </h1>
          <p className="mt-4 text-base text-zinc-300 sm:text-lg">
            Discover a small, carefully selected catalog of items for your desk,
            your home, and the road.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
      </section>

      <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <CategoryChip
            active={activeCategory === "all"}
            label="All"
            onClick={() => setActiveCategory("all")}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c}
              active={activeCategory === c}
              label={c}
              onClick={() => setActiveCategory(c)}
            />
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
          />
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500">
            No products match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-9 rounded-full px-4 text-sm font-medium capitalize transition ${
        active
          ? "bg-zinc-900 text-white"
          : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}
