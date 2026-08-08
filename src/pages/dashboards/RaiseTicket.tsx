import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { syncTicketFromBackend } from '../../lib/operationsStore';
import { getCurrentUser } from '../../lib/authStore';
import { useNavigate } from 'react-router-dom';
import {
  Lock, CreditCard, RotateCcw, AlertTriangle, UserCog, ShieldAlert,
  Wrench, HelpCircle, Paperclip, Upload, FileSearch, ScanText,
  Brain, Target, Database, Scale, Gauge, Sparkles, TicketCheck,
  CheckCircle2, Circle, Send, Loader2, FileText, Image as ImageIcon,
  File as FileIcon, X, Clock, Check
} from 'lucide-react';

interface CustomerRequest {
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

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
}

const ISSUE_TYPES = [
  { id: 'Account & Login', label: 'Account & Login', icon: Lock, desc: 'Login issues, password resets, MFA unlock request' },
  { id: 'Payment & Billing', label: 'Payment & Billing', icon: CreditCard, desc: 'Billing questions, duplicate charges, payment errors' },
  { id: 'Refund Request', label: 'Refund Request', icon: RotateCcw, desc: 'Request refund for payment transaction' },
  { id: 'Transaction Dispute', label: 'Transaction Dispute', icon: AlertTriangle, desc: 'Unauthorized charges, disputed payouts' },
  { id: 'Account Management', label: 'Account Management', icon: UserCog, desc: 'Profile updates, data requests' },
  { id: 'Security Concern', label: 'Security Concern', icon: ShieldAlert, desc: 'Suspicious login, compromised account details' },
  { id: 'Service Issue', label: 'Service Issue', icon: Wrench, desc: 'API latency, system outages, bug reports' },
  { id: 'General Inquiry', label: 'General Inquiry', icon: HelpCircle, desc: 'General product questions & assistance' },
  { id: 'Other', label: 'Other', icon: Paperclip, desc: 'Other issues not covered above' }
];

