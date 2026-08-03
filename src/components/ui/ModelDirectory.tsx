import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, RefreshCw, User, Filter, ChevronDown,
  Star, MapPin, Ruler, BadgeCheck, Crown, Heart, Briefcase, MessageCircle,
  X, ArrowLeft, ArrowRight, Calendar, Wallet, Send,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/Toast';
import Avatar from '../../components/ui/Avatar';
import { ProfileCard, type ExploreModel } from '../../components/ui/ProfileCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ModelDirectoryProps {
  mode: 'public' | 'business';
}

const PAGE_SIZE = 12;

const searchTypes = ['Name', 'Location', 'Category'];
const businessLocationOptions = ['All', 'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Enugu', 'Ibadan'];
const businessGenderOptions = ['All', 'Male', 'Female'];
const businessAvailabilityOptions = ['All', 'Available Now', 'Not Available'];
const sortByOptions = ['Newest', 'Most Popular', 'Highest Rated', 'Recently Active'];

export const ModelDirectory = ({ mode }: ModelDirectoryProps) => {
  const navigate = useNavigate();
  const { convexUser } = useUser();
  const { toast } = useToast();
  const isPublic = mode === 'public';

  const categories = useQuery(api.categories.listActive);
  const categoryOptions = categories ?? [];
  const categoryByName = new Map(categoryOptions.map((c) => [c.name.toLowerCase(), c.slug]));
  const matchesCategory = (stored: string[] | undefined, selected: string) => {
    if (!stored) return false;
    return stored.some((s) => {
      const key = s.toLowerCase();
      return key === selected.toLowerCase() || categoryByName.get(key) === selected;
    });
  };

  // Shared state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('cat');
    if (q) setSearchQuery(q);
    if (cat) {
      const match = categoryOptions.find((c) => c.name.toLowerCase() === cat.toLowerCase());
      setSelectedCategory(match ? match.slug : cat);
    }
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Business-only state
  const [searchType, setSearchType] = useState('Name');
  const [sortBy, setSortBy] = useState('Newest');
  const [inviteModal, setInviteModal] = useState<ExploreModel | null>(null);
  const [inviteForm, setInviteForm] = useState({ date: '', time: '', location: '', budget: '', message: '' });
  const [bizFilters, setBizFilters] = useState({
    gender: 'All',
    category: 'All',
    location: 'All',
    availability: 'All',
    verifiedOnly: false,
    proOnly: false,
  });

  // Shared query
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

  // Business-specific queries
  const savedRecords = useQuery(
    api.savedModels.listByBusiness,
    !isPublic && convexUser ? { businessUserId: convexUser._id as any } : 'skip'
  );
  const toggleSavedModel = useMutation(api.savedModels.toggle);
  const sendInvitation = useMutation(api.invitations.send);

  const savedModels = useMemo(
    () => new Set((savedRecords ?? []).map((record) => record.modelUserId)),
    [savedRecords]
  );

  const uniqueLocations = [...new Set(models.map((m) => m.city).filter(Boolean))] as string[];
  if (uniqueLocations.length === 0) {
    uniqueLocations.push('Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Ibadan', 'Kano');
  }

  // Business-only: client-side filtering/sorting
  const businessProcessedModels = useMemo(() => {
    if (isPublic) return models;
    let result = [...models];
    if (bizFilters.gender !== 'All') {
      result = result.filter((m) => m.gender?.toLowerCase() === bizFilters.gender.toLowerCase());
    }
    if (bizFilters.category !== 'All') {
      result = result.filter((m) =>
        matchesCategory(m.categories, bizFilters.category)
      );
    }
    if (bizFilters.location !== 'All') {
      result = result.filter((m) => {
        const loc = [m.city, m.state, m.country].filter(Boolean).join(', ').toLowerCase();
        return loc.includes(bizFilters.location.toLowerCase());
      });
    }
    if (bizFilters.availability === 'Available Now') {
      result = result.filter((m) => m.isAvailable);
    } else if (bizFilters.availability === 'Not Available') {
      result = result.filter((m) => !m.isAvailable);
    }
    if (bizFilters.verifiedOnly) {
      result = result.filter((m) => m.isVerified);
    }
    if (bizFilters.proOnly) {
      result = result.filter((m) => m.isPro);
    }
    switch (sortBy) {
      case 'Most Popular':
        result.sort((a, b) => (b.completedJobs || 0) - (a.completedJobs || 0));
        break;
      case 'Highest Rated':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Recently Active':
        result.sort((a, b) => (b.completedJobs || 0) - (a.completedJobs || 0));
        break;
    }
    return result;
  }, [models, isPublic, bizFilters, sortBy]);

  const bizPageSize = 6;
  const bizCurrentPage = page + 1;
  const bizTotalPages = Math.ceil(businessProcessedModels.length / bizPageSize);
  const bizPaginatedModels = businessProcessedModels.slice(
    (bizCurrentPage - 1) * bizPageSize,
    bizCurrentPage * bizPageSize
  );

  const formatRate = (rate?: string) => {
    if (!rate) return 'Request rate';
    return rate.toLowerCase().includes('ngn') || rate.includes('₦') ? rate : `NGN ${rate}`;
  };

  const toggleSave = async (model: ExploreModel) => {
    if (!convexUser) {
      toast('Please sign in to save models', 'warning');
      navigate('/login');
      return;
    }
    try {
      const saved = await toggleSavedModel({
        businessUserId: convexUser._id as any,
        modelUserId: model.userId,
        folder: 'Favorites',
      });
      toast(saved ? `Saved ${model.displayName}` : `Removed ${model.displayName} from saved`, saved ? 'success' : 'info');
    } catch {
      toast('Unable to update saved models', 'error');
    }
  };

  const handleSendInvite = async () => {
    if (!inviteModal) return;
    if (!convexUser) {
      toast('Please sign in to send invitations', 'warning');
      navigate('/login');
      return;
    }
    if (!inviteForm.date || !inviteForm.message) {
      toast('Please fill in date and message', 'warning');
      return;
    }
    try {
      const displayName = inviteModal.displayName || inviteModal.user?.name || 'Model';
      await sendInvitation({
        businessUserId: convexUser._id as any,
        modelUserId: inviteModal.userId,
        title: `Invitation for ${displayName}`,
        message: inviteForm.message,
        proposedDate: inviteForm.date,
        proposedRate: inviteForm.budget ? `NGN ${inviteForm.budget}` : undefined,
      });
      toast(`Invitation sent to ${displayName}!`, 'success');
      setInviteModal(null);
      setInviteForm({ date: '', time: '', location: '', budget: '', message: '' });
    } catch {
      toast('Failed to send invitation', 'error');
    }
  };

  const bizActiveFilterCount = useMemo(() => {
    let count = 0;
    if (bizFilters.gender !== 'All') count++;
    if (bizFilters.category !== 'All') count++;
    if (bizFilters.location !== 'All') count++;
    if (bizFilters.availability !== 'All') count++;
    if (bizFilters.verifiedOnly) count++;
    if (bizFilters.proOnly) count++;
    return count;
  }, [bizFilters]);

  const clearBizFilters = () => {
    setBizFilters({
      gender: 'All',
      category: 'All',
      location: 'All',
      availability: 'All',
      verifiedOnly: false,
      proOnly: false,
    });
    setSortBy('Newest');
    setSearchQuery('');
    setPage(0);
  };

  const updateBizFilter = (key: string, value: string | boolean) => {
    setBizFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const resetPage = () => setPage(0);

  if (isPublic) {
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
                  onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
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
                    onClick={() => { setSelectedCategory(null); resetPage(); }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${!selectedCategory ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                  >
                    All Categories
                  </button>
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug); resetPage(); }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${selectedCategory === cat.slug ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-4">Location</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedLocation(null); resetPage(); }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${!selectedLocation ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                  >
                    All Nigeria
                  </button>
                  {uniqueLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setSelectedLocation(loc === selectedLocation ? null : loc); resetPage(); }}
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
                      onChange={() => { setVerifiedOnly(!verifiedOnly); resetPage(); }}
                      className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-black">Verified</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={() => { setAvailableOnly(!availableOnly); resetPage(); }}
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
                          onClick={() => { setSelectedGender(g === selectedGender ? null : g); resetPage(); }}
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
                  <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setSelectedCategory(null); resetPage(); }}>
                    {categoryOptions.find((c) => c.slug === selectedCategory)?.name || selectedCategory} <span className="text-xs ml-1">×</span>
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setSelectedLocation(null); resetPage(); }}>
                    {selectedLocation} <span className="text-xs ml-1">×</span>
                  </Badge>
                )}
                {selectedGender && (
                  <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setSelectedGender(null); resetPage(); }}>
                    {selectedGender} <span className="text-xs ml-1">×</span>
                  </Badge>
                )}
                {verifiedOnly && (
                  <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setVerifiedOnly(false); resetPage(); }}>
                    Verified <span className="text-xs ml-1">×</span>
                  </Badge>
                )}
                {availableOnly && (
                  <Badge variant="gold" className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer" onClick={() => { setAvailableOnly(false); resetPage(); }}>
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
                      <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                        Previous
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                        <Button key={i} variant={page === i ? 'primary' : 'secondary'} size="sm" className="w-10 h-10 p-0" onClick={() => setPage(i)}>
                          {i + 1}
                        </Button>
                      ))}
                      <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
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
  }

  // ─── BUSINESS MODE ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#111111]">Search Models</h1>
          <p className="mt-2 text-gray-500">
            Find professional models for your next campaign.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
                placeholder={`Search models by ${searchType.toLowerCase()}...`}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); resetPage(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent cursor-pointer"
              >
                {searchTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Filters Toggle & Sort */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters
                  ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                  : 'bg-white text-[#111111] border-gray-200 hover:border-[#D4AF37]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {bizActiveFilterCount > 0 && (
                <span className="ml-1 bg-white text-[#D4AF37] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {bizActiveFilterCount}
                </span>
              )}
            </button>
            {bizActiveFilterCount > 0 && (
              <button onClick={clearBizFilters} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort By</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
              >
                {sortByOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <span className="text-sm text-gray-500">
              {isLoading ? 'Loading models...' : `${businessProcessedModels.length} model${businessProcessedModels.length !== 1 ? 's' : ''} found`}
            </span>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Gender</label>
                    <div className="flex flex-wrap gap-2">
                      {businessGenderOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => updateBizFilter('gender', option)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${bizFilters.gender === option ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Category</label>
                    <div className="relative">
                      <select
                        value={bizFilters.category}
                        onChange={(e) => updateBizFilter('category', e.target.value)}
                        className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                      >
                        <option value="All">All</option>
                        {categoryOptions.map((option) => (
                          <option key={option._id} value={option.slug}>{option.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Location</label>
                    <div className="relative">
                      <select
                        value={bizFilters.location}
                        onChange={(e) => updateBizFilter('location', e.target.value)}
                        className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                      >
                        {businessLocationOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Availability</label>
                    <div className="flex flex-wrap gap-2">
                      {businessAvailabilityOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => updateBizFilter('availability', option)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${bizFilters.availability === option ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Verified Only</label>
                    <button
                      onClick={() => updateBizFilter('verifiedOnly', !bizFilters.verifiedOnly)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${bizFilters.verifiedOnly ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${bizFilters.verifiedOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pro Members</label>
                    <button
                      onClick={() => updateBizFilter('proOnly', !bizFilters.proOnly)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${bizFilters.proOnly ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${bizFilters.proOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center mb-10"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">Loading model profiles</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Pulling the latest completed model profiles for your business account.
            </p>
          </motion.div>
        ) : bizPaginatedModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {bizPaginatedModels.map((model, index) => {
              const displayName = model.displayName || model.user?.name || 'Model';
              const photoUrl = model.imageUrl || '';
              const location = [model.city, model.state, model.country].filter(Boolean).join(', ') || 'Nigeria';
              const category = model.categories?.[0] || 'General';
              const price = model.dailyRate || model.hourlyRate || '';
              return (
                <motion.div
                  key={model._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    {photoUrl ? (
                      <img src={photoUrl} alt={displayName} className="w-full h-64 object-cover rounded-t-2xl bg-gray-100" />
                    ) : (
                      <div className="w-full h-64 rounded-t-2xl bg-gray-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${model.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {model.isAvailable ? 'Available' : 'Booked'}
                    </span>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {model.isVerified && (
                        <span className="bg-blue-500 text-white p-1.5 rounded-full">
                          <BadgeCheck className="w-4 h-4" />
                        </span>
                      )}
                      {model.isPro && (
                        <span className="bg-[#D4AF37] text-white p-1.5 rounded-full">
                          <Crown className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-[#111111]">
                          {displayName}
                          <span className="text-gray-400 font-normal text-sm ml-1">{model.height && `, ${model.height}`}</span>
                        </h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                          <MapPin className="w-3.5 h-3.5" /> {location}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{category}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      {model.height && (
                        <div className="flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5" />
                          <span>{model.height}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                        <span className="font-medium text-[#111111]">{model.rating || '4.8'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{model.completedJobs || 0} jobs</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starting Price</span>
                      <p className="text-lg font-bold text-[#D4AF37]">{formatRate(price)}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/profile/${model._id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#D4AF37] text-white rounded-xl text-xs font-bold hover:bg-[#C5A028] transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setInviteModal(model);
                          setInviteForm({ date: '', time: '', location, budget: '', message: '' });
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#111111] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Invite
                      </button>
                      <button
                        onClick={() => toggleSave(model)}
                        className={`flex items-center justify-center px-3 py-2.5 border rounded-xl transition-colors ${savedModels.has(model.userId) ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200'}`}
                      >
                        <Heart className={`w-4 h-4 ${savedModels.has(model.userId) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center mb-10"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">No models found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Try adjusting your search criteria or filters to find the perfect model for your campaign.
            </p>
            <button
              onClick={clearBizFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-white rounded-xl text-sm font-bold hover:bg-caramel-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {bizTotalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex items-center justify-center gap-2"
          >
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: bizTotalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p - 1)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                  bizCurrentPage === p
                    ? 'bg-[#D4AF37] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(bizTotalPages - 1, page + 1))}
              disabled={page >= bizTotalPages - 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {inviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setInviteModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#111111]">Invite {inviteModal.displayName || inviteModal.user?.name || 'Model'}</h2>
                  <p className="text-sm text-gray-400">Send a job invitation</p>
                </div>
                <button onClick={() => setInviteModal(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
                <Avatar
                  src={inviteModal.imageUrl}
                  name={inviteModal.displayName || inviteModal.user?.name}
                  size={48}
                  icon={User}
                />
                <div>
                  <p className="font-bold text-sm">{inviteModal.displayName || inviteModal.user?.name || 'Model'}</p>
                  <p className="text-xs text-gray-400">
                    {inviteModal.categories?.[0] || 'General'} · {[inviteModal.city, inviteModal.state, inviteModal.country].filter(Boolean).join(', ') || 'Nigeria'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="date" value={inviteForm.date} onChange={(e) => setInviteForm({ ...inviteForm, date: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Time</label>
                    <input type="time" value={inviteForm.time} onChange={(e) => setInviteForm({ ...inviteForm, time: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={inviteForm.location} onChange={(e) => setInviteForm({ ...inviteForm, location: e.target.value })} placeholder="Event location"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Budget (₦)</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={inviteForm.budget} onChange={(e) => setInviteForm({ ...inviteForm, budget: e.target.value })} placeholder="e.g. 150,000"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Message *</label>
                  <textarea rows={3} value={inviteForm.message} onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })} placeholder="Describe the job opportunity..."
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setInviteModal(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={handleSendInvite} className="px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl text-sm font-semibold hover:bg-[#C5A028] transition-all flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Invitation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
