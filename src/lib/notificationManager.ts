// ─── Types ───────────────────────────────────────────────────────────
export type NotificationType =
  | 'login_success' | 'new_device' | 'password_changed'
  | 'mobile_verified' | 'email_verified' | 'invitation_accepted'
  | 'security_alert' | 'failed_login' | 'otp_verified' | 'session_expired';

export type Severity = 'info' | 'warning' | 'critical' | 'success';

export interface AuthNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: Severity;
}

// ─── Helpers ─────────────────────────────────────────────────────────
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const H = 3600000;
const D = 86400000;

// ─── Config ──────────────────────────────────────────────────────────
export const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { defaultTitle: string; severity: Severity }
> = {
  login_success:       { defaultTitle: 'Successful Login',     severity: 'success' },
  new_device:          { defaultTitle: 'New Device Login',     severity: 'warning' },
  password_changed:    { defaultTitle: 'Password Changed',     severity: 'info' },
  mobile_verified:     { defaultTitle: 'Mobile Verified',      severity: 'success' },
  email_verified:      { defaultTitle: 'Email Verified',       severity: 'success' },
  invitation_accepted: { defaultTitle: 'Invitation Accepted',  severity: 'success' },
  security_alert:      { defaultTitle: 'Security Alert',       severity: 'critical' },
  failed_login:        { defaultTitle: 'Failed Login Attempt', severity: 'warning' },
  otp_verified:        { defaultTitle: 'OTP Verified',         severity: 'success' },
  session_expired:     { defaultTitle: 'Session Expired',      severity: 'info' },
};

// ─── Mock Notifications ──────────────────────────────────────────────
const notifications: AuthNotification[] = [
  {
    id: 'notif-01', type: 'login_success', title: 'Successful Login',
    message: 'You signed in from Chrome on Windows 11 — Mumbai, Maharashtra',
    timestamp: ago(2 * H), read: false, severity: 'success',
  },
  {
    id: 'notif-02', type: 'otp_verified', title: 'OTP Verified',
    message: 'Two-factor authentication completed successfully',
    timestamp: ago(2 * H), read: false, severity: 'success',
  },
  {
    id: 'notif-03', type: 'failed_login', title: 'Failed Login Attempt',
    message: 'Incorrect password from Chrome on Android 15 — Hyderabad, Telangana',
    timestamp: ago(8 * H), read: false, severity: 'warning',
  },
  {
    id: 'notif-04', type: 'new_device', title: 'New Device Detected',
    message: 'First login from Firefox on iPadOS 19 — Pune, Maharashtra',
    timestamp: ago(3 * D), read: true, severity: 'warning',
  },
  {
    id: 'notif-05', type: 'security_alert', title: 'Suspicious Activity',
    message: 'Multiple failed login attempts detected from IP 103.44.12.89 — Chennai',
    timestamp: ago(4 * D), read: true, severity: 'critical',
  },
  {
    id: 'notif-06', type: 'password_changed', title: 'Password Updated',
    message: 'Your account password was changed successfully',
    timestamp: ago(5 * D), read: true, severity: 'info',
  },
  {
    id: 'notif-07', type: 'login_success', title: 'Successful Login',
    message: 'You signed in from Safari on iOS 19 — Mumbai, Maharashtra',
    timestamp: ago(1 * D), read: true, severity: 'success',
  },
  {
    id: 'notif-08', type: 'session_expired', title: 'Session Expired',
    message: 'Your session on Chrome (Android 15) has expired due to inactivity',
    timestamp: ago(2 * D), read: true, severity: 'info',
  },
  {
    id: 'notif-09', type: 'invitation_accepted', title: 'Invitation Accepted',
    message: 'Sneha Kulkarni has accepted the invitation and joined as AI Engineer',
    timestamp: ago(22 * D), read: true, severity: 'success',
  },
  {
    id: 'notif-10', type: 'mobile_verified', title: 'Mobile Verified',
    message: 'Your mobile number +91 9876543210 has been successfully verified',
    timestamp: ago(30 * D), read: true, severity: 'success',
  },
  {
    id: 'notif-11', type: 'email_verified', title: 'Email Verified',
    message: 'Your email address superadmin@agentic.fi has been verified',
    timestamp: ago(30 * D), read: true, severity: 'success',
  },
  {
    id: 'notif-12', type: 'failed_login', title: 'Failed Login Attempt',
    message: 'Incorrect password from Chrome on Windows 11 — Mumbai',
    timestamp: ago(1.5 * D), read: true, severity: 'warning',
  },
];

// ─── Queries ─────────────────────────────────────────────────────────
export function getNotifications(): AuthNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getUnreadCount(): number {
  return notifications.filter((n) => !n.read).length;
}

export function filterByType(type: NotificationType): AuthNotification[] {
  return getNotifications().filter((n) => n.type === type);
}

export function filterBySeverity(severity: Severity): AuthNotification[] {
  return getNotifications().filter((n) => n.severity === severity);
}

export function getRecentNotifications(limit: number = 5): AuthNotification[] {
  return getNotifications().slice(0, limit);
}

// ─── Mutations ───────────────────────────────────────────────────────
export function addNotification(
  type: NotificationType,
  message: string,
  title?: string
): AuthNotification {
  const config = NOTIFICATION_CONFIG[type];
  const notif: AuthNotification = {
    id: `notif-${Date.now()}`,
    type,
    title: title || config.defaultTitle,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    severity: config.severity,
  };
  notifications.unshift(notif);
  return notif;
}

export function markRead(id: string): void {
  const n = notifications.find((x) => x.id === id);
  if (n) n.read = true;
}

export function markAllRead(): void {
  notifications.forEach((n) => { n.read = true; });
}

export function deleteNotification(id: string): void {
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx !== -1) notifications.splice(idx, 1);
}

// ─── Stats ───────────────────────────────────────────────────────────
export function getNotificationStats() {
  return {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    critical: notifications.filter((n) => n.severity === 'critical').length,
    warnings: notifications.filter((n) => n.severity === 'warning').length,
    today: notifications.filter(
      (n) => Date.now() - new Date(n.timestamp).getTime() < 24 * 3600000
    ).length,
  };
}
