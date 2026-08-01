import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { UPDATE_READY_EVENT } from '../lib/pwa';

export const UpdateBanner = () => {
  const [update, setUpdate] = useState<{ skipWaiting: () => void } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { skipWaiting: () => void };
      setUpdate(detail);
    };
    window.addEventListener(UPDATE_READY_EVENT, handler);
    return () => window.removeEventListener(UPDATE_READY_EVENT, handler);
  }, []);

  if (!update) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="fixed top-0 left-0 right-0 z-[96] flex justify-center px-4 pt-[env(safe-area-inset-top)]"
      >
        <div className="mt-3 flex items-center gap-3 bg-[#111111] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-white/10 max-w-md">
          <RefreshCw className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <p className="flex-1">A new version of BookAModel is available.</p>
          <button
            onClick={() => {
              update.skipWaiting();
              setUpdate(null);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] text-[#111111] text-xs font-extrabold hover:bg-[#e0c04a] transition-colors"
          >
            Update Now
          </button>
          <button
            onClick={() => setUpdate(null)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss update"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
