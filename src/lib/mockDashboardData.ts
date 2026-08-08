// Centralized Enterprise Mock Dataset - Single Source of Truth

// ─── Base Metrics ──────────────────────────────────────────────────
export const SUPPORT_STATS = {
  totalCustomerRequests: 1248,
  aiResolvedRequests: 1181,
  humanReviewRequired: 67,
  humanApproved: 59,
  humanRejected: 8,
  aiResolutionRate: 94.6,
  humanEscalationRate: 5.4
};

export const PAYMENT_STATS = {
  totalTransactions: 8942,
  successfulTransactions: 8713,
  failedTransactions: 146,
  pendingTransactions: 83
};

export const REFUND_STATS = {
  refundRequests: 214,
  automaticallyApproved: 167,
  humanReviewRequired: 47
};

export const FRAUD_STATS = {
  totalFraudAlerts: 126,
  lowRisk: 84,
  mediumRisk: 31,
  highRisk: 11
};

export const AI_PERFORMANCE = {
  averageAIConfidence: 95.4,
  aiAccuracy: 96.8,
  averageAIResponseTime: 2.8,
  averageHumanApprovalTime: 18
};

export const AI_WORKFORCE = {
  supportAgent: { name: 'Support Agent', completed: 482, active: 9, avgResponseTime: 1.8 },
  paymentAgent: { name: 'Payment Agent', completed: 3914, active: 17, avgResponseTime: 0.7 },
  fraudAgent: { name: 'Fraud Agent', completed: 126, active: 4, avgResponseTime: 3.4 },
  policyAgent: { name: 'Policy Agent', completed: 728, active: 0, avgResponseTime: 0.9 },
  approvalAgent: { name: 'Approval Agent', completed: 59, active: 8, avgResponseTime: 18 }
};

export const COST_OPTIMIZATION = {
  manualCostPerTicket: 42,
  aiCostPerTicket: 2.75,
  manualProcessingCost: 1248 * 42, // 52416
  aiProcessingCost: 1248 * 2.75,   // 3432
  operationalSavings: (1248 * 42) - (1248 * 2.75), // 48984
  costReduction: 93.4
};

export const SYSTEM_HEALTH = {
  apiGateway:          { name: 'API Gateway',            latency: 21,   uptime: 99.99 },
  postgres:            { name: 'PostgreSQL Database',    latency: 12,   uptime: 100 },
  redis:               { name: 'Redis Cache Layer',      latency: 4,    uptime: 99.98 },
  aiReasoning:         { name: 'AI Reasoning Engine',    latency: 1600, uptime: 99.92 }, // 1.6 sec
  paymentGateway:      { name: 'Payment Gateway API',    latency: 182,  uptime: 99.95 },
  fraudDetection:      { name: 'Fraud Detection Engine', latency: 240,  uptime: 99.97 },
  notificationService: { name: 'Notification Service',   latency: 41,   uptime: 99.99 }
};

// ─── Executive Summary ──────────────────────────────────────────────
export const EXECUTIVE_SUMMARY = 
  `Today, the platform processed ${SUPPORT_STATS.totalCustomerRequests} customer requests. ` +
  `AI autonomously resolved ${SUPPORT_STATS.aiResolvedRequests} requests while ${SUPPORT_STATS.humanReviewRequired} required human review. ` +
  `The platform successfully processed ${PAYMENT_STATS.totalTransactions} financial transactions and investigated ${FRAUD_STATS.totalFraudAlerts} fraud alerts. ` +
  `Total operational savings reached ₹${COST_OPTIMIZATION.operationalSavings.toLocaleString()} with an automation rate of ${SUPPORT_STATS.aiResolutionRate}%. ` +
  `Overall system health remains above 99.9% across all enterprise services.`;

// ─── Chart Data Sets ────────────────────────────────────────────────

// 1. Customer Support Ticket Trends
export const TICKET_TRENDS = [
  { time: '09:00', total: 150, resolved: 142, human: 8 },
  { time: '11:00', total: 340, resolved: 321, human: 19 },
  { time: '13:00', total: 580, resolved: 550, human: 30 },
  { time: '15:00', total: 820, resolved: 775, human: 45 },
  { time: '17:00', total: 1050, resolved: 993, human: 57 },
  { time: '19:00', total: 1248, resolved: 1181, human: 67 }, // Ending matches exactly
];

