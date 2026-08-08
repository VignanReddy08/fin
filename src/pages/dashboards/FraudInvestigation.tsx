import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Shield, Globe, ShieldCheck, MapPin, Smartphone, User, Terminal, 
  Activity, AlertTriangle, Play, RotateCcw, Cpu, Bell, CheckCircle2, History,
  Info, BarChart, Server, Lock, Search, Heart, HelpCircle, DollarSign
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getOperationalStats, addFraudAlert, processApproval, resetStore } from '../../lib/operationsStore';

// SOC Pipeline stages
const socStages = [
  "Customer Activity", "Login Analysis", "Device Fingerprint", "Behavioral Scan", "Transaction Risk", 
  "Fraud Detection", "Policy RAG", "Compliance Check", "Decision Engine", "Human Approval", "Account Action", "Audit Log"
];

// Preset simulated scenarios
interface FraudScenario {
  id: string;
  name: string;
  category: string;
  details: string;
  score: number;
  ip: string;
  location: string;
  steps: {
    stageIdx: number;
    log: string;
    evidence: string;
  }[];
}

const FRAUD_SCENARIOS: FraudScenario[] = [
  {
    id: 'unauthorized_login',
    name: 'Suspicious Location Hop',
    category: 'Suspicious Login',
    details: 'Multiple connection attempts matching VPN exit nodes.',
    score: 92,
    ip: '103.44.12.89',
    location: 'St. Petersburg, Russia',
    steps: [
      { stageIdx: 1, log: "Login request intercepted. IP check mismatch.", evidence: "IP: 103.44.12.89 (Russian Federation)" },
      { stageIdx: 2, log: "Unrecognized device fingerprint detected.", evidence: "Device: iPhone 12 (No prior cookie matching)" },
      { stageIdx: 3, log: "High geo-velocity anomaly calculated (Mumbai to St. Petersburg in 2 mins).", evidence: "Velocity limit exceeded: 8900 km/h" },
      { stageIdx: 5, log: "Threat intelligence database matched IP against known spam nodes.", evidence: "SANS Threat Database Hit #4128" },
      { stageIdx: 6, log: "RAG retrieves access restriction policy chunks.", evidence: "Policy: GeoFence-SLA-v4 (Match: 99.4%)" },
      { stageIdx: 8, log: "Decision Engine auto-flags critical threat override code.", evidence: "Action: Freeze Account Session" },
      { stageIdx: 9, log: "Awaiting administrator validation to proceed with permanent block...", evidence: "Human review required" }
    ]
  },
  {
    id: 'account_takeover',
    name: 'Account Takeover Attempt',
    category: 'Identity Theft',
    details: 'Sudden credential resets followed by high-value wire payouts.',
    score: 96,
    ip: '198.51.100.12',
    location: 'Lagos, Nigeria',
    steps: [
      { stageIdx: 1, log: "Password changed twice via recovery code.", evidence: "MFA bypassed via lock override" },
      { stageIdx: 3, log: "Behavioral alert: abnormal click-through velocity.", evidence: "System navigation speed: 450% above baseline" },
      { stageIdx: 4, log: "Stripe payout request of ₹320,000 initiated immediately.", evidence: "Transaction value exceeds daily average by 800%" },
      { stageIdx: 5, log: "AML sanctions engine flags payout destination account.", evidence: "Sanctions list check: Match probability 82%" },
      { stageIdx: 6, log: "RAG lookup retrieves large transaction limits guidelines.", evidence: "Policy: Wire-Override-AML (Match: 98%)" },
      { stageIdx: 8, log: "Decision: Terminate active sessions and freeze payout transfer.", evidence: "Rule Code: AML-LIMITS-TRIGGER" },
      { stageIdx: 9, log: "Pausing transfer. Escalated to Manager human override queue.", evidence: "Immediate lock action pending" }
    ]
  }
];

