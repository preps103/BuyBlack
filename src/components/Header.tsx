"use client";

import { useState } from "react";
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
  const [accountOpen, setAccountOpen] = useState(false);
  const userLabel =
    user?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Account";

  const goHome = () => {
    setAccountOpen(false);
    onNavigate("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAccount = () => {
    if (!user) {
      onSignIn();
      return;
    }
    setAccountOpen((open) => !open);
  };

  return (
    <>
      <div
        className="goodos-topbar-widget__spacer"
        data-goodos-topbar-spacer
        aria-hidden="true"
      />
      <header
        className="goodos-topbar buyblack-topbar"
        data-goodos-topbar
      >
        <div
          className="goodos-topbar__identity"
          data-goodos-topbar-identity
        >
          <button
            type="button"
            className="goodos-topbar__brand"
            data-goodos-topbar-brand
            onClick={goHome}
            aria-label="BuyBlack marketplace home"
          >
            <span
              className="goodos-topbar__brand-mark buyblack-brand-mark"
              data-goodos-topbar-brand-mark
            >
              BB
            </span>
            <span className="buyblack-wordmark">
              <span className="buyblack-wordmark__name">
                Buy<span>Black</span>
              </span>
              <span className="buyblack-wordmark__tagline">
                Support. Discover. Prosper.
              </span>
            </span>
          </button>
          <button
            type="button"
            className="goodos-topbar__workspace"
            data-goodos-topbar-workspace
            onClick={() => onNavigate("home")}
          >
            Marketplace
          </button>
        </div>

        <label
          className="goodos-topbar__search"
          data-goodos-topbar-search
        >
          <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search shops, products, and categories…"
            aria-label="Search BuyBlack"
          />
          <kbd className="buyblack-search-shortcut">⌘ K</kbd>
        </label>

        <nav
          className="goodos-topbar__actions"
          data-goodos-topbar-actions
          aria-label="BuyBlack actions"
        >
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="goodos-topbar__action buyblack-action--mobile-hidden"
            data-goodos-topbar-action
            aria-current={activeView === "home" ? "page" : undefined}
          >
            <Home className="h-4 w-4" />
            Marketplace
          </button>
          <button
            type="button"
            onClick={onScrollToMap}
            className="goodos-topbar__action buyblack-action--mobile-hidden"
            data-goodos-topbar-action
          >
            <MapPin className="h-4 w-4" />
            States
          </button>
          <button
            type="button"
            onClick={() => (user ? onNavigate("admin") : onSignIn())}
            className="goodos-topbar__action buyblack-action--mobile-hidden"
            data-goodos-topbar-action
            aria-current={activeView === "admin" ? "page" : undefined}
          >
            <Store className="h-4 w-4" />
            Merchant Portal
          </button>
          <button
            type="button"
            onClick={onApply}
            className="goodos-topbar__action buyblack-action--primary"
            data-goodos-topbar-action
          >
            <Plus className="h-4 w-4" />
            <span>List Your Business</span>
          </button>
        </nav>

        <nav
          className="goodos-topbar__controls"
          data-goodos-topbar-controls
          aria-label="BuyBlack controls"
        >
          <button
            type="button"
            onClick={goHome}
            className="goodos-topbar__control"
            data-goodos-topbar-control="home"
            aria-label="Marketplace home"
            title="Marketplace home"
          >
            <Home className="h-[19px] w-[19px]" />
          </button>
          <button
            type="button"
            onClick={onScrollToCategories}
            className="goodos-topbar__control"
            data-goodos-topbar-control="categories"
            aria-label="Browse categories"
            title="Browse categories"
          >
            <Grid className="h-[19px] w-[19px]" />
          </button>
          <button
            type="button"
            onClick={onCartOpen}
            className="goodos-topbar__control relative"
            data-goodos-topbar-control="cart"
            aria-label={`Open cart with ${cartCount} items`}
            title="Shopping cart"
          >
            <ShoppingBag className="h-[19px] w-[19px]" />
            {cartCount > 0 && (
              <span className="goodos-topbar__notification-badge">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={openAccount}
              disabled={!authChecked}
              className="goodos-topbar__control buyblack-account"
              data-goodos-topbar-control="account"
              aria-label={user ? `${userLabel} account` : "Sign in"}
              aria-haspopup={user ? "menu" : undefined}
              aria-expanded={user ? accountOpen : undefined}
              title={user ? userLabel : "Sign in"}
            >
              {!authChecked ? (
                <Loader2 className="h-[19px] w-[19px] animate-spin" />
              ) : user ? (
                <span>{userLabel.slice(0, 1).toUpperCase()}</span>
              ) : (
                <LogIn className="h-[19px] w-[19px]" />
              )}
            </button>
            {user && accountOpen && (
              <div
                className="buyblack-account-menu"
                role="menu"
                aria-label="Account menu"
              >
                <div className="buyblack-account-menu__identity">
                  <strong>{userLabel}</strong>
                  <span>{user.email}</span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    onNavigate("admin");
                  }}
                >
                  <Store className="h-4 w-4" />
                  Merchant Portal
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    onSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
