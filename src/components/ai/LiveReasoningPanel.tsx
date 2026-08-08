import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity, ShieldCheck, Database, Search, FileText, Bot, Scale, BrainCircuit, UserCheck, Zap, Bell, Server, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LiveReasoningPanelProps {
  ticketId: string;
}

const stepsConfig = [
  { id: 1, name: 'Ticket Received', time: 100, icon: FileText },
  { id: 2, name: 'Understanding Customer Intent', time: 250, icon: BrainCircuit },
  { id: 3, name: 'Retrieving CRM Information', time: 340, icon: Database },
  { id: 4, name: 'Checking Payment History', time: 180, icon: Activity },
  { id: 5, name: 'Running Fraud Analysis', time: 520, icon: ShieldCheck },
  { id: 6, name: 'Searching Policies via RAG', time: 410, icon: Search },
  { id: 7, name: 'Applying Business Rules', time: 90, icon: Scale },
  { id: 8, name: 'Self-Validation Check', time: 150, icon: Check },
  { id: 9, name: 'Generating Recommendation', time: 380, icon: Bot },
  { id: 10, name: 'Human Approval Check', time: 50, icon: UserCheck },
  { id: 11, name: 'Executing Action', time: 200, icon: Zap },
  { id: 12, name: 'Sending Notification', time: 120, icon: Bell },
  { id: 13, name: 'Recording Audit', time: 80, icon: Server },
];

export default function LiveReasoningPanel({ ticketId }: LiveReasoningPanelProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (activeStepIndex < stepsConfig.length) {
      const step = stepsConfig[activeStepIndex];
      const timer = setTimeout(() => {
        setActiveStepIndex(prev => prev + 1);
      }, step.time + 300); // Add a small buffer for animation
      return () => clearTimeout(timer);
    } else {
      setCompleted(true);
    }
  }, [activeStepIndex]);

  const totalTime = stepsConfig.reduce((acc, curr) => acc + curr.time, 0);

  return (
    <Card className="w-full bg-card/80 backdrop-blur-md border-border">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            Live Reasoning Trace
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-xs">Total Execution</span>
              <span className="font-mono text-primary">{completed ? `${totalTime}ms` : 'Running...'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-xs">Overall Confidence</span>
              <span className="font-mono text-success">96.4%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 overflow-hidden">
        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          <AnimatePresence>
            {stepsConfig.slice(0, activeStepIndex + 1).map((step, index) => {
              const isCurrent = index === activeStepIndex && !completed;
              const isPast = index < activeStepIndex;
              const Icon = step.icon;
              const conf = Math.floor(85 + Math.random() * 14) + (Math.random() > 0.5 ? 0.5 : 0);

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-card z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative">
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <Icon className={cn("w-4 h-4", isPast ? "text-success" : isCurrent ? "text-primary" : "text-muted")} />
                  </div>
                  
                  <div className={cn(
                    "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border bg-background/50",
                    isCurrent ? "border-primary/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]" : "border-border/50"
                  )}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={cn("text-sm font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                        {step.name}
                      </h4>
                      <span className="text-xs font-mono text-muted-foreground">{step.time}ms</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {isPast ? 'Completed' : 'Processing...'}
                      </span>
                      {isPast && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">Conf:</span>
                          <span className="text-xs font-mono text-success">{conf}%</span>
                        </div>
                      )}
                    </div>
                    {isCurrent && (
                       <div className="w-full bg-muted/50 rounded-full h-1 mt-2 overflow-hidden">
                          <motion.div
                            className="bg-primary h-full"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: step.time / 1000, ease: "linear" }}
                          />
                       </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
