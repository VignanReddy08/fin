import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, BookOpen, Key, Smartphone, HelpCircle } from 'lucide-react';

interface Tip {
  id: number;
  icon: typeof Key;
  title: string;
  desc: string;
}

const TIPS: Tip[] = [
  {
    id: 1,
    icon: Key,
    title: 'Workstation Credential Safety',
    desc: 'Never reuse corporate passwords across personal accounts. Always use dynamic password generator recommendations.',
  },
  {
    id: 2,
    icon: ShieldAlert,
    title: 'Phishing Attempt Protection',
    desc: 'Ensure the URL display is explicitly https://agentic.fi before typing credentials or inputting MFA OTP codes.',
  },
  {
    id: 3,
    icon: Smartphone,
    title: 'Device Trust Verification',
    desc: 'Regularly clean up inactive trusted devices and terminate idle sessions in your Platform Security Dashboard.',
  },
  {
    id: 4,
    icon: HelpCircle,
    title: 'Multi-Factor Access Protection',
    desc: 'MFA blocks 99% of automated credential stuffing. Always maintain SMS or Email fallback options active.',
  },
];

export default function SecurityTips() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const current = TIPS[index];
  const Icon = current.icon;

  return (
    <div className="p-3.5 rounded-lg border border-border/40 bg-card/10 backdrop-blur-sm max-w-sm mx-auto overflow-hidden">
      <div className="flex gap-2">
        <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Security Education Center</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="space-y-1"
            >
              <h4 className="text-xs font-semibold text-white">{current.title}</h4>
              <p className="text-[11px] text-gray-400 leading-normal">{current.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
