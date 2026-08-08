import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { type SecurityLevel, getSecurityLevelColor, getSecurityLevelLabel } from '../../lib/securityUtils';

interface Props {
  score: number;
  level: SecurityLevel;
  size?: number;
}

export default function SecurityScore({ score, level, size = 140 }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const color = getSecurityLevelColor(level);
  const label = getSecurityLevelLabel(level);

  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const duration = 1200;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{animatedScore}</span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-sm font-semibold" style={{ color }}>
          {label}
        </span>
        <p className="text-xs text-gray-500 mt-0.5">Security Score</p>
      </div>
    </div>
  );
}
