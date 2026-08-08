import React from 'react';
import { Card } from '../../components/ui/card';
import { Network, Database, Brain, ArrowDown, Users, ShieldAlert, Cpu, Bot, CreditCard, MessageSquare, Workflow, Bell, BarChart3, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface NodeProps {
  id: string;
  title: string;
  tech: string;
  icon: any;
  delay?: number;
  glowColor?: string;
  isActive?: boolean;
}

const ArchNode = ({ title, tech, icon: Icon, delay = 0, glowColor = "rgba(59, 130, 246, 0.5)", isActive = true }: NodeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="relative z-10 w-48"
    >
      <Card className={cn(
        "bg-[#171717]/90 backdrop-blur-xl border border-[#333333] p-4 text-center relative overflow-hidden transition-all duration-300 hover:border-slate-500",
        isActive ? "shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "opacity-80"
      )}>
        {isActive && (
          <motion.div 
            className="absolute inset-0 z-0 opacity-20"
            animate={{ 
              background: [
                `radial-gradient(circle at 0% 0%, ${glowColor} 0%, transparent 50%)`,
                `radial-gradient(circle at 100% 100%, ${glowColor} 0%, transparent 50%)`,
                `radial-gradient(circle at 0% 0%, ${glowColor} 0%, transparent 50%)`,
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        )}
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-2 bg-[#262626] rounded-full mb-3 text-slate-300">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-white mb-1">{title}</h3>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 bg-[#0A0A0A] px-2 py-0.5 rounded-full border border-[#333333]">
            {tech}
          </span>
        </div>
      </Card>
    </motion.div>
  );
};

export default function AIArchitecture() {
  return (
    <div className="space-y-6 p-6 min-h-screen bg-[#0A0A0A] text-slate-200 overflow-hidden relative">
      <div className="flex flex-col gap-2 mb-12 relative z-20">
        <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-2">
          <Network className="w-8 h-8 text-indigo-500" />
          System Architecture & Data Flow
        </h1>
        <p className="text-slate-400">Agentic orchestration and microservices topology</p>
      </div>

      <div className="relative max-w-5xl mx-auto py-10 flex flex-col items-center min-h-[800px]">
        {/* Animated Data Packet */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa] z-20"
          animate={{
            top: ["10%", "30%", "30%", "50%", "70%", "90%"],
            left: ["50%", "50%", "25%", "50%", "50%", "50%"],
            opacity: [0, 1, 1, 1, 1, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.6, 0.8, 1]
          }}
        />

        {/* Level 1: Entry */}
        <div className="flex flex-col items-center mb-16 relative w-full">
          <ArchNode id="customer" title="Customer Request" tech="API Gateway" icon={Users} delay={0} glowColor="#10b981" />
          
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-blue-500/50 to-transparent">
             <span className="absolute top-1/2 left-4 text-[10px] text-slate-400 bg-[#0A0A0A] px-1 rounded border border-[#333333] whitespace-nowrap">REST / gRPC</span>
          </div>
        </div>

        {/* Level 2: Router */}
        <div className="flex flex-col items-center mb-16 relative w-full">
          <ArchNode id="understanding" title="Ticket Understanding" tech="Gemini 1.5 Pro" icon={Brain} delay={0.2} glowColor="#3b82f6" />
          
          {/* SVG Connecting lines for branching */}
          <svg className="absolute top-full left-0 w-full h-16 pointer-events-none" style={{ zIndex: 0 }}>
            <path d="M 500 0 C 500 30, 200 30, 200 64" fill="none" stroke="#333333" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 500 0 C 500 30, 400 30, 400 64" fill="none" stroke="#333333" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 500 0 C 500 30, 600 30, 600 64" fill="none" stroke="#333333" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 500 0 C 500 30, 800 30, 800 64" fill="none" stroke="#333333" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Level 3: Specialized Agents */}
        <div className="flex justify-between w-full max-w-4xl mb-16 relative">
          <div className="flex flex-col items-center">
             <ArchNode id="crm" title="CRM Agent" tech="Salesforce API" icon={MessageSquare} delay={0.4} />
          </div>
          <div className="flex flex-col items-center">
             <ArchNode id="payment" title="Payment Agent" tech="Stripe API" icon={CreditCard} delay={0.5} />
          </div>
          <div className="flex flex-col items-center">
             <ArchNode id="fraud" title="Fraud Agent" tech="Custom ML" icon={ShieldAlert} delay={0.6} glowColor="#f59e0b" />
          </div>
          <div className="flex flex-col items-center">
             <ArchNode id="rag" title="RAG Agent" tech="ChromaDB" icon={Database} delay={0.7} />
          </div>

          <svg className="absolute top-full left-0 w-full h-16 pointer-events-none" style={{ zIndex: 0 }}>
            <path d="M 112 0 C 112 30, 500 30, 500 64" fill="none" stroke="#333333" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 368 0 C 368 30, 500 30, 500 64" fill="none" stroke="#333333" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 624 0 C 624 30, 500 30, 500 64" fill="none" stroke="#333333" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 880 0 C 880 30, 500 30, 500 64" fill="none" stroke="#333333" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Level 4: Synthesis */}
        <div className="flex flex-col items-center mb-16 relative w-full">
          <ArchNode id="decision" title="Decision Agent" tech="Gemini 1.5 Pro" icon={Workflow} delay={0.9} glowColor="#8b5cf6" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
        </div>

        {/* Level 5: Validation */}
        <div className="flex flex-col items-center mb-16 relative w-full">
          <ArchNode id="validation" title="Self-Validation" tech="Policy Engine" icon={Fingerprint} delay={1.1} />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-blue-500/50 to-transparent">
             <span className="absolute top-1/2 left-4 text-[10px] text-amber-500 bg-[#0A0A0A] px-1 rounded border border-amber-500/30 whitespace-nowrap">Needs Review?</span>
          </div>
        </div>

        {/* Level 6: Human Loop & Audit */}
        <div className="flex justify-center gap-12 mb-16 relative w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 }}
            className="relative z-10"
          >
            <Card className="bg-[#171717]/90 backdrop-blur-xl border border-amber-500/50 p-4 text-center w-48 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <div className="p-2 bg-amber-500/20 rounded-full mb-3 text-amber-500 mx-auto w-max">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Human Approval</h3>
              <span className="text-[10px] uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                Conditional
              </span>
            </Card>
          </motion.div>

          <ArchNode id="audit" title="Audit Agent" tech="Event Sourcing" icon={ShieldAlert} delay={1.4} glowColor="#10b981" />
        </div>

        {/* Level 7: Final Services */}
        <div className="flex justify-center gap-12 relative w-full">
          <ArchNode id="notification" title="Notification Svc" tech="WebSocket / Email" icon={Bell} delay={1.6} />
          <ArchNode id="db" title="Enterprise DB" tech="PostgreSQL" icon={Database} delay={1.7} />
          <ArchNode id="analytics" title="Analytics Engine" tech="ClickHouse" icon={BarChart3} delay={1.8} />
        </div>
      </div>
    </div>
  );
}
