import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, CheckCircle2, Shield, Fingerprint, LayoutDashboard, Loader2, Sparkles } from 'lucide-react';

interface Props {
  onComplete: () => void;
  isActive: boolean;
}

const STAGES = [
  { label: 'Verifying Credentials', icon: Shield, duration: 700 },
  { label: 'Checking Device Trust', icon: Fingerprint, duration: 600 },
  { label: 'Validating Security Policies', icon: Shield, duration: 800 },
  { label: 'Loading User Workspace', icon: LayoutDashboard, duration: 600 },
  { label: 'Preparing Dashboard', icon: Sparkles, duration: 500 },
];

export default function AuthProgress({ onComplete, isActive }: Props) {
  const [current, setCurrent] = useState(-1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    let idx = 0;
    const advance = () => {
      if (idx >= STAGES.length) {
        setDone(true);
        setTimeout(onComplete, 800);
        return;
      }
      setCurrent(idx);
      const stageIdx = idx;
      setTimeout(() => {
        setCompleted((prev) => [...prev, stageIdx]);
        idx++;
        advance();
      }, STAGES[stageIdx].duration);
    };

    const startDelay = setTimeout(() => {
      advance();
    }, 200);
    return () => clearTimeout(startDelay);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const progress = ((completed.length) / STAGES.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm mx-4"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"
            animate={{ rotate: done ? 0 : [0, 5, -5, 0] }}
            transition={{ repeat: done ? 0 : Infinity, duration: 2 }}
          >
            <Bot className="h-7 w-7 text-primary" />
          </motion.div>
        </div>

        {/* Stage list */}
        <div className="space-y-3 mb-6">
          {STAGES.map((stage, i) => {
            const isCompleted = completed.includes(i);
            const isCurrent = current === i && !isCompleted;

            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {isCompleted ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </motion.div>
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-700" />
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  isCompleted ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-gray-600'
                }`}>
                  {stage.label}{isCurrent ? '…' : ''}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${progress}%`,
              backgroundColor: done ? '#059669' : '#2563EB',
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Status text */}
        <p className="text-center text-xs text-gray-500">
          {done ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-emerald-400 font-medium"
            >
              ✓ Authentication Successful
            </motion.span>
          ) : (
            'Securing your session…'
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}
