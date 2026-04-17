const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "shop.token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
};

export type User = {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type CartItem = {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  total: number;
  status: string;
  created_at: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  items: OrderItem[];
};

export type ShippingInfo = {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
};

export const api = {
  login: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, name: string, password: string) =>
    request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    }),
  me: () => request<User>("/api/auth/me"),

  listProducts: (params: { q?: string; category?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.category) search.set("category", params.category);
    const qs = search.toString();
    return request<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
  },
  listCategories: () => request<string[]>("/api/products/categories"),
  getProduct: (id: number) => request<Product>(`/api/products/${id}`),

  getCart: () => request<Cart>("/api/cart"),
  addToCart: (product_id: number, quantity = 1) =>
    request<Cart>("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id, quantity }),
    }),
  updateCartItem: (item_id: number, quantity: number) =>
    request<Cart>(`/api/cart/items/${item_id}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (item_id: number) =>
    request<Cart>(`/api/cart/items/${item_id}`, { method: "DELETE" }),
  clearCart: () => request<Cart>("/api/cart", { method: "DELETE" }),

  checkout: (shipping: ShippingInfo) =>
    request<Order>("/api/orders/checkout", {
      method: "POST",
      body: JSON.stringify(shipping),
    }),
  listOrders: () => request<Order[]>("/api/orders"),
  getOrder: (id: number) => request<Order>(`/api/orders/${id}`),
};
