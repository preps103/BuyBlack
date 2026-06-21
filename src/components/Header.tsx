/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Home, MapPin, Grid, Store, Plus, Loader2 } from "lucide-react";

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

  return (
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
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-2 hover:text-white transition-colors ${activeView === 'admin' ? 'text-white' : ''}`}
            >
              <Store className="w-4 h-4 text-gold-base" /> Merchant Portal
            </button>
          </nav>
          
          <button 
            onClick={onApply}
            className="flex items-center gap-2 bg-rust hover:bg-rust-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer"
          >
            <div className="bg-white/20 rounded-full p-0.5">
              <Plus className="w-3.5 h-3.5" />
            </div>
            List Your Business
          </button>
        </div>
      </div>
    </header>
  );
}
