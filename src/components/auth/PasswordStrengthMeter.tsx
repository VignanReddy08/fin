import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { analyzePassword, type PasswordAnalysis } from '../../lib/passwordUtils';

interface Props {
  password: string;
}

export default function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const analysis: PasswordAnalysis = analyzePassword(password);

  const checks = [
    { label: 'At least 8 characters', met: analysis.checks.minLength },
    { label: 'Uppercase letter (A–Z)', met: analysis.checks.uppercase },
    { label: 'Lowercase letter (a–z)', met: analysis.checks.lowercase },
    { label: 'Number (0–9)', met: analysis.checks.number },
    { label: 'Special character (!@#$…)', met: analysis.checks.special },
  ];

  return (
    <div className="space-y-2.5 mt-1">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((seg) => (
          <motion.div
            key={seg}
            className="h-1.5 flex-1 rounded-full"
            initial={{ backgroundColor: '#333' }}
            animate={{
              backgroundColor: seg <= analysis.score ? analysis.color : '#333',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Label + Entropy + Crack Time */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        {analysis.label && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, color: analysis.color }}
            className="text-xs font-semibold"
          >
            {analysis.label}
          </motion.span>
        )}
        {analysis.entropy > 0 && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              {analysis.entropy} bits
            </span>
            {analysis.crackTime && (
              <span>~{analysis.crackTime} to crack</span>
            )}
          </div>
        )}
      </div>

      {/* Common password warning */}
      {analysis.isCommon && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs"
        >
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>This is a commonly used password. Please choose a unique one.</span>
        </motion.div>
      )}

      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-xs">
            {check.met ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              </motion.div>
            ) : (
              <div className="h-3.5 w-3.5 rounded-full border border-gray-600" />
            )}
            <span className={check.met ? 'text-gray-300' : 'text-gray-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
