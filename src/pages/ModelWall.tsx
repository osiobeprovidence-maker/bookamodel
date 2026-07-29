import { useState } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCw, User, AlertCircle } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '../contexts/UserContext';
import { ProfileCard, type ExploreModel } from '../components/ui/ProfileCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'Fashion Model', 'Runway Model', 'Commercial Model', 'Editorial Model',
  'Fitness Model', 'Beauty Model', 'Bridal Model', 'Product Model',
  'Lash Model', 'Makeup Model', 'Hair Model', 'Native Wear Model',
  'Jewellery Model', 'Skincare Model',
];

const PAGE_SIZE = 12;

export const ModelWall = () => {
  const navigate = useNavigate();
  const { convexUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(0);

  const result = useQuery(api.explore.listPublishedModels, {
    category: selectedCategory || undefined,
    location: selectedLocation || undefined,
    gender: selectedGender || undefined,
    isVerified: verifiedOnly || undefined,
    isAvailable: availableOnly || undefined,
    searchQuery: searchQuery || undefined,
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  const models = result?.models ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const isLoading = result === undefined;

  const uniqueLocations = [...new Set(models.map((m) => m.city).filter(Boolean))] as string[];
  if (uniqueLocations.length === 0) {
    uniqueLocations.push('Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Ibadan', 'Kano');
  }

  return (
    <div className="bg-[#F8F8F8] min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Explore Talent</h1>
            <p className="text-gray-400 text-sm font-medium tracking-tight">
              {isLoading ? 'Loading models...' : `Showing ${total} model${total !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search models..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm focus:border-[#D4AF37] outline-none text-sm transition-all"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              />
            </div>
            <Button
              variant="secondary"
              className="p-3 rounded-xl md:hidden"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${isFilterOpen ? 'block' : 'hidden'} lg:block w-64 space-y-8 shrink-0`}>
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#D4AF37]" /> Categories
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                <button
                  onClick={() => { setSelectedCategory(null); setPage(0); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${!selectedCategory ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                >
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat === selectedCategory ? null : cat); setPage(0); }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${selectedCategory === cat ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-4">Location</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => { setSelectedLocation(null); setPage(0); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${!selectedLocation ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                >
                  All Nigeria
                </button>
                {uniqueLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setSelectedLocation(loc === selectedLocation ? null : loc); setPage(0); }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${selectedLocation === loc ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Quick Filters</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={() => { setVerifiedOnly(!verifiedOnly); setPage(0); }}
                    className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-black">Verified</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={() => { setAvailableOnly(!availableOnly); setPage(0); }}
                    className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-black">Available</span>
                </label>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 mt-4">Gender</h4>
                  <div className="flex gap-2">
                    {['Female', 'Male'].map((g) => (
                      <button
                        key={g}
                        onClick={() => { setSelectedGender(g === selectedGender ? null : g); setPage(0); }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${selectedGender === g ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory && (
                <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setSelectedCategory(null); setPage(0); }}>
                  {selectedCategory} <span className="text-xs ml-1">×</span>
                </Badge>
              )}
              {selectedLocation && (
                <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setSelectedLocation(null); setPage(0); }}>
                  {selectedLocation} <span className="text-xs ml-1">×</span>
                </Badge>
              )}
              {selectedGender && (
                <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setSelectedGender(null); setPage(0); }}>
                  {selectedGender} <span className="text-xs ml-1">×</span>
                </Badge>
              )}
              {verifiedOnly && (
                <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setVerifiedOnly(false); setPage(0); }}>
                  Verified <span className="text-xs ml-1">×</span>
                </Badge>
              )}
              {availableOnly && (
                <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setAvailableOnly(false); setPage(0); }}>
                  Available <span className="text-xs ml-1">×</span>
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="h-8 bg-gray-100 rounded-xl" />
                        <div className="h-8 bg-gray-100 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">No models available yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {convexUser?.role === 'model'
                    ? 'Complete your profile and mark yourself as available to become discoverable.'
                    : 'Be the first model to complete your profile and become discoverable.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {convexUser?.role === 'model' && (
                    <Button variant="primary" onClick={() => navigate('/model-dashboard/profile')}>
                      Complete Profile
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {models.map((model: ExploreModel) => (
                    <ProfileCard
                      key={model._id}
                      model={model}
                      onViewProfile={(id) => navigate(`/profile/${id}`)}
                      onInvite={(id) => navigate(`/invite/${id}`)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                      <Button
                        key={i}
                        variant={page === i ? 'primary' : 'secondary'}
                        size="sm"
                        className="w-10 h-10 p-0"
                        onClick={() => setPage(i)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
