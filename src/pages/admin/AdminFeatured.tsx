/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GripVertical, Plus, Trash2, ArrowUp, ArrowDown, Star, Home, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

const sections = [
  { key: 'homepage', label: 'Homepage', icon: Home },
  { key: 'availableToday', label: 'Available Today', icon: Clock },
  { key: 'trending', label: 'Trending', icon: TrendingUp },
  { key: 'recommended', label: 'Recommended', icon: Sparkles },
] as const;

type SectionKey = (typeof sections)[number]['key'];

const AdminFeatured = () => {
  const { toast } = useToast();
  const data = useQuery(api.admin.listModels);
  const setFeaturedMutation = useMutation(api.admin.setFeatured);
  const [activeTab, setActiveTab] = useState<SectionKey>('homepage');
  const [featuredSections, setFeaturedSections] = useState<Record<SectionKey, string[]>>({
    homepage: [],
    availableToday: [],
    trending: [],
    recommended: [],
  });
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (data && !seeded) {
      setSeeded(true);
      setFeaturedSections((prev) => ({
        ...prev,
        homepage: data.filter((m) => m.isFeatured).map((m) => m.id),
      }));
    }
  }, [data, seeded]);
  const [showAddDropdown, setShowAddDropdown] = useState<SectionKey | null>(null);
  const models = (data ?? []).map((m) => ({ ...m, profileImage: m.image }));

  const currentIds = featuredSections[activeTab];
  const assignedModels = currentIds
    .map((id) => models.find((m) => m.id === id))
    .filter(Boolean);
  const availableToAdd = models.filter(
    (m) => !currentIds.includes(m.id)
  );

  const handleAdd = (modelId: string) => {
    setFeaturedSections((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], modelId],
    }));
    if (activeTab === 'homepage') {
      setFeaturedMutation({ modelId, featured: true });
    }
    setShowAddDropdown(null);
    toast('Model added to section');
  };

  const handleRemove = (modelId: string) => {
    setFeaturedSections((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((id) => id !== modelId),
    }));
    if (activeTab === 'homepage') {
      setFeaturedMutation({ modelId, featured: false });
    }
    toast('Model removed from section');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFeaturedSections((prev) => {
      const updated = [...prev[activeTab]];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return { ...prev, [activeTab]: updated };
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === currentIds.length - 1) return;
    setFeaturedSections((prev) => {
      const updated = [...prev[activeTab]];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return { ...prev, [activeTab]: updated };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Featured Models</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage which models appear in featured sections</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sections.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setShowAddDropdown(null); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all',
              activeTab === key
                ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-[#111111] dark:hover:text-white hover:border-[#D4AF37]/30'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className={cn(
              'ml-1 text-[10px] px-1.5 py-0.5 rounded-full',
              activeTab === key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
            )}>
              {featuredSections[key].length}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111111] dark:text-white">
            {sections.find((s) => s.key === activeTab)?.label} Models
          </h2>
          <div className="relative">
            <button
              onClick={() => setShowAddDropdown(showAddDropdown === activeTab ? null : activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                'bg-[#D4AF37] hover:bg-[#C5A028]',
                'text-white text-sm font-bold',
                'transition-colors active:scale-95'
              )}
            >
              <Plus className="h-4 w-4" />
              Add Model
            </button>

            <AnimatePresence>
              {showAddDropdown === activeTab && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute right-0 top-full mt-2 z-30 w-72 max-h-80 overflow-y-auto',
                    'bg-white dark:bg-gray-900',
                    'border border-gray-100 dark:border-gray-800',
                    'rounded-2xl shadow-2xl'
                  )}
                >
                  {availableToAdd.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-400">All models are already assigned</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {availableToAdd.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleAdd(model.id)}
                          className={cn(
                            'w-full flex items-center gap-3 p-2.5 rounded-xl',
                            'hover:bg-gray-50 dark:hover:bg-gray-800',
                            'transition-colors text-left'
                          )}
                        >
                          <img
                            src={model.profileImage}
                            alt={model.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#111111] dark:text-white truncate">{model.name}</p>
                            <p className="text-xs text-gray-400">{model.city} · {model.categories[0]}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {assignedModels.length === 0 ? (
        <div className={cn(
          'bg-white dark:bg-gray-900 rounded-2xl',
          'border border-gray-100 dark:border-gray-800',
          'p-16 text-center'
        )}>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Star className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-1">No models featured</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">Click "Add Model" to feature models in this section</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {assignedModels.map((model, index) => (
              <motion.div
                key={model!.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'bg-white dark:bg-gray-900 rounded-2xl',
                  'border border-gray-100 dark:border-gray-800',
                  'p-4',
                  'hover:shadow-lg transition-all duration-300'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 h-6 w-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  <img
                    src={model!.image}
                    alt={model!.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#111111] dark:text-white">{model!.name}</h3>
                    <p className="text-xs text-gray-400">{model!.city} · {model!.categories.join(', ')}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === assignedModels.length - 1}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${model!.name} from this section?`)) {
                          handleRemove(model!.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminFeatured;
