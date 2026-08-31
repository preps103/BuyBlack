"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
  Share2,
  ShieldCheck,
  Store,
  Users,
  X,
} from "lucide-react";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import AdminDashboard from "./components/AdminDashboard";
import StateShopsView from "./components/StateShopsView";
import { apiRequest } from "./api";
import type { AuthUser, Business, CatalogData } from "./types";

const GOODOS_AUTH_ORIGIN = "";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

const emptyCatalog: CatalogData = {
  businesses: [],
  states: [],
  categories: [],
  stats: { businesses: 0, states: 0, categories: 0 },
};

type View = "home" | "admin" | "state_shops";
type PendingAction = "apply" | "admin" | null;

function ModalShell({
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-bazaar-dark/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`relative my-auto w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-2xl"}`}>
        <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 text-gray-500 hover:text-gray-900" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <div className="border-b border-gray-100 bg-[#FAF8F5] px-8 pb-6 pt-8">
          <h2 className="pr-10 font-serif text-3xl font-bold">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function BusinessCard({ business, onSelect }: { business: Business; onSelect: () => void }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <button type="button" onClick={onSelect} className="block h-52 w-full bg-warm-gray text-left">
        {business.imageUrl ? (
          <img src={business.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <span className="flex h-full items-center justify-center"><Store className="h-14 w-14 text-gold-dark" /></span>
        )}
      </button>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div><h3 className="font-serif text-xl font-bold">{business.name}</h3><p className="mt-1 text-xs text-gray-500">{business.category}</p></div>
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Curated
          </span>
        </div>
        <p className="mt-3 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5" /> {business.location}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">{business.description}</p>
        <button type="button" onClick={onSelect} className="mt-5 w-full rounded-xl bg-rust py-3 text-sm font-bold text-white hover:bg-rust-dark">View business</button>
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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [working, setWorking] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const statesRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const directoryRef = useRef<HTMLElement>(null);

  const loadSession = useCallback(async () => {
    try {
      const session = await apiRequest<{ user: AuthUser | null }>("/api/marketplace/session");
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
      setCatalog(await apiRequest<CatalogData>("/api/marketplace/catalog"));
    } catch (requestError) {
      setCatalogError(requestError instanceof Error ? requestError.message : "The directory could not be loaded.");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.all([loadSession(), loadCatalog()]); }, [loadCatalog, loadSession]);
  useEffect(() => {
    const timer = toast ? window.setTimeout(() => setToast(""), 5000) : 0;
    return () => { if (timer) window.clearTimeout(timer); };
  }, [toast]);

  const visibleBusinesses = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return catalog.businesses.filter((business) =>
      (!categoryFilter || business.category === categoryFilter) &&
      (!needle || [business.name, business.category, business.description, business.city, business.state].some((value) => value.toLowerCase().includes(needle))),
    );
  }, [catalog.businesses, categoryFilter, searchQuery]);

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    setActiveView("home");
    window.setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const requireAuth = (action: Exclude<PendingAction, null>) => {
    if (user) {
      if (action === "apply") setApplicationOpen(true);
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
    if (pendingAction === "admin") setActiveView("admin");
    setPendingAction(null);
  };

  const signOut = async () => {
    await fetch(`${GOODOS_AUTH_ORIGIN}/api/auth/logout`, { method: "POST", credentials: "include", headers: { Accept: "application/json" } }).catch(() => undefined);
    setUser(null);
    setActiveView("home");
    setToast("You are signed out.");
  };

  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking("application");
    setError("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const result = await apiRequest<{ business: Business }>("/api/marketplace/applications", { method: "POST", body: JSON.stringify(values) });
      setApplicationOpen(false);
      setToast(`${result.business.name} was submitted for human review.`);
      await loadCatalog();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The business could not be submitted.");
    } finally {
      setWorking("");
    }
  };

  const shareBusiness = async (business: Business) => {
    const url = `${window.location.origin}/?business=${encodeURIComponent(business.slug)}`;
    try {
      if (navigator.share) await navigator.share({ title: business.name, text: business.description, url });
      else { await navigator.clipboard.writeText(url); setToast("Business link copied."); }
    } catch { /* Sharing can be cancelled without an error. */ }
  };

  const header = (
    <Header
      activeView={activeView}
      user={user}
      authChecked={authChecked}
      searchQuery={searchQuery}
      onNavigate={(view) => view === "admin" ? requireAuth("admin") : setActiveView(view)}
      onApply={() => requireAuth("apply")}
      onSignIn={() => setAuthOpen(true)}
      onSignOut={() => void signOut()}
      onSearchChange={(query) => { setSearchQuery(query); if (query.trim()) scrollTo(directoryRef); }}
      onScrollToStates={() => scrollTo(statesRef)}
      onScrollToCategories={() => scrollTo(categoriesRef)}
    />
  );

  if (activeView === "admin" && user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-gray-900">
        {header}
        <AdminDashboard onDirectoryChanged={loadCatalog} />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={afterAuthentication} />
      </div>
    );
  }

  if (activeView === "state_shops") {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-gray-900">
        {header}
        <StateShopsView businesses={catalog.businesses} initialState={selectedState} query={searchQuery} onBack={() => setActiveView("home")} onSelectBusiness={setSelectedBusiness} />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={afterAuthentication} />
        {selectedBusiness && <BusinessDetails business={selectedBusiness} onClose={() => setSelectedBusiness(null)} onShare={shareBusiness} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900">
      {header}

      {(toast || error) && (
        <div className={`fixed right-4 top-24 z-[100] max-w-sm rounded-2xl border bg-white px-5 py-4 text-sm font-semibold shadow-xl ${error ? "border-rust/20 text-rust-dark" : "border-green-200 text-green-800"}`} role="status">
          <div className="flex items-start gap-3">
            {error ? <X className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{error || toast}</span>
            <button type="button" onClick={() => { setError(""); setToast(""); }} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden border-b border-gray-100 bg-[#FDFCFB]">
        <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-rust/10" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gold-light/15" />
        <div className="relative mx-auto grid min-h-[650px] max-w-[1400px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-rust/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-rust">
              <ShieldCheck className="h-4 w-4" /> Curated Black-owned directory
            </span>
            <h1 className="mt-7 max-w-3xl font-serif text-6xl font-bold leading-[0.98] tracking-tight md:text-7xl">
              Discover Black-owned <span className="text-rust">businesses worth knowing.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-600">
              BuyBlack is a human-curated directory. We confirm ownership, review each submission, and connect people directly with Black-owned businesses.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <button type="button" onClick={() => scrollTo(directoryRef)} className="flex items-center gap-2 rounded-full bg-rust px-8 py-3.5 font-bold text-white shadow-lg shadow-rust/20 hover:bg-rust-dark">
                Browse directory <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => requireAuth("apply")} className="rounded-full border-2 border-gray-200 bg-white px-8 py-3.5 font-bold text-gray-700">
                Submit a business
              </button>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
              {[["Verified businesses", catalog.stats.businesses], ["States represented", catalog.stats.states], ["Business categories", catalog.stats.categories]].map(([label, value]) => (
                <div key={String(label)}><p className="font-serif text-3xl font-bold">{value}</p><p className="mt-1 text-xs font-semibold text-gray-500">{label}</p></div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[500px] lg:block">
            <div className="absolute inset-12 rounded-[3rem] bg-bazaar-dark shadow-2xl" />
            <div className="absolute left-0 top-20 w-72 rotate-[-5deg] overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="flex h-52 items-center justify-center bg-rust/10"><Store className="h-16 w-16 text-rust" /></div>
              <div className="p-5"><p className="text-xs font-black uppercase tracking-wider text-rust">Business discovery</p><p className="mt-2 font-serif text-2xl font-bold">Find places to support</p></div>
            </div>
            <div className="absolute bottom-8 right-0 w-72 rotate-3 overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="flex h-52 items-center justify-center bg-gold-light/30"><ClipboardCheck className="h-16 w-16 text-gold-dark" /></div>
              <div className="p-5"><p className="text-xs font-black uppercase tracking-wider text-gold-dark">Human curation</p><p className="mt-2 font-serif text-2xl font-bold">Ownership reviewed first</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bazaar-dark py-16 text-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-gold-base">The BuyBlack standard</p><h2 className="mt-3 font-serif text-4xl font-bold">Curated with intention.</h2><p className="mt-4 max-w-md leading-relaxed text-white/65">A listing appears only after a curator reviews the ownership claim and confirms the business is operating.</p></div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [Users, "Black ownership", "The business attests that it is at least 51% Black-owned."],
                [Building2, "Operating business", "A real public presence, contact path, and clear offering are required."],
                [ClipboardCheck, "Human decision", "A curator records what was checked before a listing is published."],
              ].map(([Icon, title, copy]) => {
                const CardIcon = Icon as typeof Users;
                return <article key={String(title)} className="rounded-2xl border border-white/10 bg-white/5 p-5"><CardIcon className="h-6 w-6 text-gold-base" /><h3 className="mt-4 font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-relaxed text-white/60">{String(copy)}</p></article>;
              })}
            </div>
          </div>
        </div>
      </section>

      <section ref={directoryRef} className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-rust">Live directory</p><h2 className="mt-2 font-serif text-4xl font-bold">Verified businesses</h2><p className="mt-2 text-gray-600">Only curator-approved records appear here.</p></div>
            <button type="button" onClick={() => setActiveView("state_shops")} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold">Open full directory <ChevronRight className="h-4 w-4" /></button>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-[1fr_260px]">
            <label className="relative"><span className="sr-only">Search directory</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by name, city, state, or category" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3" /></label>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3" aria-label="Filter by category"><option value="">All categories</option>{catalog.categories.map((category) => <option key={category}>{category}</option>)}</select>
          </div>

          {catalogLoading ? (
            <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-rust" /></div>
          ) : catalogError ? (
            <div className="mt-8 rounded-3xl border border-rust/20 bg-white px-6 py-16 text-center"><h3 className="font-serif text-2xl font-bold">Directory unavailable</h3><p className="mt-2 text-gray-600">{catalogError}</p><button type="button" onClick={() => void loadCatalog()} className="mt-6 rounded-full bg-rust px-6 py-3 font-bold text-white">Try again</button></div>
          ) : visibleBusinesses.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center"><Store className="mx-auto h-12 w-12 text-gold-dark" /><h3 className="mt-4 font-serif text-3xl font-bold">No verified matches yet</h3><p className="mx-auto mt-3 max-w-xl text-gray-600">The public directory never uses placeholder businesses. Submit a qualifying business and it will appear after review.</p><button type="button" onClick={() => requireAuth("apply")} className="mt-6 rounded-full bg-rust px-7 py-3 font-bold text-white">Submit a business</button></div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{visibleBusinesses.slice(0, 9).map((business) => <BusinessCard key={business.id} business={business} onSelect={() => setSelectedBusiness(business)} />)}</div>
          )}
        </div>
      </section>

      <section ref={categoriesRef} className="scroll-mt-24 border-y border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-rust">Browse by category</p><div className="mt-6 flex flex-wrap gap-3">{catalog.categories.length ? catalog.categories.map((category) => <button key={category} type="button" onClick={() => { setCategoryFilter(category); scrollTo(directoryRef); }} className="rounded-full border border-gray-200 bg-[#FAF8F5] px-5 py-2.5 text-sm font-bold hover:border-rust hover:text-rust">{category}</button>) : <p className="text-gray-500">Categories will appear as businesses are verified.</p>}</div></div>
      </section>

      <section ref={statesRef} className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-rust">Across the country</p><h2 className="mt-2 font-serif text-4xl font-bold">Explore by state</h2><p className="mt-2 text-gray-600">Choose a state represented in the verified directory.</p></div><div className="mt-8 flex flex-wrap gap-3">{catalog.states.length ? catalog.states.map((state) => <button key={state} type="button" onClick={() => { setSelectedState(state); setActiveView("state_shops"); }} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold hover:border-rust hover:text-rust"><MapPin className="h-4 w-4" /> {state}</button>) : <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-5 text-gray-500">States will appear when their first business is verified.</p>}</div></div>
      </section>

      <section className="bg-rust py-16 text-white"><div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-7 px-4 text-center sm:px-6 lg:flex-row lg:text-left"><div><h2 className="font-serif text-4xl font-bold">Know a Black-owned business?</h2><p className="mt-2 text-white/75">Owners, team members, and community supporters can submit one for review.</p></div><button type="button" onClick={() => requireAuth("apply")} className="shrink-0 rounded-full bg-white px-8 py-3.5 font-bold text-rust">Submit a business</button></div></section>

      <footer className="bg-bazaar-dark py-10 text-white/60"><div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><div><p className="font-serif text-xl font-bold text-white">Buy<span className="text-gold-base">Black</span></p><p className="mt-1 text-xs">A curated directory. No paid placement. No checkout.</p></div><p className="text-xs">Listings are reviewed for directory eligibility; visitors should still use their own judgment.</p></div></footer>

      <AuthModal open={authOpen} onClose={() => { setAuthOpen(false); setPendingAction(null); }} onAuthenticated={afterAuthentication} />

      {applicationOpen && (
        <ModalShell title="Submit a Black-owned business" description="Tell us what the business does and how its Black ownership can be confirmed. A curator reviews every submission before publication." onClose={() => setApplicationOpen(false)} wide>
          <form className="max-h-[72vh] space-y-5 overflow-y-auto p-8" onSubmit={submitApplication}>
            <div className="rounded-2xl border border-gold-base/30 bg-gold-light/15 p-4 text-sm leading-relaxed text-gray-700"><strong>Directory requirement:</strong> the business must be at least 51% Black-owned and currently operating. Submitting does not guarantee publication.</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Business name<input name="name" required minLength={2} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
              <label className="text-sm font-semibold">Category<input name="category" required minLength={2} placeholder="Food, beauty, professional services…" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
            </div>
            <label className="block text-sm font-semibold">Your relationship to the business<select name="submitterRelationship" required defaultValue="owner" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"><option value="owner">Owner or founder</option><option value="team_member">Team member</option><option value="community_nomination">Customer or community nomination</option></select></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Primary contact name<input name="ownerName" required minLength={2} defaultValue={user?.displayName || ""} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
              <label className="text-sm font-semibold">Business contact email<input name="email" type="email" required defaultValue={user?.email || ""} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold">Phone<input name="phone" type="tel" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
              <label className="text-sm font-semibold">City<input name="city" required minLength={2} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
              <label className="text-sm font-semibold">State<select name="state" required defaultValue="" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"><option value="" disabled>Select state</option>{US_STATES.map((state) => <option key={state}>{state}</option>)}</select></label>
            </div>
            <label className="block text-sm font-semibold">Street address <span className="font-normal text-gray-400">(optional)</span><input name="address" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
            <label className="block text-sm font-semibold">Business description<textarea name="description" required minLength={40} rows={5} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="What does the business offer, who does it serve, and what makes it distinct?" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Business website or social page<input name="websiteUrl" type="url" placeholder="https://" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
              <label className="text-sm font-semibold">Business image URL <span className="font-normal text-gray-400">(optional)</span><input name="imageUrl" type="url" placeholder="https://" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-serif text-xl font-bold">Ownership verification</h3>
              <p className="mt-1 text-sm text-gray-500">Private evidence is visible to curators and is not published in the public directory.</p>
              <label className="mt-4 block text-sm font-semibold">Public source supporting Black ownership <span className="font-normal text-gray-400">(optional)</span><input name="verificationUrl" type="url" placeholder="Article, certification, About page, or public profile" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" /></label>
              <label className="mt-4 block text-sm font-semibold">How can ownership be confirmed?<textarea name="verificationDetails" required minLength={30} rows={4} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="Explain who owns the business and what a curator can check. Do not submit Social Security numbers, banking details, or identity documents." /></label>
              <label className="mt-4 flex items-start gap-3 rounded-xl bg-[#FAF8F5] p-4 text-sm leading-relaxed"><input name="ownershipConfirmed" type="checkbox" required className="mt-1 h-4 w-4 accent-rust" /><span>I have a reasonable basis to confirm that this business is at least 51% Black-owned, and the information above is accurate to the best of my knowledge.</span></label>
            </div>
            <button type="submit" disabled={working === "application"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3.5 font-bold text-white disabled:opacity-60">{working === "application" && <Loader2 className="h-4 w-4 animate-spin" />} Submit for review</button>
          </form>
        </ModalShell>
      )}

      {selectedBusiness && <BusinessDetails business={selectedBusiness} onClose={() => setSelectedBusiness(null)} onShare={shareBusiness} />}
    </div>
  );
}

function BusinessDetails({ business, onClose, onShare }: { business: Business; onClose: () => void; onShare: (business: Business) => Promise<void> }) {
  const destination = [business.address, business.city, business.state, business.name].filter(Boolean).join(", ");
  return (
    <ModalShell title={business.name} description={`${business.category} · ${business.location}`} onClose={onClose}>
      <div className="max-h-[70vh] overflow-y-auto p-8">
        {business.imageUrl && <img src={business.imageUrl} alt="" className="mb-6 h-64 w-full rounded-2xl object-cover" />}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"><ShieldCheck className="h-4 w-4" /> Curator approved</span>
        <p className="mt-5 leading-relaxed text-gray-600">{business.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {business.websiteUrl && <a href={business.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-bazaar-dark px-5 py-2.5 text-sm font-bold text-white">Visit website <ExternalLink className="h-4 w-4" /></a>}
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold"><MapPin className="h-4 w-4" /> Directions</a>
          <button type="button" onClick={() => void onShare(business)} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold"><Share2 className="h-4 w-4" /> Share</button>
        </div>
        {(business.phone || business.email) && <div className="mt-7 rounded-2xl bg-[#FAF8F5] p-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Business contact</p><div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">{business.email && <a href={`mailto:${business.email}`} className="text-rust">{business.email}</a>}{business.phone && <a href={`tel:${business.phone}`} className="text-rust">{business.phone}</a>}</div></div>}
        <p className="mt-6 text-xs leading-relaxed text-gray-400">BuyBlack verifies eligibility for this curated directory. It does not guarantee products, services, pricing, availability, or transactions with listed businesses.</p>
      </div>
    </ModalShell>
  );
}
