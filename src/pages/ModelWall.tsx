/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { models, categories } from '../data/mockData';
import { ProfileCard } from '../components/ui/ProfileCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const ModelWall = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Ibadan', 'Kano'];

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          model.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || model.categories.includes(selectedCategory);
      const matchesLocation = !selectedLocation || model.location === selectedLocation;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [searchQuery, selectedCategory, selectedLocation]);

  return (
    <div className="bg-[#F8F8F8] min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Explore Talent</h1>
            <p className="text-gray-400 text-sm font-medium tracking-tight">Discover over 5,000+ models in Nigeria</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search models..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm focus:border-[#D4AF37] outline-none text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 space-y-8 shrink-0">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#D4AF37]" /> Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${!selectedCategory ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${selectedCategory === cat.name ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-4">Location</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${!selectedLocation ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                >
                  All Nigeria
                </button>
                {locations.map(loc => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
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
                {['Verified', 'Pro', 'Available Today'].map(label => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded-md border-2 border-gray-200 group-hover:border-[#D4AF37] flex items-center justify-center transition-colors">
                      <Check className="w-3 h-3 text-white opacity-0" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-black">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory && (
                <Badge
                  variant="gold"
                  className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  {selectedCategory} <span className="text-xs ml-1">×</span>
                </Badge>
              )}
              {selectedLocation && (
                <Badge
                  variant="gold"
                  className="pl-3 pr-2 py-1 flex items-center gap-1 cursor-pointer"
                  onClick={() => setSelectedLocation(null)}
                >
                  {selectedLocation} <span className="text-xs ml-1">×</span>
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredModels.map(model => (
                <ProfileCard key={model.id} model={model} onViewProfile={(id) => navigate(`/profile/${id}`)} onInvite={(id) => navigate(`/invite/${id}`)} />
              ))}
            </div>

            {filteredModels.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">No models found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query.</p>
                <Button variant="outline" className="mt-6" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedLocation(null); }}>
                  Clear all filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" disabled>Previous</Button>
              {[1, 2, 3, 4, 5].map(i => (
                <Button
                  key={i}
                  variant={i === 1 ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-10 h-10 p-0"
                >
                  {i}
                </Button>
              ))}
              <Button variant="secondary" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
