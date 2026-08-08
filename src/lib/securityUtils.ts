import type { User } from './authStore';
import { analyzePassword } from './passwordUtils';
import { getTrustedDevices } from './sessionManager';

// ─── Interfaces ──────────────────────────────────────────────────────
export interface SecurityScoreBreakdown {
  total: number;
  mfa: number;
  emailVerified: number;
  mobileVerified: number;
  passwordStrength: number;
  trustedDevices: number;
  recoverySetup: number;
  recentPasswordChange: number;
}

export type SecurityLevel = 'critical' | 'poor' | 'fair' | 'good' | 'excellent';

export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  action?: string;
}

// ─── Security Score Calculation ───────────────────────────────────────
export function calculateSecurityScore(user: User): SecurityScoreBreakdown {
  let mfa = 0, emailV = 0, mobileV = 0, pwStrength = 0;
  let devices = 0, recovery = 0, recentPw = 0;

  // MFA enabled (20 points)
  if (user.mfaEnabled) mfa = 20;

  // Email verified (10 points)
  if (user.emailVerified) emailV = 10;

  // Mobile verified (10 points)
  if (user.mobileVerified) mobileV = 10;

  // Password strength (20 points)
  const analysis = analyzePassword(user.password || '');
  pwStrength = Math.min(20, Math.round((analysis.score / 6) * 20));

  // Trusted devices set up (15 points)
  const trustedCount = getTrustedDevices().length;
  if (trustedCount >= 2) devices = 15;
  else if (trustedCount >= 1) devices = 10;

  // Recovery options (15 points)
  if (user.recoveryEmail) recovery += 7;
  if (user.recoveryMobile) recovery += 8;

  // Recent password change — within 90 days (10 points)
  if (user.passwordChangedAt) {
    const daysSinceChange = (Date.now() - new Date(user.passwordChangedAt).getTime()) / 86400000;
    if (daysSinceChange <= 30) recentPw = 10;
    else if (daysSinceChange <= 90) recentPw = 7;
    else if (daysSinceChange <= 180) recentPw = 3;
  }

  const total = mfa + emailV + mobileV + pwStrength + devices + recovery + recentPw;

  return {
    total: Math.min(100, total),
    mfa, emailVerified: emailV, mobileVerified: mobileV,
    passwordStrength: pwStrength, trustedDevices: devices,
    recoverySetup: recovery, recentPasswordChange: recentPw,
  };
}

// ─── Security Level ──────────────────────────────────────────────────
export function getSecurityLevel(score: number): SecurityLevel {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 30) return 'poor';
  return 'critical';
}

export function getSecurityLevelColor(level: SecurityLevel): string {
  const colors: Record<SecurityLevel, string> = {
    critical: '#EF4444',
    poor: '#F97316',
    fair: '#F59E0B',
    good: '#10B981',
    excellent: '#059669',
  };
  return colors[level];
}

export function getSecurityLevelLabel(level: SecurityLevel): string {
  const labels: Record<SecurityLevel, string> = {
    critical: 'Critical',
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',
  };
  return labels[level];
}

// ─── Security Recommendations ────────────────────────────────────────
export function getSecurityRecommendations(user: User): SecurityRecommendation[] {
  const recs: SecurityRecommendation[] = [];

  if (!user.mfaEnabled) {
    recs.push({
      id: 'enable-mfa', title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security by enabling MFA on your account.',
      priority: 'high', completed: false, action: 'Enable MFA',
    });
  } else {
    recs.push({
      id: 'enable-mfa', title: 'Two-Factor Authentication',
      description: 'MFA is active on your account.',
      priority: 'high', completed: true,
    });
  }

  if (!user.emailVerified) {
    recs.push({
      id: 'verify-email', title: 'Verify Email Address',
      description: 'Verify your email to receive security alerts and recover your account.',
      priority: 'high', completed: false, action: 'Verify Email',
    });
  } else {
    recs.push({
      id: 'verify-email', title: 'Email Verified',
      description: 'Your email address has been verified.',
      priority: 'high', completed: true,
    });
  }

  if (!user.mobileVerified) {
    recs.push({
      id: 'verify-mobile', title: 'Verify Mobile Number',
      description: 'Verify your mobile number for OTP-based authentication.',
      priority: 'high', completed: false, action: 'Verify Mobile',
    });
  } else {
    recs.push({
      id: 'verify-mobile', title: 'Mobile Verified',
      description: 'Your mobile number has been verified.',
      priority: 'high', completed: true,
    });
  }

  const analysis = analyzePassword(user.password || '');
  if (analysis.score < 5) {
    recs.push({
      id: 'strong-password', title: 'Use a Stronger Password',
      description: 'Your current password could be stronger. Use a mix of letters, numbers, and symbols.',
      priority: 'medium', completed: false, action: 'Change Password',
    });
  } else {
    recs.push({
      id: 'strong-password', title: 'Strong Password',
      description: 'Your password meets security requirements.',
      priority: 'medium', completed: true,
    });
  }

  if (!user.recoveryEmail && !user.recoveryMobile) {
    recs.push({
      id: 'recovery-options', title: 'Set Up Recovery Options',
      description: 'Add a recovery email or phone number to regain access if you get locked out.',
      priority: 'medium', completed: false, action: 'Add Recovery',
    });
  }

  if (user.passwordChangedAt) {
    const daysSince = (Date.now() - new Date(user.passwordChangedAt).getTime()) / 86400000;
    if (daysSince > 90) {
      recs.push({
        id: 'password-age', title: 'Update Your Password',
        description: `Your password is ${Math.floor(daysSince)} days old. Regular updates improve security.`,
        priority: 'low', completed: false, action: 'Change Password',
      });
    }
  }

  const trusted = getTrustedDevices();
  if (trusted.length === 0) {
    recs.push({
      id: 'trusted-device', title: 'Add a Trusted Device',
      description: 'Mark your primary devices as trusted for faster, more secure login.',
      priority: 'low', completed: false,
    });
  }

  return recs;
}