const PIPELINE_STEPS = [
  { title: 'Uploading Documents', desc: 'Syncing evidence payload with secure cloud storage', icon: Upload },
  { title: 'Reading Uploaded Files', desc: 'Validating checksums and parsing file meta headers', icon: FileSearch },
  { title: 'Extracting Text (OCR)', desc: 'Running optical character recognition on uploaded images', icon: ScanText },
  { title: 'Understanding Customer Request', desc: 'Initiating Large Language Model semantic comprehension', icon: Brain },
  { title: 'Classifying Intent', desc: 'Mapping problem descriptions to support intent classifiers', icon: Target },
  { title: 'Searching Knowledge Base (RAG)', desc: 'Retrieving relevant vector database chunks and SOP references', icon: Database },
  { title: 'Checking Company Policies', desc: 'Applying financial regulations and refund limits rules', icon: Scale },
  { title: 'Calculating Confidence Score', desc: 'Assessing accuracy metrics for auto-resolution feasibility', icon: Gauge },
  { title: 'Calculating Risk Level', desc: 'Executing risk rating engine (Low, Medium, High, Critical)', icon: ShieldAlert },
  { title: 'Generating Recommended Action', desc: 'Synthesizing response and routing recommendations', icon: Sparkles },
  { title: 'Creating Ticket', desc: 'Finalizing database transaction records and audit timelines', icon: TicketCheck }
];

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function RaiseTicket() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [createdTicket, setCreatedTicket] = useState<CustomerRequest | null>(null);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);

  // Load draft on mount
  useEffect(() => {
    const savedType = localStorage.getItem('ticket_draft_type');
    const savedDesc = localStorage.getItem('ticket_draft_description');
    if (savedType) setIssueType(savedType);
    if (savedDesc) setDescription(savedDesc);
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (issueType || description) {
      localStorage.setItem('ticket_draft_type', issueType);
      localStorage.setItem('ticket_draft_description', description);
      setDraftSaved(true);
      const timer = setTimeout(() => setDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [issueType, description]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'txt'];
    const filteredFiles = newFiles.filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      return validExtensions.includes(ext);
    });

    const fileObjects: UploadedFile[] = filteredFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      name: f.name,
      size: f.size,
      type: f.type,
      progress: 0
    }));

    setFiles(prev => [...prev, ...fileObjects]);

    // Simulate upload progress
    fileObjects.forEach(fObj => {
      let currentProg = 0;
      const interval = setInterval(() => {
        currentProg += Math.floor(Math.random() * 15) + 15;
        if (currentProg >= 100) {
          currentProg = 100;
          clearInterval(interval);
        }
        setFiles(prev => prev.map(p => p.id === fObj.id ? { ...p, progress: currentProg } : p));
      }, 120);
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setCurrentStep(0);
    
    let tempStep = 0;
    const interval = setInterval(() => {
      if (tempStep < PIPELINE_STEPS.length - 2) {
        tempStep++;
        setCurrentStep(tempStep);
      }
    }, 500);

    try {
      const user = getCurrentUser();
      
      // Extract a potential amount from description for testing risk logic
      const amountMatch = description.match(/\$(\d+)/);
      const amount = amountMatch ? parseInt(amountMatch[1]) : 0;

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: user?.fullName || 'Anonymous User',
          type: issueType,
          amount: amount,
          description: description
        })
      });

      const data = await response.json();
      clearInterval(interval);
      setCurrentStep(PIPELINE_STEPS.length);

      setCreatedTicket({
        id: data.ticket.id,
        customerName: data.ticket.customerName,
        category: 'Support',
        priority: data.ticket.priority || 'Medium',
        status: data.autoResolved ? 'Resolved' : 'Requires Approval',
        agent: 'Gemini Ticket Agent',
        confidence: data.ticket.confidenceScore || 95,
        time: 'Just now',
        risk: data.ticket.priority === 'Critical' ? 'Critical' : (data.ticket.priority === 'High' ? 'High' : 'Low'),
        details: data.ticket.description,
        timestamp: new Date().toISOString(),
        issueType: data.ticket.type,
        recommendedAction: data.ticket.suggestedResolution,
        isEscalated: data.ticket.needsHumanApproval
      });

      // Synchronize the backend AI ticket into the frontend Dashboards
      syncTicketFromBackend(data.ticket);

      localStorage.removeItem('ticket_draft_type');
      localStorage.removeItem('ticket_draft_description');
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setIsSubmitting(false);
      alert("Failed to connect to the backend API.");
    }
  };

  const resetForm = () => {
    setIssueType('');
    setDescription('');
    setFiles([]);
    setIsSubmitting(false);
    setCurrentStep(0);
    setCreatedTicket(null);
  };

  const isIssueTypeReady = !!issueType;
  const isDescReady = description.trim().length >= 50;
  const isEvidenceReady = files.length > 0;
  const allFilesUploaded = files.every(f => f.progress === 100);
  
  const isReady = isIssueTypeReady && isDescReady && isEvidenceReady && allFilesUploaded;

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return ImageIcon;
    if (['pdf', 'docx', 'txt'].includes(ext || '')) return FileText;
    return FileIcon;
  };

  if (isSubmitting && createdTicket) {
    const isEscalated = createdTicket.risk === 'High' || createdTicket.risk === 'Critical';

    return (
      <div className="p-6 md:p-8 animate-in fade-in duration-500 w-full min-h-screen text-white font-sans flex flex-col items-center pt-16">
        <Card className="border-border bg-card/30 backdrop-blur-sm w-full max-w-2xl shadow-2xl relative overflow-hidden">
          <CardContent className="pt-8 px-8 pb-10 flex flex-col items-center">
            
            <div className={cn("rounded-full p-4 mb-6 border", 
              isEscalated ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"
            )}>
              {isEscalated ? 
                <ShieldAlert className="w-12 h-12 text-amber-500" /> : 
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              }
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {isEscalated ? "Escalation Required — Manager Review" : "Analysis & Classification Complete"}
            </h2>
            <Badge variant="outline" className="font-mono text-sm px-3 py-1 mb-8 border-border bg-background/50">
              {createdTicket.id}
            </Badge>

            <div className={cn("w-full p-4 rounded-xl mb-8 text-sm leading-relaxed border",
              isEscalated 
                ? "bg-amber-500/5 border-amber-500/20 text-amber-200"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-200"
            )}>
              {isEscalated 
                ? "Your request requires additional review by our operations team due to its sensitivity. A manager has been notified and will review your request as soon as possible. You will receive updates through your notifications."
                : "Your request is currently being processed by our AI Support Agent. You can monitor progress from the My Tickets page."
              }
            </div>

            <div className="w-full mb-8">
              <h3 className="text-sm font-semibold mb-4 text-gray-400">AI Decision Engine Parameters</h3>
              <div className="grid grid-cols-2 gap-4 p-5 bg-background/60 border border-border/60 rounded-xl">
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Assigned Agent</span>
                  <div className="flex items-center gap-2 text-sm">
                    <Brain className="w-4 h-4 text-primary" />
                    <span>{createdTicket.agent}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Confidence Level</span>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={cn("w-2 h-2 rounded-full", 
                      createdTicket.confidence > 90 ? "bg-emerald-500" :
                      createdTicket.confidence > 75 ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <span>{createdTicket.confidence}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Risk Rating</span>
                  <div>
                    <Badge variant="outline" className={cn("text-xs",
                      createdTicket.risk === 'Critical' ? "border-red-500 text-red-500 bg-red-500/10" :
                      createdTicket.risk === 'High' ? "border-amber-500 text-amber-500 bg-amber-500/10" :
                      createdTicket.risk === 'Medium' ? "border-blue-500 text-blue-500 bg-blue-500/10" :
                      "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                    )}>
                      {createdTicket.risk}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Auto-Assigned Priority</span>
                  <span className="text-sm">{createdTicket.priority}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Est. Resolution Time</span>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{createdTicket.resolutionTime || 'Under 5 mins'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Human Review Required</span>
                  <span className="text-sm">{createdTicket.isEscalated ? 'Yes' : 'No'}</span>
                </div>

                {createdTicket.recommendedAction && (
                  <div className="col-span-2 flex flex-col gap-1 mt-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Recommended Action</span>
                    <div className="font-mono text-xs text-primary bg-primary/5 border border-primary/10 p-2 rounded-lg">
                      {createdTicket.recommendedAction}
                    </div>
                  </div>
                )}

                {createdTicket.knowledgeRefs && createdTicket.knowledgeRefs.length > 0 && (
                  <div className="col-span-2 flex flex-col gap-2 mt-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Knowledge References</span>
                    <div className="flex flex-wrap gap-2">
                      {createdTicket.knowledgeRefs.map((ref, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] border-border text-gray-300 bg-background/50">
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            <div className="flex flex-row gap-4 w-full justify-center">
              <Button variant="outline" onClick={resetForm} className="border-border hover:bg-muted/50">
                Raise Another Ticket
              </Button>
              <Button onClick={() => navigate('/app/tickets')} className="bg-primary hover:bg-primary/90 text-white">
                Go to My Tickets
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitting && !createdTicket) {
    const progressPercent = (currentStep / PIPELINE_STEPS.length) * 100;

    return (
      <div className="p-6 md:p-8 animate-in fade-in duration-500 w-full min-h-screen text-white font-sans flex flex-col items-center pt-16">
        <Card className="border-border bg-card/30 backdrop-blur-sm w-full max-w-2xl shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 h-1 bg-muted w-full">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <CardContent className="pt-12 px-8 pb-10">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="relative mb-6">
                <Loader2 className="w-24 h-24 text-primary/20 animate-spin absolute -inset-4" />
                <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20 animate-pulse relative z-10">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">AI Decision Engine Processing</h2>
              <p className="text-gray-400 text-sm max-w-md">
                Analyzing your request, documents, and knowledge base to determine the optimal resolution path.
              </p>
            </div>

            <div className="max-w-md mx-auto border-l-2 border-border/60 pl-8 relative space-y-1 py-2">
              {PIPELINE_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx < currentStep;
                const isRunning = idx === currentStep;
                const isPending = idx > currentStep;

                return (
                  <div key={idx} className={cn("relative py-3 transition-opacity duration-300", 
                    isPending ? "opacity-30" : "opacity-100"
                  )}>
                    
                    <div className={cn("absolute -left-[43px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border flex items-center justify-center bg-card",
                      isCompleted && "bg-emerald-500/20 border-emerald-500",
                      isRunning && "bg-primary/20 border-primary animate-pulse",
                      isPending && "border-border/50"
                    )}>
                      {isCompleted && <Check className="w-3 h-3 text-emerald-400" />}
                      {isRunning && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                    </div>

                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <h4 className={cn("text-sm font-medium",
                          isCompleted && "text-emerald-400",
                          isRunning && "text-primary font-bold",
                          isPending && "text-gray-600"
                        )}>
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-gray-600 mt-0.5">{step.desc}</p>
                      </div>
                      <StepIcon className={cn("w-4 h-4 flex-shrink-0",
                        isCompleted && "text-emerald-400",
                        isRunning && "text-primary",
                        isPending && "text-gray-600"
                      )} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 w-full min-h-screen text-white font-sans max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Intelligent AI Support Intake</h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Describe your issue naturally. Our AI will classify intent, assess risk, and route your request automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border-border bg-card/30 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-background/20 pb-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0 text-[10px] border-primary text-primary font-bold">1</Badge>
                <div>
                  <CardTitle className="text-base font-semibold">Select Issue Type</CardTitle>
                  <CardDescription className="text-xs mt-1">Help our AI narrow down the context of your request.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ISSUE_TYPES.map((type, idx) => {
                  const Icon = type.icon;
                  const isSelected = issueType === type.id;
                  
                  return (
                    <motion.button
                      key={type.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIssueType(type.id)}
                      className={cn("text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-3",
                        isSelected 
                          ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(37,99,235,0.15)]" 
                          : "bg-background/40 border-border/60 hover:bg-muted/30 hover:border-border"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg inline-flex", isSelected ? "bg-primary/20 text-primary" : "bg-muted text-gray-400")}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white mb-1">{type.label}</div>
                        <div className="text-[10px] text-gray-500 leading-relaxed">{type.desc}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/30 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-background/20 pb-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0 text-[10px] border-primary text-primary font-bold">2</Badge>
                <div>
                  <CardTitle className="text-base font-semibold">Detailed Description</CardTitle>
                  <CardDescription className="text-xs mt-1">Provide comprehensive details for accurate AI resolution.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={10}
                placeholder="Describe your issue in as much detail as possible. Our AI will analyze your description together with your uploaded documents to understand your problem and determine the best resolution."
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none leading-relaxed"
              />
              
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-2">
                  {description.length >= 50 ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Minimum requirement met</span>
                  ) : (
                    <span className="text-gray-500">Minimum 50 characters ({description.length}/50)</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <AnimatePresence>
                    {draftSaved && (
                      <motion.span 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="text-gray-500 flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" /> Draft saved
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  <span className={description.length > 5000 ? "text-red-400" : "text-gray-400"}>
                    {description.length.toLocaleString()} / 5,000
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/30 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-background/20 pb-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0 text-[10px] border-primary text-primary font-bold">3</Badge>
                <div>
                  <CardTitle className="text-base font-semibold">Supporting Evidence</CardTitle>
                  <CardDescription className="text-xs mt-1">Upload screenshots, logs, or documents to expedite investigation.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4",
                  isDragActive 
                    ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(37,99,235,0.1)]" 
                    : "border-border/50 bg-background/20 hover:border-border hover:bg-muted/10"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                  onChange={handleFileInput}
                />
                
                <div className="p-4 bg-muted/40 rounded-2xl border border-border/60">
                  <Upload className={cn("w-8 h-8", isDragActive ? "text-primary" : "text-gray-400")} />
                </div>
                
                <div>
                  <div className="text-sm font-medium text-white mb-1">
                    {isDragActive ? "Drop files here to upload" : "Click or drag files to upload"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Supported formats: PDF, PNG, JPG, DOCX, TXT. Max 50MB per file.
                  </div>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {files.map(file => {
                    const FIcon = getFileIcon(file.name);
                    const isDone = file.progress === 100;

                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/40 relative overflow-hidden group">
                        
                        {!isDone && (
                          <div 
                            className="absolute left-0 bottom-0 h-0.5 bg-primary/50 transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        )}

                        <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                          <FIcon className="w-4 h-4 text-gray-300" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs text-white truncate pr-2">{file.name}</div>
                          <div className="text-[10px] text-gray-500 flex items-center justify-between mt-0.5">
                            <span>{formatSize(file.size)}</span>
                            {isDone ? (
                              <Badge variant="outline" className="h-4 px-1 py-0 text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Ready</Badge>
                            ) : (
                              <span className="text-primary">{file.progress}%</span>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                          className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-muted transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>

                      </div>
                    );
                  })}
                </div>
              )}

            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-border bg-card/30 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold">AI Readiness Check</CardTitle>
              </div>
              <CardDescription className="text-xs">All checks must pass before submission.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2.5">
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-border/40">
                  <motion.div animate={{ color: isIssueTypeReady ? '#34d399' : '#4b5563' }}>
                    {isIssueTypeReady ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </motion.div>
                  <span className={cn("text-xs", isIssueTypeReady ? "text-gray-200" : "text-gray-500")}>Issue Type Selected</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-border/40">
                  <motion.div animate={{ color: isDescReady ? '#34d399' : '#4b5563' }}>
                    {isDescReady ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </motion.div>
                  <span className={cn("text-xs", isDescReady ? "text-gray-200" : "text-gray-500")}>Description Completed</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-border/40">
                  <motion.div animate={{ color: isEvidenceReady ? '#34d399' : '#4b5563' }}>
                    {isEvidenceReady ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </motion.div>
                  <span className={cn("text-xs", isEvidenceReady ? "text-gray-200" : "text-gray-500")}>Supporting Evidence Uploaded</span>
                </div>

              </div>

              <div className="h-px bg-border/50 w-full my-4" />

              <div className="space-y-3">
                <Button 
                  onClick={handleSubmit} 
                  disabled={!isReady}
                  className={cn("w-full transition-all duration-300 relative", 
                    isReady 
                      ? "bg-primary hover:bg-primary/90 shadow-[0_4px_24px_rgba(37,99,235,0.3)] text-white" 
                      : "disabled:opacity-40 disabled:pointer-events-none bg-muted text-gray-500"
                  )}
                >
                  {isReady && <div className="absolute inset-0 rounded-md bg-primary/20 animate-pulse pointer-events-none" />}
                  <Send className="w-4 h-4 mr-2" /> Submit for AI Review
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/app/dashboard')}
                  className="w-full border-border hover:bg-muted/50 text-gray-400"
                >
                  Cancel
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
