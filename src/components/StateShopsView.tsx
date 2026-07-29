"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import { money } from "../api";
import type { Business, Product } from "../types";

export default function StateShopsView({
  businesses,
  products,
  initialState,
  query,
  onBack,
  onSelectShop,
  onAddToCart,
}: {
  businesses: Business[];
  products: Product[];
  initialState?: string;
  query?: string;
  onBack: () => void;
  onSelectShop: (business: Business) => void;
  onAddToCart: (product: Product, business: Business) => void;
}) {
  const [state, setState] = useState(initialState || "");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState(query || "");

  const states = useMemo(
    () => Array.from(new Set(businesses.map((business) => business.state))).sort(),
    [businesses],
  );
  const categories = useMemo(
    () =>
      Array.from(new Set(businesses.map((business) => business.category))).sort(),
    [businesses],
  );
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return businesses.filter(
      (business) =>
        (!state || business.state === state) &&
        (!category || business.category === category) &&
        (!needle ||
          business.name.toLowerCase().includes(needle) ||
          business.description.toLowerCase().includes(needle) ||
          business.category.toLowerCase().includes(needle)),
    );
  }, [businesses, category, search, state]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-rust"
      >
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </button>
      <div className="mt-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rust">
          Verified directory
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold">Shop the marketplace</h1>
        <p className="mt-2 text-gray-600">
          Search verified businesses and buy directly from their live catalog.
        </p>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-[1fr_220px_220px]">
        <label className="relative">
          <span className="sr-only">Search businesses</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search businesses"
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3"
          />
        </label>
        <select
          value={state}
          onChange={(event) => setState(event.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-3"
          aria-label="Filter by state"
        >
          <option value="">All states</option>
          {states.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-3"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
          <Store className="mx-auto h-10 w-10 text-gold-dark" />
          <h2 className="mt-4 font-serif text-2xl font-bold">No verified matches yet</h2>
          <p className="mx-auto mt-2 max-w-lg text-gray-600">
            Try a broader search, or invite a business in this area to submit a
            verification application.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((business) => {
            const businessProducts = products.filter(
              (product) => product.businessId === business.id,
            );
            return (
              <article
                key={business.id}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => onSelectShop(business)}
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
                      <Store className="h-12 w-12 text-gold-dark" />
                    </span>
                  )}
                </button>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-xl font-bold">{business.name}</h2>
                      <p className="mt-1 text-xs text-gray-500">
                        {business.category}
                      </p>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5" /> {business.location}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                    {business.description}
                  </p>
                  <p className="mt-4 flex items-center gap-1 text-sm font-bold">
                    <Star className="h-4 w-4 fill-gold-base text-gold-base" />
                    {business.reviewCount > 0
                      ? `${business.rating.toFixed(1)} (${business.reviewCount})`
                      : "New to BuyBlack"}
                  </p>

                  {businessProducts[0] && (
                    <div className="mt-4 rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {businessProducts[0].name}
                          </p>
                          <p className="text-xs font-black text-rust">
                            {money(
                              businessProducts[0].priceCents,
                              businessProducts[0].currency,
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onAddToCart(businessProducts[0], business)
                          }
                          className="rounded-lg bg-bazaar-dark p-2.5 text-white"
                          aria-label={`Add ${businessProducts[0].name} to cart`}
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectShop(business)}
                    className="mt-5 w-full rounded-xl bg-rust py-3 text-sm font-bold text-white hover:bg-rust-dark"
                  >
                    View shop
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
