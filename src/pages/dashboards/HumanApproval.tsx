import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getOperationalStats, processApprovalWithComment } from '../../lib/operationsStore';
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  BrainCircuit, 
  Sparkles, 
  User, 
  FileText, 
  BookOpen 
} from 'lucide-react';

interface ApprovalRequest {
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

const ConfidenceGauge = ({ value }: { value: number }) => {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center w-9 h-9 shrink-0">
      <svg className="w-9 h-9 transform -rotate-90">
        <circle 
          cx="18" cy="18" r={radius} 
          stroke="currentColor" 
          strokeWidth="2.5" 
          fill="transparent" 
          className="text-muted" 
        />
        <circle 
          cx="18" cy="18" r={radius} 
          stroke="currentColor" 
          strokeWidth="2.5" 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          className="text-purple-500" 
          strokeLinecap="round" 
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-white">{value}%</span>
    </div>
  );
};

export default function HumanApproval() {
  const [stats, setStats] = useState(() => getOperationalStats());
  const [queue, setQueue] = useState<ApprovalRequest[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch real approvals from backend
  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals');
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      console.error("Failed to fetch approvals", err);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleUpdate = () => setStats(getOperationalStats());
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, []);

  const handleAction = async (reqId: string, action: 'approved' | 'rejected' | 'info_requested') => {
    try {
      let backendAction = 'approve';
      if (action === 'rejected') backendAction = 'reject';

      if (action !== 'info_requested') {
        await fetch(`/api/approvals/${reqId}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: backendAction })
        });
      }

      const comment = comments[reqId];
      processApprovalWithComment(reqId, action, comment || undefined);
      
      let actionText = '';
      if (action === 'approved') actionText = 'Approved';
      if (action === 'rejected') actionText = 'Rejected';
      if (action === 'info_requested') actionText = 'Requested Info for';
      
      setSuccessMessage(`Successfully ${actionText.toLowerCase()} ticket`);
      
      // Update local queue immediately
      setQueue(prev => prev.filter(req => req.id !== reqId));

      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[reqId];
        return newComments;
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket status");
    }
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-500/15 text-red-400 border border-red-500/30';
      case 'High': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'Medium': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      case 'Low': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      default: return 'bg-muted text-gray-400 border border-border';
    }
  };

  return (
    <div className="min-h-screen text-white p-6 flex flex-col gap-6 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 text-sm font-semibold flex items-center gap-2 shadow-lg backdrop-blur-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Admin Approval Queue</h1>
        <p className="text-sm text-gray-400">
          Review and action escalated tickets flagged by the AI Decision Engine for human oversight.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Escalated</span>
            <span className="text-2xl font-bold font-mono text-white">{stats.support.humanReview}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Approved</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{stats.support.humanApproved}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Rejected</span>
            <span className="text-2xl font-bold font-mono text-red-400">{stats.support.humanRejected}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Pending Queue</span>
            <span className={cn(
              "text-2xl font-bold font-mono text-amber-400",
              queue.length > 0 && "animate-pulse"
            )}>
              {queue.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {queue.length > 0 ? (
            queue.map((req: ApprovalRequest) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-lg flex flex-col"
              >
                {/* Header */}
                <div className="p-5 border-b border-border/60 bg-background/40 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Badge variant="outline" className="font-mono text-[10px] bg-muted border-border w-fit text-gray-300">
                      {req.ticketId}
                    </Badge>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{req.issueType || req.type}</h3>
                  </div>
                  <Badge className={cn("shrink-0 uppercase text-[10px] tracking-wider", getRiskColor(req.riskLevel))}>
                    {req.riskLevel || 'Medium'} Risk
                  </Badge>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Customer</span>
                      <div className="flex items-center gap-2 text-sm text-gray-200">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{req.customerName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Transaction Value</span>
                      <span className="text-sm font-mono text-gray-200">
                        {req.amount > 0 ? `₹${req.amount.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-background/50 rounded-lg border border-border/50 flex gap-3 items-start">
                    <ConfidenceGauge value={req.confidence} />
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                        <BrainCircuit className="w-3.5 h-3.5" />
                        AI Analysis Summary
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {req.aiSummary || req.reason}
                      </p>
                    </div>
                  </div>

                  {req.recommendedAction && (
                    <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Recommended Action</span>
                        <span className="text-xs text-gray-200">{req.recommendedAction}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Evidence</span>
                      <div className="flex flex-wrap gap-1.5">
                        {req.evidence && req.evidence.length > 0 ? (
                          req.evidence.map((ev, i) => (
                            <Badge key={i} variant="outline" className="bg-background/50 border-border/60 text-xs text-gray-300 gap-1 rounded-md px-1.5 py-0.5 font-normal">
                              <FileText className="w-3 h-3 text-gray-500" />
                              {ev}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No evidence</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Knowledge Refs</span>
                      <div className="flex flex-wrap gap-1.5">
                        {req.knowledgeRefs && req.knowledgeRefs.length > 0 ? (
                          req.knowledgeRefs.map((ref, i) => (
                            <Badge key={i} variant="outline" className="bg-background/50 border-border/60 text-xs text-gray-300 gap-1 rounded-md px-1.5 py-0.5 font-normal">
                              <BookOpen className="w-3 h-3 text-gray-500" />
                              {ref}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No references</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <textarea
                      value={comments[req.id] || ''}
                      onChange={(e) => setComments(prev => ({ ...prev, [req.id]: e.target.value }))}
                      rows={2}
                      placeholder="Add review comments (optional)..."
                      className="w-full rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-colors"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/60 bg-background/30 flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAction(req.id, 'approved')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 transition-colors gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction(req.id, 'rejected')}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs h-9 transition-colors gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(req.id, 'info_requested')}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 border-none text-white text-xs h-9 transition-colors gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Request Info
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center bg-card/30"
            >
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 border border-border">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Approval Queue Clear</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                No tickets currently require human review. All escalated items have been processed.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
