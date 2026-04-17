import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Package, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          <ShoppingBag className="h-6 w-6" />
          <span>Devin Shop</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-zinc-900" : "hover:text-zinc-900"
            }
            end
          >
            Shop
          </NavLink>
          {user && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? "text-zinc-900" : "hover:text-zinc-900"
              }
            >
              Orders
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/cart"
            className="relative inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/orders"
                className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 md:hidden"
              >
                <Package className="h-5 w-5" />
              </Link>
              <div className="hidden items-center gap-2 text-sm text-zinc-600 sm:flex">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex h-9 items-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
