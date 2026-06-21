import React, { useState, useRef } from "react";
import { 
  Search, Home, MapPin, Grid, Store, Plus, ArrowRight,
  ShieldCheck, Map as MapIcon, Users, ChevronDown, CheckCircle2,
  X, Star, MapPinned, Shirt, Sparkles, Coffee, BookOpen,
  Palette, Home as HomeIcon, Briefcase, Heart, Check, Building2,
  ThumbsUp, MessageSquare, Share2, PenLine, Globe, RotateCcw
} from "lucide-react";
import Header from "./components/Header";
import AdminDashboard from "./components/AdminDashboard";
import StateShopsView from "./components/StateShopsView";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const FEATURED_SHOPS = [
  {
    name: "Zuri & Co. Botanicals",
    category: "Beauty & Wellness",
    location: "Harlem, NY",
    desc: "Plant-powered skincare handcrafted with ancestral wisdom and clean ingredients.",
    rating: "4.9",
    reviews: "128",
    image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&q=80",
    verified: true
  },
  {
    name: "Kente Clothier",
    category: "Fashion & Apparel",
    location: "Atlanta, GA",
    desc: "Modern streetwear inspired by West African heritage and timeless craftsmanship.",
    rating: "4.8",
    reviews: "96",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    verified: true
  },
  {
    name: "Heritage Brew Coffee",
    category: "Food & Beverage",
    location: "Oakland, CA",
    desc: "Ethically sourced, small-batch coffee celebrating African origins.",
    rating: "4.9",
    reviews: "210",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80",
    verified: true
  },
  {
    name: "Diaspora Voices",
    category: "Books & Literature",
    location: "Chicago, IL",
    desc: "Independent bookstore and publisher amplifying Black stories and voices.",
    rating: "4.9",
    reviews: "76",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    verified: true
  }
];

// Helper components for the new layout
const HeroCard = ({ image, name, category, rating, zIndex, transform, featured }: any) => (
  <div className={`absolute bg-white rounded-2xl shadow-xl overflow-hidden w-64 ${transform}`} style={{ zIndex }}>
    <div className="h-40 w-full overflow-hidden">
      <img src={image} className="w-full h-full object-cover" alt={name} />
    </div>
    <div className="p-4 bg-white">
      <h3 className="font-serif font-bold text-lg text-gray-900">{name}</h3>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">{category}</span>
        <span className="flex items-center text-xs font-bold text-gray-900">
          <Star className="w-3 h-3 text-gold-base fill-gold-base mr-1" /> {rating}
        </span>
      </div>
    </div>
  </div>
);

