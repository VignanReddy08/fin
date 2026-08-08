import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showStatus, setShowStatus] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setRetrying(false);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(online);
      setRetrying(false);
      if (online) {
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      }
    }, 1500);
  };

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
          {isOnline ? (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Connection restored. Session synced.</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                <span className="font-medium">You are offline. Retrying sync...</span>
              </div>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="text-[10px] uppercase font-bold text-white hover:underline flex items-center gap-1"
              >
                {retrying ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  'Retry'
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
