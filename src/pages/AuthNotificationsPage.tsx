import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Eye, EyeOff, Trash2, Calendar, Filter,
  CheckCircle, ShieldAlert, Key, LogIn, Clock, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import AuthNotificationItem from '../components/auth/AuthNotificationItem';
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  getNotificationStats,
  type AuthNotification,
  type NotificationType
} from '../lib/notificationManager';

export default function AuthNotificationsPage() {
  const [notifications, setNotifications] = useState<AuthNotification[]>(getNotifications());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  const stats = getNotificationStats();

  const handleMarkRead = (id: string) => {
    markRead(id);
    setNotifications(getNotifications());
  };

  const handleMarkAllRead = () => {
    markAllRead();
    setNotifications(getNotifications());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(id);
    setNotifications(getNotifications());
  };

  const filtered = notifications.filter((n) => {
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    const matchesRead =
      readFilter === 'all' ||
      (readFilter === 'unread' && !n.read) ||
      (readFilter === 'read' && n.read);
    return matchesType && matchesRead;
  });

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'login_success', label: 'Successful Logins' },
    { value: 'new_device', label: 'New Devices' },
    { value: 'failed_login', label: 'Failed Attempts' },
    { value: 'password_changed', label: 'Password Changes' },
    { value: 'security_alert', label: 'Security Alerts' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Authentication Audit Center</h1>
          <p className="text-sm text-gray-400">
            Audit history of secure workstation login and access events.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={stats.unread === 0}
          className="text-xs text-primary hover:text-primary/80 disabled:text-gray-600 disabled:no-underline font-medium hover:underline transition-all flex items-center gap-1.5 self-start sm:self-center"
        >
          <CheckCircle className="h-4 w-4" /> Mark All as Read
        </button>
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: stats.total, color: 'text-primary' },
          { label: 'Unread Events', value: stats.unread, color: 'text-amber-400' },
          { label: 'Critical Alerts', value: stats.critical, color: 'text-red-400' },
          { label: 'New Logs Today', value: stats.today, color: 'text-emerald-400' }
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Type filter */}
        <div className="flex-1 relative">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-9 h-9 rounded-md border border-border bg-card text-xs text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Read state filters */}
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setReadFilter(r)}
              className={`px-3 py-1.5 rounded text-xs font-semibold border capitalize transition-all ${
                readFilter === r
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-card border-border text-gray-400 hover:text-white'
              }`}
            >
              {r} ({notifications.filter((n) => r === 'all' || (r === 'unread' && !n.read) || (r === 'read' && n.read)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Activity logs</CardTitle>
          <CardDescription>Auditing security and access events logged for your user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {filtered.map((notif) => (
            <div key={notif.id} className="relative group">
              <AuthNotificationItem notification={notif} onMarkRead={handleMarkRead} />
              <button
                onClick={(e) => handleDelete(notif.id, e)}
                className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all"
                title="Delete event log"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center border border-dashed border-border/85 rounded-lg space-y-3 bg-card/10">
              <Bell className="h-10 w-10 text-gray-500 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">No Audit Alerts</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed mt-1">
                  Adjust your filter parameters. There are no security logs matching the current criteria.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
