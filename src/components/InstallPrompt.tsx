import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import {
  BeforeInstallPromptEvent,
  isIOS,
  isStandalone,
  shouldShowInstallPrompt,
  dismissInstallPrompt,
  markAppInstalled,
} from '../lib/pwa';

export const InstallPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone() || installed) return;
    if (!shouldShowInstallPrompt()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const isIos = isIOS() && !isStandalone();
    setIsIOSDevice(isIos);

    if (isIos) {
      const t = setTimeout(() => setVisible(true), 2500);
      window.addEventListener('beforeinstallprompt', onPrompt);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', onPrompt);
      };
    }

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setVisible(false);
      markAppInstalled();
    });
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
    };
  }, [installed]);

  if (!visible) return null;

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        markAppInstalled();
      } else {
        dismissInstallPrompt();
      }
      setVisible(false);
      return;
    }
    dismissInstallPrompt();
    setVisible(false);
  };

  const handleLater = () => {
    dismissInstallPrompt();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-6 sm:w-96 z-[95] pb-[env(safe-area-inset-bottom)]"
        >
          <div className="bg-[#111111] text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="flex items-start gap-3.5 p-5">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-extrabold">
                    {isIOSDevice ? 'Add BookAModel to Home Screen' : 'Install BookAModel'}
                  </p>
                  <button
                    onClick={handleLater}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {isIOSDevice
                    ? 'Tap the Share button in Safari, then choose "Add to Home Screen" to use BookAModel like a native app.'
                    : 'Find jobs faster and receive instant casting notifications.'}
                </p>
                <div className="flex gap-2.5 mt-4">
                  {!isIOSDevice && (
                    <button
                      onClick={handleInstall}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#111111] text-xs font-extrabold hover:bg-[#e0c04a] transition-colors"
                    >
                      Install
                    </button>
                  )}
                  <button
                    onClick={handleLater}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
