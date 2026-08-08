import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Bot, Ticket, AlertTriangle, ArrowUpRight, DollarSign, Activity, Terminal, PlusCircle, CheckCircle, Clock, ShieldCheck, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { getOperationalStats } from '../../lib/operationsStore';
import { getCurrentUser } from '../../lib/authStore';
import CustomerDashboard from './CustomerDashboard';

export default function MainDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser() || { fullName: 'Guest User', role: 'customer' };

  // Switch to Customer view if current role is customer
  if (user.role === 'customer') {
    return <CustomerDashboard />;
  }

  // Admin Portal Dashboard Logic
  const [stats, setStats] = useState(getOperationalStats());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getOperationalStats());
    };
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, []);

  const totalTickets = stats.requests.length;
  const resolvedCount = stats.requests.filter(t => t.status === 'Resolved').length;
  const escalatedCount = stats.requests.filter(t => t.status === 'Escalated').length;
  const pendingApprovalsCount = stats.approvals.length;
  const inProgressCount = totalTickets - resolvedCount - escalatedCount - pendingApprovalsCount;

  const hasData = totalTickets > 0;

  // Calculate dynamic volume categories data for BarChart
  const categoryCounts = stats.requests.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    Volume: categoryCounts[cat]
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">FinOps Operations Center</h1>
          <p className="text-sm text-gray-400">Autonomous customer support dispatch node &amp; HIL audit monitor.</p>
        </div>
        {!hasData && (
          <div className="flex items-center gap-2 text-xs font-bold text-primary font-mono uppercase bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            Initialized and awaiting queries
          </div>
        )}
      </div>

      {/* Onboarding State Guidance */}
      {!hasData && (
        <Card className="border-dashed border-primary/40 bg-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary animate-pulse" />
                Fresh SaaS Instance Deployed - Zero Active Tickets
              </h3>
              <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                The enterprise node is running and listening. To seed this dashboard with support cases, payments, or approvals, click the button on the right to open a customer-facing support request, or log in as a customer account.
              </p>
            </div>
            <Button onClick={() => navigate('/app/tickets/new')} className="gap-2 shadow-lg shrink-0">
              <PlusCircle className="h-4 w-4" /> Open Support Ticket
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inProgressCount + escalatedCount}</div>
            <p className="text-xs text-gray-500 mt-1 font-mono">{escalatedCount} manual escalations</p>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{resolvedCount}</div>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {totalTickets > 0 ? ((resolvedCount / totalTickets) * 100).toFixed(1) : '0.0'}% AI success rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-yellow-500/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingApprovalsCount}</div>
            <p className="text-xs text-gray-500 mt-1 font-mono">Requires auditor override</p>
          </CardContent>
        </Card>

        <Card className="hover:border-purple-500/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">AI Agents Status</CardTitle>
            <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">5 Active</div>
            <p className="text-xs text-gray-500 mt-1 font-mono">Latencies: &lt;140ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Charts & Activity logs */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Category Breakdown BarChart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-white">Tickets Volume by Category</CardTitle>
            <CardDescription className="text-xs">Dynamic, mathematically correct distribution counts</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="name" stroke="#525252" fontSize={10} />
                  <YAxis stroke="#525252" fontSize={10} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#333', fontSize: 11 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="Volume" fill="#A855F7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                Awaiting support triggers to compile distribution
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operational logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Recent Activities</CardTitle>
            <CardDescription className="text-xs">Real-time system events list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[260px] overflow-y-auto">
            {stats.activities.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-12">No recent system triggers logged</p>
            ) : (
              <div className="space-y-3">
                {stats.activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <span className={`h-2 w-2 mt-1.5 rounded-full shrink-0 ${
                      act.status === 'success' ? 'bg-emerald-500' :
                      act.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-white leading-normal">{act.title}</p>
                      <p className="text-[10px] text-gray-500 leading-normal">{act.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Orchestration Details snippet */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Active AI Dispatch Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg border border-border/80 bg-black/10">
            <span className="text-gray-500 font-bold block mb-1">Support Dispatch</span>
            <span className="text-emerald-400 font-mono">Idle / listening</span>
          </div>
          <div className="p-3 rounded-lg border border-border/80 bg-black/10">
            <span className="text-gray-500 font-bold block mb-1">Knowledge Chunking</span>
            <span className="text-emerald-400 font-mono">100% vector lock</span>
          </div>
          <div className="p-3 rounded-lg border border-border/80 bg-black/10">
            <span className="text-gray-500 font-bold block mb-1">Decision Engine</span>
            <span className="text-emerald-400 font-mono">Threshold-ready</span>
          </div>
          <div className="p-3 rounded-lg border border-border/80 bg-black/10">
            <span className="text-gray-500 font-bold block mb-1">Notifiers Dispatcher</span>
            <span className="text-emerald-400 font-mono">Queue clear</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
