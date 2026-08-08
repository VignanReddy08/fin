import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  CreditCard, AlertCircle, ArrowDownRight, RefreshCcw, Search, CheckCircle2, 
  Bot, Clock, HelpCircle, ShieldAlert, Cpu, Terminal, DollarSign, Activity, Play, FileText 
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  getOperationalStats, 
  addTransaction, 
  addRefund, 
  addFraudAlert, 
  addCustomerRequest,
  processApproval 
} from '../../lib/operationsStore';

const tooltipStyle = { backgroundColor: '#171717', borderColor: '#333', color: '#fff' };

// Processing Pipeline stages
const pipelineStages = [
  "Payment Request", "Validation Agent", "Verification Agent", "Gateway Agent", "Bank Analysis", "Fraud Detection", 
  "Policy Agent (RAG)", "Decision Engine", "Approval Layer", "Execution Agent", "Notification", "Analytics Sync"
];

export default function PaymentsDashboard() {
  const [stats, setStats] = useState(getOperationalStats());
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pipeline animations state
  const [pipelineActiveIdx, setPipelineActiveIdx] = useState(-1);
  const [successMsg, setSuccessMsg] = useState('');
  const [typedSummary, setTypedSummary] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      const s = getOperationalStats();
      setStats(s);
      if (s.transactions.length > 0 && !selectedTxnId) {
        setSelectedTxnId(s.transactions[0].id);
      }
    };
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, [selectedTxnId]);

  // Simulate pipeline data flows when a transaction occurs
  useEffect(() => {
    if (stats.transactions.length > 0 && pipelineActiveIdx === -1) {
      setPipelineActiveIdx(0);
    }
  }, [stats.transactions.length]);

  useEffect(() => {
    if (pipelineActiveIdx !== -1 && pipelineActiveIdx < pipelineStages.length) {
      const timer = setTimeout(() => {
        setPipelineActiveIdx(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (pipelineActiveIdx >= pipelineStages.length) {
      setPipelineActiveIdx(-1);
    }
  }, [pipelineActiveIdx]);

  // AI Executive summary typist
  useEffect(() => {
    if (stats.transactions.length === 0) {
      setTypedSummary('');
      return;
    }
    const summaryText = `Today, the platform processed ${stats.payments.totalTxns} payment operations. Successful transactions reached ${stats.payments.successfulTxns} units with ₹${stats.cost.manualProcessingCost.toLocaleString()} total revenue processed. AI automatically resolved disputes with ${stats.support.aiResolutionRate}% accuracy, saving ₹${stats.cost.operationalSavings.toLocaleString()} in operational costs. All gateways remain nominal.`;
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
  }, [stats.payments.totalTxns]);

  const hasData = stats.transactions.length > 0;
  const currentTxn = stats.transactions.find(t => t.id === selectedTxnId) || stats.transactions[0];
  const successRate = hasData ? ((stats.payments.successfulTxns / stats.payments.totalTxns) * 100).toFixed(1) : '0.0';

  // Manual handlers to seed events right from this view
  const triggerSuccessPayment = () => {
    const txn = addTransaction('Deepak Kumar', 45000, 'Stripe', 'Success', 'Low');
    setSelectedTxnId(txn.id);
    setSuccessMsg('Simulated successful checkout of ₹45,000 via Stripe.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const triggerFailedPayment = () => {
    const txn = addTransaction('Shreya Rao', 12500, 'Razorpay', 'Failed', 'Medium');
    setSelectedTxnId(txn.id);
    setSuccessMsg('Simulated payment failure (decline) of ₹12,500 via Razorpay.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const triggerRefundClaim = () => {
    const tkt = addCustomerRequest('Vikram Joshi', 'Refund Dispute', 'Requesting refund on charge TXN-8940.', 'High');
    addRefund(tkt.id, 320000);
    setSuccessMsg('Simulated refund request of ₹320,000. Escalated to manager review.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const triggerFraudAlertEvent = () => {
    addFraudAlert('49.36.122.45', 'Mumbai, MH', 94, 'Multiple velocity failures detected.');
    setSuccessMsg('Simulated transaction fraud block alert.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Filters
  const filteredTxns = stats.transactions.filter(t => {
    const matchesSearch = t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.includes(searchTerm);
    const matchesGateway = gatewayFilter === 'all' || t.gateway === gatewayFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesGateway && matchesStatus;
  });

  // Dynamic charts data mapping
  const transactionTrends = hasData
    ? [
        { date: 'Initial', success: 0, failed: 0 },
        { date: 'Live Session', success: stats.payments.successfulTxns, failed: stats.payments.failedTxns },
      ]
    : [];

  const revenueProcessedVal = stats.transactions
    .filter(t => t.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">AI Payment Operations Center</h1>
          <p className="text-sm text-gray-400">Autonomous payment orchestration, gateway analytics, and auto-refund triggers.</p>
        </div>
        
        {/* On-Page Demo Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={triggerSuccessPayment} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8">
            <Play className="h-3 w-3 mr-1.5" /> + Payment Success
          </Button>
          <Button onClick={triggerFailedPayment} size="sm" className="bg-red-600 hover:bg-red-500 text-white text-xs h-8">
            <Play className="h-3 w-3 mr-1.5" /> + Payment Failure
          </Button>
          <Button onClick={triggerRefundClaim} size="sm" className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-8">
            <Play className="h-3 w-3 mr-1.5" /> + Refund Dispute
          </Button>
          <Button onClick={triggerFraudAlertEvent} size="sm" className="bg-red-700 hover:bg-red-600 text-white text-xs h-8">
            <Play className="h-3 w-3 mr-1.5" /> + Fraud Threat
          </Button>
        </div>
      </div>

      {/* Success alert message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold"
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zero State Onboarding Warning */}
      {!hasData && (
        <Card className="border-dashed border-primary/40 bg-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                <Bot className="h-4.5 w-4.5 text-primary animate-pulse" />
                Newly Deployed Payment Node (Standby)
              </h3>
              <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                The Payment Operations Center is currently idle. Click any simulation button at the top (e.g. **+ Payment Success** or **+ Refund Dispute**) to execute transaction traces and watch the orchestration mesh populate in real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Payment Requests', value: stats.payments.totalTxns, icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Payment Success Rate', value: `${successRate}%`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Auto Approved Refunds', value: stats.refund.autoRefunds, icon: RefreshCcw, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Revenue Processed', value: `₹${revenueProcessedVal.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
        ].map((kpi) => (
          <Card key={kpi.label} className="hover:border-primary/20 transition-colors">
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

      {/* Live Payment Processing Pipeline */}
      <Card className="glass border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Live Payment Processing Pipeline</CardTitle>
          <CardDescription className="text-xs text-gray-500">Flow mapping for the active transaction pipeline</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex items-center justify-between overflow-x-auto gap-4 py-2 border border-border bg-card/10 rounded-xl px-4">
            {pipelineStages.map((stage, i) => {
              const isActive = pipelineActiveIdx === i;
              const isCompleted = pipelineActiveIdx > i && pipelineActiveIdx !== -1;
              return (
                <React.Fragment key={stage}>
                  <div className={cn(
                    "flex flex-col items-center gap-1 flex-shrink-0 text-center w-24",
                    isActive ? "text-primary" : isCompleted ? "text-emerald-400" : "text-gray-600"
                  )}>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border",
                      isActive ? "border-primary bg-primary/10 animate-pulse ring-2 ring-primary/45" : 
                      isCompleted ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-border bg-card"
                    )}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <span className="text-[9px] font-semibold tracking-tight leading-none mt-1">{stage}</span>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <div className={cn("flex-grow min-w-3 h-0.5", isCompleted ? "bg-emerald-500/65" : "bg-border")} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Analytics & Ledger */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Payment Lifecycle Analytics */}
          <Card className="bg-[#171717] border-border">
            <CardHeader>
              <CardTitle className="text-white text-sm">Payment Success Trends</CardTitle>
              <CardDescription>Processed volume success vs declines</CardDescription>
            </CardHeader>
            <CardContent className="h-[240px] flex items-center justify-center">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{fill: '#262626'}} />
                    <Bar dataKey="success" fill="#10B981" radius={[3, 3, 0, 0]} name="Successful" />
                    <Bar dataKey="failed" fill="#EF4444" radius={[3, 3, 0, 0]} name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-gray-500 font-mono">
                  No payment lifecycle analytics available. Seed transactions to trace.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gateway Health Monitor */}
          <Card className="bg-[#171717] border-border">
            <CardHeader>
              <CardTitle className="text-white text-sm">Enterprise Payment Gateway Monitoring Center</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Stripe Gateway API', latency: '182 ms', uptime: '99.95%', status: 'Nominal' },
                { name: 'Razorpay Gateway', latency: '210 ms', uptime: '99.91%', status: 'Nominal' },
                { name: 'PayPal Node', latency: '350 ms', uptime: '99.85%', status: 'Degraded' }
              ].map((gate) => (
                <div key={gate.name} className="p-3 bg-black/40 border border-border rounded-lg text-xs font-mono">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white font-sans">{gate.name}</span>
                    <Badge variant={gate.status === 'Nominal' ? 'success' : 'pending'} className="text-[8px]">{gate.status}</Badge>
                  </div>
                  <div className="text-[10px] text-gray-500 space-y-0.5">
                    <div>Latency: {gate.latency}</div>
                    <div>Uptime: {gate.uptime}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Searchable Ledger */}
          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                 <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Enterprise Payment Ledger</CardTitle>
                 <CardDescription className="text-xs text-gray-500">Searchable stream of processed actions</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Search by ID or customer..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-xs" 
                  />
                </div>
                <select
                  value={gatewayFilter}
                  onChange={(e) => setGatewayFilter(e.target.value)}
                  className="h-9 rounded-md border border-border bg-card px-2.5 text-xs text-white"
                >
                  <option value="all">Gateways (All)</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Razorpay">Razorpay</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-border bg-card px-2.5 text-xs text-white"
                >
                  <option value="all">Statuses (All)</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Txn ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTxns.map((t) => (
                      <TableRow 
                        key={t.id} 
                        onClick={() => setSelectedTxnId(t.id)}
                        className={`cursor-pointer hover:bg-primary/5 ${selectedTxnId === t.id ? 'bg-primary/10' : ''}`}
                      >
                        <TableCell className="font-bold text-primary font-mono">{t.id}</TableCell>
                        <TableCell>{t.customerName}</TableCell>
                        <TableCell className="font-mono">₹{t.amount.toLocaleString()}</TableCell>
                        <TableCell>{t.gateway}</TableCell>
                        <TableCell>
                          <Badge variant={t.status === 'Success' ? 'success' : t.status === 'Failed' ? 'destructive' : 'pending'}>
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={t.risk === 'Low' ? 'outline' : 'destructive'}>{t.risk}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredTxns.length === 0 && (
                <div className="text-center py-10 text-xs text-gray-500 font-mono">
                  No records matching the filter query found.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: AI Assessor, Reasoning & Approvals */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Executive AI Briefing */}
          {hasData && typedSummary && (
            <Card className="border-primary/20 bg-primary/5 shadow-[0_0_15px_rgba(37,99,235,0.05)]">
              <CardHeader className="pb-1">
                <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  Executive AI Briefing Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] font-sans font-medium text-gray-200 leading-relaxed min-h-[40px]">
                  {typedSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Payment Agent Monitor */}
          <Card className="bg-[#171717] border-border">
            <CardHeader className="pb-3 bg-card/20 border-b border-border">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">AI Payment Agent Monitor</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
              {[
                { name: 'Validation Agent', status: hasData ? 'Nominal' : 'Idle', latency: '0.6s' },
                { name: 'Gateway Monitor', status: hasData ? 'Nominal' : 'Idle', latency: '0.8s' },
                { name: 'Refund Automator', status: stats.refund.totalRefunds > 0 ? 'Nominal' : 'Idle', latency: '1.2s' },
                { name: 'Chargeback Agent', status: stats.fraud.totalFraud > 0 ? 'Active' : 'Idle', latency: '3.4s' }
              ].map((agent) => (
                <div key={agent.name} className="p-2 bg-black/40 rounded border border-border/20">
                  <span className="text-gray-500 block">{agent.name}</span>
                  <span className={cn("font-bold text-[11px]", agent.status === 'Idle' ? 'text-blue-400' : 'text-emerald-400')}>{agent.status}</span>
                  <span className="text-gray-600 block text-[9px]">L: {agent.latency}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment AI Reasoning Panel */}
          {hasData && currentTxn && (
            <Card className="bg-[#171717] border-border">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">AI Assessor: {currentTxn.id}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Intent Category</span>
                  <p className="font-semibold text-white">{currentTxn.status === 'Success' ? 'Successful Settlement' : 'Payment Failure Appeal'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Transaction Value</span>
                  <p className="font-mono font-semibold text-blue-400">₹{currentTxn.amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1.5">Decision Reasoning</span>
                  <ul className="list-disc pl-4 space-y-1 text-gray-300 font-sans text-[11px] leading-relaxed">
                    <li>Detected routing gateway: {currentTxn.gateway}.</li>
                    <li>Status flags evaluated: {currentTxn.status}.</li>
                    <li>Risk assessment: {currentTxn.risk} risk profile score.</li>
                    <li>Recommendation: {currentTxn.recommendation}.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Refund Operations Center & Human Approval Queue */}
          {stats.approvals.length > 0 ? (
            <Card className="border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              <CardHeader className="pb-3 border-b border-amber-500/20 bg-amber-500/10">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  Refund Approvals Pending ({stats.approvals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {stats.approvals.map((app) => (
                  <div key={app.id} className="p-3 bg-black/40 border border-amber-500/20 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between items-center font-mono text-[10px]">
                      <span className="font-bold text-white">{app.ticketId}</span>
                      <span className="text-amber-500 font-bold">₹{app.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-sans leading-relaxed">{app.reason}</p>
                    <div className="flex gap-2 pt-1.5">
                      <Button 
                        onClick={() => {
                          processApproval(app.id, 'approved');
                          setSuccessMsg(`Approved refund override for ${app.ticketId}.`);
                          setTimeout(() => setSuccessMsg(''), 3000);
                        }}
                        className="flex-1 h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        Approve
                      </Button>
                      <Button 
                        onClick={() => {
                          processApproval(app.id, 'rejected');
                          setSuccessMsg(`Rejected refund override for ${app.ticketId}.`);
                          setTimeout(() => setSuccessMsg(''), 3000);
                        }}
                        className="flex-1 h-7 text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#171717] border-border">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Refund Manual Queue</CardTitle>
              </CardHeader>
              <CardContent className="py-6 text-center text-xs text-gray-500 font-mono">
                ✓ No pending overrides in the queue.
              </CardContent>
            </Card>
          )}

          {/* Cost Optimization Formula */}
          <Card className="bg-[#171717] border-border text-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-xs font-bold uppercase tracking-wider">AI Cost Optimization Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-500">AI Cost (₹2.75 / request):</span>
                <span className="text-white font-semibold">₹{stats.cost.aiProcessingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Manual Cost (₹42 / request):</span>
                <span className="text-white font-semibold">₹{stats.cost.manualProcessingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-border/30 pt-1.5 text-emerald-400 font-bold">
                <span>Net Savings Generated:</span>
                <span>₹{stats.cost.operationalSavings.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
