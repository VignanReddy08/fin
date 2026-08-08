// ─── Interfaces ──────────────────────────────────────────────────────
export interface PasswordCheck {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export type StrengthLevel =
  | 'none' | 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';

export interface PasswordAnalysis {
  score: number;
  level: StrengthLevel;
  label: string;
  checks: PasswordCheck;
  color: string;
  percentage: number;
  entropy: number;
  crackTime: string;
  isCommon: boolean;
}

// ─── Common Passwords ────────────────────────────────────────────────
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey',
  '1234567', 'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou',
  'master', 'sunshine', 'ashley', 'bailey', 'shadow', '123123',
  '654321', 'superman', 'qazwsx', 'michael', 'football', 'password1',
  'password123', '000000', 'hello', 'charlie', 'donald', '121212',
  'admin', 'admin123', 'welcome', 'login', 'starwars', 'solo',
  'princess', 'passw0rd', 'p@ssw0rd', 'p@ssword', 'qwerty123',
  'letmein123', 'welcome1', '1q2w3e4r', 'zaq1xsw2', 'test123',
  'changeme', 'secret', 'access', 'master123', 'abcdef', 'abcd1234',
]);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

// ─── Entropy Calculation ─────────────────────────────────────────────
export function calculateEntropy(password: string): number {
  if (!password) return 0;
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;
  if (charsetSize === 0) return 0;
  return Math.round(password.length * Math.log2(charsetSize));
}

// ─── Crack Time Estimation ───────────────────────────────────────────
export function estimateCrackTime(entropy: number): string {
  if (entropy === 0) return '';
  // Assume 10 billion guesses/second (modern GPU cluster)
  const seconds = Math.pow(2, entropy) / 1e10;

  if (seconds < 0.001) return 'instantly';
  if (seconds < 1) return 'less than a second';
  if (seconds < 60) return `${Math.ceil(seconds)} seconds`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.ceil(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.ceil(seconds / 2592000)} months`;
  if (seconds < 31536000 * 100) return `${Math.ceil(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e6) return `${Math.ceil(seconds / (31536000 * 100))} centuries`;
  if (seconds < 31536000 * 1e9) return `${Math.ceil(seconds / (31536000 * 1e6))} million years`;
  return 'billions of years';
}

// ─── Password Analysis ───────────────────────────────────────────────
export function analyzePassword(password: string): PasswordAnalysis {
  const checks: PasswordCheck = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const entropy = calculateEntropy(password);
  const crackTime = estimateCrackTime(entropy);
  const common = isCommonPassword(password);

  // Very Strong: all 5 checks + length ≥ 12 + not common
  if (score === 5 && password.length >= 12 && !common) {
    return {
      score: 6, level: 'very-strong', label: 'Very Strong',
      checks, color: '#059669', percentage: 100,
      entropy, crackTime, isCommon: common,
    };
  }

  const map: Record<number, { level: StrengthLevel; label: string; color: string; pct: number }> = {
    0: { level: 'none', label: '', color: '#333333', pct: 0 },
    1: { level: 'very-weak', label: 'Very Weak', color: '#EF4444', pct: 17 },
    2: { level: 'weak', label: 'Weak', color: '#F97316', pct: 33 },
    3: { level: 'fair', label: 'Fair', color: '#F59E0B', pct: 50 },
    4: { level: 'good', label: 'Good', color: '#84CC16', pct: 67 },
    5: { level: 'strong', label: 'Strong', color: '#10B981', pct: 83 },
  };

  // Downgrade if common
  const effectiveScore = common && score > 1 ? Math.min(score, 2) : score;
  const { level, label, color, pct } = map[effectiveScore];

  return {
    score: effectiveScore, level, label: common ? 'Common Password' : label,
    checks, color: common ? '#EF4444' : color, percentage: pct,
    entropy, crackTime, isCommon: common,
  };
}

// ─── Secure Password Generator ───────────────────────────────────────
export interface GeneratorOptions {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
}

export function generateSecurePassword(opts: GeneratorOptions = {}): string {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = opts;

  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const NUMS  = '0123456789';
  const SYMS  = '!@#$%^&*()_+-=[]{}|;:<>?';

  let chars = '';
  const required: string[] = [];

  if (lowercase)  { chars += LOWER; required.push(LOWER); }
  if (uppercase)  { chars += UPPER; required.push(UPPER); }
  if (numbers)    { chars += NUMS;  required.push(NUMS); }
  if (symbols)    { chars += SYMS;  required.push(SYMS); }
  if (!chars) { chars = LOWER; required.push(LOWER); }

  // Generate random password
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  const result = Array.from(arr).map((n) => chars[n % chars.length]);

  // Ensure at least one char from each required set
  const shuffle = new Uint32Array(required.length);
  crypto.getRandomValues(shuffle);
  required.forEach((set, i) => {
    const pos = shuffle[i] % length;
    const randIdx = new Uint32Array(1);
    crypto.getRandomValues(randIdx);
    result[pos] = set[randIdx[0] % set.length];
  });

  return result.join('');
}
