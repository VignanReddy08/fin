import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ShieldCheck, Zap, BarChart3, Users, Lock, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">FinMatrix</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#agents" className="hover:text-white transition">AI Agents</a>
            <a href="#security" className="hover:text-white transition">Security</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-300">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              The Future of Financial Operations
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Autonomous FinOps <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">
                Powered by Multi-Agent AI
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Automate support, fraud detection, and payments with specialized AI agents while keeping humans in the loop for high-risk decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-8 text-base group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Abstract UI Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-2 shadow-2xl overflow-hidden"
          >
            <div className="aspect-[16/9] md:aspect-[21/9] rounded-lg bg-[#0A0A0A] border border-white/5 relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
               
               {/* Animated SVG Connections */}
               <div className="absolute inset-0 z-10 flex items-center justify-center">
                 <svg className="w-full h-full max-w-[800px] overflow-visible" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
                   {/* Center to Top-Left */}
                   <motion.path d="M 400 150 L 200 75" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none"
                     initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
                   {/* Center to Top-Right */}
                   <motion.path d="M 400 150 L 600 75" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none"
                     initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.2 }} />
                   {/* Center to Bottom-Left */}
                   <motion.path d="M 400 150 L 200 225" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none"
                     initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.4 }} />
                   {/* Center to Bottom-Right */}
                   <motion.path d="M 400 150 L 600 225" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none"
                     initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.1 }} />
                 </svg>
               </div>

               {/* HTML Nodes overlay */}
               <div className="absolute inset-0 z-20 pointer-events-none">
                 {/* Center Node */}
                 <motion.div 
                   className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black border border-primary/50 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                   animate={{ scale: [1, 1.05, 1] }}
                   transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                 >
                   <Bot className="w-8 h-8 text-primary" />
                 </motion.div>
                 <div className="absolute left-1/2 top-[calc(50%+40px)] -translate-x-1/2 text-xs text-primary font-mono bg-black/50 px-2 py-0.5 rounded border border-primary/20 backdrop-blur">AI Orchestrator</div>

                 {/* Top Left Node */}
                 <div className="absolute left-[calc(50%-200px)] md:left-[calc(50%-260px)] top-[calc(50%-75px)] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black border border-blue-500/50 rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                   <ShieldCheck className="w-5 h-5 text-blue-500" />
                 </div>
                 <div className="absolute left-[calc(50%-200px)] md:left-[calc(50%-260px)] top-[calc(50%-35px)] -translate-x-1/2 text-[10px] text-blue-400 font-mono bg-black/50 px-2 py-0.5 rounded border border-blue-500/20 backdrop-blur">Fraud Ops</div>

                 {/* Top Right Node */}
                 <div className="absolute left-[calc(50%+200px)] md:left-[calc(50%+260px)] top-[calc(50%-75px)] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black border border-emerald-500/50 rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                   <Users className="w-5 h-5 text-emerald-500" />
                 </div>
                 <div className="absolute left-[calc(50%+200px)] md:left-[calc(50%+260px)] top-[calc(50%-35px)] -translate-x-1/2 text-[10px] text-emerald-400 font-mono bg-black/50 px-2 py-0.5 rounded border border-emerald-500/20 backdrop-blur">Support Agent</div>

                 {/* Bottom Left Node */}
                 <div className="absolute left-[calc(50%-200px)] md:left-[calc(50%-260px)] top-[calc(50%+75px)] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black border border-amber-500/50 rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                   <BarChart3 className="w-5 h-5 text-amber-500" />
                 </div>
                 <div className="absolute left-[calc(50%-200px)] md:left-[calc(50%-260px)] top-[calc(50%+115px)] -translate-x-1/2 text-[10px] text-amber-400 font-mono bg-black/50 px-2 py-0.5 rounded border border-amber-500/20 backdrop-blur">Analytics Core</div>

                 {/* Bottom Right Node */}
                 <div className="absolute left-[calc(50%+200px)] md:left-[calc(50%+260px)] top-[calc(50%+75px)] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black border border-purple-500/50 rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                   <Lock className="w-5 h-5 text-purple-500" />
                 </div>
                 <div className="absolute left-[calc(50%+200px)] md:left-[calc(50%+260px)] top-[calc(50%+115px)] -translate-x-1/2 text-[10px] text-purple-400 font-mono bg-black/50 px-2 py-0.5 rounded border border-purple-500/20 backdrop-blur">Compliance AI</div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Capabilities</h2>
            <p className="text-gray-400">Everything you need to scale financial operations securely.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Human-in-the-Loop", desc: "AI handles the routine. High-risk operations are automatically escalated for human approval." },
              { icon: ShieldCheck, title: "Real-time Fraud Ops", desc: "Multi-agent behavioral analysis detecting anomalies in milliseconds with full explainability." },
              { icon: BarChart3, title: "Actionable Analytics", desc: "Live operational metrics, cost savings, and AI performance tracked in beautiful dashboards." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-card/50 hover:bg-card transition-colors">
                <f.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="py-24 bg-background border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Multi-Agent Architecture</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our platform deploys specialized AI agents working in tandem to handle complex financial workflows.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-1">Customer Support Agent</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">Handles 80% of level 1 and 2 queries instantly, integrated directly into your knowledge base.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-1">Fraud Detection Agent</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">Monitors transaction patterns in real-time, escalating only the most nuanced cases to your risk team.</p>
                </div>
              </div>
            </div>
            <div className="bg-card/30 p-8 rounded-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="bg-background/80 backdrop-blur border border-white/10 p-4 rounded-lg flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Agent Network Syncing...</p>
                    <p className="text-xs text-gray-500">Latency: 12ms</p>
                  </div>
                </div>
                <div className="bg-background/80 backdrop-blur border border-white/10 p-4 rounded-lg flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Risk Model Inference</p>
                    <p className="text-xs text-gray-500">Confidence: 99.8%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-card/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Lock className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Bank-Grade Security</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            FinMatrix operates a state-of-the-art secure infrastructure designed to protect sensitive financial operations and client data.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {['SOC 2 Type II Certified', 'AES-256 Encryption', 'Zero-Trust Architecture', 'Real-time Audit Logs'].map((feature, i) => (
              <div key={i} className="bg-background p-6 rounded-xl border border-white/5 flex flex-col items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-500/70" />
                <span className="text-sm font-medium text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Bot className="h-5 w-5 text-gray-400" />
            <span className="font-semibold text-gray-300">FinMatrix</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition">Terms</a>
            <a href="#" className="hover:text-gray-300 transition">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
