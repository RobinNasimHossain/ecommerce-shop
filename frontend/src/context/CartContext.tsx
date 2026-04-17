import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type Cart } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type CartContextValue = {
  cart: Cart;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
  itemCount: number;
};

const emptyCart: Cart = { items: [], subtotal: 0 };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(emptyCart);
      return;
    }
    setLoading(true);
    try {
      const fresh = await api.getCart();
      setCart(fresh);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      const next = await api.addToCart(productId, quantity);
      setCart(next);
    },
    [],
  );

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    const next = await api.updateCartItem(itemId, quantity);
    setCart(next);
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    const next = await api.removeCartItem(itemId);
    setCart(next);
  }, []);

  const clear = useCallback(async () => {
    const next = await api.clearCart();
    setCart(next);
  }, []);

  const itemCount = useMemo(
    () => cart.items.reduce((sum, i) => sum + i.quantity, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      addToCart,
      updateItem,
      removeItem,
      clear,
      refresh,
      itemCount,
    }),
    [cart, loading, addToCart, updateItem, removeItem, clear, refresh, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
