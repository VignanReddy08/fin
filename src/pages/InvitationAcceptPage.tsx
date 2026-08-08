import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Shield, Smartphone, Mail, Lock, User,
  CheckCircle2, AlertCircle, Clock, RefreshCcw, Sparkles,
  ArrowRight, Key, ShieldCheck, MailCheck, Bell, Sparkle,
  Eye, EyeOff
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import OTPInput from '../components/auth/OTPInput';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import PasswordGenerator from '../components/auth/PasswordGenerator';
import CapsLockDetector from '../components/auth/CapsLockDetector';
import StepProgress from '../components/auth/StepProgress';
import TrustBadges from '../components/auth/TrustBadges';
import { getInvitationByToken, acceptInvitation, type Invitation } from '../lib/authStore';
import { generateOTP, verifyOTP, formatTimer } from '../lib/otpUtils';

const STEPS = ['Welcome', 'Verify Phone', 'Verify Email', 'Credentials', 'Setup Profile', 'Done'];

const slideVariants = {
  enter: { x: 280, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -280, opacity: 0 },
};

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
];

export default function InvitationAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Setup
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verification Details
  const [mobileOTP, setMobileOTP] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [emailVerified, setEmailVerified] = useState(false);
  const [emailTimer, setEmailTimer] = useState(300);
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);

  // Profile Details
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMobile, setRecoveryMobile] = useState('');
  const [notifyMethod, setNotifyMethod] = useState<'both' | 'email' | 'sms'>('both');

  useEffect(() => {
    if (token) {
      const fetchInv = async () => {
        const inv = await getInvitationByToken(token);
        if (inv) {
          setInvitation(inv);
          setRecoveryEmail(inv.email);
          setRecoveryMobile(inv.mobile);
        } else {
          setError('Invalid or expired invitation token');
        }
      };
      fetchInv();
    }
  }, [token]);

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
    if (currentStep === 2 && emailTimer > 0 && !emailVerified) {
      const id = setInterval(() => setEmailTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [currentStep, emailTimer, emailVerified]);

  useEffect(() => {
    if (emailResendCooldown > 0) {
      const id = setInterval(() => setEmailResendCooldown((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [emailResendCooldown]);

  useEffect(() => {
    if (currentStep === 5) {
      const id = setTimeout(() => navigate('/login'), 5000);
      return () => clearTimeout(id);
    }
  }, [currentStep, navigate]);

  const handleStartOnboarding = () => {
    if (!invitation) return;
    const otp = generateOTP();
    setMobileOTP(otp);
    setOtpTimer(300);
    setCurrentStep(1);
  };

  const handleOTPComplete = (entered: string) => {
    if (verifyOTP(entered, mobileOTP)) {
      setOtpError(false);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setOtpTimer(300);
        setCurrentStep(2);
      }, 1000);
    } else {
      setOtpError(true);
    }
  };

  const handleResendOTP = () => {
    const otp = generateOTP();
    setMobileOTP(otp);
    setOtpTimer(300);
    setOtpError(false);
    setResendCooldown(30);
  };

  const handleVerifyEmail = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setEmailVerified(true);
      setTimeout(() => setCurrentStep(3), 1000);
    }, 1500);
  };

  const handleResendEmail = () => {
    setEmailTimer(300);
    setEmailResendCooldown(30);
  };

  const useGeneratedPassword = (pw: string) => {
    setPassword(pw);
    setConfirmPassword(pw);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setCurrentStep(4);
  };

  const handleProfileComplete = () => {
    if (!invitation) return;
    setIsLoading(true);
    setTimeout(async () => {
      const res = await acceptInvitation(invitation.token, password);
      setIsLoading(false);
      if (res.success && res.user) {
        // Save extra profile details
        res.user.avatarUrl = avatar;
        res.user.recoveryEmail = recoveryEmail;
        res.user.recoveryMobile = recoveryMobile;
        res.user.profileCompleted = true;
        setCurrentStep(5);
      } else {
        setError(res.error || 'Failed to complete onboarding');
      }
    }, 1500);
  };

  if (error && currentStep === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="glass max-w-md w-full border-red-500/20 text-center p-6 space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-14 w-14 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold text-red-400">Onboarding Error</CardTitle>
          <p className="text-sm text-gray-400">{error}</p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Back to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10 py-6"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">FinMatrix</span>
          </Link>
        </div>

        {invitation && (
          <StepProgress steps={STEPS} currentStep={currentStep} />
        )}

        <Card className="glass border-white/10 shadow-2xl overflow-hidden mt-4">
          <AnimatePresence mode="wait">
            {/* Step 0: Welcome / Details */}
            {currentStep === 0 && invitation && (
              <motion.div
                key="welcome"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
              >
                <div className="text-center space-y-1">
                  <div className="flex justify-center mb-2">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">Official Invitation</CardTitle>
                  <CardDescription>Enterprise Employee Onboarding Portal</CardDescription>
                </div>

                <div className="p-4 rounded-lg bg-card/50 border border-border/50 space-y-3.5">
                  <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                    <span className="text-gray-500">FullName</span>
                    <span className="text-white font-medium">{invitation.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                    <span className="text-gray-500">Official Email</span>
                    <span className="text-white font-medium">{invitation.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                    <span className="text-gray-500">Mobile</span>
                    <span className="text-white font-medium">+91 {invitation.mobile}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                    <span className="text-gray-500">Department</span>
                    <span className="text-white font-medium">{invitation.department}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                    <span className="text-gray-500">Designation</span>
                    <span className="text-white font-medium">{invitation.designation}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Assigned Role</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      {invitation.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  As part of FinMatrix corporate governance, you are required to verify your credentials, activate MFA, and configure recovery options before your workstation is provisioned.
                </p>

                <Button onClick={handleStartOnboarding} className="w-full h-11">
                  Begin Onboarding Flow <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            )}

            {/* Step 1: Mobile Verification */}
            {currentStep === 1 && invitation && (
              <motion.div
                key="verify-mobile"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 space-y-5"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Smartphone className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-center">Verify Official Mobile</CardTitle>
                  <p className="text-center text-sm text-gray-400 mt-1">
                    OTP sent to registered number +91 ****{invitation.mobile.slice(-4)}
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary">
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span>Demo mode — Your OTP is: <span className="font-mono font-bold">{mobileOTP}</span></span>
                </div>

                <OTPInput onComplete={handleOTPComplete} error={otpError} />

                {otpError && <p className="text-center text-sm text-destructive">Invalid verification code. Try again.</p>}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-4">
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

            {/* Step 2: Email Verification */}
            {currentStep === 2 && invitation && (
              <motion.div
                key="verify-email"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 space-y-5"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <MailCheck className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-center">Verify Official Email</CardTitle>
                  <p className="text-center text-sm text-gray-400 mt-1">
                    Click verification link sent to {invitation.email}
                  </p>
                </div>

                <Button onClick={handleVerifyEmail} className="w-full h-11" disabled={isLoading}>
                  {isLoading ? 'Verifying link...' : 'Verify Email (Simulate Click)'}
                </Button>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Expires in {formatTimer(emailTimer)}
                  </span>
                  <button
                    onClick={handleResendEmail}
                    disabled={emailResendCooldown > 0}
                    className="text-primary hover:underline disabled:text-gray-600 disabled:no-underline"
                  >
                    {emailResendCooldown > 0 ? `Resend in ${emailResendCooldown}s` : 'Resend link'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Password Settings */}
            {currentStep === 3 && (
              <motion.div
                key="credentials"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 space-y-4"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Lock className="h-7 w-7 text-emerald-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">Secure Credentials</CardTitle>
                  <CardDescription>Setup an enterprise-grade password</CardDescription>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">Workstation Password</label>
                      <PasswordGenerator onUsePassword={useGeneratedPassword} />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                    <PasswordStrengthMeter password={password} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 mt-2">
                    Save Credentials <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 4: Profile Complete Setup */}
            {currentStep === 4 && (
              <motion.div
                key="setup-profile"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 space-y-5"
              >
                <div className="text-center">
                  <CardTitle className="text-lg font-bold">Configure Profile Details</CardTitle>
                  <CardDescription>Setup your recovery and preference configurations</CardDescription>
                </div>

                <div className="space-y-4">
                  {/* Avatar selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Corporate Avatar</label>
                    <div className="flex gap-3 justify-center py-1">
                      {AVATARS.map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`relative rounded-full overflow-hidden h-12 w-12 border-2 transition-all ${
                            avatar === url ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                          }`}
                        >
                          <img src={url} alt="Avatar option" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recovery details */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-300">Emergency Recovery Email</label>
                      <Input
                        type="email"
                        placeholder="personal@gmail.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-300">Recovery Mobile Number</label>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        value={recoveryMobile}
                        onChange={(e) => setRecoveryMobile(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Notification preference */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-primary" /> Security Alerts Method
                    </label>
                    <div className="flex gap-2">
                      {([
                        ['both', 'Email + SMS'],
                        ['email', 'Email Only'],
                        ['sms', 'SMS Only']
                      ] as const).map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNotifyMethod(val)}
                          className={`flex-1 py-2 rounded text-xs font-medium border transition-all ${
                            notifyMethod === val
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'bg-card/50 border-border text-gray-400 hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={handleProfileComplete} className="w-full h-11 mt-2" disabled={isLoading}>
                  {isLoading ? 'Activating Profile…' : 'Activate Onboarding Workstation'}
                </Button>
              </motion.div>
            )}

            {/* Step 5: Finished */}
            {currentStep === 5 && invitation && (
              <motion.div
                key="done"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 text-center space-y-5"
              >
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/30">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-emerald-400">Account Activated Successfully!</h3>
                  <p className="text-sm text-gray-400">Your corporate workstation is now ready.</p>
                </div>

                <div className="p-4 rounded-lg bg-card/60 border border-border/80 text-left space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Employee Name:</span><span className="text-white">{invitation.fullName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Official ID:</span><span className="text-white font-mono">{invitation.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Department:</span><span className="text-white">{invitation.department}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Platform Role:</span><span className="text-primary font-bold">{invitation.role.replace('_', ' ').toUpperCase()}</span></div>
                </div>

                <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
                  <div className="h-3 w-3 rounded-full border border-primary border-t-transparent animate-spin" />
                  Redirecting to Enterprise Sign In screen…
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
