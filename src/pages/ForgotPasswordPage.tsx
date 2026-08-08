import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Mail, Phone, Lock, ArrowLeft, ArrowRight,
  Shield, CheckCircle2, AlertCircle, Eye, EyeOff,
  KeyRound, Clock, RefreshCcw, Sparkles, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import OTPInput from '../components/auth/OTPInput';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import PasswordGenerator from '../components/auth/PasswordGenerator';
import CapsLockDetector from '../components/auth/CapsLockDetector';
import StepProgress from '../components/auth/StepProgress';
import TrustBadges from '../components/auth/TrustBadges';
import {
  findUser,
  isCredentialEmail,
  isCredentialMobile,
  resetUserPassword,
} from '../lib/authStore';
import { generateOTP, verifyOTP, formatTimer } from '../lib/otpUtils';

const STEPS = ['Identity', 'Verify', 'Reset'];

const slideVariants = {
  enter: { x: 280, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -280, opacity: 0 },
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 — Identity
  const [credential, setCredential] = useState('');
  const [credError, setCredError] = useState('');

  // Step 2 — OTP
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3 — Reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [userId, setUserId] = useState('');

  const isEmail = isCredentialEmail(credential);
  const isMobile = isCredentialMobile(credential);

  useEffect(() => {
    if (currentStep === 1 && otpTimer > 0) {
      const id = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [currentStep, otpTimer]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const id = setInterval(() => setResendCooldown((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (resetSuccess) {
      const id = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(id);
    }
  }, [resetSuccess, navigate]);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');

    if (!credential.trim()) {
      setCredError('Please enter your email or mobile number');
      return;
    }

    const user = findUser(credential);
    if (!user) {
      setCredError('No account found with this credential');
      return;
    }

    setIsLoading(true);
    setUserId(user.id);

    setTimeout(() => {
      const generated = generateOTP();
      setOtp(generated);
      setOtpTimer(300);
      setCurrentStep(1);
      setIsLoading(false);
    }, 1200);
  };

  const handleOTPComplete = (entered: string) => {
    if (verifyOTP(entered, otp)) {
      setOtpError(false);
      setIsLoading(true);
      setTimeout(() => {
        setCurrentStep(2);
        setIsLoading(false);
      }, 1000);
    } else {
      setOtpError(true);
    }
  };

  const handleResendOTP = () => {
    const generated = generateOTP();
    setOtp(generated);
    setOtpTimer(300);
    setOtpError(false);
    setResendCooldown(30);
  };

  const useGeneratedPassword = (pw: string) => {
    setNewPassword(pw);
    setConfirmPassword(pw);
    setResetError('');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      resetUserPassword(userId, newPassword);
      setResetSuccess(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 py-6"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">FinMatrix</span>
          </Link>
        </div>

        {!resetSuccess && <StepProgress steps={STEPS} currentStep={currentStep} />}

        <Card className="glass border-white/10 shadow-2xl overflow-hidden mt-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Credential */}
            {currentStep === 0 && (
              <motion.div
                key="fp-identity"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="space-y-1 pb-3">
                  <div className="flex justify-center mb-2">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <KeyRound className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-center">Reset your password</CardTitle>
                  <p className="text-center text-sm text-gray-400">
                    Enter your registered email or mobile number to receive a verification code
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <AnimatePresence>
                    {credError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{credError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleStep1} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Email or Mobile Number</label>
                      <div className="relative">
                        <div className="absolute left-3 top-2.5">
                          {isEmail ? (
                            <Mail className="h-4 w-4 text-primary" />
                          ) : isMobile ? (
                            <Phone className="h-4 w-4 text-primary" />
                          ) : (
                            <Mail className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <Input
                          type="text"
                          placeholder="name@enterprise.com or 9876543210"
                          className="pl-10"
                          value={credential}
                          onChange={(e) => {
                            setCredential(e.target.value);
                            setCredError('');
                          }}
                          id="fp-credential"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending code…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Send Verification Code <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <Link to="/login" className="text-sm text-gray-400 hover:text-gray-300 inline-flex items-center gap-1">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to login
                    </Link>
                  </div>
                </CardContent>
              </motion.div>
            )}

            {/* Step 2: Verification Code */}
            {currentStep === 1 && (
              <motion.div
                key="fp-verify"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-3"
              >
                <div className="flex justify-center mb-2">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-center text-white">Enter verification code</h3>
                <p className="text-center text-sm text-gray-400 mb-4">We've sent code to {credential}</p>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary mb-4">
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span>Demo mode — Your OTP is: <span className="font-mono font-bold">{otp}</span></span>
                </div>

                <OTPInput onComplete={handleOTPComplete} error={otpError} />

                {otpError && <p className="text-center text-sm text-destructive mt-2">Invalid code. Try again.</p>}

                <div className="flex items-center justify-between text-xs text-gray-500 mt-6">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Expires in {formatTimer(otpTimer)}
                  </span>
                  <button
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0}
                    className="text-primary hover:underline disabled:text-gray-600 disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: New Password */}
            {currentStep === 2 && !resetSuccess && (
              <motion.div
                key="fp-reset"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="space-y-1 pb-3">
                  <div className="flex justify-center mb-2">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Lock className="h-7 w-7 text-emerald-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-center">Create new password</CardTitle>
                  <p className="text-center text-sm text-gray-400">
                    Identity verified. Create your secure credentials below.
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <AnimatePresence>
                    {resetError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{resetError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-300">New Password</label>
                        <PasswordGenerator onUsePassword={useGeneratedPassword} />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setResetError('');
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-500"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <CapsLockDetector />
                      <PasswordStrengthMeter password={newPassword} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setResetError('');
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-gray-500"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading ? 'Resetting password…' : 'Reset Password'}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {/* Success */}
            {resetSuccess && (
              <motion.div
                key="fp-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-emerald-400">Password Reset!</h3>
                <p className="text-sm text-gray-400">Your password was updated. You can now login.</p>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Redirecting to login…
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Footer badges */}
        <div className="mt-8">
          <TrustBadges variant="compact" />
        </div>
      </motion.div>
    </div>
  );
}