// 2. Transaction Success Trends
export const TRANSACTION_TRENDS = [
  { date: 'Aug 01', total: 1200, success: 1170, failed: 20, pending: 10 },
  { date: 'Aug 02', total: 2500, success: 2435, failed: 45, pending: 20 },
  { date: 'Aug 03', total: 4100, success: 3995, failed: 70, pending: 35 },
  { date: 'Aug 04', total: 5800, success: 5650, failed: 100, pending: 50 },
  { date: 'Aug 05', total: 7200, success: 7015, failed: 120, pending: 65 },
  { date: 'Aug 06', total: 8942, success: 8713, failed: 146, pending: 83 }, // Ending matches exactly
];

// 3. Fraud Alert Distribution Pie
export const FRAUD_DISTRIBUTION = [
  { name: 'Low Risk', value: FRAUD_STATS.lowRisk, color: '#10B981' },
  { name: 'Medium Risk', value: FRAUD_STATS.mediumRisk, color: '#F59E0B' },
  { name: 'High Risk', value: FRAUD_STATS.highRisk, color: '#EF4444' }
];

// 4. AI Savings Optimization Trend (derived savings per hour)
export const SAVINGS_TREND = [
  { hour: '08:00', costManual: 8400, costAI: 550, savings: 7850 },
  { hour: '11:00', costManual: 16800, costAI: 1100, savings: 15700 },
  { hour: '14:00', costManual: 29400, costAI: 1925, savings: 27475 },
  { hour: '17:00', costManual: 42000, costAI: 2750, savings: 39250 },
  { hour: '20:00', costManual: 52416, costAI: 3432, savings: 48984 } // Ending matches exactly
];

// ─── Shared Recent Activity Feed ────────────────────────────────────
export interface ActivityItem {
  id: string;
  type: 'ticket' | 'payment' | 'fraud' | 'system' | 'workforce';
  title: string;
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-01',
    type: 'payment',
    title: 'High-Value Transfer Success',
    message: 'Processed payout transaction TX-8942 to FinMatrix sandbox environment successfully.',
    timestamp: '2 mins ago',
    status: 'success'
  },
  {
    id: 'act-02',
    type: 'fraud',
    title: 'High-Risk Alert Blocked',
    message: 'Fraud Agent flagged investigation #126 on credential mismatch. Session blocked.',
    timestamp: '15 mins ago',
    status: 'error'
  },
  {
    id: 'act-03',
    type: 'ticket',
    title: 'Customer Refund Auto-Approved',
    message: 'Refund Request #214 successfully resolved by Payment Agent. Operational cost saved ₹39.25.',
    timestamp: '40 mins ago',
    status: 'success'
  },
  {
    id: 'act-04',
    type: 'system',
    title: 'AI Reasoning Engine Load Peak',
    message: 'AI reasoning engine inference latency stabilized at 1.6s. All nodes active.',
    timestamp: '1 hour ago',
    status: 'info'
  },
  {
    id: 'act-05',
    type: 'workforce',
    title: 'Policy Agent Database Sync',
    message: 'Policy Agent completed 728 lookups. Cache hits registered above 98%.',
    timestamp: '3 hours ago',
    status: 'success'
  }
];

// ─── Human Approval Queue ───────────────────────────────────────────
export interface ApprovalItem {
  id: string;
  ticketId: string;
  customerName: string;
  type: string;
  amount: number;
  confidence: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const HUMAN_APPROVAL_QUEUE: ApprovalItem[] = [
  {
    id: 'app-01',
    ticketId: 'TKT-1042',
    customerName: 'Aarav Mehta',
    type: 'Refund Request',
    amount: 14500,
    confidence: 79.4,
    reason: 'Amount exceeds auto-approval dollar threshold set in configurations ($500).',
    status: 'pending'
  },
  {
    id: 'app-02',
    ticketId: 'TKT-1043',
    customerName: 'Sunita Rao',
    type: 'MFA Override Reset',
    amount: 0,
    confidence: 82.1,
    reason: 'Device IP location mismatch during recovery request verification step.',
    status: 'pending'
  },
  {
    id: 'app-03',
    ticketId: 'TKT-1044',
    customerName: 'Vikram Joshi',
    type: 'High-Value Transfer',
    amount: 320000,
    confidence: 68.9,
    reason: 'Potential security audit flags triggered on destination API address routing.',
    status: 'pending'
  }
];
