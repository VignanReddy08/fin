import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Mail, Clock, RefreshCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import OTPInput from './OTPInput';
import { generateOTP, verifyOTP, formatTimer } from '../../lib/otpUtils';

interface Props {
  email: string;
  mobile: string;
  onVerify: (rememberDevice: boolean) => void;
  onCancel: () => void;
}

type DeliveryMethod = 'sms' | 'email';

export default function MFAVerification({ email, mobile, onVerify, onCancel }: Props) {
  const [method, setMethod] = useState<DeliveryMethod | null>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [timer, setTimer] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const sendOTP = (m: DeliveryMethod) => {
    setMethod(m);
    const code = generateOTP();
    setOtp(code);
    setTimer(300);
    setOtpError(false);
  };

  useEffect(() => {
    if (method && timer > 0 && !verified) {
      const id = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [method, timer, verified]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const id = setInterval(() => setResendCooldown((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [resendCooldown]);

  const handleOTPComplete = (entered: string) => {
    if (verifyOTP(entered, otp)) {
      setOtpError(false);
      setIsVerifying(true);
      setTimeout(() => {
        setVerified(true);
        setTimeout(() => onVerify(rememberDevice), 1200);
      }, 800);
    } else {
      setOtpError(true);
    }
  };

  const handleResend = () => {
    const code = generateOTP();
    setOtp(code);
    setTimer(300);
    setOtpError(false);
    setResendCooldown(30);
  };

  // ── Method Selection ────────────────────────────────────────────────
  if (!method) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Shield className="h-7 w-7 text-primary" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-400 mt-1">
            Choose how you'd like to receive your verification code
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => sendOTP('sms')}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Smartphone className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">SMS to Mobile</p>
              <p className="text-xs text-gray-500">Send code to +91 ****{mobile.slice(-4)}</p>
            </div>
          </button>

          <button
            onClick={() => sendOTP('email')}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Email</p>
              <p className="text-xs text-gray-500">Send code to {email.replace(/(.{2}).*(@.*)/, '$1***$2')}</p>
            </div>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel sign in
        </button>
      </motion.div>
    );
  }

  // ── Verified Success ────────────────────────────────────────────────
  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-6 gap-4"
      >
        <motion.div
          className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </motion.div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-400">Verified!</p>
          <p className="text-sm text-gray-400">Identity confirmed. Loading your workspace…</p>
        </div>
      </motion.div>
    );
  }

  // ── OTP Entry ───────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5"
    >
      <div className="flex justify-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
          {method === 'sms' ? (
            <Smartphone className="h-7 w-7 text-primary" />
          ) : (
            <Mail className="h-7 w-7 text-primary" />
          )}
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-white">Enter Verification Code</h3>
        <p className="text-sm text-gray-400 mt-1">
          {method === 'sms'
            ? `Code sent to +91 ****${mobile.slice(-4)}`
            : `Code sent to ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`}
        </p>
      </div>

      {/* Demo hint */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary">
        <Sparkles className="h-4 w-4 flex-shrink-0" />
        <span>Demo mode — Your OTP is: <span className="font-mono font-bold">{otp}</span></span>
      </div>

      <OTPInput onComplete={handleOTPComplete} error={otpError} />

      {otpError && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-destructive">
          Invalid code. Please try again.
        </motion.p>
      )}

      {/* Timer */}
      <div className="text-center">
        {timer > 0 ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Code expires in <span className="text-white font-mono">{formatTimer(timer)}</span></span>
          </div>
        ) : (
          <p className="text-sm text-destructive">Code has expired</p>
        )}
      </div>

      {/* Resend */}
      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-sm text-primary hover:text-primary/80 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto transition-colors"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </button>
      </div>

      {/* Remember device */}
      <div className="flex items-center gap-2 justify-center">
        <button
          type="button"
          role="checkbox"
          aria-checked={rememberDevice}
          onClick={() => setRememberDevice(!rememberDevice)}
          className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
            rememberDevice ? 'bg-primary border-primary' : 'border-gray-600 bg-gray-800'
          }`}
        >
          {rememberDevice && (
            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12">
              <path d="M10 3L4.5 8.5L2 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <label
          onClick={() => setRememberDevice(!rememberDevice)}
          className="text-sm text-gray-400 cursor-pointer select-none"
        >
          Remember this device for 30 days
        </label>
      </div>

      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <div className="h-4 w-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          Verifying identity…
        </div>
      )}

      {/* Back */}
      <button
        onClick={() => setMethod(null)}
        className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors text-center"
      >
        Use a different method
      </button>
    </motion.div>
  );
}
