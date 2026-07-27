/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Send,
  MessageSquare,
  Trash2,
  Folder,
  Clock,
  CheckCircle,
  Calendar,
  Star,
  MapPin,
} from 'lucide-react';
import { businessModels, savedModelsData } from '../../data/businessData';
import { cn } from '../../lib/utils';

const folders = ['All', 'Favorites', 'Editorial', 'Commercial', 'Runway', 'Recently Saved'] as const;

const categories = ['All', 'Fashion', 'Commercial', 'Runway', 'Editorial', 'Fitness', 'Lifestyle', 'Beauty'];
const genders = ['All', 'Male', 'Female'];

export default function SavedModels() {
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const totalSaved = savedModelsData.length;
  const recentlyAdded = savedModelsData.filter((s) => {
    const saved = new Date(s.savedDate);
    const now = new Date();
    const diff = (now.getTime() - saved.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;
  const availableCount = savedModelsData.filter((s) => {
    const model = businessModels.find((m) => m.id === s.modelId);
    return model?.isAvailable;
  }).length;
  const bookedCount = savedModelsData.filter((s) => {
    const model = businessModels.find((m) => m.id === s.modelId);
    return model && !model.isAvailable;
  }).length;

  const stats = [
    { label: 'Saved', value: totalSaved, icon: Heart, bg: 'bg-pink-100', color: 'text-pink-600' },
    { label: 'Recently Added', value: recentlyAdded, icon: Clock, bg: 'bg-blue-100', color: 'text-blue-600' },
    { label: 'Available', value: availableCount, icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
    { label: 'Booked', value: bookedCount, icon: Calendar, bg: 'bg-yellow-100', color: 'text-yellow-600' },
  ];

  const filteredModels = savedModelsData
    .filter((item) => {
      if (activeFolder === 'All') return true;
      if (activeFolder === 'Recently Saved') {
        const savedDate = new Date(item.savedDate);
        const now = new Date();
        const diff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      return item.folder === activeFolder;
    })
    .map((saved) => {
      const model = businessModels.find((m) => m.id === saved.modelId);
      return model ? { ...model, savedDate: saved.savedDate, savedFolder: saved.folder } : null;
    })
    .filter(Boolean)
    .filter((model) => {
      if (searchQuery.trim()) {
        return model!.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .filter((model) => {
      if (categoryFilter !== 'All') {
        return model!.category === categoryFilter;
      }
      return true;
    })
    .filter((model) => {
      if (genderFilter !== 'All') {
        return model!.gender === genderFilter;
      }
      return true;
    });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#111111]">Saved Models</h1>
          <p className="mt-2 text-gray-500">Manage your favorite talents.</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Folder Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-bold transition-all',
                activeFolder === folder
                  ? 'bg-[#111111] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {folder}
            </button>
          ))}
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved models..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent cursor-pointer"
              >
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g === 'All' ? 'All Genders' : g}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'grid' ? 'bg-[#D4AF37] text-white' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'list' ? 'bg-[#D4AF37] text-white' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Model Grid */}
        {filteredModels.length > 0 ? (
          <div
            className={cn(
              'gap-4 sm:gap-6 mb-10 min-w-0',
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'flex flex-col'
            )}
          >
            {filteredModels.map((model, index) => (
              <motion.div
                key={model!.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0 group hover:shadow-md transition-shadow"
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Profile Photo */}
                    <div className="relative">
                      <img
                        src={model!.image}
                        alt={model!.name}
                        className="w-full h-56 object-cover rounded-t-2xl"
                      />
                      <span
                        className={cn(
                          'absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white',
                          model!.isAvailable ? 'bg-green-500' : 'bg-red-500'
                        )}
                      >
                        {model!.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#111111]">{model!.name}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                          {model!.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {model!.location}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-3">
                        <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                        <span className="text-sm font-bold text-[#111111]">{model!.rating}</span>
                        <span className="text-xs text-gray-400 ml-1">
                          Saved {new Date(model!.savedDate).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-[#111111] rounded-xl text-xs font-bold hover:bg-[#D4AF37] hover:text-white transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#111111] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors">
                          <Send className="w-3.5 h-3.5" />
                          Invite
                        </button>
                        <button className="flex items-center justify-center px-3 py-2.5 bg-gray-100 text-[#111111] rounded-xl text-xs font-bold hover:bg-[#D4AF37] hover:text-white transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button className="flex items-center justify-center px-3 py-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* List View */
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
                    <img
                      src={model!.image}
                      alt={model!.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#111111] truncate min-w-0">{model!.name}</h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0',
                            model!.isAvailable ? 'bg-green-500' : 'bg-red-500'
                          )}
                        >
                          {model!.isAvailable ? 'Available' : 'Booked'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 min-w-0 flex-wrap">
                        <span className="truncate">{model!.category}</span>
                        <span className="hidden sm:inline">&middot;</span>
                        <span className="truncate">{model!.location}</span>
                        <span className="hidden sm:inline">&middot;</span>
                        <span className="flex items-center gap-0.5 flex-shrink-0">
                          <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                          {model!.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 flex-wrap sm:flex-nowrap">
                      <button className="p-2 text-gray-400 hover:text-[#D4AF37] transition-colors rounded-lg hover:bg-gray-100">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#111111] transition-colors rounded-lg hover:bg-gray-100">
                        <Send className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#D4AF37] transition-colors rounded-lg hover:bg-gray-100">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
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
              <Folder className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">No saved models in this folder</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Browse models and save your favorites to see them here.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
