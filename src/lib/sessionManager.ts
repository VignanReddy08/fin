// ─── Interfaces ──────────────────────────────────────────────────────
export interface Session {
  id: string;
  userId: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  loginTime: string;
  lastActive: string;
  status: 'active' | 'idle' | 'expired';
  isTrusted: boolean;
  isCurrent: boolean;
  loginMethod: string;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  method: string;
  status: 'success' | 'failed' | 'blocked';
}

export interface TrustedDevice {
  id: string;
  name: string;
  browser: string;
  os: string;
  trustedAt: string;
  lastUsed: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const H = 3600000;
const D = 86400000;

// ─── Mock Sessions ───────────────────────────────────────────────────
const sessions: Session[] = [
  {
    id: 'sess-001', userId: 'sa-001', device: 'Desktop', browser: 'Chrome 126',
    os: 'Windows 11', ip: '192.168.1.105', location: 'Mumbai, Maharashtra',
    loginTime: ago(2 * H), lastActive: ago(3 * 60000), status: 'active',
    isTrusted: true, isCurrent: true, loginMethod: 'Password + MFA',
  },
  {
    id: 'sess-002', userId: 'sa-001', device: 'Mobile', browser: 'Safari 18',
    os: 'iOS 19', ip: '10.0.0.42', location: 'Mumbai, Maharashtra',
    loginTime: ago(1 * D), lastActive: ago(3 * H), status: 'active',
    isTrusted: true, isCurrent: false, loginMethod: 'Password + MFA',
  },
  {
    id: 'sess-003', userId: 'sa-001', device: 'Tablet', browser: 'Firefox 128',
    os: 'iPadOS 19', ip: '172.16.0.88', location: 'Pune, Maharashtra',
    loginTime: ago(3 * D), lastActive: ago(2 * D), status: 'idle',
    isTrusted: false, isCurrent: false, loginMethod: 'Password',
  },
  {
    id: 'sess-004', userId: 'emp-001', device: 'Desktop', browser: 'Edge 126',
    os: 'Windows 11', ip: '192.168.1.200', location: 'Delhi, NCR',
    loginTime: ago(6 * H), lastActive: ago(30 * 60000), status: 'active',
    isTrusted: true, isCurrent: false, loginMethod: 'Password + MFA',
  },
  {
    id: 'sess-005', userId: 'emp-002', device: 'Desktop', browser: 'Chrome 126',
    os: 'macOS Sequoia', ip: '10.10.5.33', location: 'Bangalore, Karnataka',
    loginTime: ago(12 * H), lastActive: ago(8 * H), status: 'idle',
    isTrusted: false, isCurrent: false, loginMethod: 'Google OAuth',
  },
  {
    id: 'sess-006', userId: 'cust-001', device: 'Mobile', browser: 'Chrome 126',
    os: 'Android 15', ip: '49.36.122.45', location: 'Hyderabad, Telangana',
    loginTime: ago(2 * D), lastActive: ago(2 * D), status: 'expired',
    isTrusted: false, isCurrent: false, loginMethod: 'Password',
  },
];

// ─── Mock Login History ──────────────────────────────────────────────
const loginHistory: LoginHistoryEntry[] = [
  { id: 'lh-01', timestamp: ago(2 * H), device: 'Desktop', browser: 'Chrome 126', os: 'Windows 11', ip: '192.168.1.105', location: 'Mumbai, Maharashtra', method: 'Password + MFA', status: 'success' },
  { id: 'lh-02', timestamp: ago(6 * H), device: 'Desktop', browser: 'Edge 126', os: 'Windows 11', ip: '192.168.1.200', location: 'Delhi, NCR', method: 'Password + MFA', status: 'success' },
  { id: 'lh-03', timestamp: ago(8 * H), device: 'Mobile', browser: 'Chrome 126', os: 'Android 15', ip: '49.36.122.45', location: 'Hyderabad, Telangana', method: 'Password', status: 'failed' },
  { id: 'lh-04', timestamp: ago(12 * H), device: 'Desktop', browser: 'Chrome 126', os: 'macOS Sequoia', ip: '10.10.5.33', location: 'Bangalore, Karnataka', method: 'Google OAuth', status: 'success' },
  { id: 'lh-05', timestamp: ago(1 * D), device: 'Mobile', browser: 'Safari 18', os: 'iOS 19', ip: '10.0.0.42', location: 'Mumbai, Maharashtra', method: 'Password + MFA', status: 'success' },
  { id: 'lh-06', timestamp: ago(1.5 * D), device: 'Desktop', browser: 'Chrome 126', os: 'Windows 11', ip: '192.168.1.105', location: 'Mumbai, Maharashtra', method: 'Password', status: 'failed' },
  { id: 'lh-07', timestamp: ago(1.5 * D), device: 'Desktop', browser: 'Chrome 126', os: 'Windows 11', ip: '192.168.1.105', location: 'Mumbai, Maharashtra', method: 'Password', status: 'failed' },
  { id: 'lh-08', timestamp: ago(2 * D), device: 'Mobile', browser: 'Chrome 126', os: 'Android 15', ip: '49.36.122.45', location: 'Hyderabad, Telangana', method: 'Password', status: 'success' },
  { id: 'lh-09', timestamp: ago(3 * D), device: 'Tablet', browser: 'Firefox 128', os: 'iPadOS 19', ip: '172.16.0.88', location: 'Pune, Maharashtra', method: 'Password', status: 'success' },
  { id: 'lh-10', timestamp: ago(4 * D), device: 'Desktop', browser: 'Chrome 126', os: 'Ubuntu 24.04', ip: '103.44.12.89', location: 'Chennai, Tamil Nadu', method: 'Password', status: 'blocked' },
  { id: 'lh-11', timestamp: ago(5 * D), device: 'Desktop', browser: 'Chrome 126', os: 'Windows 11', ip: '192.168.1.105', location: 'Mumbai, Maharashtra', method: 'Password + MFA', status: 'success' },
  { id: 'lh-12', timestamp: ago(7 * D), device: 'Mobile', browser: 'Safari 18', os: 'iOS 19', ip: '10.0.0.42', location: 'Mumbai, Maharashtra', method: 'Password + MFA', status: 'success' },
];

// ─── Mock Trusted Devices ────────────────────────────────────────────
const trustedDevices: TrustedDevice[] = [
  { id: 'td-001', name: 'Work Laptop — Chrome', browser: 'Chrome 126', os: 'Windows 11', trustedAt: ago(30 * D), lastUsed: ago(2 * H) },
  { id: 'td-002', name: 'iPhone — Safari', browser: 'Safari 18', os: 'iOS 19', trustedAt: ago(14 * D), lastUsed: ago(1 * D) },
  { id: 'td-003', name: 'Office Desktop — Edge', browser: 'Edge 126', os: 'Windows 11', trustedAt: ago(45 * D), lastUsed: ago(6 * H) },
];

// ─── Session Management ──────────────────────────────────────────────
export function getSessions(userId?: string): Session[] {
  if (userId) return sessions.filter((s) => s.userId === userId);
  return [...sessions];
}

export function getActiveSessions(userId?: string): Session[] {
  return getSessions(userId).filter((s) => s.status !== 'expired');
}

export function terminateSession(sessionId: string): boolean {
  const sess = sessions.find((s) => s.id === sessionId);
  if (sess && !sess.isCurrent) {
    sess.status = 'expired';
    return true;
  }
  return false;
}

export function terminateAllOtherSessions(currentSessionId: string): number {
  let count = 0;
  sessions.forEach((s) => {
    if (s.id !== currentSessionId && s.status !== 'expired') {
      s.status = 'expired';
      count++;
    }
  });
  return count;
}

// ─── Login History ───────────────────────────────────────────────────
export function getLoginHistory(limit?: number): LoginHistoryEntry[] {
  const sorted = [...loginHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

export function addLoginHistoryEntry(entry: Omit<LoginHistoryEntry, 'id'>): void {
  loginHistory.unshift({ id: `lh-${Date.now()}`, ...entry });
}

export function getLoginStats() {
  const last24h = loginHistory.filter(
    (e) => Date.now() - new Date(e.timestamp).getTime() < 24 * H
  );
  return {
    total: loginHistory.length,
    successful: loginHistory.filter((e) => e.status === 'success').length,
    failed: loginHistory.filter((e) => e.status === 'failed').length,
    blocked: loginHistory.filter((e) => e.status === 'blocked').length,
    last24h: last24h.length,
    last24hFailed: last24h.filter((e) => e.status === 'failed').length,
  };
}

// ─── Trusted Devices ─────────────────────────────────────────────────
export function getTrustedDevices(): TrustedDevice[] {
  return [...trustedDevices];
}

export function markDeviceTrusted(device: Omit<TrustedDevice, 'id' | 'trustedAt' | 'lastUsed'>): void {
  trustedDevices.push({
    id: `td-${Date.now()}`,
    ...device,
    trustedAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  });
}

export function removeTrustedDevice(deviceId: string): boolean {
  const idx = trustedDevices.findIndex((d) => d.id === deviceId);
  if (idx !== -1) {
    trustedDevices.splice(idx, 1);
    return true;
  }
  return false;
}

export function isDeviceTrusted(browser: string, os: string): boolean {
  return trustedDevices.some((d) => d.browser === browser && d.os === os);
}

// ─── Utility: Time formatting ────────────────────────────────────────
export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
