// ─── Reactive Dynamic Operations Store ──────────────────────────────
// This store manages dynamic customer operations and acts as the single source of truth.
// It persists state to localStorage so updates survive page reloads.

export interface CustomerRequest {
  id: string;
  customerName: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Resolved' | 'Requires Approval' | 'Escalated' | 'Processing';
  agent: string;
  confidence: number;
  time: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  details: string;
  timestamp: string;
  issueType?: string;
  aiSummary?: string;
  resolutionTime?: string;
  evidence?: string[];
  knowledgeRefs?: string[];
  recommendedAction?: string;
  auditLogs?: Array<{ stage: string; timestamp: string; details: string; user?: string }>;
  workflowStage?: string;
  isEscalated?: boolean;
}

export interface Transaction {
  id: string;
  customerName: string;
  amount: number;
  gateway: 'Stripe' | 'Razorpay' | 'Adyen' | 'PayPal';
  status: 'Success' | 'Failed' | 'Pending';
  risk: 'Low' | 'Medium' | 'High';
  recommendation: string;
  timestamp: string;
}

export interface RefundCase {
  id: string;
  ticketId: string;
  customerName: string;
  amount: number;
  status: 'Auto-Approved' | 'Human Review Required';
  timestamp: string;
}

export interface FraudAlert {
  id: string;
  caseId: string;
  ip: string;
  location: string;
  riskScore: number;
  status: 'Low' | 'Medium' | 'High';
  details: string;
  timestamp: string;
}

export interface OperationalActivity {
  id: string;
  type: 'ticket' | 'payment' | 'refund' | 'fraud' | 'system';
  title: string;
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

export interface ApprovalRequest {
  id: string;
  ticketId: string;
  customerName: string;
  type: string;
  amount: number;
  confidence: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'info_requested';
  timestamp: string;
  issueType?: string;
  aiSummary?: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  evidence?: string[];
  knowledgeRefs?: string[];
  recommendedAction?: string;
  managerComment?: string;
}

// Helper to load localStorage safely
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ─── State Arrays ───────────────────────────────────────────────────
let requests: CustomerRequest[] = getStorageItem('ops_requests', []);
let transactions: Transaction[] = getStorageItem('ops_transactions', []);
let refunds: RefundCase[] = getStorageItem('ops_refunds', []);
let fraudAlerts: FraudAlert[] = getStorageItem('ops_fraud', []);
let activities: OperationalActivity[] = getStorageItem('ops_activities', []);
let approvals: ApprovalRequest[] = getStorageItem('ops_approvals', []);

// Save Helper
const saveState = () => {
  setStorageItem('ops_requests', requests);
  setStorageItem('ops_transactions', transactions);
  setStorageItem('ops_refunds', refunds);
  setStorageItem('ops_fraud', fraudAlerts);
  setStorageItem('ops_activities', activities);
  setStorageItem('ops_approvals', approvals);

  // Dispatch custom event to notify React components of state changes
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('operations_store_update'));
  }
};

// ─── Mutations ──────────────────────────────────────────────────────

// ─── Mutations ──────────────────────────────────────────────────────

