import React, { useState } from "react";
import { 
  ShieldCheck, Phone, CheckCircle2, XCircle, Search, 
  Filter, Calendar, Clock, ChevronRight, User, Mail, Link as LinkIcon
} from "lucide-react";

const INITIAL_APPS = [
  {
    id: "app-1049",
    businessName: "Soul Full Kitchen",
    ownerName: "Marcus Johnson",
    email: "marcus@soulfullkitchen.co",
    phone: "(555) 234-9812",
    category: "Food & Beverage",
    submittedDate: "Today, 9:24 AM",
    status: "pending",
    location: "Atlanta, GA",
    description: "A modern soul food experience focusing on healthy, locally sourced ingredients without sacrificing flavor.",
    website: "soulfullkitchen.co"
  },
  {
    id: "app-1048",
    businessName: "Lumina Organics",
    ownerName: "Sarah Adebayo",
    email: "hello@luminaorganics.com",
    phone: "(555) 876-1200",
    category: "Beauty & Wellness",
    submittedDate: "Yesterday, 3:15 PM",
    status: "pending",
    location: "Brooklyn, NY",
    description: "Handcrafted, plant-based skincare products made with ingredients sourced directly from West Africa.",
    website: "luminaorganics.com"
  },
  {
    id: "app-1045",
    businessName: "Bronzeville Books",
    ownerName: "David Wright",
    email: "dwright@bronzevillebooks.com",
    phone: "(555) 441-9921",
    category: "Books & Literature",
    submittedDate: "Oct 12, 11:00 AM",
    status: "pending",
    location: "Chicago, IL",
    description: "An independent bookstore specializing in African American literature, history, and children's books.",
    website: "bronzevillebooks.com"
  }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [applications, setApplications] = useState(INITIAL_APPS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };
  
  const filteredApps = applications.filter(app => {
    const matchesTab = app.status === activeTab;
    const matchesSearch = app.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const verifiedCount = applications.filter(a => a.status === 'verified').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rust/30 text-rust-dark text-[10px] font-bold tracking-wider uppercase mb-3 bg-rust/5">
            <ShieldCheck className="w-3.5 h-3.5" /> Merchant Portal
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Listing Verification Center</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium max-w-2xl">
            Review and vet incoming applications to ensure all businesses on our platform meet our community standards and authenticity requirements.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <div className="bg-rust/10 p-2 rounded-lg text-rust">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Pending Calls</div>
              <div className="font-bold text-gray-900">4 Scheduled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Application Status</h3>
          <nav className="space-y-1.5 flex-1">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'pending' ? 'bg-white text-rust shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pending
              </div>
              {pendingCount > 0 && <span className="bg-rust text-white text-[10px] py-0.5 px-2 rounded-full">{pendingCount}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('verified')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'verified' ? 'bg-white text-green-700 shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Verified
              </div>
              {verifiedCount > 0 && <span className="bg-green-600 text-white text-[10px] py-0.5 px-2 rounded-full">{verifiedCount}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('rejected')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'rejected' ? 'bg-white text-red-700 shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Rejected
              </div>
              {rejectedCount > 0 && <span className="bg-red-600 text-white text-[10px] py-0.5 px-2 rounded-full">{rejectedCount}</span>}
            </button>
          </nav>
        </div>

        {/* Dashboard List */}
        <div className="flex-1 p-6 md:p-8 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl font-bold text-gray-900 capitalize">
              {activeTab} ({filteredApps.length})
            </h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search businesses..." 
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rust focus:ring-1 focus:ring-rust transition-all"
                />
              </div>
              <button className="bg-gray-50 border border-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No applications found in this category.</p>
              </div>
            ) : filteredApps.map((app) => (
              <div key={app.id} className="border border-gray-100 rounded-2xl p-6 hover:border-rust/30 hover:shadow-md transition-all group">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                  
                  {/* Left Column: Business & Owner Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-serif text-xl font-bold text-gray-900 group-hover:text-rust transition-colors">{app.businessName}</h4>
                      <span className="bg-mustard/10 text-mustard border border-mustard/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {app.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 max-w-2xl">{app.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Owner</div>
                        <div className="text-sm font-semibold text-gray-900">{app.ownerName}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/> Email</div>
                        <div className="text-sm font-medium text-gray-700 truncate"><a href={`mailto:${app.email}`} className="hover:text-rust">{app.email}</a></div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</div>
                        <div className="text-sm font-medium text-gray-700">{app.phone}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Website</div>
                        <div className="text-sm font-medium text-rust truncate"><a href={`https://${app.website}`} target="_blank" rel="noreferrer" className="hover:underline">{app.website}</a></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col gap-3 xl:w-48 shrink-0">
                    <div className="text-[11px] font-medium text-gray-500 text-right mb-1">
                      Submitted: {app.submittedDate}
                    </div>
                    <button 
                      onClick={() => alert(`Scheduling confirmation call with ${app.ownerName} for ${app.businessName}...`)}
                      className="w-full bg-[#1C3627] hover:bg-[#13251a] text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Phone className="w-4 h-4" /> Schedule Call
                    </button>
                    {activeTab === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'verified')}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2 rounded-xl text-[13px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Verify
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 rounded-xl text-[13px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                    {activeTab !== 'pending' && (
                       <button 
                         onClick={() => handleUpdateStatus(app.id, 'pending')}
                         className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-2 rounded-xl text-[13px] font-bold transition-colors flex items-center justify-center gap-1 w-full mt-2"
                       >
                         <Clock className="w-4 h-4" /> Mark Pending
                       </button>
                    )}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}

