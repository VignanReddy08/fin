import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CheckCircle2, ArrowRight, ArrowLeft,
  Bell, Smartphone, Mail, Sparkles, LogOut, Check, Bot
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import StepProgress from '../components/auth/StepProgress';
import { getCurrentUser, updateUserProfile, type User as SystemUser } from '../lib/authStore';

const STEPS = ['Personal Info', 'Workstation Avatar', 'Recovery Fallbacks', 'Notifications'];

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
];

export default function ProfileCompletionPage() {
  const navigate = useNavigate();
  const user = getCurrentUser() || {
    id: 'sa-001',
    fullName: 'Super Administrator',
    email: 'superadmin@agentic.fi',
    mobile: '9999999999',
  } as SystemUser;

  const [currentStep, setCurrentStep] = useState(0);
  const [fullName, setFullName] = useState(user.fullName);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMobile, setRecoveryMobile] = useState('');
  const [notifyMethod, setNotifyMethod] = useState<'both' | 'email' | 'sms'>('both');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((c) => c + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  };

  const handleComplete = () => {
    setIsLoading(true);
    setTimeout(() => {
      updateUserProfile(user.id, {
        fullName,
        avatarUrl: avatar,
        recoveryEmail,
        recoveryMobile,
        profileCompleted: true,
      });
      setIsLoading(false);
      navigate('/app/dashboard');
    }, 1500);
  };

  const pct = Math.round(((currentStep + 1) / 4) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 py-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-white">FinMatrix</span>
          </div>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Continue Later
          </button>
        </div>

        {/* Completion details */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
            <span>Workstation Provision Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <StepProgress steps={STEPS} currentStep={currentStep} />

        <Card className="glass border-white/10 shadow-2xl overflow-hidden mt-4">
          <CardContent className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Info */}
              {currentStep === 0 && (
                <motion.div
                  key="personal-info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">Confirm Workspace Profile</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Please confirm your display identity details</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400">FullName</label>
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400">Official Work Email</label>
                      <Input type="email" value={user.email} disabled className="opacity-60 cursor-not-allowed" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Workstation Avatar */}
              {currentStep === 1 && (
                <motion.div
                  key="avatar-setup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">Select Workspace Avatar</h3>
                    <p className="text-xs text-gray-500 mt-0.5">This represents your account icon in security lists</p>
                  </div>

                  <div className="flex gap-4 justify-center py-2">
                    {AVATARS.map((url) => (
                      <button
                        key={url}
                        onClick={() => setAvatar(url)}
                        className={`relative rounded-full overflow-hidden h-14 w-14 border-2 transition-all ${
                          avatar === url ? 'border-primary scale-110' : 'border-transparent opacity-75'
                        }`}
                      >
                        <img src={url} alt="Avatar option" className="h-full w-full object-cover" />
                        {avatar === url && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Recovery details */}
              {currentStep === 2 && (
                <motion.div
                  key="recovery-fallbacks"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">Recovery Access Configurations</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Add fallback details to verify identity during recovery</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Emergency Recovery Email</label>
                      <Input
                        type="email"
                        placeholder="personal@gmail.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Recovery Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        value={recoveryMobile}
                        onChange={(e) => setRecoveryMobile(e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Notification details */}
              {currentStep === 3 && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">Security Notifications Preference</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Choose how you'd like to get workstation login updates</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {([
                      ['both', 'Email + SMS Alerts'],
                      ['email', 'Email Notifications Only'],
                      ['sms', 'SMS Text Alerts Only']
                    ] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setNotifyMethod(val)}
                        className={`w-full py-3 px-4 rounded-lg text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                          notifyMethod === val
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-card/50 border-border text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{label}</span>
                        {notifyMethod === val && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between gap-4 pt-4 border-t border-border/30">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={handleNext} disabled={isLoading} className="flex items-center gap-1">
                {isLoading ? (
                  'Saving…'
                ) : currentStep === 3 ? (
                  'Complete Setup'
                ) : (
                  <>
                    Next <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
