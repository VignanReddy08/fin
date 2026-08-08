import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldAlert, Bot, CheckCircle2, AlertCircle, Clock, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationType = 'fraud' | 'ai' | 'success' | 'approval' | 'info';
type Severity = 'Critical' | 'Warning' | 'Info';

interface Notification {
  id: string;
  title: string;
  description?: string;
  time: string;
  type: NotificationType;
  severity: Severity;
  unread: boolean;
  group: 'Today' | 'Yesterday';
}

const NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Fraud Alert: Suspicious login from new device', time: '2 min ago', type: 'fraud', severity: 'Critical', unread: true, group: 'Today' },
  { id: '2', title: 'AI resolved ticket #TKT-8930 autonomously', time: '15 min ago', type: 'ai', severity: 'Info', unread: true, group: 'Today' },
  { id: '3', title: 'Wire transfer $55K awaiting approval', time: '30 min ago', type: 'approval', severity: 'Warning', unread: true, group: 'Today' },
  { id: '4', title: 'Payment gateway Stripe: latency spike detected', time: '1 hr ago', type: 'fraud', severity: 'Warning', unread: false, group: 'Today' },
  { id: '5', title: 'SLA breach warning: 3 tickets approaching deadline', time: '2 hrs ago', type: 'fraud', severity: 'Critical', unread: false, group: 'Today' },
  { id: '6', title: 'Compliance audit completed for Q2', time: '3 hrs ago', type: 'success', severity: 'Info', unread: false, group: 'Today' },
  { id: '7', title: 'New customer onboarding: Acme Corp', time: 'Yesterday', type: 'info', severity: 'Info', unread: false, group: 'Yesterday' },
  { id: '8', title: 'AI model retrained: Fraud v4.2 deployed', time: 'Yesterday', type: 'ai', severity: 'Info', unread: false, group: 'Yesterday' },
];

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [filter, setFilter] = useState<'All' | 'Alerts' | 'AI Actions' | 'System'>('All');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Alerts') return n.severity === 'Critical' || n.severity === 'Warning';
    if (filter === 'AI Actions') return n.type === 'ai';
    if (filter === 'System') return n.type === 'success' || n.type === 'info';
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'fraud': return <ShieldAlert className="text-destructive" size={16} />;
      case 'ai': return <Bot className="text-primary" size={16} />;
      case 'success': return <CheckCircle2 className="text-success" size={16} />;
      case 'approval': return <Clock className="text-pending" size={16} />;
      default: return <AlertCircle className="text-muted-foreground" size={16} />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'fraud': return 'bg-destructive/10 border-destructive/20';
      case 'ai': return 'bg-primary/10 border-primary/20';
      case 'success': return 'bg-success/10 border-success/20';
      case 'approval': return 'bg-pending/10 border-pending/20';
      default: return 'bg-muted border-border';
    }
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'Critical': return <Badge variant="destructive" className="text-[9px] px-1 h-4">Critical</Badge>;
      case 'Warning': return <Badge variant="outline" className="text-[9px] px-1 h-4 border-pending text-pending bg-pending/10">Warning</Badge>;
      case 'Info': return null;
    }
  };

  const groupedNotifications = filteredNotifications.reduce((acc, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[calc(100%+0.5rem)] right-0 w-96 z-50 origin-top-right"
        >
          <Card className="shadow-2xl border-white/10 bg-card/95 backdrop-blur-xl overflow-hidden rounded-xl">
            <CardHeader className="p-4 pb-0 border-b border-border/50">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Notifications
                  <Badge className="bg-primary text-white text-xs h-5 px-1.5">{notifications.filter(n => n.unread).length}</Badge>
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleMarkAllRead} title="Mark all read">
                    <Check size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onClose}>
                    <X size={14} />
                  </Button>
                </div>
              </div>
              <div className="flex gap-1 pb-3 overflow-x-auto scrollbar-hide">
                {['All', 'Alerts', 'AI Actions', 'System'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors",
                      filter === f 
                        ? "bg-foreground text-background font-medium" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Bell size={24} className="text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No notifications found</p>
                  <p className="text-xs text-muted-foreground mt-1">You're all caught up with your {filter.toLowerCase()} notifications.</p>
                </div>
              ) : (
                <div className="py-2">
                  {Object.entries(groupedNotifications).map(([group, items]) => (
                    <div key={group}>
                      <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-black/20 sticky top-0 z-10 backdrop-blur-sm">
                        {group}
                      </div>
                      {items.map(notification => (
                        <div 
                          key={notification.id}
                          className={cn(
                            "px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors flex gap-3 cursor-pointer relative group",
                            notification.unread ? "bg-primary/5" : ""
                          )}
                        >
                          {notification.unread && (
                            <span className="absolute left-1.5 top-5 h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                          <div className={cn("mt-0.5 h-8 w-8 rounded-full border flex items-center justify-center shrink-0", getIconBg(notification.type))}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <p className={cn("text-sm text-foreground", notification.unread ? "font-medium" : "font-normal")}>
                                {notification.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                              {getSeverityBadge(notification.severity)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <div className="p-2 border-t border-border bg-muted/20 text-center">
              <Button variant="link" className="text-xs text-muted-foreground hover:text-foreground h-auto p-0">
                View all notifications
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
