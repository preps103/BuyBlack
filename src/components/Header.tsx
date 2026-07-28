/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Search,
  Home,
  MapPin,
  Grid,
  Store,
  Plus,
  Loader2,
  LogIn,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";

type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

const GOODOS_AUTH_ORIGIN = "";
const GOODOS_PUBLIC_ORIGIN = "https://base.goodos.app";

export default function Header({
  activeView,
  onNavigate,
  onApply,
  onScrollToMap,
  onScrollToCategories
}: {
  activeView: 'home' | 'admin' | 'state_shops',
  onNavigate: (view: 'home' | 'admin' | 'state_shops') => void,
  onApply: () => void,
  onScrollToMap?: () => void,
  onScrollToCategories?: () => void
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mfaUrl, setMfaUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingView, setPendingView] = useState<'admin' | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${GOODOS_AUTH_ORIGIN}/api/auth/me`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json();
        return data.user || null;
      })
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      setShowResults(true);
      
      // Simulate AJAX request
      fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          // Combine some dummy results with "Shop" items
          const items = data.products?.slice(0, 4).map((p: any) => ({
            type: 'product',
            name: p.title,
            desc: p.category,
            id: p.id
          })) || [];
          
          if (searchQuery.toLowerCase().includes('cof') || searchQuery.toLowerCase().includes('brew')) {
             items.unshift({ type: 'shop', name: 'Heritage Brew Coffee', desc: 'Food & Beverage in Oakland, CA' });
          }
          if (searchQuery.toLowerCase().includes('skincare') || searchQuery.toLowerCase().includes('zuri')) {
             items.unshift({ type: 'shop', name: 'Zuri & Co. Botanicals', desc: 'Beauty & Wellness in Harlem, NY' });
          }

          setSearchResults(items);
        })
        .finally(() => setIsSearching(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openLogin = (view: 'admin' | null = null) => {
    setPendingView(view);
    setAuthError("");
    setMfaUrl("");
    setIsAuthOpen(true);
  };

  const handleMerchantPortal = () => {
    if (user) {
      onNavigate('admin');
      return;
    }

    openLogin('admin');
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAuthenticating(true);
    setAuthError("");
    setMfaUrl("");

    try {
      const response = await fetch(`${GOODOS_AUTH_ORIGIN}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to sign in.");
      }

      if (data.mfa?.required) {
        setAuthError("Password verified. Complete GoodOS verification to continue.");
        setMfaUrl(data.mfa.enrollmentUrl || `${GOODOS_PUBLIC_ORIGIN}/mfa-enroll`);
        return;
      }

      setUser(data.user || null);
      setPassword("");
      setIsAuthOpen(false);

      if (pendingView === 'admin') {
        onNavigate('admin');
      }
      setPendingView(null);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${GOODOS_AUTH_ORIGIN}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    }).catch(() => null);

    setUser(null);
    if (activeView === 'admin') {
      onNavigate('home');
    }
  };

  const userLabel =
    user?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Account";
  const userInitial = userLabel.slice(0, 1).toUpperCase();

  return (
    <>
    <header className="sticky top-0 z-40 bg-bazaar-dark text-white shadow-xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          {/* Logo Mark */}
          <div className="relative w-10 h-10 flex items-center justify-center border-2 border-gold-base rounded flex-shrink-0">
            <span className="font-serif font-bold text-lg text-gold-base leading-none relative z-10 block -mt-0.5 ml-0.5">BB</span>
          </div>
          {/* Logo Text */}
          <div className="flex flex-col mb-1">
            <h1 className="font-serif text-[28px] font-bold text-white leading-none tracking-tight">
              Buy<span className="text-gold-base font-sans font-extrabold pb-1">Black</span>
            </h1>
            <p className="text-[8px] font-sans font-bold tracking-[0.2em] text-gold-base uppercase -mt-0.5">
              Support. Discover. Prosper.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden lg:block relative">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input
               type="text"
               placeholder="Search shops, products, categories, and more..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onFocus={() => { if (searchQuery.trim()) setShowResults(true); }}
               onBlur={() => setTimeout(() => setShowResults(false), 200)}
               className="w-full bg-white text-gray-900 placeholder:text-gray-500 rounded-full py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-gold-base transition-all"
             />
             {isSearching && (
               <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rust animate-spin" />
             )}
          </div>
          
          {/* Search Dropdown */}
          {showResults && ( searchResults.length > 0 || !isSearching ) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 z-50 text-gray-900">
              {isSearching ? (
                 <div className="p-4 text-center text-sm font-medium text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                 <ul className="py-2">
                   {searchResults.map((result, idx) => (
                     <li key={idx} className="px-5 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={() => { setSearchQuery(result.name); setShowResults(false); }}>
                       <div className="flex items-center justify-between">
                         <span className="font-bold text-sm">{result.name}</span>
                         <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{result.type}</span>
                       </div>
                       <div className="text-xs text-gray-500 mt-0.5">{result.desc}</div>
                     </li>
                   ))}
                 </ul>
              ) : (
                 <div className="p-4 text-center text-sm font-medium text-gray-500">No results found for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-6 shrink-0">
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-gray-300">
            <button 
              onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`flex items-center gap-2 hover:text-white transition-colors ${activeView === 'home' ? 'text-white' : ''}`}
            >
              <Home className="w-4 h-4 text-gold-base" /> Marketplace
            </button>
            <button onClick={onScrollToMap} className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <MapPin className="w-4 h-4 text-gold-base" /> Map
            </button>
            <button onClick={onScrollToCategories} className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Grid className="w-4 h-4 text-gold-base" /> Categories
            </button>
            <button 
              onClick={handleMerchantPortal}
              className={`flex items-center gap-2 hover:text-white transition-colors ${activeView === 'admin' ? 'text-white' : ''}`}
            >
              <Store className="w-4 h-4 text-gold-base" /> Merchant Portal
            </button>
          </nav>

          {user ? (
            <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold hover:bg-white/10 transition-colors"
                aria-label={`Open account for ${userLabel}`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-base text-xs font-black text-bazaar-dark">
                  {userInitial}
                </span>
                <span className="hidden 2xl:inline max-w-28 truncate">{userLabel}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full p-2 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Sign out of GoodOS"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openLogin()}
              disabled={!authChecked}
              className="flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-2.5 text-sm font-semibold text-white hover:border-gold-base/70 hover:bg-white/5 disabled:opacity-60 transition-colors"
            >
              {authChecked ? <LogIn className="h-4 w-4 text-gold-base" /> : <Loader2 className="h-4 w-4 animate-spin text-gold-base" />}
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
          
          <button 
            onClick={onApply}
            aria-label="List your business"
            className="flex items-center gap-2 bg-rust hover:bg-rust-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer"
          >
            <div className="bg-white/20 rounded-full p-0.5">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline">List Your Business</span>
          </button>
        </div>
      </div>
    </header>

    {isAuthOpen && (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-bazaar-dark/85 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goodos-login-title"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white text-gray-900 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setIsAuthOpen(false);
              setPendingView(null);
            }}
            className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Close sign-in dialog"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="border-b border-gray-100 bg-[#FAF8F5] px-8 pb-6 pt-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bazaar-dark text-lg font-black text-gold-base shadow-lg">
                G
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rust">GoodOS Account</p>
                <p className="font-serif text-xl font-bold">BuyBlack</p>
              </div>
            </div>
            <h2 id="goodos-login-title" className="font-serif text-3xl font-bold tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Use the same GoodOS account you use across your other applications.
            </p>
          </div>

          <form className="space-y-5 p-8" onSubmit={handleLogin}>
            {authError && (
              <div className="rounded-xl border border-rust/20 bg-rust/5 px-4 py-3 text-sm font-medium text-rust-dark" role="alert">
                {authError}
                {mfaUrl && (
                  <a
                    href={mfaUrl}
                    className="mt-2 flex items-center gap-2 font-bold underline underline-offset-4"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Continue verification in GoodOS
                  </a>
                )}
              </div>
            )}

            <div>
              <label htmlFor="goodos-email" className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Email
              </label>
              <input
                id="goodos-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-rust focus:ring-1 focus:ring-rust"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="goodos-password" className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Password
              </label>
              <input
                id="goodos-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-rust focus:ring-1 focus:ring-rust"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3.5 font-bold text-white shadow-md shadow-rust/20 transition-colors hover:bg-rust-dark disabled:cursor-wait disabled:opacity-70"
            >
              {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {isAuthenticating ? "Signing in…" : "Sign In with GoodOS"}
            </button>

            <p className="text-center text-xs leading-relaxed text-gray-500">
              Your BuyBlack session is secured by GoodOS authentication.
            </p>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
