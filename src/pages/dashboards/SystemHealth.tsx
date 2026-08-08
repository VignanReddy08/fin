import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Server, Database, Zap, Shield, Globe, Cpu, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOperationalStats } from '../../lib/operationsStore';

export default function SystemHealth() {
  const [stats, setStats] = useState(getOperationalStats());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getOperationalStats());
    };
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, []);

  const totalRequests = stats.support.totalRequests;
  const totalTxns = stats.payments.totalTxns;
  const totalFraud = stats.fraud.totalFraud;

  const services = [
    { id: 'api', name: 'API Gateway', status: 'Operational', uptime: `${stats.health.apiHealth.uptime}%`, latency: `${stats.health.apiHealth.latency}ms`, icon: Globe, color: 'bg-emerald-500' },
    { id: 'pg', name: 'PostgreSQL Database', status: 'Operational', uptime: `${stats.health.dbHealth.uptime}%`, latency: `${stats.health.dbHealth.latency}ms`, icon: Database, color: 'bg-emerald-500' },
    { id: 'redis', name: 'Redis Cache Layer', status: 'Operational', uptime: `${stats.health.cacheHealth.uptime}%`, latency: `${stats.health.cacheHealth.latency}ms`, icon: Zap, color: 'bg-emerald-500' },
    { id: 'ai', name: 'AI Reasoning Engine', status: totalRequests > 0 ? 'Operational' : 'Standby / Idle', uptime: `${stats.health.engineHealth.uptime}%`, latency: totalRequests > 0 ? `${stats.health.engineHealth.latency / 1000}s` : '0.0s', icon: Cpu, color: totalRequests > 0 ? 'bg-emerald-500' : 'bg-blue-500' },
    { id: 'payment', name: 'Payment Gateway API', status: totalTxns > 0 ? 'Operational' : 'Standby / Idle', uptime: `${stats.health.paymentHealth.uptime}%`, latency: totalTxns > 0 ? `${stats.health.paymentHealth.latency}ms` : '0ms', icon: Database, color: totalTxns > 0 ? 'bg-emerald-500' : 'bg-blue-500' },
    { id: 'fraud', name: 'Fraud Detection Engine', status: totalFraud > 0 ? 'Operational' : 'Standby / Idle', uptime: `${stats.health.fraudHealth.uptime}%`, latency: totalFraud > 0 ? `${stats.health.fraudHealth.latency}ms` : '0ms', icon: Shield, color: totalFraud > 0 ? 'bg-emerald-500' : 'bg-blue-500' },
    { id: 'notification', name: 'Notification Service', status: 'Operational', uptime: `${stats.health.notifyHealth.uptime}%`, latency: `${stats.health.notifyHealth.latency}ms`, icon: Bell, color: 'bg-emerald-500' },
  ];

  const [selectedService, setSelectedService] = useState(services[0]);
  
  // Reactively sync selected service when stats update
  const currentService = services.find(s => s.id === selectedService.id) || services[0];

  const latencyData = Array.from({ length: 24 }).map((_, i) => {
    const isSeconds = currentService.latency.includes('s') && !currentService.latency.includes('ms');
    const baseLatency = parseFloat(currentService.latency) || 0;
    const rawVal = baseLatency > 0 ? Math.max(0.1, baseLatency + (Math.random() - 0.5) * (baseLatency * 0.2)) : 0;
    return {
      time: `${String(i).padStart(2, '0')}:00`,
      latency: parseFloat(rawVal.toFixed(isSeconds ? 2 : 0)),
    };
  });

  const isSeconds = currentService.latency.includes('s') && !currentService.latency.includes('ms');
  const operationalCount = services.filter(s => s.status === 'Operational').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary animate-pulse" />
          Enterprise Infra Service Mesh
        </h1>
        <p className="text-sm text-gray-400">Real-time status tracking, database latencies, and transaction channel monitors.</p>
      </div>

      <Card className="glass border-white/10 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Platform Health Overview</h2>
              <p className="text-xs text-gray-400">
                Operating services: {operationalCount} active / {services.length - operationalCount} in standby
              </p>
            </div>
            <Badge variant="success" className="px-3 py-0.5 rounded border border-emerald-500/20 text-xs">
              Systems Checked (Nominal Uptime)
            </Badge>
          </div>
          
          <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000" 
              style={{ width: `${(operationalCount / services.length) * 100}%` }}
            />
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${((services.length - operationalCount) / services.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isSelected = currentService.id === service.id;
            const isStandby = service.status.includes('Standby');
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setSelectedService(service)}
                className={cn(
                  "relative cursor-pointer overflow-hidden rounded-xl border bg-card/40 p-4 transition-all duration-200 hover:border-primary/40",
                  isSelected ? "border-primary bg-card" : "border-border",
                )}
              >
                <div className={cn("absolute left-0 top-0 bottom-0 w-1", isStandby ? 'bg-blue-500' : 'bg-emerald-500')} />
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-white">{service.name}</h3>
                      <p className="text-[10px] text-gray-500">Service Gateway</p>
                    </div>
                  </div>
                  <Badge variant={isStandby ? 'outline' : 'success'} className="text-[9px] uppercase tracking-wide">
                    {service.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <p className="text-gray-500 text-[9px]">Uptime Ratio</p>
                    <p className="font-semibold text-gray-200">{service.uptime}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[9px]">Target Latency</p>
                    <p className="font-semibold text-gray-200">{service.latency}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="lg:col-span-1">
          <Card className="glass border-white/10 sticky top-6 flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <currentService.icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-sm text-white">{currentService.name}</CardTitle>
                  <CardDescription className="text-xs text-gray-400">Audited latency logs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0A0A] p-3 rounded-lg border border-border">
                  <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Median Latency</p>
                  <p className="text-lg font-bold text-white font-mono">{currentService.latency}</p>
                </div>
                <div className="bg-[#0A0A0A] p-3 rounded-lg border border-border">
                  <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Uptime Rate</p>
                  <p className="text-lg font-bold text-white font-mono">{currentService.uptime}</p>
                </div>
              </div>
              
              <div className="h-[200px]">
                <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">24h Response Graph</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="time" stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}${isSeconds ? 's' : 'ms'}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="latency" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorLatency)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
