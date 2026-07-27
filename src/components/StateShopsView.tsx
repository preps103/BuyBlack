import React, { useState, useMemo } from "react";
import { ArrowLeft, Star, MapPin, ShieldCheck, Filter, ChevronDown, Search } from "lucide-react";

export default function StateShopsView({ 
  stateName, 
  onBack, 
  onSelectShop 
}: { 
  stateName: string, 
  onBack: () => void,
  onSelectShop: (shop: any) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');

  // Use mock data for now, ideally this would be fetched from an API
  const MOCK_SHOPS = useMemo(() => [
    {
      name: "Zuri & Co. Botanicals",
      category: "Beauty & Wellness",
      location: `Los Angeles, ${stateName}`,
      desc: "Plant-powered skincare handcrafted with ancestral wisdom and clean ingredients.",
      rating: "4.9",
      reviews: "128",
      image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&q=80",
      verified: true,
      distance: 1.2
    },
    {
      name: "Kente Clothier",
      category: "Fashion & Apparel",
      location: `San Francisco, ${stateName}`,
      desc: "Modern streetwear inspired by West African heritage and timeless craftsmanship.",
      rating: "4.8",
      reviews: "96",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      verified: true,
      distance: 3.5
    },
    {
      name: "Heritage Brew Coffee",
      category: "Food & Beverage",
      location: `Oakland, ${stateName}`,
      desc: "Ethically sourced, small-batch coffee celebrating African origins.",
      rating: "4.9",
      reviews: "210",
      image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80",
      verified: true,
      distance: 0.8
    },
    {
      name: "Diaspora Voices",
      category: "Books & Literature",
      location: `San Diego, ${stateName}`,
      desc: "Independent bookstore and publisher amplifying Black stories and voices.",
      rating: "4.9",
      reviews: "76",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
      verified: true,
      distance: 5.1
    },
    {
      name: "Melanin Books & More",
      category: "Books & Literature",
      location: `Fresno, ${stateName}`,
      desc: "An incredible independent bookstore honoring global Black culture.",
      rating: "5.0",
      reviews: "45",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
      verified: true,
      distance: 12.4
    },
    {
      name: "The Flex Collective",
      category: "Fashion & Apparel",
      location: `Sacramento, ${stateName}`,
      desc: "Streetwear brand setting the tone for modern day hype styles.",
      rating: "4.7",
      reviews: "112",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
      verified: true,
      distance: 2.3
    }
  ], [stateName]);

  const categories = useMemo(() => Array.from(new Set(MOCK_SHOPS.map(s => s.category))), [MOCK_SHOPS]);

  const filteredAndSortedShops = useMemo(() => {
    return [...MOCK_SHOPS]
      .filter(shop => {
        if (selectedCategory && shop.category !== selectedCategory) return false;
        if (searchQuery && !shop.name.toLowerCase().includes(searchQuery.toLowerCase()) && !shop.desc.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'top_rated') return parseFloat(b.rating) - parseFloat(a.rating);
        if (sortBy === 'closest') return a.distance - b.distance;
        if (sortBy === 'most_reviews') return parseInt(b.reviews) - parseInt(a.reviews);
        return 0; // recommended
      });
  }, [MOCK_SHOPS, selectedCategory, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 font-bold text-sm bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to map
        </button>

        <div className="mb-8 border-b border-gray-200 pb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight mb-3">
            Shops in {stateName}
          </h1>
          <p className="text-xl text-gray-500 font-medium mb-8">Discover amazing Black-owned businesses across the state.</p>
          
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative w-full lg:w-96 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-rust transition-colors"
              />
            </div>
            
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 ml-auto items-center">
              {/* Category Filter */}
              <div className="relative w-full sm:w-auto">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-48 appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-8 text-sm font-medium text-gray-700 outline-none focus:border-rust transition-colors cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Options */}
              <div className="relative w-full sm:w-auto flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500 shrink-0">Sort by:</span>
                <div className="relative w-full sm:w-48">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-4 pr-8 text-sm font-medium text-gray-900 outline-none focus:border-rust transition-colors cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="closest">Closest to me</option>
                    <option value="top_rated">Top Rated</option>
                    <option value="most_reviews">Most Reviewed</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredAndSortedShops.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No shops found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query to find more businesses.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSortBy('recommended'); }}
              className="mt-4 text-rust font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedShops.map((shop, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow group">
                <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => onSelectShop?.(shop)}>
                  <img src={shop.image} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {shop.verified && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 flex items-center gap-1 rounded-md text-[10px] font-bold text-green-700 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-green-600" /> Verified
                    </div>
                  )}
                  {sortBy === 'closest' && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5 rounded-full text-xs font-bold text-white shadow-sm">
                      <MapPin className="w-3 h-3 text-rust" /> {shop.distance} miles away
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 onClick={() => onSelectShop?.(shop)} className="font-serif font-bold text-xl text-gray-900 leading-tight hover:text-rust transition-colors cursor-pointer">{shop.name}</h3>
                  </div>
                  <div className="flex justify-between items-center mb-3 text-xs text-gray-500 font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">{shop.category}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-rust" /> {shop.location.split(',')[0]}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{shop.desc}</p>
                  
                  <div className="flex items-center gap-1.5 mb-5">
                    <div className="flex items-center gap-0.5 border border-mustard/30 bg-mustard/5 px-1.5 py-0.5 rounded text-mustard font-bold text-xs">
                      <Star className="w-3 h-3 fill-mustard" /> {shop.rating}
                    </div>
                    <span className="text-xs font-medium text-gray-500 hover:underline cursor-pointer">({shop.reviews} reviews)</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button onClick={() => onSelectShop?.(shop)} className="bg-rust hover:bg-rust-dark text-white rounded-lg py-2 text-sm font-semibold transition-colors">
                      View Shop
                    </button>
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.location + ', ' + shop.name)}`, '_blank')} className="border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-semibold transition-colors bg-white hover:bg-gray-50">
                      Directions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

