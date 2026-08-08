import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { getOperationalStats } from '../../lib/operationsStore';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];
const tooltipStyle = { backgroundColor: '#171717', borderColor: '#333', color: '#fff' };

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(getOperationalStats());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getOperationalStats());
    };
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, []);

  const hasData = stats.support.totalRequests > 0;

  const lineData = hasData
    ? [
        { name: 'Initial', value: 0 },
        { name: 'Live Session', value: stats.support.aiResolutionRate }
      ]
    : [];

  const barData = hasData
    ? [
        { name: 'Resolved', volume: stats.support.aiResolved },
        { name: 'Escalated', volume: stats.support.humanReview }
      ]
    : [];

  const pieData = [
    { name: 'Support', value: stats.workforce.support.completed },
    { name: 'Payments', value: stats.workforce.payment.completed },
    { name: 'Fraud', value: stats.workforce.fraud.completed }
  ].filter(p => p.value > 0);

  const revenueProtected = stats.transactions
    .filter(t => t.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 flex flex-col gap-6 overflow-y-auto animate-in fade-in duration-500">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: "AI Resolution Rate", val: stats.support.aiResolutionRate, suffix: "%", color: "text-blue-500" },
          { title: "Human Escalation", val: stats.support.humanEscalationRate, suffix: "%", color: "text-amber-500" },
          { title: "Avg AI Latency", val: hasData ? 2.8 : 0.0, suffix: "s", color: "text-emerald-500" },
          { title: "Active AI Jobs", val: stats.workforce.support.active + stats.workforce.payment.active, suffix: "", color: "text-purple-500" },
          { title: "Revenue Processed", val: revenueProtected, prefix: "₹", color: "text-emerald-400" },
          { title: "Operational Savings", val: stats.cost.operationalSavings, prefix: "₹", color: "text-blue-400" },
        ].map((kpi, i) => (
          <Card key={i} className="bg-[#171717] border-[#333]">
            <CardContent className="p-4">
              <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">{kpi.title}</p>
              <div className={`text-xl font-bold font-mono ${kpi.color}`}>
                <AnimatedCounter value={kpi.val} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.val % 1 !== 0 ? 1 : 0} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasData ? (
        <>
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
            <Card className="bg-[#171717] border-[#333]">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">AI Resolution Rate Progression</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} dot={true} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-[#171717] border-[#333]">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">AI vs Human Workload Volume</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{fill: '#262626'}} />
                    <Bar dataKey="volume" fill="#10B981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px]">
            <Card className="bg-[#171717] border-[#333] lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Completed Task Categories</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} name={entry.name} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-gray-500 font-mono">No categories</span>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-[#171717] border-[#333] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Cumulative Cost Savings Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lineData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="value" stroke="#2563EB" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="border border-dashed border-border p-12 text-center text-gray-500">
          <p className="text-sm font-bold text-gray-400 mb-1">Analytics Sandbox Idle</p>
          <p className="text-xs text-gray-500">
            No live data patterns detected. Raise simulation requests to load line, bar, and area diagrams.
          </p>
        </Card>
      )}
    </div>
  );
}