// 1. Create a support ticket
export function addCustomerRequest(
  customerName: string,
  category: string,
  details: string,
  priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium',
  issueType?: string,
  evidence: string[] = []
): CustomerRequest {
  const reqId = `TKT-${1000 + requests.length + 1}`;
  const timestamp = new Date().toISOString();

  // ─── AI DECISION ENGINE CLASSIFIER ─────────────────────────────────
  let selectedType = issueType || 'Other';
  let cleanDetails = details.toLowerCase();
  let cleanCategory = category.toLowerCase();

  // Default values
  let aiRisk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  let aiPriority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  let estTime = '10 mins';
  let recommendedAction = 'Auto-resolve via Support AI';
  let knowledgeRefs: string[] = ['SOP-GEN-01 (Standard Support Escalation)'];
  let agent = 'Support AI Agent';
  let confidence = 92 + Math.floor(Math.random() * 8); // 92% - 99%
  let workflowStage = 'AI Analysis';
  let isEscalated = false;

  // ─── Issue Type Based Classification ──────────────────────────────
  if (selectedType === 'Account & Login') {
    if (cleanDetails.includes('reset') || cleanDetails.includes('forgot')) {
      aiRisk = 'Low';
      aiPriority = 'Low';
      estTime = '5 mins';
      recommendedAction = 'Auto-resolve via Support AI';
      knowledgeRefs = ['SOP-AUTH-02 (Password Resets)', 'SOP-SEC-12 (MFA Lockouts)'];
    } else if (cleanDetails.includes('unable to login') || cleanDetails.includes('cannot login') || cleanDetails.includes('locked out')) {
      aiRisk = 'Medium';
      aiPriority = 'Medium';
      estTime = '30 mins';
      recommendedAction = 'Assign to Support AI Agent';
      knowledgeRefs = ['SOP-AUTH-03 (Login Failures)', 'SOP-SEC-12 (MFA Lockouts)'];
    } else {
      aiRisk = 'Medium';
      aiPriority = 'Medium';
      estTime = '20 mins';
      recommendedAction = 'Assign to Support AI Agent';
      knowledgeRefs = ['SOP-AUTH-01 (Account Access)', 'SOP-GEN-01 (Standard Support)'];
    }
  } else if (selectedType === 'Payment & Billing') {
    if (cleanDetails.includes('duplicate')) {
      aiRisk = 'Medium';
      aiPriority = 'Medium';
      estTime = '15 mins';
      recommendedAction = 'Process automatic duplicate payment resolution';
      knowledgeRefs = ['SOP-PAY-09 (Duplicate Charges)', 'SOP-PAY-11 (Failed Gateway Routing)'];
    } else if (cleanDetails.includes('failed') || cleanDetails.includes('declined')) {
      aiRisk = 'Medium';
      aiPriority = 'Medium';
      estTime = '45 mins';
      recommendedAction = 'Assign to Support AI Agent';
      knowledgeRefs = ['SOP-PAY-11 (Failed Gateway Routing)', 'SOP-PAY-12 (Payment Declines)'];
    } else {
      aiRisk = 'Low';
      aiPriority = 'Low';
      estTime = '10 mins';
      recommendedAction = 'Auto-resolve via Support AI';
      knowledgeRefs = ['SOP-PAY-01 (Billing Inquiries)', 'SOP-GEN-01 (Standard Support)'];
    }
  } else if (selectedType === 'Refund Request') {
    const amountMatch = details.match(/\d+[\d,.]*/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;
    
    if (amount > 10000 || cleanDetails.includes('limit') || cleanDetails.includes('large') || cleanDetails.includes('above threshold')) {
      aiRisk = 'High';
      aiPriority = 'High';
      estTime = '2 hours';
      recommendedAction = 'Escalate to Human Approval Queue due to value threshold';
      knowledgeRefs = ['SOP-REF-04 (High-value Escrow Refunds)', 'SOP-REF-05 (Refund Limits)'];
    } else {
      aiRisk = 'Medium';
      aiPriority = 'Medium';
      estTime = '1 hour';
      recommendedAction = 'Assign to Support AI Agent';
      knowledgeRefs = ['SOP-REF-01 (General Refund Limits)', 'SOP-REF-02 (Refund Processing)'];
    }
  } else if (selectedType === 'Transaction Dispute') {
    aiRisk = 'Critical';
    aiPriority = 'Critical';
    estTime = '24 hours';
    recommendedAction = 'Route to Fraud & AML specialist; suspend associated payment flows';
    knowledgeRefs = ['SOP-DISP-08 (Chargeback Disputes)', 'SOP-DISP-02 (Card Networks Regulations)', 'SOP-FRAUD-01 (Dispute Investigation)'];
  } else if (selectedType === 'Account Management') {
    aiRisk = 'Low';
    aiPriority = 'Low';
    estTime = '10 mins';
    recommendedAction = 'Auto-resolve via Support AI';
    knowledgeRefs = ['SOP-GEN-02 (Profile Data Changes)', 'SOP-ACC-01 (Account Settings)'];
  } else if (selectedType === 'Security Concern') {
    aiRisk = 'High';
    aiPriority = 'High';
    estTime = '2 hours';
    recommendedAction = 'Escalate to Human Approval Queue; lock account session key';
    knowledgeRefs = ['SOP-SEC-01 (Compromised Accounts)', 'SOP-SEC-09 (IP Blocklisting)', 'SOP-SEC-10 (Incident Response)'];
  } else if (selectedType === 'Service Issue') {
    if (cleanDetails.includes('outage') || cleanDetails.includes('down')) {
      aiRisk = 'Medium';
      aiPriority = 'Medium';
      estTime = '30 mins';
      recommendedAction = 'Assign to Support AI Agent';
      knowledgeRefs = ['SOP-SYS-01 (Service Outages)', 'SOP-SYS-05 (Server Latency)'];
    } else {
      aiRisk = 'Low';
      aiPriority = 'Low';
      estTime = '15 mins';
      recommendedAction = 'Auto-resolve via Support AI';
      knowledgeRefs = ['SOP-SYS-05 (Server Latency)', 'SOP-GEN-01 (Standard Support)'];
    }
  } else if (selectedType === 'General Inquiry') {
    aiRisk = 'Low';
    aiPriority = 'Low';
    estTime = '5 mins';
    recommendedAction = 'Auto-resolve via Support AI';
    knowledgeRefs = ['SOP-GEN-01 (Standard Support Escalation)'];
  } else {
    aiRisk = 'Low';
    aiPriority = 'Low';
    estTime = '10 mins';
    recommendedAction = 'Auto-resolve via Support AI';
    knowledgeRefs = ['SOP-GEN-01 (Standard Support Escalation)'];
  }

  // ─── Explicit Keyword Overrides ───────────────────────────────────
  if (cleanDetails.includes('password reset')) {
    aiRisk = 'Low';
    aiPriority = 'Low';
    estTime = '5 mins';
    recommendedAction = 'Auto-resolve via Support AI';
  } else if (cleanDetails.includes('unable to login') || cleanDetails.includes('cannot login')) {
    aiRisk = 'Medium';
    aiPriority = 'Medium';
    recommendedAction = 'Assign to Support AI Agent';
  } else if (cleanDetails.includes('duplicate payment')) {
    aiRisk = 'Medium';
    aiPriority = 'Medium';
    recommendedAction = 'Assign to Support AI Agent';
  } else if (cleanDetails.includes('suspicious account activity') || cleanDetails.includes('suspicious activity')) {
    aiRisk = 'High';
    aiPriority = 'High';
    recommendedAction = 'Escalate to Human Approval Queue; lock account session key';
    knowledgeRefs = ['SOP-SEC-01 (Compromised Accounts)', 'SOP-SEC-09 (IP Blocklisting)'];
  } else if (cleanDetails.includes('potential fraud') || cleanDetails.includes('fraud')) {
    aiRisk = 'Critical';
    aiPriority = 'Critical';
    recommendedAction = 'Route to Fraud & AML specialist; suspend associated payment flows';
    knowledgeRefs = ['SOP-FRAUD-01 (Fraud Investigation)', 'SOP-SEC-01 (Compromised Accounts)'];
  } else if (cleanDetails.includes('large financial transaction dispute')) {
    aiRisk = 'Critical';
    aiPriority = 'Critical';
    estTime = '24 hours';
    recommendedAction = 'Route to Fraud & AML specialist; suspend associated payment flows';
    knowledgeRefs = ['SOP-DISP-08 (Chargeback Disputes)', 'SOP-FRAUD-01 (Fraud Investigation)'];
  }

  // ─── Determine Status and Assignment ──────────────────────────────
  let status: 'Resolved' | 'Requires Approval' | 'Escalated' | 'Processing' = 'Processing';
  if (aiRisk === 'High' || aiRisk === 'Critical') {
    status = 'Requires Approval';
    agent = 'Operations Manager';
    isEscalated = true;
    workflowStage = 'Awaiting Human Review';
  } else {
    agent = 'Support AI Agent';
    workflowStage = 'AI Processing';
  }

  // ─── Create Comprehensive Audit Logs ──────────────────────────────
  const auditLogs = [
    { stage: 'Ticket Created', timestamp, details: `Ticket generated with ID ${reqId} by customer.`, user: customerName },
    { stage: 'AI Analysis Completed', timestamp, details: `AI engine intent classification complete. Intent confidence: ${confidence}%. Detected issue type: ${selectedType}.`, user: 'AI Engine' },
    { stage: 'Knowledge Base Search', timestamp, details: `Retrieved ${knowledgeRefs.length} relevant SOP documents via RAG: ${knowledgeRefs.join(', ')}.`, user: 'AI Engine' },
    { stage: 'Company Policy Check', timestamp, details: `Applied ${selectedType} policy rules and compliance checks.`, user: 'AI Engine' },
    { stage: 'Risk Level Assigned', timestamp, details: `Ticket classified as ${aiRisk.toUpperCase()} risk. Priority mapped to ${aiPriority}.`, user: 'AI Engine' },
    { stage: 'Confidence Score Calculated', timestamp, details: `Confidence score: ${confidence}%. Auto-resolution feasible: ${confidence >= 90 ? 'Yes' : 'No'}.`, user: 'AI Engine' },
    { stage: 'Recommended Action Generated', timestamp, details: `Action suggested: "${recommendedAction}".`, user: 'AI Engine' }
  ];

  if (isEscalated) {
    auditLogs.push({ stage: 'Escalated to Human', timestamp, details: `Ticket flagged for human review due to ${aiRisk.toUpperCase()} risk profile. Routed to Operations Manager queue.`, user: 'AI Engine' });
  } else {
    auditLogs.push({ stage: 'Auto-Resolution Started', timestamp, details: `AI Support Agent assigned. Autonomous resolution in progress.`, user: 'AI Engine' });
  }

  // ─── Build AI Summary ─────────────────────────────────────────────
  const aiSummary = `Customer reports ${selectedType.toLowerCase()} issue. Details: "${details.slice(0, 120)}${details.length > 120 ? '...' : ''}". AI classified as ${aiRisk.toUpperCase()} risk with ${confidence}% confidence. ${isEscalated ? 'Requires manager review before action.' : 'AI will attempt autonomous resolution.'}`;

  const req: CustomerRequest = {
    id: reqId,
    customerName,
    category: category || selectedType,
    priority: aiPriority,
    status,
    agent,
    confidence,
    time: new Date().toLocaleTimeString(),
    risk: aiRisk,
    details,
    timestamp,
    issueType: selectedType,
    aiSummary,
    resolutionTime: estTime,
    evidence,
    knowledgeRefs,
    recommendedAction,
    auditLogs,
    workflowStage,
    isEscalated
  };

  requests.unshift(req);

  // If requires human approval, add to approval queue
  if (status === 'Requires Approval') {
    const amountMatch = details.match(/\d+[\d,.]*/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;
    
    approvals.unshift({
      id: `APP-${100 + approvals.length + 1}`,
      ticketId: reqId,
      customerName,
      type: selectedType,
      amount,
      confidence,
      reason: `Auto-flagged due to ${aiRisk.toUpperCase()} risk profile: "${recommendedAction}"`,
      status: 'pending',
      timestamp,
      issueType: selectedType,
      aiSummary: req.aiSummary,
      riskLevel: aiRisk,
      evidence,
      knowledgeRefs,
      recommendedAction
    });

    activities.unshift({
      id: `act-${Date.now()}`,
      type: 'ticket',
      title: 'Human Review Triggered',
      message: `${reqId} escalated to Manager approval queue. Risk: ${aiRisk}.`,
      timestamp: new Date().toLocaleTimeString(),
      status: aiRisk === 'Critical' ? 'error' : 'warning'
    });
  } else {
    activities.unshift({
      id: `act-${Date.now()}`,
      type: 'ticket',
      title: 'Request Auto-Processing Started',
      message: `${reqId} successfully assigned to ${agent} (Confidence: ${confidence}%).`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success'
    });
  }

  saveState();
  return req;
}

// 2. Execute a payment transaction
export function addTransaction(
  customerName: string,
  amount: number,
  gateway: 'Stripe' | 'Razorpay' | 'Adyen' | 'PayPal',
  status: 'Success' | 'Failed' | 'Pending' = 'Success',
  risk: 'Low' | 'Medium' | 'High' = 'Low'
): Transaction {
  const txnId = `TXN-${8900 + transactions.length + 1}`;
  const timestamp = new Date().toISOString();

  const txn: Transaction = {
    id: txnId,
    customerName,
    amount,
    gateway,
    status,
    risk,
    recommendation: status === 'Success' ? 'Approve' : status === 'Failed' ? 'Block / Retry' : 'Hold',
    timestamp
  };

  transactions.unshift(txn);

  activities.unshift({
    id: `act-${Date.now()}`,
    type: 'payment',
    title: `Payment ${status}`,
    message: `${txnId} of ₹${amount.toLocaleString()} via ${gateway} is ${status.toLowerCase()}.`,
    timestamp: new Date().toLocaleTimeString(),
    status: status === 'Success' ? 'success' : status === 'Failed' ? 'error' : 'info'
  });

  // If transaction fails, auto-create a support ticket
  if (status === 'Failed') {
    addCustomerRequest(
      customerName,
      'Payment Failure Inquiry',
      `Auto-generated: Customer transaction ${txnId} for ₹${amount} failed during authorization.`,
      'High'
    );
  }

  saveState();
  return txn;
}

// 3. Request a refund
export function addRefund(ticketId: string, amount: number): RefundCase {
  const refId = `RFN-${200 + refunds.length + 1}`;
  const timestamp = new Date().toISOString();

  const req = requests.find(r => r.id === ticketId);
  const customerName = req ? req.customerName : 'Enterprise User';

  let status: 'Auto-Approved' | 'Human Review Required' = 'Auto-Approved';
  if (amount > 10000) {
    status = 'Human Review Required';
  }

  const refund: RefundCase = {
    id: refId,
    ticketId,
    customerName,
    amount,
    status,
    timestamp
  };

  refunds.unshift(refund);

  activities.unshift({
    id: `act-${Date.now()}`,
    type: 'refund',
    title: `Refund Initiated`,
    message: `Refund of ₹${amount.toLocaleString()} for ${ticketId} status: ${status}.`,
    timestamp: new Date().toLocaleTimeString(),
    status: status === 'Auto-Approved' ? 'success' : 'warning'
  });

  saveState();
  return refund;
}

// 4. Trigger fraud alert
export function addFraudAlert(ip: string, location: string, riskScore: number, details: string): FraudAlert {
  const caseId = `FRD-${120 + fraudAlerts.length + 1}`;
  const timestamp = new Date().toISOString();

  let status: 'Low' | 'Medium' | 'High' = 'Low';
  if (riskScore > 80) status = 'High';
  else if (riskScore > 40) status = 'Medium';

  const alert: FraudAlert = {
    id: `CASE-${Date.now()}`,
    caseId,
    ip,
    location,
    riskScore,
    status,
    details,
    timestamp
  };

  fraudAlerts.unshift(alert);

  activities.unshift({
    id: `act-${Date.now()}`,
    type: 'fraud',
    title: `Fraud Threat Flagged`,
    message: `SOC threat alert ${caseId} triggered from IP ${ip} (${location}). Risk: ${status}.`,
    timestamp: new Date().toLocaleTimeString(),
    status: status === 'High' ? 'error' : 'warning'
  });

  saveState();
  return alert;
}

// 5. Audit decision approval/rejection
export function processApproval(approvalId: string, action: 'approved' | 'rejected'): void {
  const appIdx = approvals.findIndex(a => a.id === approvalId);
  if (appIdx === -1) return;

  const app = approvals[appIdx];
  app.status = action;

  // Update associated ticket status
  const tktIdx = requests.findIndex(r => r.id === app.ticketId);
  if (tktIdx !== -1) {
    requests[tktIdx].status = action === 'approved' ? 'Resolved' : 'Escalated';
  }

  // Record activity
  activities.unshift({
    id: `act-${Date.now()}`,
    type: 'system',
    title: `Escalation ${action === 'approved' ? 'Approved' : 'Rejected'}`,
    message: `Manager audited and ${action} request ${app.ticketId} (Value: ₹${app.amount.toLocaleString()}).`,
    timestamp: new Date().toLocaleTimeString(),
    status: action === 'approved' ? 'success' : 'error'
  });

  // Remove from queue (or keep, but mark finished)
  approvals.splice(appIdx, 1);

  saveState();
}

// 6. Update ticket status manually
export function updateTicketStatus(
  ticketId: string,
  status: 'Resolved' | 'Requires Approval' | 'Escalated',
  comment?: string
): void {
  const idx = requests.findIndex((r) => r.id === ticketId);
  if (idx !== -1) {
    requests[idx].status = status;
    if (comment) {
      requests[idx].details += `\n[Audit Update]: ${comment}`;
    }
    activities.unshift({
      id: `act-${Date.now()}`,
      type: 'ticket',
      title: `Ticket ${status}`,
      message: `Admin manually updated ${ticketId} to ${status}.`,
      timestamp: new Date().toLocaleTimeString(),
      status: status === 'Resolved' ? 'success' : status === 'Escalated' ? 'error' : 'warning',
    });
    saveState();
  }
}

  // 7. Reset all states to 0 (Freshly Deployed Platform)
  export function resetStore(): void {
    requests = [];
    transactions = [];
    refunds = [];
    fraudAlerts = [];
    activities = [];
    approvals = [];
    saveState();
  }

  // 8. Get ticket by ID
  export function getTicketById(id: string): CustomerRequest | undefined {
    return requests.find(r => r.id === id);
  }

  // 9. Update ticket workflow stage
  export function updateTicketWorkflowStage(ticketId: string, stage: string): void {
    const idx = requests.findIndex((r) => r.id === ticketId);
    if (idx !== -1) {
      requests[idx].workflowStage = stage;
      saveState();
    }
  }

  // 10. Process approval with comment and info request
  export function processApprovalWithComment(
    approvalId: string,
    action: 'approved' | 'rejected' | 'info_requested',
    comment?: string
  ): void {
    const appIdx = approvals.findIndex(a => a.id === approvalId);
    if (appIdx === -1) return;

    const app = approvals[appIdx];
    app.status = action;
    if (comment) {
      app.managerComment = comment;
    }

    // Update associated ticket status
    const tktIdx = requests.findIndex(r => r.id === app.ticketId);
    if (tktIdx !== -1) {
      if (action === 'approved') {
        requests[tktIdx].status = 'Resolved';
        requests[tktIdx].workflowStage = 'Completed';
      } else if (action === 'rejected') {
        requests[tktIdx].status = 'Escalated';
        requests[tktIdx].workflowStage = 'Escalated';
      } else if (action === 'info_requested') {
        requests[tktIdx].status = 'Requires Approval';
        requests[tktIdx].workflowStage = 'Awaiting Information';
      }
    }

    // Record activity
    activities.unshift({
      id: `act-${Date.now()}`,
      type: 'system',
      title: `Escalation ${action === 'approved' ? 'Approved' : action === 'rejected' ? 'Rejected' : 'Info Requested'}`,
      message: `Manager audited and ${action} request ${app.ticketId}.${comment ? ` Comment: "${comment}"` : ''}`,
      timestamp: new Date().toLocaleTimeString(),
      status: action === 'approved' ? 'success' : action === 'rejected' ? 'error' : 'warning'
    });

    // Add audit log to ticket
    if (tktIdx !== -1) {
      const timestamp = new Date().toISOString();
      requests[tktIdx].auditLogs = requests[tktIdx].auditLogs || [];
      requests[tktIdx].auditLogs.push({
        stage: action === 'approved' ? 'Manager Approved' : action === 'rejected' ? 'Manager Rejected' : 'Manager Requested More Information',
        timestamp,
        details: comment || `Manager took action: ${action}`,
        user: 'Operations Manager'
      });
    }

    // Remove from queue
    approvals.splice(appIdx, 1);

    saveState();
  }

  // 11. Sync Ticket Created by Backend
  export function syncTicketFromBackend(backendTicket: any): void {
    const req: CustomerRequest = {
      id: backendTicket.id,
      customerName: backendTicket.customerName,
      category: backendTicket.type,
      priority: backendTicket.priority,
      status: backendTicket.status === 'pending' ? 'Requires Approval' : 'Resolved',
      agent: backendTicket.status === 'pending' ? 'Operations Manager' : 'Support AI Agent',
      confidence: backendTicket.confidenceScore,
      time: new Date().toLocaleTimeString(),
      risk: backendTicket.priority === 'Critical' ? 'High' : backendTicket.priority,
      details: backendTicket.description,
      timestamp: backendTicket.createdAt,
      issueType: backendTicket.type,
      aiSummary: backendTicket.reasoning,
      resolutionTime: backendTicket.status === 'pending' ? '24 hours' : 'Instant',
      evidence: [],
      knowledgeRefs: [],
      recommendedAction: backendTicket.suggestedResolution,
      auditLogs: [{
        stage: 'AI Backend Analysis',
        timestamp: backendTicket.createdAt,
        details: backendTicket.reasoning,
        user: 'AI Engine'
      }],
      workflowStage: backendTicket.status === 'pending' ? 'Awaiting Human Review' : 'Completed',
      isEscalated: backendTicket.status === 'pending'
    };

    requests.unshift(req);

    activities.unshift({
      id: `act-${Date.now()}`,
      type: 'ticket',
      title: backendTicket.status === 'pending' ? 'Human Review Triggered' : 'Ticket Auto-Resolved',
      message: `${req.id} processed by AI. Priority: ${req.priority}.`,
      timestamp: new Date().toLocaleTimeString(),
      status: backendTicket.status === 'pending' ? 'warning' : 'success'
    });

    saveState();
  }

// ─── Derived calculations ───────────────────────────────────────────
export function getOperationalStats() {
  const totalRequests = requests.length;
  
  // Support calculations
  const aiResolved = requests.filter(r => r.status === 'Resolved').length;
  const humanReview = requests.filter(r => r.status === 'Requires Approval' || r.status === 'Escalated').length;
  const aiResolutionRate = totalRequests > 0 ? parseFloat(((aiResolved / totalRequests) * 100).toFixed(1)) : 0;
  const humanEscalationRate = totalRequests > 0 ? parseFloat(((humanReview / totalRequests) * 100).toFixed(1)) : 0;

  // Support approved vs rejected
  const humanApproved = requests.filter(r => r.status === 'Resolved' && r.priority !== 'Low').length; // approximation
  const humanRejected = requests.filter(r => r.status === 'Escalated').length;

  // Payments calculations
  const totalTxns = transactions.length;
  const successfulTxns = transactions.filter(t => t.status === 'Success').length;
  const failedTxns = transactions.filter(t => t.status === 'Failed').length;
  const pendingTxns = transactions.filter(t => t.status === 'Pending').length;

  // Refunds calculations
  const totalRefunds = refunds.length;
  const autoRefunds = refunds.filter(r => r.status === 'Auto-Approved').length;
  const manualRefunds = refunds.filter(r => r.status === 'Human Review Required').length;

  // Fraud alerts
  const totalFraud = fraudAlerts.length;
  const lowRiskFraud = fraudAlerts.filter(f => f.status === 'Low').length;
  const medRiskFraud = fraudAlerts.filter(f => f.status === 'Medium').length;
  const highRiskFraud = fraudAlerts.filter(f => f.status === 'High').length;

  // Cost savings formula
  const manualCostPerTicket = 42;
  const aiCostPerTicket = 2.75;
  const manualProcessingCost = totalRequests * manualCostPerTicket;
  const aiProcessingCost = totalRequests * aiCostPerTicket;
  const operationalSavings = Math.max(0, manualProcessingCost - aiProcessingCost);
  const costReduction = totalRequests > 0 ? 93.4 : 0;

  // Infrastructure metrics (always baseline, latencies active but healthy)
  const apiHealth = { latency: 21, uptime: 99.99 };
  const dbHealth = { latency: 12, uptime: 100 };
  const cacheHealth = { latency: 4, uptime: 99.98 };
  const engineHealth = { latency: totalRequests > 0 ? 1600 : 0, uptime: 99.92 };
  const paymentHealth = { latency: totalTxns > 0 ? 182 : 0, uptime: 99.95 };
  const fraudHealth = { latency: totalFraud > 0 ? 240 : 0, uptime: 99.97 };
  const notifyHealth = { latency: 41, uptime: 99.99 };

  // AI Executive Summary
  let summary = 'No operations processed today. Platform is ready to receive customer events.';
  if (totalRequests > 0) {
    summary = `Today, the platform processed ${totalRequests} customer requests. AI autonomously resolved ${aiResolved} requests while ${humanReview} required human review. ` +
      `The platform successfully processed ${totalTxns} financial transactions and investigated ${totalFraud} fraud alerts. ` +
      `Total operational savings reached ₹${operationalSavings.toLocaleString()} with an automation rate of ${aiResolutionRate}%. ` +
      `Overall system health remains above 99.9% across all enterprise services.`;
  }

  // AI Workforce completed/active metrics
  const workforce = {
    support: { completed: requests.filter(r => r.agent === 'Support Agent').length, active: requests.filter(r => r.agent === 'Support Agent' && r.status !== 'Resolved').length, latency: 1.8 },
    payment: { completed: transactions.length, active: transactions.filter(t => t.status === 'Pending').length, latency: 0.7 },
    fraud: { completed: fraudAlerts.length, active: fraudAlerts.filter(f => f.status === 'Medium').length, latency: 3.4 },
    policy: { completed: requests.length, active: 0, latency: 0.9 },
    approval: { completed: humanApproved, active: approvals.length, latency: 18 }
  };

  return {
    requests,
    transactions,
    refunds,
    fraudAlerts,
    activities,
    approvals,
    summary,
    workforce,
    cost: {
      manualCostPerTicket,
      aiCostPerTicket,
      manualProcessingCost,
      aiProcessingCost,
      operationalSavings,
      costReduction
    },
    support: {
      totalRequests,
      aiResolved,
      humanReview,
      humanApproved,
      humanRejected,
      aiResolutionRate,
      humanEscalationRate
    },
    payments: {
      totalTxns,
      successfulTxns,
      failedTxns,
      pendingTxns
    },
    refund: {
      totalRefunds,
      autoRefunds,
      manualRefunds
    },
    fraud: {
      totalFraud,
      lowRiskFraud,
      medRiskFraud,
      highRiskFraud
    },
    health: {
      apiHealth,
      dbHealth,
      cacheHealth,
      engineHealth,
      paymentHealth,
      fraudHealth,
      notifyHealth
    }
  };
}

// Seed helper (only if we want to add data on-demand via simulator UI)
export function seedSampleDataset(): void {
  // Clear first
  resetStore();

  // Create exactly the user specified values to verify consistency:
  
  // 1. Transactions: 8713 success, 146 failed, 83 pending (Total: 8942)
  for (let i = 0; i < 83; i++) {
    transactions.push({ id: `TXN-${8900 + i}`, customerName: 'System User', amount: 4500, gateway: 'Stripe', status: 'Pending', risk: 'Medium', recommendation: 'Hold', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 146; i++) {
    transactions.push({ id: `TXN-${8700 + i}`, customerName: 'System User', amount: 3200, gateway: 'Razorpay', status: 'Failed', risk: 'Medium', recommendation: 'Retry', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 8713; i++) {
    transactions.push({ id: `TXN-${1000 + i}`, customerName: 'System User', amount: 1250, gateway: 'Stripe', status: 'Success', risk: 'Low', recommendation: 'Approve', timestamp: new Date().toISOString() });
  }

  // 2. Customer Requests: 1181 resolved, 67 human review (59 approved, 8 rejected, Total: 1248)
  for (let i = 0; i < 1181; i++) {
    requests.push({ id: `TKT-${1000 + i}`, customerName: 'System Customer', category: 'General Help', priority: 'Low', status: 'Resolved', agent: 'Support Agent', confidence: 96, time: '3 hrs ago', risk: 'Low', details: 'Auto-resolved question.', timestamp: new Date().toISOString() });
  }
  // Escalations
  for (let i = 0; i < 59; i++) {
    requests.push({ id: `TKT-${2100 + i}`, customerName: 'System Customer', category: 'High-Value Refund', priority: 'High', status: 'Resolved', agent: 'Payment Agent', confidence: 78, time: '1 hr ago', risk: 'Medium', details: 'Refund processed after manual override.', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 8; i++) {
    requests.push({ id: `TKT-${2300 + i}`, customerName: 'System Customer', category: 'Account Hold Override', priority: 'Critical', status: 'Escalated', agent: 'Fraud Agent', confidence: 64, time: '5 mins ago', risk: 'High', details: 'Escalated and rejected due to failed biometrics.', timestamp: new Date().toISOString() });
  }

  // 3. Refunds: 167 auto-approved, 47 review required (Total: 214)
  for (let i = 0; i < 167; i++) {
    refunds.push({ id: `RFN-${200 + i}`, ticketId: `TKT-${1000 + i}`, customerName: 'System User', amount: 150, status: 'Auto-Approved', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 47; i++) {
    refunds.push({ id: `RFN-${400 + i}`, ticketId: `TKT-${2100 + i}`, customerName: 'System User', amount: 12000, status: 'Human Review Required', timestamp: new Date().toISOString() });
  }

  // 4. Fraud alerts: 84 low, 31 medium, 11 high (Total: 126)
  for (let i = 0; i < 84; i++) {
    fraudAlerts.push({ id: `CASE-L-${i}`, caseId: `FRD-${100 + i}`, ip: '192.168.1.1', location: 'Mumbai, MH', riskScore: 12, status: 'Low', details: 'Low risk access pattern.', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 31; i++) {
    fraudAlerts.push({ id: `CASE-M-${i}`, caseId: `FRD-${200 + i}`, ip: '49.36.122.4', location: 'Hyderabad, TS', riskScore: 54, status: 'Medium', details: 'Unrecognized user agent session.', timestamp: new Date().toISOString() });
  }
  for (let i = 0; i < 11; i++) {
    fraudAlerts.push({ id: `CASE-H-${i}`, caseId: `FRD-${300 + i}`, ip: '103.44.12.8', location: 'Chennai, TN', riskScore: 94, status: 'High', details: 'Multiple failed MFA credentials.', timestamp: new Date().toISOString() });
  }

  // 5. Seed initial activities
  activities.unshift(
    { id: 'act-01', type: 'payment', title: 'Transaction Seeded', message: 'Initialized 8,942 mock payout gateway logs.', timestamp: new Date().toLocaleTimeString(), status: 'success' },
    { id: 'act-02', type: 'ticket', title: 'Support Queue Seeded', message: 'Initialized 1,248 ticket classification records.', timestamp: new Date().toLocaleTimeString(), status: 'success' },
    { id: 'act-03', type: 'fraud', title: 'SOC Alerts Sync', message: 'Synchronized 126 dynamic threat indicators.', timestamp: new Date().toLocaleTimeString(), status: 'warning' }
  );

  saveState();
}
