"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  ThumbsUp,
  X,
} from "lucide-react";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import AdminDashboard from "./components/AdminDashboard";
import StateShopsView from "./components/StateShopsView";
import { apiRequest, money } from "./api";
import type {
  AuthUser,
  Business,
  CartItem,
  CatalogData,
  Order,
  Product,
  Review,
} from "./types";

const GOODOS_AUTH_ORIGIN = "";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const emptyCatalog: CatalogData = {
  businesses: [],
  products: [],
  reviews: [],
  states: [],
  categories: [],
  stats: { businesses: 0, states: 0, products: 0, reviews: 0 },
  payments: {
    stripe: {
      provider: "stripe",
      label: "Credit or debit card",
      configured: false,
      webhooksConfigured: false,
      mode: "test",
    },
    paypal: {
      provider: "paypal",
      label: "PayPal",
      configured: false,
      webhooksConfigured: false,
      mode: "sandbox",
    },
  },
};

type View = "home" | "admin" | "state_shops";
type PendingAction = "apply" | "review" | "admin" | null;

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-bazaar-dark/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 text-gray-500 hover:text-gray-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="border-b border-gray-100 bg-[#FAF8F5] px-8 pb-6 pt-8">
          <h2 className="font-serif text-3xl font-bold">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function ShopCard({
  business,
  product,
  onSelect,
  onAdd,
}: {
  business: Business;
  product?: Product;
  onSelect: () => void;
  onAdd: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <button
        type="button"
        onClick={onSelect}
        className="block h-52 w-full bg-warm-gray text-left"
      >
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center">
            <Store className="h-14 w-14 text-gold-dark" />
          </span>
        )}
      </button>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold">{business.name}</h3>
            <p className="mt-1 text-xs text-gray-500">{business.category}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        </div>
        <p className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" /> {business.location}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {business.description}
        </p>
        <p className="mt-4 flex items-center gap-1 text-sm font-bold">
          <Star className="h-4 w-4 fill-gold-base text-gold-base" />
          {business.reviewCount
            ? `${business.rating.toFixed(1)} (${business.reviewCount})`
            : "New to BuyBlack"}
        </p>
        {product && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{product.name}</p>
              <p className="text-xs font-black text-rust">
                {money(product.priceCents, product.currency)}
              </p>
            </div>
            <button
              type="button"
              onClick={onAdd}
              disabled={product.inventoryCount !== null && product.inventoryCount < 1}
              className="rounded-lg bg-bazaar-dark p-2.5 text-white disabled:cursor-not-allowed disabled:opacity-45"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={onSelect}
          className="mt-5 w-full rounded-xl bg-rust py-3 text-sm font-bold text-white hover:bg-rust-dark"
        >
          View shop
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("home");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [catalog, setCatalog] = useState<CatalogData>(emptyCatalog);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [working, setWorking] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [checkoutProvider, setCheckoutProvider] = useState<"stripe" | "paypal">(
    "stripe",
  );

  const statesRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const shopsRef = useRef<HTMLElement>(null);

  const loadSession = useCallback(async () => {
    try {
      const session = await apiRequest<{ user: AuthUser | null }>(
        "/api/marketplace/session",
      );
      setUser(session.user);
      return session.user;
    } finally {
      setAuthChecked(true);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError("");
    try {
      setCatalog(
        await apiRequest<CatalogData>("/api/marketplace/catalog"),
      );
    } catch (requestError) {
      setCatalogError(
        requestError instanceof Error
          ? requestError.message
          : "The marketplace could not be loaded.",
      );
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.all([loadSession(), loadCatalog()]);
  }, [loadCatalog, loadSession]);

  useEffect(() => {
    const timer = toast ? window.setTimeout(() => setToast(""), 5000) : 0;
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [toast]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const checkout = url.searchParams.get("checkout");
    const orderId = url.searchParams.get("order");
    if (!checkout || !orderId) return;

    const resolveCheckout = async () => {
      setWorking("checkout-return");
      try {
        if (checkout === "cancelled") {
          setToast("Checkout was cancelled. Your cart is still available.");
          return;
        }

        let order: Order;
        if (
          checkout === "success" &&
          url.searchParams.get("provider") === "paypal" &&
          url.searchParams.get("token")
        ) {
          const result = await apiRequest<{ order: Order }>(
            "/api/marketplace/paypal/capture",
            {
              method: "POST",
              body: JSON.stringify({
                orderId,
                providerOrderId: url.searchParams.get("token"),
              }),
            },
          );
          order = result.order;
        } else {
          const sessionId = url.searchParams.get("session_id");
          const result = await apiRequest<{ order: Order }>(
            `/api/marketplace/orders/${encodeURIComponent(orderId)}${
              sessionId
                ? `?session_id=${encodeURIComponent(sessionId)}`
                : ""
            }`,
          );
          order = result.order;
        }

        if (order.status === "paid") {
          setCart([]);
          setToast("Payment confirmed. Your order is complete.");
          void loadCatalog();
        } else {
          setToast(`Order status: ${order.status}.`);
        }
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Order status could not be confirmed.",
        );
      } finally {
        url.search = "";
        window.history.replaceState({}, "", url.toString());
        setWorking("");
      }
    };

    void resolveCheckout();
  }, [loadCatalog]);

  const visibleBusinesses = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return catalog.businesses.filter(
      (business) =>
        !needle ||
        business.name.toLowerCase().includes(needle) ||
        business.category.toLowerCase().includes(needle) ||
        business.description.toLowerCase().includes(needle) ||
        catalog.products.some(
          (product) =>
            product.businessId === business.id &&
            product.name.toLowerCase().includes(needle),
        ),
    );
  }, [catalog.businesses, catalog.products, searchQuery]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    setActiveView("home");
    window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const requireAuth = (action: Exclude<PendingAction, null>) => {
    if (user) {
      if (action === "apply") setApplicationOpen(true);
      if (action === "review") setReviewOpen(true);
      if (action === "admin") setActiveView("admin");
      return;
    }
    setPendingAction(action);
    setAuthOpen(true);
  };

  const afterAuthentication = async () => {
    const authenticatedUser = await loadSession();
    if (!authenticatedUser) throw new Error("GoodOS session was not established.");
    if (pendingAction === "apply") setApplicationOpen(true);
    if (pendingAction === "review") setReviewOpen(true);
    if (pendingAction === "admin") setActiveView("admin");
    setPendingAction(null);
  };

  const signOut = async () => {
    await fetch(`${GOODOS_AUTH_ORIGIN}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    }).catch(() => undefined);
    setUser(null);
    setActiveView("home");
    setToast("You are signed out.");
  };

  const addToCart = (product: Product, business: Business) => {
    setError("");
    const inventoryLimit = Math.min(product.inventoryCount ?? 25, 25);
    const currentQuantity =
      cart.find((item) => item.product.id === product.id)?.quantity || 0;
    if (inventoryLimit < 1) {
      setError(`${product.name} is sold out.`);
      return;
    }
    if (currentQuantity >= inventoryLimit) {
      setError(`Only ${inventoryLimit} ${product.name} available per order.`);
      return;
    }
    if (cart.length && cart[0].business.id !== business.id) {
      setError(
        "Checkout supports one merchant at a time. Complete or clear the current cart first.",
      );
      setCartOpen(true);
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { product, business, quantity: 1 }];
    });
    setToast(`${product.name} added to your cart.`);
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.min(
                  Math.min(item.product.inventoryCount ?? 25, 25),
                  Math.max(0, item.quantity + change),
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const submitApplication = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setWorking("application");
    setError("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const result = await apiRequest<{ business: Business }>(
        "/api/marketplace/applications",
        {
          method: "POST",
          body: JSON.stringify(values),
        },
      );
      setApplicationOpen(false);
      setToast(
        `${result.business.name} was submitted for verification. Track it in the Merchant Portal.`,
      );
      await loadCatalog();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Application could not be submitted.",
      );
    } finally {
      setWorking("");
    }
  };

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking("review");
    setError("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      await apiRequest<{ review: Review }>("/api/marketplace/reviews", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setReviewOpen(false);
      setToast("Your review is now live.");
      await loadCatalog();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Review could not be submitted.",
      );
    } finally {
      setWorking("");
    }
  };

  const markHelpful = async (review: Review) => {
    if (!user) {
      requireAuth("review");
      return;
    }
    try {
      const result = await apiRequest<{
        helpful: boolean;
        helpfulCount: number;
      }>(`/api/marketplace/reviews/${review.id}/helpful`, {
        method: "POST",
      });
      setCatalog((current) => ({
        ...current,
        reviews: current.reviews.map((item) =>
          item.id === review.id
            ? { ...item, helpfulCount: result.helpfulCount }
            : item,
        ),
      }));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Helpful vote could not be saved.",
      );
    }
  };

  const shareBusiness = async (business: Business) => {
    const url = `${window.location.origin}/?shop=${encodeURIComponent(
      business.slug,
    )}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: business.name,
          text: business.description,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setToast("Shop link copied.");
      }
    } catch {
      // User cancellation is not an application error.
    }
  };

  const beginCheckout = async () => {
    if (!cart.length) return;
    const readiness = catalog.payments[checkoutProvider];
    if (!readiness.configured || !readiness.webhooksConfigured) {
      setError(
        `${checkoutProvider === "stripe" ? "Card checkout" : "PayPal"} needs credentials and a verified webhook before it can accept payments.`,
      );
      return;
    }

    setWorking("checkout");
    setError("");
    try {
      const result = await apiRequest<{
        orderId: string;
        checkoutUrl: string;
      }>("/api/marketplace/checkout", {
        method: "POST",
        body: JSON.stringify({
          provider: checkoutProvider,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
      window.location.assign(result.checkoutUrl);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Checkout could not be started.",
      );
      setWorking("");
    }
  };

  if (activeView === "admin" && user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-gray-900">
        <Header
          activeView={activeView}
          user={user}
          authChecked={authChecked}
          searchQuery={searchQuery}
          cartCount={cartCount}
          onNavigate={setActiveView}
          onApply={() => requireAuth("apply")}
          onSignIn={() => setAuthOpen(true)}
          onSignOut={() => void signOut()}
          onSearchChange={setSearchQuery}
          onCartOpen={() => setCartOpen(true)}
          onScrollToMap={() => scrollTo(statesRef)}
          onScrollToCategories={() => scrollTo(categoriesRef)}
        />
        <AdminDashboard onCatalogChanged={loadCatalog} />
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onAuthenticated={afterAuthentication}
        />
      </div>
    );
  }

  if (activeView === "state_shops") {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-gray-900">
        <Header
          activeView={activeView}
          user={user}
          authChecked={authChecked}
          searchQuery={searchQuery}
          cartCount={cartCount}
          onNavigate={setActiveView}
          onApply={() => requireAuth("apply")}
          onSignIn={() => setAuthOpen(true)}
          onSignOut={() => void signOut()}
          onSearchChange={setSearchQuery}
          onCartOpen={() => setCartOpen(true)}
          onScrollToMap={() => setActiveView("home")}
          onScrollToCategories={() => setActiveView("home")}
        />
        <StateShopsView
          businesses={catalog.businesses}
          products={catalog.products}
          initialState={selectedState}
          query={searchQuery}
          onBack={() => setActiveView("home")}
          onSelectShop={setSelectedBusiness}
          onAddToCart={addToCart}
        />
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onAuthenticated={afterAuthentication}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900">
      <Header
        activeView={activeView}
        user={user}
        authChecked={authChecked}
        searchQuery={searchQuery}
        cartCount={cartCount}
        onNavigate={(view) =>
          view === "admin" ? requireAuth("admin") : setActiveView(view)
        }
        onApply={() => requireAuth("apply")}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={() => void signOut()}
        onSearchChange={(query) => {
          setSearchQuery(query);
          if (query.trim()) scrollTo(shopsRef);
        }}
        onCartOpen={() => setCartOpen(true)}
        onScrollToMap={() => scrollTo(statesRef)}
        onScrollToCategories={() => scrollTo(categoriesRef)}
      />

      {(toast || error) && (
        <div
          className={`fixed right-4 top-24 z-[100] max-w-sm rounded-2xl border px-5 py-4 text-sm font-semibold shadow-xl ${
            error
              ? "border-rust/20 bg-white text-rust-dark"
              : "border-green-200 bg-white text-green-800"
          }`}
          role="status"
        >
          <div className="flex items-start gap-3">
            {error ? (
              <X className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{error || toast}</span>
            <button
              type="button"
              onClick={() => {
                setError("");
                setToast("");
              }}
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden border-b border-gray-100 bg-[#FDFCFB]">
        <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-rust/10" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gold-light/15" />
        <div className="relative mx-auto grid min-h-[650px] max-w-[1400px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-rust/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-rust">
              <ShieldCheck className="h-4 w-4" />
              Verified Black-owned marketplace
            </span>
            <h1 className="mt-7 max-w-3xl font-serif text-6xl font-bold leading-[0.98] tracking-tight md:text-7xl">
              Discover Black-Owned{" "}
              <span className="text-rust">shops you can support today.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-600">
              Search verified businesses, buy their products, share trusted
              reviews, and help local Black entrepreneurship grow.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => scrollTo(shopsRef)}
                className="flex items-center gap-2 rounded-full bg-rust px-8 py-3.5 font-bold text-white shadow-lg shadow-rust/20 hover:bg-rust-dark"
              >
                Explore shops <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => requireAuth("apply")}
                className="rounded-full border-2 border-gray-200 bg-white px-8 py-3.5 font-bold text-gray-700"
              >
                List your business
              </button>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Verified shops", catalog.stats.businesses],
                ["States served", catalog.stats.states],
                ["Live products", catalog.stats.products],
                ["Customer reviews", catalog.stats.reviews],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="font-serif text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[500px] lg:block">
            <div className="absolute inset-12 rounded-[3rem] bg-bazaar-dark shadow-2xl" />
            <div className="absolute left-0 top-20 w-72 rotate-[-5deg] overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="flex h-52 items-center justify-center bg-rust/10">
                <Store className="h-16 w-16 text-rust" />
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-wider text-rust">
                  Verified merchants
                </p>
                <p className="mt-2 font-serif text-2xl font-bold">
                  Build a trusted storefront
                </p>
              </div>
            </div>
            <div className="absolute bottom-8 right-0 w-72 rotate-3 overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="flex h-52 items-center justify-center bg-gold-light/30">
                <ShoppingBag className="h-16 w-16 text-gold-dark" />
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-wider text-gold-dark">
                  Secure checkout
                </p>
                <p className="mt-2 font-serif text-2xl font-bold">
                  Pay by card or PayPal
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={shopsRef} className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-rust">
                Live catalog
              </p>
              <h2 className="mt-2 font-serif text-4xl font-bold">
                Verified businesses
              </h2>
              <p className="mt-2 text-gray-600">
                Results come directly from approved merchant records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView("state_shops")}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold"
            >
              Browse directory <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {catalogLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-rust" />
            </div>
          ) : catalogError ? (
            <div className="mt-8 rounded-3xl border border-rust/20 bg-rust/5 p-10 text-center">
              <p className="font-bold text-rust-dark">{catalogError}</p>
              <button
                type="button"
                onClick={() => void loadCatalog()}
                className="mt-5 rounded-full bg-rust px-6 py-3 font-bold text-white"
              >
                Retry marketplace
              </button>
            </div>
          ) : visibleBusinesses.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
              <Store className="mx-auto h-12 w-12 text-gold-dark" />
              <h3 className="mt-4 font-serif text-3xl font-bold">
                {searchQuery ? "No matching businesses" : "Founding merchants wanted"}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-gray-600">
                {searchQuery
                  ? "Try another search or clear the search box."
                  : "The directory opens with verified merchant records—not sample listings. Submit the first business for review."}
              </p>
              <button
                type="button"
                onClick={() =>
                  searchQuery ? setSearchQuery("") : requireAuth("apply")
                }
                className="mt-6 rounded-full bg-rust px-7 py-3 font-bold text-white"
              >
                {searchQuery ? "Clear search" : "Apply for verification"}
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleBusinesses.slice(0, 6).map((business) => {
                const product = catalog.products.find(
                  (item) => item.businessId === business.id,
                );
                return (
                  <ShopCard
                    key={business.id}
                    business={business}
                    product={product}
                    onSelect={() => setSelectedBusiness(business)}
                    onAdd={() => product && addToCart(product, business)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section
        ref={statesRef}
        className="scroll-mt-24 border-y border-gray-100 bg-warm-gray/40 py-20"
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rust">
            Shop by location
          </p>
          <h2 className="mt-2 font-serif text-4xl font-bold">
            Verified businesses by state
          </h2>
          {catalog.states.length === 0 ? (
            <p className="mt-5 text-gray-600">
              States will appear as businesses complete verification.
            </p>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              {catalog.states.map((state) => (
                <button
                  type="button"
                  key={state}
                  onClick={() => {
                    setSelectedState(state);
                    setActiveView("state_shops");
                  }}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold hover:border-rust hover:text-rust"
                >
                  <MapPin className="h-4 w-4" /> {state}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section ref={categoriesRef} className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rust">
            Shop by category
          </p>
          <h2 className="mt-2 font-serif text-4xl font-bold">
            Find what you need
          </h2>
          {catalog.categories.length === 0 ? (
            <p className="mt-5 text-gray-600">
              Categories are generated from verified business applications.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {catalog.categories.map((category, index) => {
                const colors = [
                  "bg-rust",
                  "bg-[#1C8276]",
                  "bg-[#6B4B8B]",
                  "bg-[#1F5490]",
                ];
                return (
                  <button
                    type="button"
                    key={category}
                    onClick={() => {
                      setSearchQuery(category);
                      scrollTo(shopsRef);
                    }}
                    className={`rounded-2xl p-6 text-left text-white ${
                      colors[index % colors.length]
                    }`}
                  >
                    <Store className="h-8 w-8" />
                    <p className="mt-8 font-serif text-2xl font-bold">
                      {category}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-bazaar-dark py-20 text-white">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gold-base">
              Merchant launch program
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-5xl font-bold">
              Put your business in front of customers ready to buy.
            </h2>
            <p className="mt-5 max-w-2xl text-gray-300">
              Apply for verification, publish products, track orders, and choose
              card or PayPal checkout from one merchant portal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => requireAuth("apply")}
            className="rounded-full bg-rust px-8 py-4 font-bold text-white"
          >
            List your business
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>© 2026 BuyBlack. Built on GoodOS.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => requireAuth("review")} className="font-bold">
              Write a review
            </button>
            <button onClick={() => requireAuth("admin")} className="font-bold">
              Merchant Portal
            </button>
          </div>
        </div>
      </footer>

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingAction(null);
        }}
        onAuthenticated={afterAuthentication}
      />

      {applicationOpen && (
        <ModalShell
          title="Apply for business verification"
          description="Applications are stored securely and reviewed in the live merchant portal."
          onClose={() => setApplicationOpen(false)}
        >
          <form className="space-y-4 p-8" onSubmit={submitApplication}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Business name
                <input
                  name="name"
                  required
                  minLength={2}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold">
                Owner name
                <input
                  name="ownerName"
                  required
                  defaultValue={
                    user?.displayName ||
                    [user?.firstName, user?.lastName].filter(Boolean).join(" ")
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Business email
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={user?.email}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold">
                Phone
                <input
                  name="phone"
                  type="tel"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold">
                Category
                <input
                  name="category"
                  required
                  placeholder="Fashion, food, services…"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold">
                City
                <input
                  name="city"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold">
                State
                <select
                  name="state"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                >
                  <option value="">Select</option>
                  {US_STATES.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Street address
              <input
                name="address"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </label>
            <label className="block text-sm font-semibold">
              Business description
              <textarea
                name="description"
                required
                minLength={40}
                rows={5}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                placeholder="Tell customers what you offer and what makes the business distinct."
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Website URL
                <input
                  name="websiteUrl"
                  type="url"
                  placeholder="https://"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold">
                Image URL
                <input
                  name="imageUrl"
                  type="url"
                  placeholder="https://"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={working === "application"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3.5 font-bold text-white disabled:opacity-60"
            >
              {working === "application" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Submit application
            </button>
          </form>
        </ModalShell>
      )}

      {reviewOpen && (
        <ModalShell
          title="Write a verified review"
          description="Your GoodOS identity is attached to the review to reduce spam and duplicate ratings."
          onClose={() => setReviewOpen(false)}
        >
          <form className="space-y-4 p-8" onSubmit={submitReview}>
            <label className="block text-sm font-semibold">
              Business
              <select
                name="businessId"
                required
                defaultValue={selectedBusiness?.id || ""}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
              >
                <option value="">Select a verified business</option>
                {catalog.businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Rating
              <select
                name="rating"
                required
                defaultValue="5"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} star{rating === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Review
              <textarea
                name="body"
                required
                minLength={10}
                rows={6}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={working === "review" || catalog.businesses.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3.5 font-bold text-white disabled:opacity-60"
            >
              {working === "review" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Publish review
            </button>
          </form>
        </ModalShell>
      )}

      {selectedBusiness && (
        <ModalShell
          title={selectedBusiness.name}
          description={`${selectedBusiness.category} · ${selectedBusiness.location}`}
          onClose={() => setSelectedBusiness(null)}
        >
          <div className="max-h-[70vh] space-y-8 overflow-y-auto p-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  <ShieldCheck className="h-4 w-4" /> Verified
                </span>
                {selectedBusiness.reviewCount > 0 && (
                  <span className="flex items-center gap-1 text-sm font-bold">
                    <Star className="h-4 w-4 fill-gold-base text-gold-base" />
                    {selectedBusiness.rating.toFixed(1)} ·{" "}
                    {selectedBusiness.reviewCount} reviews
                  </span>
                )}
              </div>
              <p className="mt-4 leading-relaxed text-gray-600">
                {selectedBusiness.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {selectedBusiness.websiteUrl && (
                  <a
                    href={selectedBusiness.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-bazaar-dark px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Visit website
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    [
                      selectedBusiness.address,
                      selectedBusiness.city,
                      selectedBusiness.state,
                      selectedBusiness.name,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold"
                >
                  Get directions
                </a>
                <button
                  type="button"
                  onClick={() => void shareBusiness(selectedBusiness)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold">Products</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {catalog.products.filter(
                  (product) => product.businessId === selectedBusiness.id,
                ).length === 0 ? (
                  <p className="text-sm text-gray-500">
                    This merchant has not published products yet.
                  </p>
                ) : (
                  catalog.products
                    .filter(
                      (product) => product.businessId === selectedBusiness.id,
                    )
                    .map((product) => (
                      <article
                        key={product.id}
                        className="rounded-2xl border border-gray-200 p-4"
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="mb-4 h-36 w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-warm-gray">
                            <Package className="h-10 w-10 text-gold-dark" />
                          </div>
                        )}
                        <h4 className="font-bold">{product.name}</h4>
                        <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                          {product.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="font-black text-rust">
                            {money(product.priceCents, product.currency)}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              addToCart(product, selectedBusiness)
                            }
                            disabled={
                              product.inventoryCount !== null &&
                              product.inventoryCount < 1
                            }
                            className="rounded-lg bg-rust px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {product.inventoryCount !== null &&
                            product.inventoryCount < 1
                              ? "Sold out"
                              : "Add to cart"}
                          </button>
                        </div>
                      </article>
                    ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-serif text-2xl font-bold">Reviews</h3>
                <button
                  type="button"
                  onClick={() => requireAuth("review")}
                  className="flex items-center gap-2 text-sm font-bold text-rust"
                >
                  <MessageSquare className="h-4 w-4" /> Write a review
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {catalog.reviews.filter(
                  (review) => review.businessId === selectedBusiness.id,
                ).length === 0 ? (
                  <p className="text-sm text-gray-500">No reviews yet.</p>
                ) : (
                  catalog.reviews
                    .filter(
                      (review) => review.businessId === selectedBusiness.id,
                    )
                    .map((review) => (
                      <article
                        key={review.id}
                        className="rounded-2xl bg-gray-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold">{review.userName}</p>
                          <span className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-3.5 w-3.5 ${
                                  index < review.rating
                                    ? "fill-gold-base text-gold-base"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                          {review.body}
                        </p>
                        <button
                          type="button"
                          onClick={() => void markHelpful(review)}
                          className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gray-500"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" /> Helpful{" "}
                          {review.helpfulCount > 0
                            ? `(${review.helpfulCount})`
                            : ""}
                        </button>
                      </article>
                    ))
                )}
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-bazaar-dark/70">
          <button
            type="button"
            className="flex-1"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          />
          <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-rust">
                  Secure checkout
                </p>
                <h2 className="mt-1 font-serif text-3xl font-bold">Your cart</h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2 text-gray-500"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="py-20 text-center text-gray-500">
                  <ShoppingBag className="mx-auto h-10 w-10" />
                  <p className="mt-4 font-semibold">Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <article
                    key={item.product.id}
                    className="rounded-2xl border border-gray-200 p-4"
                  >
                    <p className="text-xs font-bold text-rust">
                      {item.business.name}
                    </p>
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{item.product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {money(item.product.priceCents, item.product.currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-gray-200 p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="rounded-full p-1.5"
                          aria-label={`Remove one ${item.product.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-5 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          disabled={
                            item.quantity >=
                            Math.min(item.product.inventoryCount ?? 25, 25)
                          }
                          className="rounded-full p-1.5 disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label={`Add one ${item.product.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-6">
                <div className="flex items-center justify-between text-lg font-black">
                  <span>Total</span>
                  <span>{money(cartTotal)}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  The displayed total is charged by the selected processor.
                  Merchants must include any shipping costs in their listed price.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {(["stripe", "paypal"] as const).map((provider) => {
                    const readiness = catalog.payments[provider];
                    const ready =
                      readiness.configured && readiness.webhooksConfigured;
                    return (
                      <button
                        type="button"
                        key={provider}
                        onClick={() => setCheckoutProvider(provider)}
                        disabled={!ready}
                        className={`rounded-xl border p-3 text-left ${
                          checkoutProvider === provider
                            ? "border-rust bg-rust/5"
                            : "border-gray-200"
                        }`}
                      >
                        <span className="flex items-center gap-2 font-bold capitalize">
                          {provider === "stripe" ? (
                            <CreditCard className="h-4 w-4" />
                          ) : (
                            <span className="font-black text-[#003087]">P</span>
                          )}
                          {provider === "stripe" ? "Card" : "PayPal"}
                        </span>
                        <span
                          className={`mt-1 block text-[10px] font-bold ${
                            readiness.configured &&
                            readiness.webhooksConfigured
                              ? "text-green-700"
                              : "text-amber-700"
                          }`}
                        >
                          {ready ? "Available" : "Setup needed"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => void beginCheckout()}
                  disabled={
                    working === "checkout" ||
                    !catalog.payments[checkoutProvider].configured ||
                    !catalog.payments[checkoutProvider].webhooksConfigured
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3.5 font-bold text-white disabled:opacity-60"
                >
                  {working === "checkout" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Continue with{" "}
                  {checkoutProvider === "stripe" ? "card" : "PayPal"}
                </button>
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="mt-3 w-full text-center text-xs font-bold text-gray-500"
                >
                  Clear cart
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {working === "checkout-return" && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-bazaar-dark/85 text-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold-base" />
            <p className="mt-4 font-bold">Confirming your payment…</p>
          </div>
        </div>
      )}
    </div>
  );
}
