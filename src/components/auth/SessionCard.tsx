import { MapPin, Clock, LogOut, ShieldCheck, ShieldOff } from 'lucide-react';
import { DeviceTypeIcon } from './DeviceIcon';
import { formatTimeAgo, type Session } from '../../lib/sessionManager';

interface Props {
  session: Session;
  onTerminate?: (id: string) => void;
}

export default function SessionCard({ session, onTerminate }: Props) {
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    idle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    expired: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      session.isCurrent
        ? 'border-primary/30 bg-primary/5'
        : 'border-border bg-card/50 hover:bg-card/80'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            session.isCurrent ? 'bg-primary/10' : 'bg-gray-800'
          }`}>
            <DeviceTypeIcon device={session.device} className={`h-5 w-5 ${
              session.isCurrent ? 'text-primary' : 'text-gray-400'
            }`} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white">
                {session.browser} on {session.os}
              </span>
              {session.isCurrent && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium uppercase tracking-wider">
                  Current
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {session.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(session.loginTime)}
              </span>
              {session.ip && (
                <span className="font-mono">{session.ip}</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusColors[session.status]}`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
              {session.isTrusted ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500">
                  <ShieldCheck className="h-3 w-3" /> Trusted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                  <ShieldOff className="h-3 w-3" /> Untrusted
                </span>
              )}
              <span className="text-[10px] text-gray-600">{session.loginMethod}</span>
            </div>
          </div>
        </div>

        {/* Terminate button */}
        {!session.isCurrent && session.status !== 'expired' && onTerminate && (
          <button
            onClick={() => onTerminate(session.id)}
            className="p-2 rounded-lg text-gray-500 hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="End session"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
