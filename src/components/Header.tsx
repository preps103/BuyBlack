"use client";

import {
  Grid,
  Home,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Plus,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import type { AuthUser } from "../types";

type View = "home" | "admin" | "state_shops";

export default function Header({
  activeView,
  user,
  authChecked,
  searchQuery,
  cartCount,
  onNavigate,
  onApply,
  onSignIn,
  onSignOut,
  onSearchChange,
  onCartOpen,
  onScrollToMap,
  onScrollToCategories,
}: {
  activeView: View;
  user: AuthUser | null;
  authChecked: boolean;
  searchQuery: string;
  cartCount: number;
  onNavigate: (view: View) => void;
  onApply: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onSearchChange: (query: string) => void;
  onCartOpen: () => void;
  onScrollToMap: () => void;
  onScrollToCategories: () => void;
}) {
  const userLabel =
    user?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Account";

  return (
    <header className="sticky top-0 z-40 bg-bazaar-dark text-white shadow-xl">
      <div className="mx-auto flex min-h-20 max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="flex shrink-0 items-center gap-3 text-left"
          onClick={() => {
            onNavigate("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="BuyBlack home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded border-2 border-gold-base font-serif text-lg font-bold text-gold-base">
            BB
          </span>
          <span className="hidden flex-col sm:flex">
            <span className="font-serif text-[28px] font-bold leading-none">
              Buy<span className="font-sans font-extrabold text-gold-base">Black</span>
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gold-base">
              Support. Discover. Prosper.
            </span>
          </span>
        </button>

        <label className="relative hidden min-w-0 flex-1 lg:block">
          <span className="sr-only">Search BuyBlack</span>
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search verified shops and products"
            className="w-full rounded-full bg-white py-3 pl-12 pr-4 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-gold-base"
          />
        </label>

        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium text-gray-300 xl:flex">
          <button
            onClick={() => onNavigate("home")}
            className={activeView === "home" ? "text-white" : "hover:text-white"}
          >
            <span className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gold-base" /> Marketplace
            </span>
          </button>
          <button onClick={onScrollToMap} className="hover:text-white">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold-base" /> States
            </span>
          </button>
          <button onClick={onScrollToCategories} className="hover:text-white">
            <span className="flex items-center gap-2">
              <Grid className="h-4 w-4 text-gold-base" /> Categories
            </span>
          </button>
          <button
            onClick={() => (user ? onNavigate("admin") : onSignIn())}
            className={activeView === "admin" ? "text-white" : "hover:text-white"}
          >
            <span className="flex items-center gap-2">
              <Store className="h-4 w-4 text-gold-base" /> Merchant Portal
            </span>
          </button>
        </nav>

        <button
          type="button"
          onClick={onCartOpen}
          className="relative rounded-full border border-white/15 p-2.5 hover:border-gold-base"
          aria-label={`Open cart with ${cartCount} items`}
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rust px-1 text-[10px] font-black">
              {cartCount}
            </span>
          )}
        </button>

        {user ? (
          <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => onNavigate("admin")}
              className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold hover:bg-white/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-base text-xs font-black text-bazaar-dark">
                {userLabel.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-28 truncate 2xl:inline">{userLabel}</span>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full p-2 text-gray-300 hover:bg-white/10 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            disabled={!authChecked}
            className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-sm font-semibold hover:border-gold-base disabled:opacity-60"
          >
            {authChecked ? (
              <LogIn className="h-4 w-4 text-gold-base" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-gold-base" />
            )}
            <span className="hidden md:inline">Sign In</span>
          </button>
        )}

        <button
          type="button"
          onClick={onApply}
          className="flex items-center gap-2 rounded-full bg-rust px-4 py-2.5 text-sm font-semibold hover:bg-rust-dark"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">List Your Business</span>
        </button>
      </div>
    </header>
  );
}
