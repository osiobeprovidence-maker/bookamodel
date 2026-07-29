/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  Ruler,
  BadgeCheck,
  Crown,
  Heart,
  MessageCircle,
  User,
  Briefcase,
  Filter,
  X,
  ArrowLeft,
  ArrowRight,
  PackageOpen,
  Send,
  Calendar,
  Wallet,
} from 'lucide-react';
import { businessModels } from '../../data/businessData';
import { useToast } from '../../components/ui/Toast';

const ITEMS_PER_PAGE = 6;

const searchTypes = ['Name', 'Location', 'Category'];
const genderOptions = ['All', 'Male', 'Female'];
const categoryOptions = ['All', 'Fashion', 'Commercial', 'Runway', 'Editorial', 'Fitness', 'Lifestyle', 'Beauty'];
const locationOptions = ['All', 'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Enugu', 'Ibadan'];
const availabilityOptions = ['All', 'Available Now', 'Not Available'];
const sortByOptions = ['Newest', 'Most Popular', 'Highest Rated', 'Recently Active'];

export default function SearchModels() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('Name');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('Newest');
  const [savedModels, setSavedModels] = useState<Set<string>>(new Set());
  const [inviteModal, setInviteModal] = useState<typeof businessModels[number] | null>(null);
  const [inviteForm, setInviteForm] = useState({ date: '', time: '', location: '', budget: '', message: '' });
  const [filters, setFilters] = useState({
    gender: 'All',
    category: 'All',
    location: 'All',
    availability: 'All',
    verifiedOnly: false,
    proOnly: false,
  });

  const updateFilter = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const filteredModels = useMemo(() => {
    let result = [...businessModels];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((model) => {
        const searchField = searchType === 'Name'
          ? model.name
          : searchType === 'Location'
          ? model.location
          : model.category;
        return searchField?.toLowerCase().includes(q);
      });
    }

    if (filters.gender !== 'All') {
      result = result.filter((model) => model.gender === filters.gender);
    }
    if (filters.category !== 'All') {
      result = result.filter((model) => model.category === filters.category);
    }
    if (filters.location !== 'All') {
      result = result.filter((model) => model.location === filters.location);
    }
    if (filters.availability === 'Available Now') {
      result = result.filter((model) => model.isAvailable);
    } else if (filters.availability === 'Not Available') {
      result = result.filter((model) => !model.isAvailable);
    }
    if (filters.verifiedOnly) {
      result = result.filter((model) => model.isVerified);
    }
    if (filters.proOnly) {
      result = result.filter((model) => model.isPro);
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
      case 'Newest':
      default:
        break;
    }

    return result;
  }, [searchQuery, searchType, filters, sortBy]);

  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.gender !== 'All') count++;
    if (filters.category !== 'All') count++;
    if (filters.location !== 'All') count++;
    if (filters.availability !== 'All') count++;
    if (filters.verifiedOnly) count++;
    if (filters.proOnly) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      gender: 'All',
      category: 'All',
      location: 'All',
      availability: 'All',
      verifiedOnly: false,
      proOnly: false,
    });
    setSortBy('Newest');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleSave = (modelId: string, modelName: string) => {
    setSavedModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
        toast(`Removed ${modelName} from saved`, 'info');
      } else {
        next.add(modelId);
        toast(`Saved ${modelName}`, 'success');
      }
      return next;
    });
  };

  const handleSendInvite = () => {
    if (!inviteModal) return;
    if (!inviteForm.date || !inviteForm.message) {
      toast('Please fill in date and message', 'warning');
      return;
    }
    toast(`Invitation sent to ${inviteModal.name}!`, 'success');
    setInviteModal(null);
    setInviteForm({ date: '', time: '', location: '', budget: '', message: '' });
  };

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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Search models by ${searchType.toLowerCase()}...`}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
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
                  <option key={type} value={type}>
                    {type}
                  </option>
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
              Show Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-white text-[#D4AF37] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Sort By
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
              >
                {sortByOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <span className="text-sm text-gray-500">
              {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} found
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
                  {/* Gender */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Gender
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {genderOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => updateFilter('gender', option)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            filters.gender === option
                              ? 'bg-[#D4AF37] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={filters.category}
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                      >
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Location
                    </label>
                    <div className="relative">
                      <select
                        value={filters.location}
                        onChange={(e) => updateFilter('location', e.target.value)}
                        className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                      >
                        {locationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Availability
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availabilityOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => updateFilter('availability', option)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            filters.availability === option
                              ? 'bg-[#D4AF37] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verified Only Toggle */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Verified Only
                    </label>
                    <button
                      onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        filters.verifiedOnly ? 'bg-[#D4AF37]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                          filters.verifiedOnly ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Pro Members Toggle */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Pro Members
                    </label>
                    <button
                      onClick={() => updateFilter('proOnly', !filters.proOnly)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        filters.proOnly ? 'bg-[#D4AF37]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                          filters.proOnly ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {paginatedModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {paginatedModels.map((model, index) => (
              <motion.div
                key={model.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Photo */}
                <div className="relative">
                  <img
                    src={model.photo || model.image || ''}
                    alt={model.name}
                    className="w-full h-64 object-cover rounded-t-2xl"
                  />
                  {/* Availability Badge */}
                  <span
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                      model.isAvailable
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {model.isAvailable ? 'Available' : 'Booked'}
                  </span>
                  {/* Badges */}
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

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-[#111111]">
                        {model.name}
                        <span className="text-gray-400 font-normal text-sm ml-1">
                          {model.age && `, ${model.age}`}
                        </span>
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {model.location}
                      </div>
                    </div>
                  </div>

                  {/* Category Tag */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                      {model.category}
                    </span>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {model.height && (
                      <div className="flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5" />
                        <span>{model.height}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                      <span className="font-medium text-[#111111]">
                        {model.rating || '4.8'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{model.completedJobs || 0} jobs</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Starting Price
                    </span>
                    <p className="text-lg font-bold text-[#D4AF37]">
                      ₦{(model.price || 50000).toLocaleString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/profile/${model.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#D4AF37] text-white rounded-xl text-xs font-bold hover:bg-[#C5A028] transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setInviteModal(model);
                        setInviteForm({ date: '', time: '', location: model.location || '', budget: '', message: '' });
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#111111] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Invite
                    </button>
                    <button
                      onClick={() => toggleSave(model.id, model.name)}
                      className={`flex items-center justify-center px-3 py-2.5 border rounded-xl transition-colors ${
                        savedModels.has(model.id)
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${savedModels.has(model.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
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
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-white rounded-xl text-sm font-bold hover:bg-caramel-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex items-center justify-center gap-2"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                  currentPage === page
                    ? 'bg-[#D4AF37] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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
                  <h2 className="text-xl font-bold text-[#111111]">Invite {inviteModal.name}</h2>
                  <p className="text-sm text-gray-400">Send a job invitation</p>
                </div>
                <button onClick={() => setInviteModal(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
                <img src={inviteModal.image} alt={inviteModal.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-bold text-sm">{inviteModal.name}</p>
                  <p className="text-xs text-gray-400">{inviteModal.category} · {inviteModal.location}</p>
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
}
