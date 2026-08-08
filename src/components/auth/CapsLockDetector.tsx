import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function CapsLockDetector() {
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      setCapsLock(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', handler);
    };
  }, []);

  return (
    <AnimatePresence>
      {capsLock && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-1.5 text-xs text-amber-400 mt-1"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Caps Lock is on</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
