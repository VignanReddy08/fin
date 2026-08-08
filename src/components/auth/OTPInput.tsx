import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  length?: number;
  onComplete: (otp: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export default function OTPInput({
  length = 6,
  onComplete,
  error = false,
  disabled = false,
}: Props) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Reset values when error clears or on re-render with new error state
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setValues(Array(length).fill('')), 600);
      return () => clearTimeout(timer);
    }
  }, [error, length]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    // Auto-advance to next box
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Fire onComplete when all filled
    const otp = newValues.join('');
    if (otp.length === length && newValues.every((v) => v)) {
      onComplete(otp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newValues = [...values];
      newValues[index - 1] = '';
      setValues(newValues);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);
    const newValues = [...values];
    pasted.split('').forEach((char, i) => {
      newValues[i] = char;
    });
    setValues(newValues);

    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === length) {
      onComplete(pasted);
    }
  };

  return (
    <motion.div
      className="flex gap-2 sm:gap-3 justify-center"
      animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {values.map((value, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <input
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1}`}
            className={[
              'w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg',
              'bg-card border-2 text-white outline-none',
              'transition-all duration-200',
              'focus:ring-2 focus:ring-primary/50',
              'disabled:opacity-50',
              error
                ? 'border-destructive'
                : value
                  ? 'border-primary'
                  : 'border-border',
            ].join(' ')}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
