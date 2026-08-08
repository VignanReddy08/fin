import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Brain, 
  Headset, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  GitMerge, 
  CheckCircle2, 
  FileCheck, 
  History, 
  Bell, 
  BarChart, 
  Clock, 
  DollarSign,
  Activity,
  Cpu,
  Search,
  BookOpen,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  addCustomerRequest,
  addTransaction,
  addRefund,
  addFraudAlert,
  getOperationalStats,
  resetStore
} from '../../lib/operationsStore';

// ─── Constants & Data Types ─────────────────────────────────────────

interface AgentNode {
  id: string;
  name: string;
  icon: any;
  color: string;
  bg: string;
  glow: string;
  category: 'entry' | 'front' | 'check' | 'core' | 'review' | 'out';
  x: number;
  y: number;
  description: string;
  responsibilities: string[];
  rules: string[];
  apis: string[];
}

const AGENTS: AgentNode[] = [
  { id: 'ticket', name: 'Ticket Understanding', icon: Terminal, color: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20', category: 'entry', x: 20, y: 50, description: 'Classifies and extracts intent from customer requests.', responsibilities: ['Intent Parsing', 'Sentiment Detection', 'Entity Extraction'], rules: ['Validate email formats', 'Check keywords for high urgency'], apis: ['NLP-Parser-v2', 'Sentiment-Analyzer'] },
  { id: 'support', name: 'Customer Support Agent', icon: Headset, color: 'text-cyan-400', bg: 'bg-cyan-500/10', glow: 'shadow-cyan-500/20', category: 'front', x: 190, y: 50, description: 'Interacts with users and drafts natural response context.', responsibilities: ['Chat Dispatching', 'Response Drafting', 'Onboarding Guidance'], rules: ['Enforce SLA target rules', 'Maintain formal greeting tone'], apis: ['Support-Templates-S3', 'Drafting-Engine'] },
  { id: 'crm', name: 'CRM Integration Agent', icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10', glow: 'shadow-teal-500/20', category: 'front', x: 190, y: 160, description: 'Fetches client lifecycle data, tenure, and lifetime value.', responsibilities: ['Tenure Retrieval', 'SSO Session Matching', 'Billing sync'], rules: ['Verify client tenancy level', 'Check whitelist records'], apis: ['Salesforce-OAuth2', 'SSO-Session-Verify'] },
  { id: 'payment', name: 'Payment Verification', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20', category: 'check', x: 360, y: 50, description: 'Audits transaction status across gateways.', responsibilities: ['Payout Auditing', 'Gateway Health Sync', 'Failed status diagnostics'], rules: ['Verify transaction presence', 'Match amount matchings'], apis: ['Stripe-Payout-API', 'Razorpay-Status-Check'] },
  { id: 'fraud', name: 'Fraud Detection Agent', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', glow: 'shadow-red-500/20', category: 'check', x: 360, y: 160, description: 'Scans device fingerprints and flags anomaly coordinates.', responsibilities: ['Risk Auditing', 'IP Geolocation scans', 'Biometric validation'], rules: ['AML compliance audit', 'Geo-velocity limits verification'], apis: ['SOC-Anomaly-Scanner', 'VPN-IP-Checker'] },
  { id: 'rag', name: 'Knowledge Retrieval (RAG)', icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10', glow: 'shadow-indigo-500/20', category: 'check', x: 360, y: 270, description: 'Retrieves corporate policies and compliance SLA guidelines.', responsibilities: ['Policy Chunk Vectoring', 'Similarity Scoring', 'Citation references'], rules: ['Enforce correct policy version', 'Check confidence metrics'], apis: ['Pinecone-Index-Search', 'Embeddings-Generator'] },
  { id: 'decision', name: 'Decision Engine', icon: GitMerge, color: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20', category: 'core', x: 530, y: 160, description: 'Applies business rules to select the final action path.', responsibilities: ['Threshold checking', 'Action mapping', 'Alternate option analysis'], rules: ['Auto-refund limit < ₹10k', 'Escalate if risk high'], apis: ['Rule-Compiler-v3', 'FinOps-Workflow-Hub'] },
  { id: 'selfcheck', name: 'Self-Validation Agent', icon: CheckCircle2, color: 'text-orange-400', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/20', category: 'review', x: 700, y: 50, description: 'Checks decision sanity before execution.', responsibilities: ['Token leak check', 'Hallucination review', 'Guardrail policy matching'], rules: ['Verify safe response template', 'Check token cost boundaries'], apis: ['Guardrail-Validator', 'Sanity-Auditor'] },
  { id: 'approval', name: 'Human Approval Agent', icon: FileCheck, color: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20', category: 'review', x: 700, y: 160, description: 'Coordinates review overrides for high-risk actions.', responsibilities: ['Manager Dispatch', 'Waiting timers', 'Override executions'], rules: ['Flag wire transfer overrides', 'Enforce dual authorization'], apis: ['Manager-Inbox-Hook', 'Approval-Registry'] },
  { id: 'audit', name: 'Compliance Agent', icon: History, color: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20', category: 'review', x: 700, y: 270, description: 'Records immutable ledger trails of all operations.', responsibilities: ['Ledger logging', 'Audit logs streaming', 'CSV reports creation'], rules: ['Immutable record hash matching', 'Sign compliance stamps'], apis: ['Ledger-Immutable-API', 'Audit-Logger'] },
  { id: 'notify', name: 'Notification Agent', icon: Bell, color: 'text-pink-400', bg: 'bg-pink-500/10', glow: 'shadow-pink-500/20', category: 'out', x: 870, y: 100, description: 'Dispatches status notifications across email/SMS channels.', responsibilities: ['Email alerts sending', 'SMS OTP creation', 'Channel redundancy check'], rules: ['Format response tags', 'Enforce user privacy headers'], apis: ['SendGrid-Mailer', 'Twilio-SMS-Dispatch'] },
  { id: 'analytics', name: 'Analytics Agent', icon: BarChart, color: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20', category: 'out', x: 870, y: 210, description: 'Synchronizes performance indicators and token costs.', responsibilities: ['KPI calculations', 'Savings mapping', 'Uptime monitoring'], rules: ['Verify dashboard integrity', 'Calculate ROI costs'], apis: ['Recharts-Sync-Service', 'Grafana-Metric-Hook'] }
];

const CONNECTIONS = [
  { from: 'ticket', to: 'support', type: 'Customer Context' },
  { from: 'ticket', to: 'crm', type: 'SSO Session' },
  { from: 'support', to: 'payment', type: 'Billing Request' },
  { from: 'crm', to: 'payment', type: 'CRM Tenure profile' },
  { from: 'crm', to: 'fraud', type: 'Device Fingerprint' },
  { from: 'support', to: 'rag', type: 'Policy Query' },
  { from: 'payment', to: 'decision', type: 'Payment Details' },
  { from: 'fraud', to: 'decision', type: 'Fraud Risk Signals' },
  { from: 'rag', to: 'decision', type: 'Retrieved Policies' },
  { from: 'decision', to: 'selfcheck', type: 'Decision Draft' },
  { from: 'decision', to: 'approval', type: 'Human Review Request' },
  { from: 'decision', to: 'audit', type: 'Compliance Audit record' },
  { from: 'selfcheck', to: 'notify', type: 'Validated Answer' },
  { from: 'approval', to: 'notify', type: 'Human Decision output' },
  { from: 'audit', to: 'analytics', type: 'Metrics Update' },
  { from: 'notify', to: 'analytics', type: 'Notification success' }
];

interface Scenario {
  id: string;
  name: string;
  category: string;
  tktCategory: string;
  details: string;
  steps: {
    agentId: string;
    log: string;
    timeline: string;
    ragDoc?: string;
    ragScore?: number;
    ruleCode?: string;
    ruleResult?: 'PASS' | 'FAIL';
    ruleText?: string;
    communication: string;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'refund_request',
    name: 'Disputed Refund Claim',
    category: 'Refund Claim',
    tktCategory: 'Refund Dispute',
    details: 'Customer requesting refund of ₹12,500 on transaction TXN-8938.',
    steps: [
      { agentId: 'ticket', log: 'Ticket parsed. Intent: Refund dispute. Priority: High.', timeline: 'Intent Classification completed.', communication: 'Ticket Agent parsed refund intent from query.' },
      { agentId: 'crm', log: 'Customer profile matched: 4-year tenure. LTV: ₹1.2M.', timeline: 'CRM client query completed.', communication: 'CRM Agent retrieved tenure: 4 years.' },
      { agentId: 'payment', log: 'Transaction TXN-8938 verified as successful on Stripe.', timeline: 'Gateway record checked.', communication: 'Payment Agent checked Stripe payload. Success.' },
      { agentId: 'fraud', log: 'Risk assessment: 12 (Low risk device coordinates).', timeline: 'Behavioral scanning finished.', communication: 'Fraud Agent calculated low risk score: 12.' },
      { agentId: 'rag', log: 'Retrieving guidelines: refund_slas_q3.pdf. Similarity score: 94%.', timeline: 'RAG policy retrieved.', ragDoc: 'refund_slas_q3.pdf', ragScore: 94, communication: 'RAG Agent fetched policy chunk: Refund SLAs.' },
      { agentId: 'decision', log: 'Rules check: limit > ₹10,000 threshold. Escalating to human.', timeline: 'Business rule checked.', ruleCode: 'RULE-LIMIT-CHECK', ruleResult: 'FAIL', ruleText: 'Amount ₹12,500 exceeds auto-refund limit of ₹10,000.', communication: 'Decision Engine triggered human override rule.' },
      { agentId: 'approval', log: 'Awaiting manager approval verification override...', timeline: 'Human review pending.', communication: 'Approval Agent requested Manager manual override.' },
      { agentId: 'selfcheck', log: 'Compliance review completed. Guardrail constraints matched.', timeline: 'Decision sanity check verified.', communication: 'Self-Check verified token formatting.' },
      { agentId: 'audit', log: 'Immutable audit logs record written. Ledger index #10842.', timeline: 'Compliance audit trail saved.', communication: 'Audit Agent signed database block.' },
      { agentId: 'notify', log: 'Customer notification SMS/email dispatched.', timeline: 'Customer notified.', communication: 'Notification Agent mailed email confirmation.' },
      { agentId: 'analytics', log: 'Throughput and opex savings calculated and sync completed.', timeline: 'Analytics metric synced.', communication: 'Analytics Agent updated financial savings.' }
    ]
  },
  {
    id: 'failed_payment',
    name: 'Checkout Failure Anomaly',
    category: 'Payment Failure',
    tktCategory: 'Payment Failure Inquiry',
    details: 'Customer checkout of ₹14,500 failed during Stripe validation.',
    steps: [
      { agentId: 'ticket', log: 'Parsing failure logs. Intent: Checkout error.', timeline: 'Error logs analyzed.', communication: 'Ticket Agent parsed failed checkout trace.' },
      { agentId: 'crm', log: 'Customer account active. Lifetime transactions: 45.', timeline: 'CRM index verified.', communication: 'CRM Agent verified tenant limits.' },
      { agentId: 'payment', log: 'Stripe gateway logs check returned: Code 402 Card Declined.', timeline: 'Stripe check failed.', communication: 'Payment Agent diagnosed Stripe code 402.' },
      { agentId: 'fraud', log: 'Anomalies check: 100% device match. IP location verified.', timeline: 'Location verified.', communication: 'Fraud Agent verified clean device signature.' },
      { agentId: 'rag', log: 'Policy lookups: card_decline_reasons.txt (Similarity: 98%).', timeline: 'RAG policy retrieved.', ragDoc: 'card_decline_reasons.txt', ragScore: 98, communication: 'RAG Agent retrieved card decline guidelines.' },
      { agentId: 'decision', log: 'Decision: Trigger automated retry check and suggest user balances.', timeline: 'Auto-retry rule checked.', ruleCode: 'RULE-RETRY-CHECK', ruleResult: 'PASS', ruleText: 'Payment failure is user-side decline, auto-suggest option.', communication: 'Decision Engine compiled suggestions response.' },
      { agentId: 'selfcheck', log: 'Sanity validation checks passed.', timeline: 'Sanity checks complete.', communication: 'Self-Check validated safe response template.' },
      { agentId: 'audit', log: 'Audit ledger updated with gateway status code logs.', timeline: 'Log recorded.', communication: 'Audit Agent saved error trace.' },
      { agentId: 'notify', log: 'Emailed user alert with payment decline detail instructions.', timeline: 'User decline mail sent.', communication: 'Notification Agent dispatched balance alert.' },
      { agentId: 'analytics', log: 'Updated fail count indices on system health mesh.', timeline: 'Analytics updated.', communication: 'Analytics Agent updated health index.' }
    ]
  },
  {
    id: 'suspicious_login',
    name: 'Suspicious Access Alert',
    category: 'Account Security',
    tktCategory: 'Security Violation',
    details: 'Account login from unrecognized device in high-risk location.',
    steps: [
      { agentId: 'ticket', log: 'Urgent security incident detected. Intent: Account takeover alert.', timeline: 'Incident logged.', communication: 'Ticket Agent categorized threat incident.' },
      { agentId: 'crm', log: 'User history lookup: past 3 logins from Mumbai.', timeline: 'CRM history fetched.', communication: 'CRM Agent matches past login history.' },
      { agentId: 'fraud', log: 'Threat: High risk location St. Petersburg. Score: 94.', timeline: 'Threat coordinates flagged.', communication: 'Fraud Agent flagged 94 risk score (VPN / Location mismatch).' },
      { agentId: 'rag', log: 'Security protocol RAG lookup: access_controls_v2.pdf (Match: 99%).', timeline: 'Access policies checked.', ragDoc: 'access_controls_v2.pdf', ragScore: 99, communication: 'RAG Agent verified compliance controls.' },
      { agentId: 'decision', log: 'Decision: Lock session and trigger MFA OTP verification.', timeline: 'Lock session rule checked.', ruleCode: 'RULE-LOCK-SESSION', ruleResult: 'PASS', ruleText: 'Lock account due to VPN detection.', communication: 'Decision Engine triggered freeze account override.' },
      { agentId: 'approval', log: 'Pausing session. Dispatching OTP authorization challenge.', timeline: 'OTP challenge active.', communication: 'Approval Agent requested multi-factor verification.' },
      { agentId: 'selfcheck', log: 'Guardrails check passed.', timeline: 'Guardrails cleared.', communication: 'Self-Check confirmed token block.' },
      { agentId: 'audit', log: 'Recorded access block to ledger audit trails.', timeline: 'Ledger record saved.', communication: 'Audit Agent logged block case.' },
      { agentId: 'notify', log: 'SMS OTP challenge sent. Safety warning email dispatched.', timeline: 'OTP alerts sent.', communication: 'Notification Agent pushed Twilio OTP SMS.' },
      { agentId: 'analytics', log: 'Updated anomaly logs timeline.', timeline: 'Analytics synchronized.', communication: 'Analytics Agent logged threat case.' }
    ]
  }
];

export default function AIAgentWorkflow() {
  const [stats, setStats] = useState(getOperationalStats());
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(AGENTS[0]);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPausedForApproval, setIsPausedForApproval] = useState(false);
  
  // Real-time consoles
  const [timelineLogs, setTimelineLogs] = useState<{ label: string; time: string; details: string; duration: string }[]>([]);
  const [consoleMessages, setConsoleMessages] = useState<{ time: string; text: string }[]>([]);
  
  // Typing state for AI executive summary
  const [typedSummary, setTypedSummary] = useState('');
  const [summaryDone, setSummaryDone] = useState(false);
  const timerRef = useRef<any>(null);

  // Sync stats when actions run
  useEffect(() => {
    const handleUpdate = () => {
      setStats(getOperationalStats());
    };
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, []);

  // Execution runner
  const startSimulation = (sc: Scenario) => {
    if (isExecuting) return;
    setCurrentScenario(sc);
    setActiveStepIdx(0);
    setIsExecuting(true);
    setIsPausedForApproval(false);
    setTimelineLogs([]);
    setConsoleMessages([]);
    setTypedSummary('');
    setSummaryDone(false);

    // Initial console welcome log
    const timeStr = new Date().toLocaleTimeString();
    setConsoleMessages([{ time: timeStr, text: `▶ Starting orchestration for: ${sc.name}...` }]);
  };

  useEffect(() => {
    if (!isExecuting || currentScenario === null || activeStepIdx === -1) return;

    const currentStep = currentScenario.steps[activeStepIdx];
    const targetAgent = AGENTS.find(a => a.id === currentStep.agentId);
    
    // Auto scroll or select agent in inspector
    if (targetAgent) {
      setSelectedAgent(targetAgent);
    }

    // Add communication console msg
    const timeStr = new Date().toLocaleTimeString();
    setConsoleMessages(prev => [
      ...prev,
      { time: timeStr, text: `[${targetAgent?.name || 'Engine'}]: ${currentStep.communication}` }
    ]);

    // Check for Human-in-the-Loop pause condition
    if (currentStep.agentId === 'approval' && !isPausedForApproval) {
      setIsPausedForApproval(true);
      setConsoleMessages(prev => [
        ...prev,
        { time: timeStr, text: `⚠️ PAUSED: High-Risk Action requires human reviewer override approval.` }
      ]);
      return; // Pause execution loop
    }

    // Run step timer
    timerRef.current = setTimeout(() => {
      // Append to timeline
      setTimelineLogs(prev => [
        ...prev,
        {
          label: currentStep.timeline,
          time: timeStr,
          details: currentStep.log,
          duration: '1.2s'
        }
      ]);

      if (activeStepIdx < currentScenario.steps.length - 1) {
        setActiveStepIdx(prev => prev + 1);
      } else {
        // Complete execution!
        setIsExecuting(false);
        setSummaryDone(true);
        
        // Push actual dynamic event data to OperationsStore to show real-time synchronization!
        if (currentScenario.id === 'refund_request') {
          addCustomerRequest('Aarav Mehta', currentScenario.tktCategory, currentScenario.details, 'High');
          addRefund('TKT-1025', 12500);
        } else if (currentScenario.id === 'failed_payment') {
          addTransaction('Deepak Kumar', 14500, 'Stripe', 'Failed');
        } else if (currentScenario.id === 'suspicious_login') {
          addFraudAlert('103.44.12.89', 'Chennai, TN', 94, 'Suspicious VPN IP credentials mismatch.');
        }
      }
    }, 1600);

    return () => clearTimeout(timerRef.current);
  }, [isExecuting, activeStepIdx, currentScenario, isPausedForApproval]);

  // Handle Human Approval click
  const approveHumanOverride = () => {
    setIsPausedForApproval(false);
    // Resume step execution
    if (currentScenario && activeStepIdx !== -1) {
      const timeStr = new Date().toLocaleTimeString();
      setConsoleMessages(prev => [
        ...prev,
        { time: timeStr, text: `✓ Human Approval confirmed. Resuming orchestration flow...` }
      ]);
      setActiveStepIdx(prev => prev + 1);
    }
  };

  // Typist animation for summary
  useEffect(() => {
    if (!summaryDone || !currentScenario) return;

    const summaryText = `Intent: ${currentScenario.category} verified successfully. AI Engine reached 95.4% confidence score. All business compliance guidelines retrieved using RAG. Auditable immutable ledger sync verified. Final actions processed nominally.`;
    
    let charIdx = 0;
    const interval = setInterval(() => {
      setTypedSummary((prev) => prev + summaryText.charAt(charIdx));
      charIdx++;
      if (charIdx >= summaryText.length) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [summaryDone, currentScenario]);

  // Derived state details for active connection visualizer
  const activeAgentId = isExecuting && currentScenario && activeStepIdx !== -1 
    ? currentScenario.steps[activeStepIdx].agentId 
    : '';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-screen bg-[#0A0A0A] text-slate-200 animate-in fade-in duration-500 pb-12">
      
      {/* ─── COLUMN 1: CONTROLS & METRICS ──────────────────────────────── */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Scenario Simulator */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-3 border-b border-border bg-card/40">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-primary animate-spin-slow" />
              Autonomous Decision Simulator
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">Run operational cases step-by-step</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => startSimulation(sc)}
                disabled={isExecuting}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all flex flex-col gap-1 text-xs",
                  currentScenario?.id === sc.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card/40 border-border hover:border-primary/20"
                )}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-white">{sc.name}</span>
                  <Badge variant="outline" className="text-[9px] uppercase font-mono">{sc.category}</Badge>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">{sc.details}</p>
              </button>
            ))}

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full h-8 text-xs border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  resetStore();
                  setCurrentScenario(null);
                  setActiveStepIdx(-1);
                  setIsExecuting(false);
                  setIsPausedForApproval(false);
                  setTimelineLogs([]);
                  setConsoleMessages([]);
                  setTypedSummary('');
                }}
              >
                <RotateCcw className="h-3 w-3 mr-2" /> Reset Platform State
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Performance Dashboard */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-3 border-b border-border bg-card/40">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <BarChart className="h-4 w-4 text-emerald-500" />
              AI Performance Sandbox
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">Orchestration status rates</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-black/40 p-2.5 rounded border border-border/40">
              <span className="text-[10px] text-gray-500 block">Total Requests</span>
              <span className="font-bold text-white font-mono text-sm">{stats.support.totalRequests}</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded border border-border/40">
              <span className="text-[10px] text-gray-500 block">AI Resolved</span>
              <span className="font-bold text-white font-mono text-sm">{stats.support.aiResolved}</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded border border-border/40 col-span-2">
              <span className="text-[10px] text-gray-500 block">Resolution Rate</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                {stats.support.aiResolutionRate}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Infrastructure Monitor */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-3 border-b border-border bg-card/40">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-blue-500" />
              Enterprise Infra Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5 text-xs">
            {[
              { name: 'API Gateway', status: 'Operational', uptime: '99.99%', latency: '21ms' },
              { name: 'PostgreSQL DB', status: 'Operational', uptime: '100.0%', latency: '12ms' },
              { name: 'AI Reasoning', status: isExecuting ? 'Processing' : 'Idle', uptime: '99.92%', latency: '1.6s' },
            ].map((mesh) => (
              <div key={mesh.name} className="flex justify-between items-center p-2 rounded bg-black/30 border border-border/20 font-mono text-[10px]">
                <div>
                  <span className="font-bold text-white block">{mesh.name}</span>
                  <span className="text-gray-500">Latency: {mesh.latency}</span>
                </div>
                <Badge variant={mesh.status === 'Operational' ? 'success' : 'pending'} className="text-[9px]">
                  {mesh.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* ─── COLUMN 2 & 3: FLOW VISUALIZATION & TIMELINE ────────────────── */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Workflow Pipe SVG Visualizer */}
        <Card className="glass border-white/10 relative overflow-hidden flex flex-col min-h-[480px]">
          <CardHeader className="pb-3 border-b border-border bg-card/40 z-10">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              Multi-Agent Orchestration Flow Graph
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Interactive visualization of specialized agents passing data packets
            </CardDescription>
          </CardHeader>

          <div className="flex-1 relative overflow-auto p-4 min-h-[400px]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Connection lines rendering */}
              {CONNECTIONS.map((conn, i) => {
                const fromNode = AGENTS.find(a => a.id === conn.from)!;
                const toNode = AGENTS.find(a => a.id === conn.to)!;
                
                const fromIdx = AGENTS.findIndex(a => a.id === conn.from);
                const toIdx = AGENTS.findIndex(a => a.id === conn.to);
                
                const currentActiveIdx = isExecuting && currentScenario ? activeStepIdx : -1;
                
                // Connection glows when the parent node is currently processing or completed
                const isConnectionGlow = currentActiveIdx !== -1 && fromIdx <= currentActiveIdx && toIdx <= currentActiveIdx;

                return (
                  <g key={i}>
                    <motion.path
                      d={`M ${fromNode.x + 150} ${fromNode.y + 35} C ${fromNode.x + 180} ${fromNode.y + 35}, ${toNode.x - 30} ${toNode.y + 35}, ${toNode.x} ${toNode.y + 35}`}
                      fill="none"
                      stroke={isConnectionGlow ? "#3b82f6" : "#262626"}
                      strokeWidth={isConnectionGlow ? "2.5" : "1.5"}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    {isConnectionGlow && (
                      <motion.circle
                        r="3.5"
                        fill="#60a5fa"
                        className="shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                      >
                        <animateMotion
                          path={`M ${fromNode.x + 150} ${fromNode.y + 35} C ${fromNode.x + 180} ${fromNode.y + 35}, ${toNode.x - 30} ${toNode.y + 35}, ${toNode.x} ${toNode.y + 35}`}
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </motion.circle>
                    )}
                  </g>
                );
              })}
            </svg>
            
            <div className="relative w-[1100px] h-[360px] z-10">
              {AGENTS.map((agent, index) => {
                const isCurrent = activeAgentId === agent.id;
                const isPast = isExecuting && currentScenario && index < activeStepIdx;
                
                const status = isCurrent ? 'processing' : isPast ? 'completed' : 'idle';
                const Icon = agent.icon;

                return (
                  <motion.div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={cn(
                      "absolute w-[150px] p-2.5 rounded-xl border backdrop-blur-md flex flex-col gap-1 cursor-pointer transition-all",
                      status === 'processing'
                        ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105"
                        : status === 'completed'
                          ? "bg-card/90 border-emerald-500/40"
                          : "bg-card/40 border-border opacity-70 hover:opacity-100"
                    )}
                    style={{ left: agent.x, top: agent.y }}
                  >
                    <div className="flex justify-between items-center">
                      <div className={cn("p-1 rounded-md", agent.bg, agent.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        status === 'processing' ? 'bg-primary animate-ping' :
                        status === 'completed' ? 'bg-emerald-500' : 'bg-gray-700'
                      )} />
                    </div>
                    <div className="text-[10px] font-bold text-white truncate mt-1">{agent.name}</div>
                    <span className="text-[8px] text-gray-500 uppercase font-mono tracking-wider font-semibold">
                      {status === 'processing' ? 'Orchestrating' : status === 'completed' ? 'Completed' : 'Standby'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Live AI Reasoning Timeline */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-3 border-b border-border bg-card/40">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">
              Live AI Reasoning Timeline
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Interactive trace of decision steps and confidence outputs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 max-h-[300px] overflow-y-auto space-y-3.5">
            {timelineLogs.map((log, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.label}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{log.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal">{log.details}</p>
                </div>
              </div>
            ))}

            {timelineLogs.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-500 font-mono">
                No active reasoning timeline. Trigger a simulator event to generate decisions.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ─── COLUMN 4: INSPECTORS & CONSOLES ────────────────────────────── */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Human-in-the-Loop Override Alert Box */}
        {isPausedForApproval && (
          <Card className="border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Human Review Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-gray-300">
                Action blocked by AI policy check. Requires manager override audit.
              </p>
              <div className="p-2.5 rounded bg-black/40 border border-amber-500/20 font-mono text-[10px] space-y-1">
                <div><span className="text-gray-500">Case ID:</span> <span className="text-white">APP-101</span></div>
                <div><span className="text-gray-500">Value:</span> <span className="text-amber-400">₹12,500</span></div>
                <div><span className="text-gray-500">Risk Limit:</span> <span className="text-red-400">₹10,000 threshold exceeded</span></div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button 
                  onClick={approveHumanOverride}
                  className="flex-1 h-8 text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Approve Override
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Inspector Panel */}
        {selectedAgent && (
          <Card className="glass border-white/10">
            <CardHeader className="pb-3 border-b border-border bg-card/40">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg bg-card border border-border", selectedAgent.color)}>
                  <selectedAgent.icon className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm text-white">{selectedAgent.name}</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Agent Inspector</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Description</span>
                <p className="text-gray-300 leading-normal text-[11px]">{selectedAgent.description}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1.5">Responsibilities</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.responsibilities.map(r => (
                    <Badge key={r} variant="outline" className="text-[9px] bg-black/40 border-border">{r}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 font-mono text-[10px]">
                <div className="bg-black/30 p-2 rounded border border-border/20">
                  <span className="text-gray-500 block mb-0.5">Retrieved Docs</span>
                  <span className="text-white font-bold">{selectedAgent.rules.length} units</span>
                </div>
                <div className="bg-black/30 p-2 rounded border border-border/20">
                  <span className="text-gray-500 block mb-0.5">Integrations</span>
                  <span className="text-white font-bold">{selectedAgent.apis.length} APIs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Agent Communication Console */}
        <Card className="glass border-white/10 flex flex-col h-[260px] overflow-hidden">
          <CardHeader className="pb-3 border-b border-border bg-card/40 shrink-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">
              Communication Console
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">Live agent-to-agent message channel</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 bg-black p-3 font-mono text-[10px] text-emerald-500 overflow-y-auto space-y-1">
            {consoleMessages.map((msg, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-gray-600 mr-1.5">[{msg.time}]</span>
                <span>{msg.text}</span>
              </div>
            ))}
            <div className="animate-pulse">_</div>
          </CardContent>
        </Card>

        {/* Executive AI Briefing Summary */}
        {summaryDone && (
          <Card className="border-dashed border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                AI Executive Briefing Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] font-sans font-medium text-gray-200 leading-relaxed min-h-[40px]">
                {typedSummary}
              </p>
            </CardContent>
          </Card>
        )}

      </div>

    </div>
  );
}
