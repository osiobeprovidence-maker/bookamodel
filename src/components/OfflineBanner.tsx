import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export const OfflineBanner = () => {
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="fixed top-0 left-0 right-0 z-[96] flex justify-center px-4 pt-[env(safe-area-inset-top)]"
        >
          <div className="mt-3 flex items-center gap-2.5 bg-[#111111] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl border border-white/10">
            <WifiOff className="w-3.5 h-3.5 text-[#D4AF37]" />
            You're offline. Some features are unavailable.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
