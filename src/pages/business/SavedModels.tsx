import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Folder, Search } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';

export default function SavedModels() {
  const navigate = useNavigate();
  const { convexUser } = useUser();

  const savedModels = useQuery(
    api.savedModels.listByBusiness,
    convexUser ? { businessUserId: convexUser._id as any } : 'skip'
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#111111]">Saved Models</h1>
          <p className="mt-2 text-gray-500">Manage your favorite talents.</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Saved', value: savedModels?.length ?? 0, icon: Heart, bg: 'bg-pink-100', color: 'text-pink-600' },
            { label: 'Available', value: 0, icon: Heart, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Booked', value: 0, icon: Heart, bg: 'bg-yellow-100', color: 'text-yellow-600' },
            { label: 'Browse', value: '→', icon: Search, bg: 'bg-blue-100', color: 'text-blue-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {(!savedModels || savedModels.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-20 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Folder className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">You haven't saved any models yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
              Browse models and save your favorites to see them here.
            </p>
            <button
              onClick={() => navigate('/business-dashboard/search')}
              className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all"
            >
              <Search className="w-4 h-4" />
              Browse Models
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
