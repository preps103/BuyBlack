"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, MapPin, Search, ShieldCheck, Store } from "lucide-react";
import type { Business } from "../types";

export default function StateShopsView({
  businesses,
  initialState,
  query,
  onBack,
  onSelectBusiness,
}: {
  businesses: Business[];
  initialState?: string;
  query?: string;
  onBack: () => void;
  onSelectBusiness: (business: Business) => void;
}) {
  const [state, setState] = useState(initialState || "");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState(query || "");
  const states = useMemo(() => Array.from(new Set(businesses.map((business) => business.state))).sort(), [businesses]);
  const categories = useMemo(() => Array.from(new Set(businesses.map((business) => business.category))).sort(), [businesses]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return businesses.filter((business) =>
      (!state || business.state === state) &&
      (!category || business.category === category) &&
      (!needle || [business.name, business.description, business.category, business.city, business.state].some((value) => value.toLowerCase().includes(needle))),
    );
  }, [businesses, category, search, state]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-rust">
        <ArrowLeft className="h-4 w-4" /> Back to directory
      </button>
      <div className="mt-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rust">Verified directory</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">Find Black-owned businesses</h1>
        <p className="mt-2 max-w-2xl text-gray-600">Every public listing has been reviewed before publication. BuyBlack links you directly to each business.</p>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-[1fr_220px_220px]">
        <label className="relative">
          <span className="sr-only">Search businesses</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search businesses" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3" />
        </label>
        <select value={state} onChange={(event) => setState(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-3" aria-label="Filter by state">
          <option value="">All states</option>
          {states.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-3" aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
          <Store className="mx-auto h-10 w-10 text-gold-dark" />
          <h2 className="mt-4 font-serif text-2xl font-bold">No verified matches yet</h2>
          <p className="mx-auto mt-2 max-w-lg text-gray-600">Try a broader search, or submit a Black-owned business for review.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((business) => (
            <article key={business.id} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <button type="button" onClick={() => onSelectBusiness(business)} className="block h-52 w-full bg-warm-gray text-left">
                {business.imageUrl ? <img src={business.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center"><Store className="h-12 w-12 text-gold-dark" /></span>}
              </button>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="font-serif text-xl font-bold">{business.name}</h2><p className="mt-1 text-xs text-gray-500">{business.category}</p></div>
                  <span className="rounded-full bg-green-50 p-2 text-green-700" title="Ownership reviewed"><ShieldCheck className="h-4 w-4" /></span>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5" /> {business.location}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">{business.description}</p>
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={() => onSelectBusiness(business)} className="flex-1 rounded-xl bg-rust py-3 text-sm font-bold text-white">View listing</button>
                  {business.websiteUrl && <a href={business.websiteUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-gray-200 p-3 text-rust" aria-label={`Visit ${business.name} website`}><ExternalLink className="h-4 w-4" /></a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
