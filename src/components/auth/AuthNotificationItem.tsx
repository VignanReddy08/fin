import {
  CheckCircle2, AlertTriangle, ShieldAlert, Info, LogIn,
  Smartphone, Mail, Key, UserPlus, Clock,
} from 'lucide-react';
import { formatTimeAgo } from '../../lib/sessionManager';
import type { AuthNotification, NotificationType } from '../../lib/notificationManager';

interface Props {
  notification: AuthNotification;
  onMarkRead?: (id: string) => void;
}

const ICON_MAP: Record<NotificationType, typeof CheckCircle2> = {
  login_success: LogIn,
  new_device: Smartphone,
  password_changed: Key,
  mobile_verified: Smartphone,
  email_verified: Mail,
  invitation_accepted: UserPlus,
  security_alert: ShieldAlert,
  failed_login: AlertTriangle,
  otp_verified: CheckCircle2,
  session_expired: Clock,
};

const SEVERITY_STYLES = {
  success: 'text-emerald-400 bg-emerald-500/10',
  info: 'text-blue-400 bg-blue-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  critical: 'text-red-400 bg-red-500/10',
};

export default function AuthNotificationItem({ notification: n, onMarkRead }: Props) {
  const Icon = ICON_MAP[n.type] || Info;
  const styles = SEVERITY_STYLES[n.severity];

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
        n.read
          ? 'border-border/30 bg-transparent hover:bg-card/30'
          : 'border-border bg-card/50 hover:bg-card/80'
      }`}
      onClick={() => onMarkRead?.(n.id)}
    >
      <div className={`h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center ${styles}`}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-medium truncate ${n.read ? 'text-gray-400' : 'text-white'}`}>
            {n.title}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
            <span className="text-[10px] text-gray-600 whitespace-nowrap">
              {formatTimeAgo(n.timestamp)}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
      </div>
    </div>
  );
}
