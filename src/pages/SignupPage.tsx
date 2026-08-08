import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Mail, Phone, Lock, User, ArrowRight,
  Shield, CheckCircle2, AlertCircle, Eye, EyeOff,
  Clock, RefreshCcw, Sparkles, MailCheck, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import PasswordGenerator from '../components/auth/PasswordGenerator';
import CapsLockDetector from '../components/auth/CapsLockDetector';
import OTPInput from '../components/auth/OTPInput';
import StepProgress from '../components/auth/StepProgress';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import TrustBadges from '../components/auth/TrustBadges';
import { type Role, registerCustomer, registerAdmin, googleAuth } from '../lib/authStore';
import { findUserByEmail, findUserByMobile, verifyMobile, verifyEmail } from '../lib/authStore';
import { generateOTP, formatTimer } from '../lib/otpUtils';
import { useGoogleLogin } from '@react-oauth/google';

const STEPS = ['Register', 'Verify Email', 'Complete'];

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
  general?: string;
}

const slideVariants = {
  enter: { x: 280, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -280, opacity: 0 },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [otpError, setOtpError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [userId, setUserId] = useState('');

  // Secret Admin Key Binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Redirect after success
  useEffect(() => {
    if (currentStep === 2) {
      const id = setTimeout(() => navigate('/login'), 4000);
      return () => clearTimeout(id);
    }
  }, [currentStep, navigate]);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const useGeneratedPassword = (pw: string) => {
    setFormData((prev) => ({ ...prev, password: pw, confirmPassword: pw }));
    setErrors((prev) => ({ ...prev, password: undefined, confirmPassword: undefined }));
  };

  const validateStep1 = (): boolean => {
    const e: FormErrors = {};

    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2)
      e.fullName = 'Name must be at least 2 characters';

    if (!formData.email.trim()) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Please enter a valid email address';
    else if (findUserByEmail(formData.email))
      e.email = 'This email is already registered';

    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 8)
      e.password = 'Password must be at least 8 characters';

    if (!formData.confirmPassword)
      e.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Passwords do not match';

    if (!formData.agreeTerms)
      e.agreeTerms = 'You must agree to the Terms & Conditions';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1Submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateStep1()) return;

    setIsLoading(true);
    try {
      const newOTP = generateOTP();
      setGeneratedOTP(newOTP);

      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: newOTP })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send OTP email');
      }

      setCurrentStep(1); // Move to OTP verification step
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to send OTP email' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (enteredOTP !== generatedOTP && enteredOTP !== '000000') {
      setOtpError('Invalid OTP. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      };
      
      const result = await (isAdminMode ? registerAdmin(data) : registerCustomer(data));

      if (result.success && result.user) {
        setUserId(result.user.id);
        verifyEmail(result.user.id); // Auto-verify
        setCurrentStep(2); // Success step
      } else {
        setErrors({ general: result.error || 'Registration failed' });
        setCurrentStep(0); // Go back if registration failed
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setErrors({});
      try {
        const result = await googleAuth(tokenResponse.access_token);
        if (result.success && result.user) {
          navigate('/app/dashboard');
        } else {
          setErrors({ general: result.error || 'Google login failed' });
        }
      } catch (err) {
        setErrors({ general: 'Network error during Google login' });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setErrors({ general: 'Google login was canceled or failed' });
    }
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10 py-6"
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

        {/* Step Progress */}
        <StepProgress steps={STEPS} currentStep={currentStep} />

        <Card className="glass border-white/10 shadow-2xl overflow-hidden mt-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Form */}
            {currentStep === 0 && (
              <motion.div
                key="step-register"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="space-y-1 pb-3">
                  <CardTitle className="text-xl font-bold text-center">
                    {isAdminMode ? (
                      <span className="flex items-center justify-center gap-2 text-primary">
                        <Shield className="h-5 w-5" /> Admin Provisioning
                      </span>
                    ) : (
                      'Create your account'
                    )}
                  </CardTitle>
                  <p className="text-center text-sm text-gray-400">
                    {isAdminMode ? 'Register a new super admin account' : 'Join FinMatrix as a customer'}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <GoogleAuthButton onAuth={handleGoogleAuth} text="Continue with Google" />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 text-gray-500 uppercase tracking-wider">
                        or register with credentials
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{errors.general}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleStep1Submit} className="space-y-3.5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="text"
                          placeholder="John Doe"
                          className={errors.fullName ? 'border-destructive' : ''}
                          value={formData.fullName}
                          onChange={(e) => updateField('fullName', e.target.value)}
                        />
                      </div>
                      {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          className={errors.email ? 'border-destructive' : ''}
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    {/* Password + CapsLock + Generator */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <PasswordGenerator onUsePassword={useGeneratedPassword} />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={errors.password ? 'border-destructive' : ''}
                          value={formData.password}
                          onChange={(e) => updateField('password', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <CapsLockDetector />
                      <PasswordStrengthMeter password={formData.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={errors.confirmPassword ? 'border-destructive' : ''}
                          value={formData.confirmPassword}
                          onChange={(e) => updateField('confirmPassword', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={formData.agreeTerms}
                        onClick={() => updateField('agreeTerms', !formData.agreeTerms)}
                        className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                          formData.agreeTerms ? 'bg-primary border-primary' : 'border-gray-600 bg-gray-800'
                        }`}
                      >
                        {formData.agreeTerms && (
                          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12">
                            <path d="M10 3L4.5 8.5L2 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <span className="text-xs text-gray-400 select-none">
                        I agree to the <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
                      </span>
                    </div>
                    {errors.agreeTerms && <p className="text-xs text-destructive">{errors.agreeTerms}</p>}

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Continue <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {/* Step 2: Verify OTP */}
            {currentStep === 1 && (
              <motion.div
                key="step-verify"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-3 text-center space-y-4"
              >
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <MailCheck className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Check your email</h3>
                <p className="text-sm text-gray-400">
                  We've sent a 6-digit verification code to <span className="text-white font-medium">{formData.email}</span>
                </p>

                <div className="bg-primary/10 border border-primary/20 text-primary-foreground/90 p-3 rounded-md text-xs text-left my-4 leading-relaxed">
                  <strong>⚠️ Demo Notice:</strong> Email delivery is currently disabled due to standard Render free-tier SMTP limitations. Please enter <strong>000000</strong> as the verification code to bypass this step.
                </div>

                <div className="py-4">
                  <OTPInput 
                    length={6} 
                    onComplete={(val) => {
                      setEnteredOTP(val);
                      setOtpError('');
                    }} 
                    error={!!otpError} 
                    disabled={isLoading}
                  />
                  {otpError && <p className="text-xs text-destructive mt-2">{otpError}</p>}
                </div>

                <Button 
                  onClick={handleVerifyOTP} 
                  className="w-full h-11" 
                  disabled={enteredOTP.length !== 6 || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                <div className="mt-4 flex flex-col items-center gap-2 text-sm">
                  <p className="text-gray-400">Didn't receive the code?</p>
                  <button 
                    onClick={(e) => handleStep1Submit(e as unknown as React.FormEvent)} 
                    className="text-primary hover:underline flex items-center gap-1"
                    disabled={isLoading}
                  >
                    <RefreshCcw className="h-3 w-3" /> Resend Code
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {currentStep === 2 && (
              <motion.div
                key="step-complete"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-3 text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-emerald-400">Account Created!</h3>
                <p className="text-sm text-gray-400">
                  Welcome to FinMatrix, {formData.fullName}. Your account is verified and ready.
                </p>
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
