import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Lock, Mail, Phone, ArrowRight, Shield,
  Eye, EyeOff, AlertCircle, Loader2, Sparkles, Building2, UserCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import CapsLockDetector from '../components/auth/CapsLockDetector';
import TrustBadges from '../components/auth/TrustBadges';
import AuthProgress from '../components/auth/AuthProgress';
import MFAVerification from '../components/auth/MFAVerification';
import WorkspaceSelection from '../components/auth/WorkspaceSelection';
import SecurityTips from '../components/auth/SecurityTips';
import NetworkStatusBanner from '../components/auth/NetworkStatusBanner';
import { login, googleAuth, isCredentialEmail, isCredentialMobile, isAccountLocked, resetUserPassword, updateUserProfile, type User } from '../lib/authStore';
import { markDeviceTrusted, isDeviceTrusted } from '../lib/sessionManager';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const navigate = useNavigate();
  const credentialInputRef = useRef<HTMLInputElement>(null);

  // States
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [error, setError] = useState('');

  // Lockout State
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Flow Control States
  const [mfaUser, setMfaUser] = useState<User | null>(null);
  const [showMFA, setShowMFA] = useState(false);
  const [showWorkspaceSelect, setShowWorkspaceSelect] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [showForcePasswordChange, setShowForcePasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const isEmail = isCredentialEmail(credential);
  const isMobile = isCredentialMobile(credential);

  // Keyboard Shortcuts & Focus Management
  useEffect(() => {
    // Focus on mount
    credentialInputRef.current?.focus();

    const handleShortcuts = (e: KeyboardEvent) => {
      // Ctrl + Shift + L -> Clear & Focus Login Credential
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setCredential('');
        setPassword('');
        setError('');
        credentialInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, []);

  const startLockoutTimer = (seconds: number) => {
    setIsLocked(true);
    setLockoutRemaining(seconds);
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lockout = isAccountLocked(credential);
    if (lockout.locked) {
      startLockoutTimer(lockout.remaining);
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const result = await login(credential, password);
      setIsLoading(false);

      if (result.success && result.user) {
        const browser = "Chrome 126";
        const os = "Windows 11";
        const trusted = isDeviceTrusted(browser, os) || localStorage.getItem(`device_trusted_${result.user.id}`) === 'true';

        setMfaUser(result.user);

        if (result.user.passwordChangedAt === '') {
          setShowForcePasswordChange(true);
        } else if (result.requiresMFA && !trusted) {
          setShowMFA(true);
        } else {
          // Bypass MFA
          setSelectedEnvironment('Production');
          navigate('/app/dashboard');
        }
      } else {
        if (result.isLocked && result.lockoutRemaining) {
          startLockoutTimer(result.lockoutRemaining);
        } else {
          setError(result.error || 'Authentication failed');
        }
      }
    }, 1200);
  };

  const handleForcePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    if (mfaUser) {
      resetUserPassword(mfaUser.id, newPassword);
      updateUserProfile(mfaUser.id, { passwordChangedAt: new Date().toISOString() });
      setShowForcePasswordChange(false);
      
      const browser = "Chrome 126";
      const os = "Windows 11";
      const trusted = isDeviceTrusted(browser, os) || localStorage.getItem(`device_trusted_${mfaUser.id}`) === 'true';
      if (mfaUser.mfaEnabled && !trusted) {
        setShowMFA(true);
      } else {
        setSelectedEnvironment('Production');
        navigate('/app/dashboard');
      }
    }
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const result = await googleAuth(tokenResponse.access_token);
        if (result.success && result.user) {
          setMfaUser(result.user);
          setSelectedEnvironment('Production');
          navigate('/app/dashboard');
        } else {
          setError(result.error || 'Google login failed');
        }
      } catch (err) {
        setError('Network error during Google login');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google login was canceled or failed');
    }
  });

  const handleMFAVerify = (rememberDevice: boolean) => {
    setShowMFA(false);
    if (rememberDevice && mfaUser) {
      localStorage.setItem(`device_trusted_${mfaUser.id}`, 'true');
      markDeviceTrusted({
        name: 'This Device (Verified)',
        browser: 'Chrome 126',
        os: 'Windows 11'
      });
    }
    // Proceed to Workspace Environment Selection or direct to dashboard for customers
    setSelectedEnvironment('Production');
    navigate('/app/dashboard');
  };

  const handleWorkspaceSelect = (ws: any) => {
    setSelectedEnvironment(ws.environment);
    setShowWorkspaceSelect(false);
    // Display personalized welcome visual animation before dashboard redirect
    setShowWelcomeAnimation(true);
  };

  const handleWelcomeAnimationComplete = () => {
    setShowWelcomeAnimation(false);
    setShowProgress(true);
  };

  const handleProgressComplete = () => {
    setShowProgress(false);
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Offline network Banner detection */}
      <NetworkStatusBanner />

      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Intelligent setup loader screen */}
      <AnimatePresence>
        {showProgress && (
          <AuthProgress isActive={showProgress} onComplete={handleProgressComplete} />
        )}
      </AnimatePresence>

      {/* Welcome Animation Panel */}
      <AnimatePresence>
        {showWelcomeAnimation && mfaUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-6 max-w-sm px-6"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center overflow-hidden">
                    {mfaUser.avatarUrl ? (
                      <img src={mfaUser.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {mfaUser.fullName.split(' ').map((n) => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                    <UserCheck className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Welcome, {mfaUser.fullName}</h2>
                <p className="text-xs text-gray-500">
                  Initializing secure workstation session for {mfaUser.email}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-card border border-border/80 flex items-center justify-between text-xs text-left">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-white">FinMatrix Corp</p>
                    <p className="text-[10px] text-gray-500">Role: {mfaUser.role.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  {selectedEnvironment}
                </span>
              </div>

              <Button onClick={handleWelcomeAnimationComplete} className="w-full h-10">
                Proceed to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 py-6"
      >
        {/* Force Password Change override */}
        {showForcePasswordChange && mfaUser ? (
          <Card className="glass border-white/10 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold text-center">Change Default Password</CardTitle>
              <CardDescription className="text-center text-xs">
                For security compliance, you must update the default administrator password before accessing the FinMatrix platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForcePasswordChangeSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-300">New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-300">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => { setConfirmNewPassword(e.target.value); setError(''); }}
                  />
                </div>
                <Button type="submit" className="w-full h-10 text-xs">
                  Update Password & Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : showWorkspaceSelect && mfaUser ? (
          <WorkspaceSelection
            userFullName={mfaUser.fullName}
            userRole={mfaUser.role}
            onSelect={handleWorkspaceSelect}
          />
        ) : (
          <>
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">FinMatrix</span>
              </Link>
            </div>

            <Card className="glass border-white/10 shadow-2xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center">
                  {showMFA ? 'Security Verification' : isLocked ? 'Account Temporarily Locked' : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="text-center">
                  {showMFA 
                    ? 'Enter the multi-factor authentication code sent to you' 
                    : isLocked 
                    ? 'Security policy block triggered due to failed attempts' 
                    : 'Sign in to your enterprise account'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Lockout details */}
                {isLocked ? (
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <Shield className="h-6 w-6 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Too Many Failed Login Attempts</p>
                        <p className="text-xs text-red-400/80 mt-0.5">
                          Your account has been locked for your protection.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border text-center space-y-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Remaining Lock Duration</p>
                      <p className="text-3xl font-bold font-mono text-white">
                        {Math.floor(lockoutRemaining / 60)}:{String(lockoutRemaining % 60).padStart(2, '0')}
                      </p>
                      <p className="text-xs text-gray-500">
                        You can try again after the timer expires, or request an administrator password reset.
                      </p>
                    </div>

                    <Button onClick={() => setIsLocked(false)} variant="outline" className="w-full">
                      Return to Login
                    </Button>
                  </div>
                ) : showMFA && mfaUser ? (
                  <MFAVerification
                    email={mfaUser.email}
                    mobile={mfaUser.mobile}
                    onVerify={handleMFAVerify}
                    onCancel={() => setShowMFA(false)}
                  />
                ) : (
                  <>
                    <GoogleAuthButton onAuth={handleGoogleAuth} text="Continue with Google" />

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-card px-3 text-gray-500 uppercase tracking-wider">
                          or sign in with credentials
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                          >
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Credential auto detect */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Email, Username, or Mobile Number
                        </label>
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
                            placeholder="Email, username, or phone number"
                            className="pl-10"
                            required
                            ref={credentialInputRef}
                            value={credential}
                            onChange={(e) => {
                              setCredential(e.target.value);
                              setError('');
                            }}
                            autoComplete="username"
                            id="login-credential"
                          />
                        </div>
                      </div>

                      {/* Password + CapsLock */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-300">Password</label>
                          <Link
                            to="/forgot-password"
                            className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            required
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setError('');
                            }}
                            autoComplete="current-password"
                            id="login-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <CapsLockDetector />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 mt-2 font-semibold"
                        disabled={isLoading}
                        id="login-submit"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying Credentials…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Sign In <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>

                    <p className="text-center text-sm text-gray-400">
                      Don't have an account?{' '}
                      <Link
                        to="/signup"
                        className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                      >
                        Create account
                      </Link>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rotating Security Tips */}
            <div className="mt-6">
              <SecurityTips />
            </div>

            {/* Footer badges */}
            <div className="mt-6">
              <TrustBadges variant="compact" />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