export default function FraudInvestigation() {
  const [stats, setStats] = useState(getOperationalStats());
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<FraudScenario | null>(null);
  const [simIdx, setSimIdx] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPausedForApproval, setIsPausedForApproval] = useState(false);
  
  // Console log logs
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [typedSummary, setTypedSummary] = useState('');
  const [simMsg, setSimMsg] = useState('');
  
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const s = getOperationalStats();
      setStats(s);
      if (s.fraudAlerts.length > 0 && !selectedCaseId) {
        setSelectedCaseId(s.fraudAlerts[0].caseId);
      }
    };
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, [selectedCaseId]);

  // Simulation execution cycle
  const runSimulation = (sc: FraudScenario) => {
    if (isExecuting) return;
    setActiveScenario(sc);
    setSimIdx(0);
    setIsExecuting(true);
    setIsPausedForApproval(false);
    setConsoleLogs([]);
    setTypedSummary('');
    setSimMsg(`▶ Initializing dynamic SOC threat scanner for: ${sc.name}`);

    // Welcome log
    const timeStr = new Date().toLocaleTimeString();
    setConsoleLogs([`[${timeStr}] SOC Threat Scanner active. Auditing IP ${sc.ip}...`]);
  };

  useEffect(() => {
    if (!isExecuting || !activeScenario || simIdx === -1) return;

    const currentStep = activeScenario.steps[simIdx];
    const timeStr = new Date().toLocaleTimeString();

    // Check for Human-in-the-Loop pause condition
    if (currentStep.stageIdx === 9 && !isPausedForApproval) {
      setIsPausedForApproval(true);
      setConsoleLogs(prev => [...prev, `[${timeStr}] ⚠️ CRITICAL PAUSE: Action requires human manager override signature.`]);
      return;
    }

    timerRef.current = setTimeout(() => {
      // Log to console
      setConsoleLogs(prev => [
        ...prev,
        `[${timeStr}] [${socStages[currentStep.stageIdx]}] ${currentStep.log} (Evidence: ${currentStep.evidence})`
      ]);

      if (simIdx < activeScenario.steps.length - 1) {
        setSimIdx(prev => prev + 1);
      } else {
        // Simulation finished!
        setIsExecuting(false);
        setSimMsg('');
        
        // Push actual alert to centralized store to update metrics in real-time
        addFraudAlert(activeScenario.ip, activeScenario.location, activeScenario.score, activeScenario.details);
      }
    }, 1200);

    return () => clearTimeout(timerRef.current);
  }, [isExecuting, simIdx, activeScenario, isPausedForApproval]);

  // Approve override action
  const handleApproveAction = () => {
    setIsPausedForApproval(false);
    if (activeScenario && simIdx !== -1) {
      const timeStr = new Date().toLocaleTimeString();
      setConsoleLogs(prev => [...prev, `[${timeStr}] ✓ Manager override accepted. Continuing threat dispatch...`]);
      setSimIdx(prev => prev + 1);
    }
  };

  // Executive summary typist
  useEffect(() => {
    if (stats.fraud.totalFraud === 0) {
      setTypedSummary('');
      return;
    }
    const summaryText = `Today, the platform evaluated ${stats.fraud.totalFraud} security events. Threat mitigation resolved ${stats.fraud.totalFraud - stats.fraud.highRiskFraud} cases autonomously while ${stats.fraud.highRiskFraud} required human reviewer override audits. Overall risk average stabilized at ${stats.fraud.highRiskFraud > 0 ? 94 : 12}% with zero leakage detected.`;
    let charIdx = 0;
    setTypedSummary('');
    const timer = setInterval(() => {
      setTypedSummary(prev => prev + summaryText.charAt(charIdx));
      charIdx++;
      if (charIdx >= summaryText.length) {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [stats.fraud.totalFraud]);

  const hasData = stats.fraud.totalFraud > 0;
  const activeAlerts = stats.fraudAlerts;
  const selectedCase = activeAlerts.find(c => c.caseId === selectedCaseId) || activeAlerts[0];

  const barChartData = hasData
    ? [
        { name: 'Low Risk', count: stats.fraud.lowRiskFraud },
        { name: 'Medium Risk', count: stats.fraud.medRiskFraud },
        { name: 'High Risk', count: stats.fraud.highRiskFraud },
      ]
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">AI Security Operations Center (SOC)</h1>
          <p className="text-sm text-gray-400">Real-time threat mapping, automated risk verification, and human audit queues.</p>
        </div>

        {/* Demo Simulations */}
        <div className="flex gap-2 flex-wrap">
          {FRAUD_SCENARIOS.map((sc) => (
            <Button
              key={sc.id}
              onClick={() => runSimulation(sc)}
              disabled={isExecuting}
              size="sm"
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white text-xs h-8"
            >
              <Play className="h-3 w-3 mr-1.5" /> Simulate {sc.category}
            </Button>
          ))}
          <Button
            onClick={() => {
              resetStore();
              setActiveScenario(null);
              setSimIdx(-1);
              setIsExecuting(false);
              setIsPausedForApproval(false);
              setConsoleLogs([]);
              setTypedSummary('');
            }}
            variant="outline"
            size="sm"
            className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-xs h-8"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset State
          </Button>
        </div>
      </div>

      {/* Simulator Message Alert */}
      {simMsg && (
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-semibold animate-pulse">
          {simMsg}
        </div>
      )}

      {/* Zero State Onboarding Warning */}
      {!hasData && (
        <Card className="border-dashed border-red-500/30 bg-red-500/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                <ShieldAlert className="h-4.5 w-4.5 text-red-400 animate-pulse" />
                Newly Deployed Security Node (Standby)
              </h3>
              <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                The Security Operations Center is currently idle. Click any simulation button at the top (e.g. **Simulate Suspicious Login** or **Simulate Account Takeover**) to trigger automated threat scans and watch the SOC pipeline populate.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Executive Security Summary */}
      {hasData && typedSummary && (
        <Card className="border-red-500/20 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
          <CardHeader className="pb-1">
            <CardTitle className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              AI Security briefing Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] font-sans font-medium text-gray-200 leading-relaxed min-h-[40px]">
              {typedSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPIs Metrics row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Fraud Alerts', value: stats.fraud.totalFraud, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'High Risk cases', value: stats.fraud.highRiskFraud, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Uptime (SOC Node)', value: '99.97%', icon: Server, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Revenue Protected', value: `₹${(stats.payments.successfulTxns * 1250).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
        ].map((kpi) => (
          <Card key={kpi.label} className="hover:border-red-500/20 transition-colors">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                <div className={cn("p-1.5 rounded-md", kpi.bg, kpi.color)}>
                  <kpi.icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Fraud Pipeline Graph */}
      <Card className="glass border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Live Fraud Investigation Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex items-center justify-between overflow-x-auto gap-4 py-2 border border-border bg-card/10 rounded-xl px-4">
            {socStages.map((stage, i) => {
              const isActive = isExecuting && activeScenario && activeScenario.steps[simIdx]?.stageIdx === i;
              const isCompleted = isExecuting && activeScenario && activeScenario.steps[simIdx]?.stageIdx > i;
              return (
                <React.Fragment key={stage}>
                  <div className={cn(
                    "flex flex-col items-center gap-1 flex-shrink-0 text-center w-24",
                    isActive ? "text-red-500" : isCompleted ? "text-emerald-400" : "text-gray-600"
                  )}>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border",
                      isActive ? "border-red-500 bg-red-500/10 animate-pulse ring-2 ring-red-500/40" : 
                      isCompleted ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-border bg-card"
                    )}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <span className="text-[9px] font-semibold tracking-tight leading-none mt-1">{stage}</span>
                  </div>
                  {i < socStages.length - 1 && (
                    <div className={cn("flex-grow min-w-3 h-0.5", isCompleted ? "bg-emerald-500/65" : "bg-border")} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area: Alerts Queue & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Alerts Feed */}
          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                 <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Active Security Cases</CardTitle>
                 <CardDescription className="text-xs text-gray-500">Auditable trace list</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case ID</TableHead>
                      <TableHead>IP Coordinates</TableHead>
                      <TableHead>Geolocation</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeAlerts.map((c) => (
                      <TableRow 
                        key={c.caseId} 
                        onClick={() => setSelectedCaseId(c.caseId)}
                        className={`cursor-pointer hover:bg-red-500/5 ${selectedCase?.caseId === c.caseId ? 'bg-red-500/10' : ''}`}
                      >
                        <TableCell className="font-bold text-red-400 font-mono">{c.caseId}</TableCell>
                        <TableCell className="font-mono text-gray-300">{c.ip}</TableCell>
                        <TableCell>{c.location}</TableCell>
                        <TableCell className="font-bold text-white font-mono">{c.riskScore}%</TableCell>
                        <TableCell>
                          <Badge variant={c.status === 'High' ? 'destructive' : c.status === 'Medium' ? 'pending' : 'outline'}>
                            {c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {!hasData && (
                <div className="text-center py-10 text-xs text-gray-500 font-mono">
                  No active security alerts processed yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Threat categories chart */}
          <Card className="bg-[#171717] border-border">
            <CardHeader>
              <CardTitle className="text-white text-sm">Threat Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} cursor={{fill: '#262626'}} />
                    <Bar dataKey="count" fill="#EF4444" radius={[3, 3, 0, 0]} name="Cases" />
                  </ReBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-gray-500 font-mono">
                  No threat distribution metrics. Trigger login alerts to chart.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Area: Security Assessor, Agent Status, HIP Queue */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Human-in-the-Loop Override Challenge */}
          {isPausedForApproval && (
            <Card className="border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse">
              <CardHeader className="pb-3 border-b border-red-500/20 bg-red-500/10">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Override Active Request Block
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <p className="text-gray-300 font-sans">
                  AI security limits matched high-value payout wire coordinates. Immediate session lock override check required.
                </p>
                <Button 
                  onClick={handleApproveAction}
                  className="w-full h-8 text-xs bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Approve Wire Override
                </Button>
              </CardContent>
            </Card>
          )}

          {/* AI Security Assessor */}
          {hasData && selectedCase && (
            <Card className="bg-[#171717] border-border text-xs">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">AI Case Assessor: {selectedCase.caseId}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">Threat Coordinates</span>
                  <p className="font-semibold text-white">{selectedCase.location} (IP: {selectedCase.ip})</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">Risk Score Index</span>
                  <Badge variant="destructive" className="font-mono text-[11px] font-bold py-0.5">{selectedCase.riskScore}% Threat Risk</Badge>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Evidence Records</span>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-sans">{selectedCase.details}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Agent Terminal */}
          <Card className="glass border-white/10 flex flex-col h-[220px] overflow-hidden">
            <CardHeader className="pb-3 border-b border-border bg-card/40 shrink-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-red-500 animate-pulse" />
                SOC Console Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 bg-black p-3 font-mono text-[9px] text-emerald-500 overflow-y-auto space-y-1 min-h-[120px]">
              {consoleLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">{log}</div>
              ))}
              {consoleLogs.length === 0 && (
                <div className="text-gray-500">Standby. Awaiting alerts...</div>
              )}
              <div className="animate-pulse inline">_</div>
            </CardContent>
          </Card>

          {/* AI Security Agent monitor */}
          <Card className="bg-[#171717] border-border text-xs">
            <CardHeader className="pb-3 border-b border-border bg-card/20">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">AI Security Agent Monitor</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-2 font-mono text-[10px]">
              {[
                { name: 'Login Risk Agent', status: hasData ? 'Nominal' : 'Idle', latency: '0.4s' },
                { name: 'Device Intel Agent', status: hasData ? 'Nominal' : 'Idle', latency: '0.6s' },
                { name: 'AML Monitor', status: hasData ? 'Active' : 'Idle', latency: '1.4s' },
                { name: 'Policy Agent', status: hasData ? 'Nominal' : 'Idle', latency: '0.8s' }
              ].map((agent) => (
                <div key={agent.name} className="p-2 bg-black/40 rounded border border-border/20">
                  <span className="text-gray-500 block">{agent.name}</span>
                  <span className={cn("font-bold text-[11px]", agent.status === 'Idle' ? 'text-blue-400' : 'text-red-400')}>{agent.status}</span>
                  <span className="text-gray-600 block text-[9px]">L: {agent.latency}</span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