const ReviewCard = ({ user, time, shop, rating, reviews, location, category, text, photos, onCommentClick, onShareClick }: any) => {
  const [isHelpful, setIsHelpful] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <div className="text-sm">
            <span className="font-bold text-gray-900">{user.name}</span>
            <span className="text-gray-500"> {user.action}</span>
          </div>
          <div className="text-[11px] text-gray-400 font-medium">{time}</div>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-bold text-gray-900 leading-tight">{shop}</h4>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
               <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-rust fill-rust' : 'text-gray-300 fill-gray-300'}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-900">{rating}</span>
          <span className="text-xs text-gray-500">({reviews})</span>
        </div>
        <div className="text-[11px] text-gray-500 mt-1">
          {location} • {category}
        </div>
      </div>

      {text && <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-1">{text}</p>}

      {photos && photos.length > 0 && (
        <div className="flex gap-2 mb-4 flex-1 items-start">
          {photos.slice(0, 3).map((p: string, i: number) => (
            <div key={i} className="relative flex-1 aspect-square rounded-xl overflow-hidden shrink-0 bg-gray-100">
               <img src={p} className="w-full h-full object-cover" />
               {i === 2 && photos.length > 3 && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                   <span className="text-white font-bold text-sm">+{photos.length - 2}</span>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <button 
          onClick={() => setIsHelpful(!isHelpful)}
          className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${isHelpful ? 'text-rust' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-rust' : ''}`} /> {isHelpful ? 'Helpful (1)' : 'Helpful'}
        </button>
        <button onClick={onCommentClick || (() => alert("Comment feature coming soon!"))} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
          <MessageSquare className="w-4 h-4" /> Comment
        </button>
        <button onClick={onShareClick || (() => alert("Copied link to clipboard!"))} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
};

const ShopCard = ({ shop, onViewClick }: { shop: any, onViewClick?: () => void }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
    <div className="relative h-48">
      <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
      {shop.verified && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 flex items-center gap-1 rounded-md text-[10px] font-bold text-green-700">
          <ShieldCheck className="w-3 h-3 text-green-600" /> Verified
        </div>
      )}
    </div>
    <div className="p-5 flex flex-col flex-1">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-serif font-bold text-xl text-gray-900 leading-tight">{shop.name}</h3>
      </div>
      <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
        <span>{shop.category}</span>
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {shop.location}</span>
      </div>
      <p className="text-xs text-gray-600 mb-4 line-clamp-3 flex-1">{shop.desc}</p>
      
      <div className="flex items-center gap-1 mb-4">
        <Star className="w-4 h-4 text-mustard fill-mustard" />
        <span className="text-sm font-bold text-gray-900">{shop.rating}</span>
        <span className="text-xs text-gray-500">({shop.reviews})</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button onClick={() => onViewClick?.()} className="bg-rust hover:bg-rust-dark text-white rounded-lg py-2 text-sm font-semibold transition-colors">
          View Shop
        </button>
        <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.location + ', ' + shop.name)}`, '_blank')} className="border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-semibold transition-colors bg-white">
          Get Directions
        </button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'admin' | 'state_shops'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const exploreRef = useRef<HTMLElement>(null);
  const locationRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLElement>(null);

  const handleStateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Select Your State' || val === 'Select your state' || val === '') return;
    
    setSelectedState(val);
    triggerSearch();
  };

  const triggerSearch = () => {
    setIsSearchingLocation(true);
    setTimeout(() => {
      setIsSearchingLocation(false);
      scrollTo(mapRef);
    }, 1500);
  };

  const handleUseLocation = () => {
    setIsSearchingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            
            if (data.principalSubdivision) {
              setSelectedState(data.principalSubdivision);
            } else {
              setSelectedState('California'); // Fallback
            }
          } catch (error) {
            console.error("Error fetching location:", error);
            setSelectedState('California');
          } finally {
            setIsSearchingLocation(false);
            scrollTo(mapRef);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setSelectedState('California');
          setIsSearchingLocation(false);
          scrollTo(mapRef);
        }
      );
    } else {
      setSelectedState('California');
      setIsSearchingLocation(false);
      scrollTo(mapRef);
    }
  };

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      window.scrollTo({ top: ref.current.offsetTop - 80, behavior: 'smooth' });
    }
  };

  const handleShare = async (title: string, text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 font-sans selection:bg-gold-light/30">
      <Header 
        activeView={activeView} 
        onNavigate={setActiveView} 
        onApply={() => setIsModalOpen(true)} 
        onScrollToMap={() => { setActiveView('home'); setTimeout(() => scrollTo(mapRef), 50); }}
        onScrollToCategories={() => { setActiveView('home'); setTimeout(() => scrollTo(exploreRef), 50); }}
      />

      {/* Listing Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bazaar-dark/80 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="px-8 pt-8 pb-6 bg-[#FAF8F5] border-b border-gray-100 placeholder:text-gray-400">
              <div className="w-12 h-12 bg-rust/10 text-rust rounded-full flex items-center justify-center mb-4 border border-rust/20 shadow-sm">
                <Store className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Apply for Listing Verification</h2>
              <p className="text-sm font-medium text-gray-500 mt-2">Join thousands of verified Black-owned businesses on our platform.</p>
            </div>
            <div className="p-8">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Application submitted successfully! Our team will contact you soon."); setIsModalOpen(false); }}>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Business Name</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rust focus:ring-1 focus:ring-rust transition-colors" placeholder="e.g. Lumina Organics" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Owner Name</label>
                    <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rust transition-colors" placeholder="First & Last Name" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Category</label>
                    <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rust transition-colors appearance-none">
                      <option value="">Select...</option>
                      <option>Fashion & Apparel</option>
                      <option>Beauty & Wellness</option>
                      <option>Food & Beverage</option>
                      <option>Services</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                  <input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rust transition-colors" placeholder="hello@yourbusiness.com" />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-rust hover:bg-rust-dark text-white rounded-xl py-3.5 font-bold transition-colors shadow-md shadow-rust/20">
                    Submit Application
                  </button>
                  <p className="text-center text-[11px] text-gray-500 mt-4 font-medium">
                    By submitting, you agree to our verification process. Our team will contact you to schedule a quick confirmation call.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

        {/* Write a Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bazaar-dark/80 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="px-8 pt-8 pb-6 bg-[#FAF8F5] border-b border-gray-100 placeholder:text-gray-400">
              <div className="w-12 h-12 bg-rust/10 text-rust rounded-full flex items-center justify-center mb-4 border border-rust/20 shadow-sm">
                <PenLine className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Write a Review</h2>
              <p className="text-sm font-medium text-gray-500 mt-2">Share your experience and help others discover great Black-owned businesses.</p>
            </div>
            <div className="p-8">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Review submitted successfully!"); setIsReviewModalOpen(false); }}>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Business Name</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rust focus:ring-1 focus:ring-rust transition-colors" placeholder="Which business did you visit?" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" className="text-gray-300 hover:text-rust transition-colors">
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Your Review</label>
                  <textarea required rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rust transition-colors resize-none" placeholder="Tell us about your experience..."></textarea>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-rust hover:bg-rust-dark text-white rounded-xl py-3.5 font-bold transition-colors shadow-md shadow-rust/20">
                    Post Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Shop Detail Modal */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bazaar-dark/80 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedShop(null)}
              className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-gray-900 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative h-64 shrink-0">
              <img src={selectedShop.image} alt={selectedShop.name} className="w-full h-full object-cover" />
              {selectedShop.verified && (
                <div className="absolute bottom-4 left-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1 rounded-lg text-xs font-bold text-green-700 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> Verified Business
                </div>
              )}
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 leading-tight mb-2">{selectedShop.name}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 font-medium">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">{selectedShop.category}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedShop.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-center gap-1.5 bg-[#FFFDF5] border border-mustard/20 px-3 py-1.5 rounded-xl shadow-sm">
                    <Star className="w-5 h-5 text-mustard fill-mustard" />
                    <span className="font-bold text-gray-900 text-lg leading-none">{selectedShop.rating}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">Based on {selectedShop.reviews} reviews</div>
                </div>
              </div>
              
              <div className="h-px w-full bg-gray-100 my-6"></div>
              
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">About the business</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedShop.desc} Exploring the deep roots of our culture through amazing products and services. We're proud to serve our local community and bring you the finest quality. Thank you for your continued support!
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedShop.location + ', ' + selectedShop.name)}`, '_blank')} className="flex items-center justify-center gap-2 bg-rust hover:bg-rust-dark text-white rounded-xl py-3.5 font-bold transition-colors shadow-md shadow-rust/20">
                  <MapPin className="w-5 h-5" /> Get Directions
                </button>
                <button onClick={() => alert("Website coming soon!")} className="flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl py-3.5 font-bold transition-colors bg-white">
                  <Globe className="w-5 h-5" /> Visit Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'admin' ? (
        <AdminDashboard />
      ) : activeView === 'state_shops' ? (
        <StateShopsView 
          stateName={selectedState || 'California'} 
          onBack={() => setActiveView('home')} 
          onSelectShop={setSelectedShop} 
        />
      ) : (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <section className="py-12 md:py-20 grid lg:grid-cols-2 gap-12 items-center relative">
          {/* Decorative shapes */}
          <div className="absolute top-10 left-0 -translate-x-full">
            <svg width="100" height="150" viewBox="0 0 100 150" fill="none">
              <path d="M0 0C50 0 100 50 100 100C100 120 80 150 50 150H0V0Z" fill="#D05334" opacity="0.1" />
              <circle cx="20" cy="40" r="8" fill="#E2AD45" />
              <rect x="10" y="80" width="15" height="40" rx="7.5" fill="#E2AD45" transform="rotate(45 10 80)" />
            </svg>
          </div>

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rust/30 text-rust-dark text-[10px] font-bold tracking-wider uppercase mb-8 bg-rust/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-rust-dark animate-pulse"></div>
              The #1 Directory for Black-Owned Businesses
            </div>
            
            <h2 className="text-5xl lg:text-[4rem] xl:text-[4.5rem] font-serif font-bold leading-[1.05] tracking-tight mb-6 text-gray-900">
              Discover Black-Owned<br />
              <span className="text-rust">Shops Near You</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed font-medium">
              Find and support incredible Black entrepreneurs, shop local, and help build generational wealth in our communities.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button onClick={() => scrollTo(exploreRef)} className="flex items-center gap-2 bg-rust hover:bg-rust-dark text-white px-8 py-3.5 rounded-full font-semibold transition-colors shadow-lg shadow-rust/20">
                Explore Shops <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollTo(locationRef)} className="flex items-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-3.5 rounded-full font-semibold transition-colors bg-white">
                <MapPin className="w-5 h-5 text-gray-500" /> Find My State
              </button>
            </div>

            <div className="flex items-center gap-8 md:gap-12 flex-wrap text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-light/30 flex items-center justify-center text-mustard">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">10K+</div>
                  <div className="text-gray-500 text-xs font-medium">Verified Businesses</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-light/30 flex items-center justify-center text-mustard">
                  <MapIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">50 States</div>
                  <div className="text-gray-500 text-xs font-medium">Covered</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-light/30 flex items-center justify-center text-mustard">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">1M+</div>
                  <div className="text-gray-500 text-xs font-medium">Shoppers Strong</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[480px] hidden lg:block">
            {/* The overlapping cards visual */}
            <HeroCard 
              image="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80" 
              name="Kente Clothier" category="Fashion & Apparel" rating="4.9"
              zIndex={10} transform="top-12 -left-8 -rotate-6"
            />
            <HeroCard 
              image="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80" 
              name="Heritage Brew Coffee" category="Food & Beverage" rating="4.8"
              zIndex={20} transform="top-0 left-32 scale-110 shadow-2xl"
            />
            <HeroCard 
              image="https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&q=80" 
              name="Zuri & Co. Botanicals" category="Beauty & Wellness" rating="4.9"
              zIndex={15} transform="top-16 left-72 rotate-3"
            />
            {/* Carousel dots */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              <div className="w-3 h-1.5 rounded-full bg-bazaar-dark"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </section>

        {/* HORIZONTAL LOCATION BANNER */}
        <section className="mb-14" ref={locationRef}>
          <div className="bg-[#1C3627] rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
            
            <div className="flex items-center gap-4 relative z-10 w-full lg:w-auto">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm hidden md:flex">
                <MapPin className="w-8 h-8 text-[#1C3627]" fill="currentColor" strokeWidth={1} />
              </div>
              <div className="text-white">
                <h3 className="font-serif font-bold text-xl md:text-2xl mb-1">Find Black-Owned Shops Near You</h3>
                <p className="text-sm text-gray-300 leading-tight md:leading-normal">Select your state or use your location to discover verified<br className="hidden lg:block" /> Black-owned businesses in your area.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full lg:w-auto">
              <div className="relative w-full sm:w-auto">
                <select 
                  value={selectedState} 
                  onChange={handleStateSelect} 
                  className="appearance-none bg-transparent border border-[#3E5C4B] text-white rounded-xl py-3 pl-4 pr-12 text-sm font-semibold outline-none focus:border-mustard transition-colors w-full sm:w-64 cursor-pointer hover:bg-white/5"
                >
                  <option value="" className="text-gray-900">Select Your State</option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state} className="text-gray-900">{state}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              
              <span className="text-sm font-medium text-gray-400 italic hidden sm:inline">or</span>
              
              <button 
                onClick={handleUseLocation}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#F6F2EB] hover:bg-white text-[#1C3627] px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
              >
                Use My Location
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-3 relative z-10 border-l border-[#3E5C4B] pl-8">
               <div className="flex -space-x-3">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" className="w-10 h-10 rounded-full border-2 border-[#1C3627] object-cover" alt="Shopper" />
                 <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80" className="w-10 h-10 rounded-full border-2 border-[#1C3627] object-cover" alt="Shopper" />
                 <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" className="w-10 h-10 rounded-full border-2 border-[#1C3627] object-cover" alt="Shopper" />
               </div>
               <div className="text-white text-sm">
                 <span className="font-bold">Join 50,000+ shoppers</span>
                 <p className="text-[11px] text-gray-400 leading-tight">supporting Black-owned<br/>everyday.</p>
               </div>
            </div>
          </div>
        </section>

        {/* MAP SECTION */}
        <section className="mb-14" ref={mapRef}>
          <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-[#F0ECE4] shadow-sm relative">
            {isSearchingLocation && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 rounded-[2rem] flex items-center justify-center">
                <div className="bg-white px-6 py-4 rounded-full shadow-lg flex items-center gap-3 border border-gray-100">
                  <div className="w-5 h-5 border-2 border-rust border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-bold text-sm text-gray-900">Finding locations...</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-[28px] font-serif font-bold text-gray-900">Shop Black-Owned Businesses by State</h2>
                <p className="text-gray-500 mt-1 text-sm font-medium">Explore amazing businesses across the United States.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select 
                    value={selectedState} 
                    onChange={handleStateSelect}
                    className="appearance-none bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm font-semibold text-gray-700 outline-none focus:border-rust shadow-sm cursor-pointer"
                  >
                    <option value="">Select your state</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button onClick={handleUseLocation} className="flex items-center gap-2 bg-bazaar-dark hover:bg-[#2d211d] text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-sm">
                  <MapPin className="w-4 h-4" /> Use My Location
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
              {/* Map Illustration Placeholder */}
              <div className="bg-[#FAF8F5] rounded-3xl flex items-center justify-center relative border border-[#EBE6DD] overflow-hidden min-h-[400px]">
                {/* Simplified Map Visual */}
                <div className="w-[110%] h-[110%] opacity-[0.35] invert sepia saturate-0 hue-rotate-180 brightness-75 contrast-125" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/1/1a/Blank_US_Map_%28states_only%29.svg")', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
                
                {/* Map Controls */}
                <div className="absolute top-4 left-4 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500 overflow-hidden">
                  <button className="p-2 hover:bg-gray-50 transition-colors"><Plus className="w-4 h-4" /></button>
                  <div className="h-px bg-gray-200"></div>
                  <button className="p-2 hover:bg-gray-50 transition-colors"><div className="w-4 h-[2px] bg-current rounded-full"></div></button>
                  <div className="h-px bg-gray-200"></div>
                  <button className="p-2 hover:bg-gray-50 transition-colors"><MapIcon className="w-4 h-4" /></button>
                </div>
                
                {/* Pin for State */}
                <div className="absolute top-[48%] left-[12%]">
                  <div className="bg-bazaar-dark text-white text-xs px-3 py-2 rounded-xl shadow-xl font-medium mb-2 relative scale-110 origin-bottom-left">
                    <div className="font-bold text-sm">{selectedState || 'California'}</div>
                    <div className="flex items-center gap-1 mt-1 text-gray-300 font-normal"><Building2 className="w-3 h-3" /> {selectedState === 'New York' ? '892' : '1,248'} businesses</div>
                    <div className="absolute -bottom-2 left-6 border-[5px] border-transparent border-t-bazaar-dark"></div>
                  </div>
                  <div className="w-4 h-4 bg-rust rounded-full border-[3px] border-white ml-8 shadow-md"></div>
                </div>
              </div>

              {/* State Details Panel */}
              <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#EBE6DD] flex flex-col">
                <div className="mb-6 relative rounded-2xl h-[100px] overflow-hidden bg-gradient-to-r from-[#FDE8D4] to-[#FDFCFB] p-5 flex items-center border border-white">
                  {/* Decorative background image for State */}
                  <div className="absolute inset-y-0 right-0 w-40 opacity-80 mix-blend-multiply" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1549490059-4d62ea06ef55?w=300&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', maskImage: 'linear-gradient(to right, transparent, black 80%)' }}></div>
                  <div className="relative z-10">
                    <div className="text-[9px] uppercase font-bold tracking-[0.15em] text-rust mb-1 inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
                      <MapPin className="w-2.5 h-2.5" /> SELECTED STATE
                    </div>
                    <h3 className="font-serif text-[32px] font-bold text-gray-900 leading-none mt-1 shadow-white drop-shadow-md">{selectedState || 'California'}</h3>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-6 border-b border-[#EBE6DD] pb-5">
                  <span className="text-[34px] tracking-tight font-bold text-gray-900 leading-none">{selectedState === 'New York' ? '892' : '1,248'}</span>
                  <span className="text-sm font-semibold text-gray-500">Businesses</span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Top Cities</h4>
                    <ul className="space-y-2.5 text-[13px]">
                      <li className="flex justify-between items-center text-gray-700">
                        <span className="truncate pr-2">{selectedState === 'New York' ? 'Brooklyn' : 'Los Angeles'}</span> 
                        <span className="font-bold text-gray-900">{selectedState === 'New York' ? '324' : '412'}</span>
                      </li>
                      <li className="flex justify-between items-center text-gray-700">
                        <span className="truncate pr-2">{selectedState === 'New York' ? 'Harlem' : 'Oakland'}</span> 
                        <span className="font-bold text-gray-900">{selectedState === 'New York' ? '188' : '168'}</span>
                      </li>
                      <li className="flex justify-between items-center text-gray-700">
                        <span className="truncate pr-2">{selectedState === 'New York' ? 'Queens' : 'San Diego'}</span> 
                        <span className="font-bold text-gray-900">{selectedState === 'New York' ? '121' : '142'}</span>
                      </li>
                    </ul>
                    <button onClick={() => alert("Loading cities...")} className="text-rust text-xs font-bold mt-4 flex items-center gap-1 hover:text-rust-dark transition-colors">
                      View all cities <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Popular Categories</h4>
                    <ul className="space-y-2.5 text-[13px]">
                      <li className="flex justify-between items-center text-gray-700">
                        <span className="flex items-center gap-1.5 truncate pr-2"><Sparkles className="w-3.5 h-3.5 text-rust/80 shrink-0" /> Beauty & Wellness</span> 
                        <span className="font-bold text-gray-900 shrink-0">312</span>
                      </li>
                      <li className="flex justify-between items-center text-gray-700">
                        <span className="flex items-center gap-1.5 truncate pr-2"><Shirt className="w-3.5 h-3.5 text-rust/80 shrink-0" /> Fashion & Appar...</span> 
                        <span className="font-bold text-gray-900 shrink-0">286</span>
                      </li>
                      <li className="flex justify-between items-center text-gray-700">
                        <span className="flex items-center gap-1.5 truncate pr-2"><Coffee className="w-3.5 h-3.5 text-rust/80 shrink-0" /> Food & Beverage</span> 
                        <span className="font-bold text-gray-900 shrink-0">198</span>
                      </li>
                      <li className="flex justify-between items-center text-gray-700">
                        <span className="flex items-center gap-1.5 truncate pr-2"><HomeIcon className="w-3.5 h-3.5 text-rust/80 shrink-0" /> Home Goods</span> 
                        <span className="font-bold text-gray-900 shrink-0">156</span>
                      </li>
                      <li className="flex justify-between items-center text-gray-700">
                        <span className="flex items-center gap-1.5 truncate pr-2"><BookOpen className="w-3.5 h-3.5 text-rust/80 shrink-0" /> Books & Literat...</span> 
                        <span className="font-bold text-gray-900 shrink-0">94</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button onClick={() => setActiveView('state_shops')} className="w-full bg-rust hover:bg-rust-dark text-white rounded-xl py-3.5 font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-rust/10">
                    View Shops in {selectedState || 'California'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FILTERS BAR */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl p-4 border border-[#F0ECE4] flex flex-wrap xl:flex-nowrap items-center justify-between gap-4 shadow-sm text-sm">
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 flex-1">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 tracking-wider">State</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl py-2.5 pl-3 pr-8 font-medium text-gray-700 outline-none focus:border-rust transition-colors cursor-pointer">
                    <option>All States</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 tracking-wider">City</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl py-2.5 pl-3 pr-8 font-medium text-gray-700 outline-none focus:border-rust transition-colors cursor-pointer">
                    <option>All Cities</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 tracking-wider">Category</label>
                <div className="relative">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl py-2.5 pl-9 pr-8 font-medium text-gray-700 outline-none focus:border-rust transition-colors cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Books & Literature">Books & Literature</option>
                    <option value="Art & Collectibles">Art & Collectibles</option>
                    <option value="Home Goods">Home Goods</option>
                    <option value="Services">Services</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                  <Grid className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              
              <div className="h-10 w-px bg-gray-200 hidden xl:block mx-1 mt-5"></div>
              
              <div className="flex items-center gap-3 mt-5 xl:mt-5 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar flex-1">
                <label className="flex items-center gap-2 cursor-pointer shrink-0 pl-1">
                  <div className="w-4 h-4 rounded-full border border-gray-300 bg-white"></div>
                  <span className="font-semibold text-gray-600 text-[13px]">Online Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <div className="w-4 h-4 rounded-full border border-gray-300 bg-white"></div>
                  <span className="font-semibold text-gray-600 text-[13px]">Local Pickup</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-green-50/80 hover:bg-green-100 px-3 py-[7px] rounded-full shrink-0 transition-colors border border-green-100">
                  <div className="w-7 h-4 bg-green-600 rounded-full relative shadow-inner">
                    <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                  <span className="font-bold text-green-700 text-[13px]">Ships Nationwide</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg shrink-0 transition-colors">
                  <div className="w-4 h-4 bg-green-600 rounded-md flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-[13px]">Verified</span>
                </label>
              </div>
            </div>
            
            <button onClick={() => setSelectedCategory('')} className="text-rust text-[13px] font-bold flex items-center gap-1 hover:text-rust-dark transition-colors shrink-0 mt-5 xl:mt-5 px-3 py-1.5 bg-rust/5 hover:bg-rust/10 rounded-lg">
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>
        </section>

        {/* FEATURED SHOPS */}
        <section className="mb-16" ref={exploreRef}>
          <div className="flex items-end justify-between mb-6 px-1">
            <h2 className="text-[28px] font-serif font-bold text-gray-900 tracking-tight">Featured Black-Owned Shops</h2>
            <button onClick={() => alert("Loading more shops...")} className="text-rust font-bold flex items-center gap-1 text-sm hover:text-rust-dark transition-colors group">
              View all shops <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_SHOPS.filter(shop => !selectedCategory || shop.category === selectedCategory).map((shop, i) => (
                <ShopCard key={i} onViewClick={() => setSelectedShop(shop)} shop={shop}/>
              ))}
            </div>
            
            {/* Nav Arrows */}
            <button className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-200 transition-all z-10 hidden xl:flex">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* REVIEWS & PHOTOS */}
        <section className="mb-16">
          <div className="flex flex-wrap items-end justify-between mb-6 px-1 gap-4">
            <div>
              <h2 className="text-[28px] font-serif font-bold text-gray-900 tracking-tight">Reviews & Photos</h2>
              <p className="text-gray-500 mt-1 text-sm font-medium">Real experiences from our community</p>
            </div>
            <button onClick={() => setIsReviewModalOpen(true)} className="flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-2.5 rounded-full font-semibold transition-colors bg-white text-sm shadow-sm cursor-pointer h-10">
              <PenLine className="w-4 h-4" /> Write a Review
            </button>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ReviewCard 
                 user={{ name: "Jasmine R.", action: "added 5 photos", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" }}
                 time="10 minutes ago" shop="Melanin Books & More" rating={4.8} reviews={94} location="Houston, TX" category="Books & Literature"
                 photos={[
                   "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&q=80",
                   "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&q=80",
                   "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&q=80"
                 ]}
                 onCommentClick={() => setIsReviewModalOpen(true)}
                 onShareClick={() => handleShare("BuyBlack Review - Melanin Books & More", "Check out this review of Melanin Books & More on BuyBlack!")}
              />
              <ReviewCard 
                 user={{ name: "Marcus T.", action: "wrote a review", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" }}
                 time="25 minutes ago" shop="The Flex Collective" rating={4.9} reviews={67} location="Los Angeles, CA" category="Fashion"
                 text="Amazing quality and even better customer service. Shipping was fast and the packaging was on point. Will definitely shop again!"
                 onCommentClick={() => setIsReviewModalOpen(true)}
                 onShareClick={() => handleShare("BuyBlack Review - The Flex Collective", "Check out this review of The Flex Collective on BuyBlack!")}
              />
              <ReviewCard 
                 user={{ name: "Tasha L.", action: "added 3 photos", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" }}
                 time="1 hour ago" shop="Sweet Earth Bakery" rating={4.7} reviews={53} location="Chicago, IL" category="Food & Beverage"
                 photos={[
                   "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80",
                   "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=300&q=80",
                   "https://images.unsplash.com/photo-1559553156-2e97137af16f?w=300&q=80"
                 ]}
                 onCommentClick={() => setIsReviewModalOpen(true)}
                 onShareClick={() => handleShare("BuyBlack Review - Sweet Earth Bakery", "Check out this review of Sweet Earth Bakery on BuyBlack!")}
              />
              <ReviewCard 
                 user={{ name: "DeAndre P.", action: "wrote a review", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80" }}
                 time="2 hours ago" shop="Dapper Depths Barbershop" rating={4.9} reviews={112} location="Miami, FL" category="Beauty & Wellness"
                 text="Best cut in the city! The vibe is immaculate and my barber really listens to what I want. 10/10 recommend."
                 onCommentClick={() => setIsReviewModalOpen(true)}
                 onShareClick={() => handleShare("BuyBlack Review - Dapper Depths Barbershop", "Check out this review of Dapper Depths Barbershop on BuyBlack!")}
              />
            </div>

            <button className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-200 transition-all z-10 hidden xl:flex">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* SHOP BY CATEGORY */}
        <section className="mb-20">
          <h2 className="text-[28px] font-serif font-bold text-gray-900 mb-6 px-1 tracking-tight">Shop by Category</h2>
          
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div onClick={() => { setSelectedCategory(selectedCategory === 'Fashion & Apparel' ? '' : 'Fashion & Apparel'); scrollTo(exploreRef); }} className={`bg-rust rounded-2xl p-5 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-rust/20 transition-all cursor-pointer flex flex-col justify-between aspect-square ${selectedCategory === 'Fashion & Apparel' ? 'ring-4 ring-rust/50 shadow-lg -translate-y-1' : ''}`}>
                <Shirt className="w-7 h-7 mb-auto" />
                <div>
                  <h4 className="font-bold text-[13px] leading-tight mb-1">Fashion &<br/>Apparel</h4>
                  <p className="text-[10px] font-medium text-white/80">1,286 shops</p>
                </div>
              </div>
              <div onClick={() => { setSelectedCategory(selectedCategory === 'Beauty & Wellness' ? '' : 'Beauty & Wellness'); scrollTo(exploreRef); }} className={`bg-[#CF4D67] rounded-2xl p-5 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#CF4D67]/20 transition-all cursor-pointer flex flex-col justify-between aspect-square ${selectedCategory === 'Beauty & Wellness' ? 'ring-4 ring-[#CF4D67]/50 shadow-lg -translate-y-1' : ''}`}>
                <Sparkles className="w-7 h-7 mb-auto" />
                <div>
                  <h4 className="font-bold text-[13px] leading-tight mb-1">Beauty &<br/>Wellness</h4>
                  <p className="text-[10px] font-medium text-white/80">1,042 shops</p>
                </div>
              </div>
              <div onClick={() => { setSelectedCategory(selectedCategory === 'Food & Beverage' ? '' : 'Food & Beverage'); scrollTo(exploreRef); }} className={`bg-[#1C8276] rounded-2xl p-5 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1C8276]/20 transition-all cursor-pointer flex flex-col justify-between aspect-square ${selectedCategory === 'Food & Beverage' ? 'ring-4 ring-[#1C8276]/50 shadow-lg -translate-y-1' : ''}`}>
                <Coffee className="w-7 h-7 mb-auto" />
                <div>
                  <h4 className="font-bold text-[13px] leading-tight mb-1">Food &<br/>Beverage</h4>
                  <p className="text-[10px] font-medium text-white/80">2,134 shops</p>
                </div>
              </div>
              <div onClick={() => { setSelectedCategory(selectedCategory === 'Books & Literature' ? '' : 'Books & Literature'); scrollTo(exploreRef); }} className={`bg-[#6B4B8B] rounded-2xl p-5 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6B4B8B]/20 transition-all cursor-pointer flex flex-col justify-between aspect-square ${selectedCategory === 'Books & Literature' ? 'ring-4 ring-[#6B4B8B]/50 shadow-lg -translate-y-1' : ''}`}>
                <BookOpen className="w-7 h-7 mb-auto" />
                <div>
                  <h4 className="font-bold text-[13px] leading-tight mb-1">Books &<br/>Literature</h4>
                  <p className="text-[10px] font-medium text-white/80">832 shops</p>
                </div>
              </div>
              <div onClick={() => { setSelectedCategory(selectedCategory === 'Art & Collectibles' ? '' : 'Art & Collectibles'); scrollTo(exploreRef); }} className={`bg-[#D3A248] rounded-2xl p-5 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#D3A248]/20 transition-all cursor-pointer flex flex-col justify-between aspect-square ${selectedCategory === 'Art & Collectibles' ? 'ring-4 ring-[#D3A248]/50 shadow-lg -translate-y-1' : ''}`}>
                <Palette className="w-7 h-7 mb-auto" />
                <div>
                  <h4 className="font-bold text-[13px] leading-tight mb-1">Art &<br/>Collectibles</h4>
                  <p className="text-[10px] font-medium text-white/80">642 shops</p>
                </div>
              </div>
              <div onClick={() => { setSelectedCategory(selectedCategory === 'Home Goods' ? '' : 'Home Goods'); scrollTo(exploreRef); }} className={`bg-[#418E5E] rounded-2xl p-5 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#418E5E]/20 transition-all cursor-pointer flex flex-col justify-between aspect-square ${selectedCategory === 'Home Goods' ? 'ring-4 ring-[#418E5E]/50 shadow-lg -translate-y-1' : ''}`}>
                <HomeIcon className="w-7 h-7 mb-auto" />
                <div>
                  <h4 className="font-bold text-[13px] leading-tight mb-1">Home<br/>Goods</h4>
                  <p className="text-[10px] font-medium text-white/80">914 shops</p>
                </div>
              </div>
              <div onClick={() => { setSelectedCategory(selectedCategory === 'Services' ? '' : 'Services'); scrollTo(exploreRef); }} className={`bg-[#1F5490] rounded-2xl p-5 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1F5490]/20 transition-all cursor-pointer flex flex-col justify-between aspect-square ${selectedCategory === 'Services' ? 'ring-4 ring-[#1F5490]/50 shadow-lg -translate-y-1' : ''}`}>
                <Briefcase className="w-7 h-7 mb-auto" />
                <div>
                  <h4 className="font-bold text-[13px] leading-tight mb-1">Services</h4>
                  <p className="text-[10px] font-medium text-white/80">1,203 shops</p>
                </div>
              </div>
              <div onClick={() => { setSelectedCategory(selectedCategory === 'Wellness' ? '' : 'Wellness'); scrollTo(exploreRef); }} className={`bg-[#D46B34] rounded-2xl p-5 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#D46B34]/20 transition-all cursor-pointer flex flex-col justify-between aspect-square ${selectedCategory === 'Wellness' ? 'ring-4 ring-[#D46B34]/50 shadow-lg -translate-y-1' : ''}`}>
                <Heart className="w-7 h-7 mb-auto" />
                <div>
                  <h4 className="font-bold text-[13px] leading-tight mb-1">Wellness</h4>
                  <p className="text-[10px] font-medium text-white/80">531 shops</p>
                </div>
              </div>
            </div>
            
            <button className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-200 transition-all z-10 hidden xl:flex">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="mb-12 rounded-[2.5rem] bg-[#1A1116] overflow-hidden relative shadow-2xl">
          {/* Decorative Background Botanical Pattern - simplified via CSS */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-mustard/40 via-transparent to-transparent"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-stretch min-h-[320px]">
            {/* Image container */}
            <div className="lg:w-1/3 relative hidden md:block">
              <div className="absolute bottom-0 left-8 origin-bottom z-10" style={{ transform: 'scale(1.15) translateY(10%)' }}>
                 <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=800" 
                  alt="Entrepreneur" 
                  className="w-full h-[380px] object-cover object-top mask-image-bottom-gradient"
                  style={{ 
                    WebkitMaskImage: 'linear-gradient(to top, transparent 5%, black 25%)',
                    maskImage: 'linear-gradient(to top, transparent 5%, black 25%)'
                  }}
                />
              </div>
            </div>
            
            <div className="lg:w-2/3 p-10 lg:py-16 lg:px-12 text-white flex flex-col xl:flex-row items-center xl:items-start xl:justify-between gap-10">
              <div className="max-w-lg z-20">
                <h2 className="text-3xl md:text-[2.5rem] font-serif font-bold mb-4 leading-tight tracking-tight">Own a Black-Owned Business?</h2>
                <p className="text-gray-300 text-[15px] leading-relaxed mb-8">
                  Join thousands of entrepreneurs growing their businesses and reaching more customers on BuyBlack.
                </p>
                <div className="flex gap-x-8 gap-y-6 flex-wrap">
                  <div className="flex-1 min-w-[120px]">
                    <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center mb-3">
                      <Store className="w-4 h-4 text-gray-300" />
                    </div>
                    <h4 className="font-bold text-sm tracking-wide">Increase Visibility</h4>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">Get discovered by<br/>thousands of shoppers</p>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <div className="w-10 h-10 rounded-full border border-mustard/30 bg-mustard/10 flex items-center justify-center mb-3">
                      <Users className="w-4 h-4 text-mustard" />
                    </div>
                    <h4 className="font-bold text-sm text-mustard tracking-wide">Build Community</h4>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">Connect with customers<br/>who support your mission</p>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center mb-3">
                      <HomeIcon className="w-4 h-4 text-gray-300" />
                    </div>
                    <h4 className="font-bold text-sm tracking-wide">Grow Your Business</h4>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">Access tools to scale<br/>and succeed</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center xl:items-end justify-center shrink-0 w-full xl:w-auto z-20 mt-4 xl:mt-0">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-mustard hover:bg-[#d09d35] text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center gap-2 mb-5 w-full justify-center shadow-lg shadow-mustard/20"
                >
                  List Your Business <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center gap-2 text-mustard text-xs font-semibold">
                   It's free and only takes<br className="xl:hidden"/> a few minutes! <Sparkles className="w-4 h-4 inline ml-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST MARKERS */}
        <section className="mb-12 bg-[#F9F6F0] rounded-[2rem] p-8 md:p-10 border border-[#EBE6DD]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1C3627] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Verified Black-Owned</h4>
                <p className="text-gray-600 text-[13px] leading-relaxed">Every business is verified<br/>for authenticity.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-rust/10 text-rust flex items-center justify-center shrink-0 shadow-sm mt-1 border border-rust/20">
                <Users className="w-6 h-6" fill="currentColor" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Support & Uplift</h4>
                <p className="text-gray-600 text-[13px] leading-relaxed">Your support helps build<br/>stronger communities.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E5ECE5] text-[#1C3627] flex items-center justify-center shrink-0 shadow-sm mt-1 border border-[#C6D8CB]">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Shop Local or Nationwide</h4>
                <p className="text-gray-600 text-[13px] leading-relaxed">Find local favorites or shop<br/>from anywhere.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F3E8DB] text-mustard border border-[#E9CBA8] flex items-center justify-center shrink-0 shadow-sm mt-1">
                <MessageSquare className="w-6 h-6" fill="currentColor" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Real Reviews. Real Impact.</h4>
                <p className="text-gray-600 text-[13px] leading-relaxed">Share your experience and<br/>help others discover.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      )}
    </div>
  );
}
