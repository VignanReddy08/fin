import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, KeyRound, Globe, Laptop, Smartphone, AlertTriangle, AlertCircle, LogOut, Key } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import SessionCard from '../components/auth/SessionCard';
import { getSessions, terminateSession, terminateAllOtherSessions, type Session } from '../lib/sessionManager';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(getSessions('sa-001'));
  const [filter, setFilter] = useState<'all' | 'active' | 'idle' | 'expired'>('all');
  const [successMsg, setSuccessMsg] = useState('');

  const currentSession = sessions.find((s) => s.isCurrent);

  const handleTerminate = (id: string) => {
    terminateSession(id);
    setSessions(getSessions('sa-001'));
    setSuccessMsg('Session terminated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleTerminateOthers = () => {
    if (currentSession) {
      const count = terminateAllOtherSessions(currentSession.id);
      setSessions(getSessions('sa-001'));
      setSuccessMsg(`Terminated ${count} other active session(s).`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const filtered = sessions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const activeCount = sessions.filter((s) => s.status === 'active').length;
  const idleCount = sessions.filter((s) => s.status === 'idle').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Active Sessions</h1>
          <p className="text-sm text-gray-400">
            Monitor and manage active workstations logged in with your credentials.
          </p>
        </div>
        <Button
          onClick={handleTerminateOthers}
          variant="destructive"
          className="flex items-center gap-2"
          disabled={sessions.filter((s) => !s.isCurrent && s.status !== 'expired').length === 0}
        >
          <LogOut className="h-4 w-4" />
          Sign Out All Other Devices
        </Button>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sessions', value: sessions.length, color: 'text-primary' },
          { label: 'Active Sessions', value: activeCount, color: 'text-emerald-400' },
          { label: 'Idle Sessions', value: idleCount, color: 'text-amber-400' }
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Options */}
      <div className="flex gap-2">
        {(['all', 'active', 'idle', 'expired'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border capitalize transition-all ${
              filter === f
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-card border-border text-gray-400 hover:text-white'
            }`}
          >
            {f} ({sessions.filter((s) => f === 'all' || s.status === f).length})
          </button>
        ))}
      </div>

      {/* Session Cards list */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active Connections</CardTitle>
          <CardDescription>
            Workstations currently logged into your FinMatrix session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {filtered.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onTerminate={handleTerminate}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-8 text-center border border-dashed border-border/80 rounded-lg space-y-3 bg-card/10">
              <Key className="h-10 w-10 text-gray-500 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">No Sessions Match Filter</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed mt-1">
                  Adjust your filter options above or try reloading. There are no active connections matching the selected status.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
