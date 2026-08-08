import { Lock, Shield, FileCheck2, Globe, ShieldCheck, KeyRound } from 'lucide-react';

const BADGES = [
  { icon: Lock, label: '256-bit SSL', tip: '256-bit SSL/TLS Encryption' },
  { icon: Shield, label: 'RBI Compliant', tip: 'Reserve Bank of India Compliant' },
  { icon: FileCheck2, label: 'ISO 27001', tip: 'ISO 27001:2022 Certified' },
  { icon: ShieldCheck, label: 'SOC 2', tip: 'SOC 2 Type II Compliant' },
  { icon: Globe, label: 'GDPR Ready', tip: 'GDPR & Data Privacy Ready' },
  { icon: KeyRound, label: 'E2E Encrypted', tip: 'End-to-End Encryption' },
];

interface Props {
  variant?: 'compact' | 'expanded';
}

export default function TrustBadges({ variant = 'compact' }: Props) {
  if (variant === 'expanded') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {BADGES.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.label}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-card/50 border border-border/50 group hover:border-primary/20 transition-colors"
              title={b.tip}
            >
              <Icon className="h-4 w-4 text-emerald-500/70 group-hover:text-emerald-400 transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors whitespace-nowrap">
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {BADGES.map((b) => {
        const Icon = b.icon;
        return (
          <div
            key={b.label}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-400 transition-colors cursor-default group"
            title={b.tip}
          >
            <Icon className="h-3.5 w-3.5 text-emerald-600/60 group-hover:text-emerald-500 transition-colors" />
            <span className="text-[10px] font-medium uppercase tracking-wider">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}
