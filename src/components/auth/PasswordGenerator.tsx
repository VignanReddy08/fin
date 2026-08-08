import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, RefreshCw, Copy, Check, SlidersHorizontal } from 'lucide-react';
import { generateSecurePassword, analyzePassword } from '../../lib/passwordUtils';

interface Props {
  onUsePassword: (password: string) => void;
}

export default function PasswordGenerator({ onUsePassword }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true, lowercase: true, numbers: true, symbols: true,
  });
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const pw = generateSecurePassword({ length, ...options });
    setGenerated(pw);
    setCopied(false);
  }, [length, options]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    onUsePassword(generated);
    setIsOpen(false);
  };

  const toggleOption = (key: keyof typeof options) => {
    const activeCount = Object.values({ ...options, [key]: !options[key] }).filter(Boolean).length;
    if (activeCount === 0) return; // at least one must be active
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const analysis = generated ? analyzePassword(generated) : null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && !generated) generate(); }}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
      >
        <KeyRound className="h-3.5 w-3.5" />
        {isOpen ? 'Hide' : 'Generate Secure Password'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-lg bg-card/80 border border-border space-y-3">
              {/* Generated password display */}
              {generated && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 rounded bg-background/50 border border-border font-mono text-sm text-white break-all select-all">
                    {generated}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={generate}
                    className="p-2 rounded hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Strength indicator */}
              {analysis && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium" style={{ color: analysis.color }}>{analysis.label}</span>
                  <span className="text-gray-500">• {analysis.entropy} bits • ~{analysis.crackTime}</span>
                </div>
              )}

              {/* Length slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <SlidersHorizontal className="h-3 w-3" /> Length
                  </span>
                  <span className="text-white font-mono">{length}</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={32}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Options toggles */}
              <div className="flex flex-wrap gap-2">
                {([
                  ['uppercase', 'A–Z'],
                  ['lowercase', 'a–z'],
                  ['numbers', '0–9'],
                  ['symbols', '!@#'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleOption(key)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                      options[key]
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-gray-800 border-gray-700 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Use button */}
              {generated && (
                <button
                  type="button"
                  onClick={handleUse}
                  className="w-full h-8 rounded bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  Use This Password
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
