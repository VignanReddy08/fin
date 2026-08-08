/** Generate a random 6-digit OTP string. */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Compare entered OTP against the expected value. */
export function verifyOTP(entered: string, expected: string): boolean {
  return entered === expected;
}

/** Format remaining seconds as `m:ss`. */
export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
