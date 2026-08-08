import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, ShieldCheck, Download, Search, Filter, RefreshCw,
  Clock, MapPin, Eye, FileSpreadsheet, ArrowLeft, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

interface AuditLog {
  id: string;
  user: string;
  email: string;
  action: 'LOGIN' | 'MFA_VERIFY' | 'LOGOUT' | 'INVITE_SENT' | 'LOCKOUT' | 'PW_RESET';
  timestamp: string;
  status: 'success' | 'failed' | 'blocked';
  ip: string;
  location: string;
  device: string;
  browser: string;
}

const AUDIT_LOGS: AuditLog[] = [
  { id: 'aud-01', user: 'Super Administrator', email: 'superadmin@agentic.fi', action: 'LOGIN', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), status: 'success', ip: '192.168.1.105', location: 'Mumbai, MH', device: 'Desktop', browser: 'Chrome 126' },
  { id: 'aud-02', user: 'Super Administrator', email: 'superadmin@agentic.fi', action: 'MFA_VERIFY', timestamp: new Date(Date.now() - 29 * 60000).toISOString(), status: 'success', ip: '192.168.1.105', location: 'Mumbai, MH', device: 'Desktop', browser: 'Chrome 126' },
  { id: 'aud-03', user: 'Rahul Mehta', email: 'rahul.mehta@agentic.fi', action: 'LOGIN', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'failed', ip: '49.36.122.45', location: 'Hyderabad, TS', device: 'Mobile', browser: 'Chrome 126' },
  { id: 'aud-04', user: 'Anita Desai', email: 'anita.desai@agentic.fi', action: 'LOCKOUT', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), status: 'blocked', ip: '103.44.12.89', location: 'Chennai, TN', device: 'Desktop', browser: 'Chrome 126' },
  { id: 'aud-05', user: 'Super Administrator', email: 'superadmin@agentic.fi', action: 'INVITE_SENT', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), status: 'success', ip: '192.168.1.105', location: 'Mumbai, MH', device: 'Desktop', browser: 'Chrome 126' },
  { id: 'aud-06', user: 'Priya Sharma', email: 'priya.sharma@agentic.fi', action: 'PW_RESET', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'success', ip: '192.168.1.200', location: 'Delhi, NCR', device: 'Desktop', browser: 'Edge 126' },
  { id: 'aud-07', user: 'Karan Singh', email: 'karan.singh@agentic.fi', action: 'LOGIN', timestamp: new Date(Date.now() - 1.5 * 86400000).toISOString(), status: 'success', ip: '10.10.5.33', location: 'Bangalore, KA', device: 'Desktop', browser: 'Chrome 126' },
  { id: 'aud-08', user: 'Anita Desai', email: 'anita.desai@agentic.fi', action: 'LOGOUT', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'success', ip: '172.16.0.88', location: 'Pune, MH', device: 'Tablet', browser: 'Firefox 128' },
];

export default function AuthAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>(AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = 'ID,User,Email,Action,Timestamp,Status,IP,Location,Device,Browser\n';
      const rows = logs.map(
        (l) => `${l.id},${l.user},${l.email},${l.action},${l.timestamp},${l.status},${l.ip},${l.location},${l.device},${l.browser}`
      ).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agenticfi-auth-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1500);
  };

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesAction && matchesStatus;
  });

  const actionLabels: Record<string, string> = {
    LOGIN: 'Login Attempt',
    MFA_VERIFY: 'MFA Verified',
    LOGOUT: 'User Sign Out',
    INVITE_SENT: 'Invitation Sent',
    LOCKOUT: 'Account Lockout',
    PW_RESET: 'Password Reset',
  };

  const statusBadges = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Administrative Auth Audit</h1>
          <p className="text-sm text-gray-400">
            Real-time audit log of access events, password updates, and lockouts.
          </p>
        </div>
        <Button onClick={handleExport} disabled={exporting} className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          {exporting ? 'Exporting CSV…' : 'Export Audit CSV'}
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Audit Records', value: logs.length, color: 'text-primary' },
          { label: 'Successful Events', value: logs.filter((l) => l.status === 'success').length, color: 'text-emerald-400' },
          { label: 'Blocked Attacks', value: logs.filter((l) => l.status === 'blocked').length, color: 'text-red-400' },
          { label: 'Failed Credentials', value: logs.filter((l) => l.status === 'failed').length, color: 'text-amber-400' }
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by user or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-3 text-xs text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Access Actions</option>
          <option value="LOGIN">Login Attempts</option>
          <option value="MFA_VERIFY">MFA verifications</option>
          <option value="INVITE_SENT">Invitations Sent</option>
          <option value="LOCKOUT">Account Lockouts</option>
          <option value="PW_RESET">Password Resets</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-3 text-xs text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Outcome Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Table Card */}
      <Card className="glass border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-gray-400 font-medium">
                  <th className="py-3.5 px-4">Event Time</th>
                  <th className="py-3.5 px-4 font-sans">Identity</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Location &amp; IP</th>
                  <th className="py-3.5 px-4 font-sans">Status</th>
                  <th className="py-3.5 px-4 text-right">Device/Browser</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-card/40 transition-colors">
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block">{log.user}</span>
                      <span className="text-[10px] text-gray-500 block">{log.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-300">
                      {actionLabels[log.action]}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="block text-gray-300">{log.location}</span>
                      <span className="block text-[10px] text-gray-500 font-mono">{log.ip}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded border uppercase text-[9px] font-bold ${statusBadges[log.status]}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-400">
                      <span className="block">{log.device}</span>
                      <span className="block text-[10px] text-gray-500">{log.browser}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No matching audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
