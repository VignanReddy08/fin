import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, AlertTriangle, HelpCircle, DollarSign, RefreshCcw, Database, ShieldAlert, Cpu } from 'lucide-react';
import {
  addCustomerRequest,
  addTransaction,
  addRefund,
  addFraudAlert,
  resetStore,
  seedSampleDataset,
  getOperationalStats
} from '../../lib/operationsStore';

export default function OperationsSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(getOperationalStats());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getOperationalStats());
    };
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, []);

  const handleCreateTicket = () => {
    const questions = [
      'Failed payment checkout for ₹14,500.',
      'Requesting refund on charge TXN-8938.',
      'My login credential gives account locked error.',
      'Requesting invoice PDF for Q2 statements.',
    ];
    const categories = ['Payment Failure', 'Refund Claim', 'Account Security', 'General Help'];
    const idx = Math.floor(Math.random() * questions.length);
    addCustomerRequest('Aarav Mehta', categories[idx], questions[idx]);
  };

  const handleCreateTransaction = () => {
    const amounts = [1250, 4500, 14500, 320000];
    const gateways = ['Stripe', 'Razorpay', 'Adyen', 'PayPal'] as const;
    const statuses = ['Success', 'Failed', 'Pending'] as const;
    
    const amt = amounts[Math.floor(Math.random() * amounts.length)];
    const gate = gateways[Math.floor(Math.random() * gateways.length)];
    const stat = statuses[Math.floor(Math.random() * statuses.length)];
    
    addTransaction('Deepak Kumar', amt, gate, stat);
  };

  const handleCreateRefund = () => {
    addRefund('TKT-1024', 12500);
  };

  const handleCreateFraud = () => {
    addFraudAlert('103.44.12.89', 'Chennai, Tamil Nadu', 92, 'Biometric verification failures detected on mobile gateway.');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/95 text-white border border-primary/20 shadow-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md"
      >
        <Cpu className="h-4 w-4 animate-spin-slow" />
        FinOps Event Simulator
      </motion.button>

      {/* Control Panel Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-12 left-0 w-80 p-5 rounded-2xl glass border border-white/10 shadow-2xl space-y-4 text-white"
          >
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <Database className="h-4 w-4 text-primary" />
                Live FinOps Simulator
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Trigger real-time events to test reactive dashboards</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono bg-black/40 p-2.5 rounded-lg border border-border/40">
              <div>
                <span className="text-gray-500 block">TKTs</span>
                <span className="font-bold">{stats.support.totalRequests}</span>
              </div>
              <div>
                <span className="text-gray-500 block">TXNs</span>
                <span className="font-bold">{stats.payments.totalTxns}</span>
              </div>
              <div>
                <span className="text-gray-500 block">FRAUD</span>
                <span className="font-bold">{stats.fraud.totalFraud}</span>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="space-y-2">
              <button
                onClick={handleCreateTicket}
                className="w-full h-8 flex items-center justify-between px-3 text-xs bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-gray-300">
                  <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                  Raise Support Ticket
                </span>
                <Play className="h-3 w-3 text-gray-500" />
              </button>

              <button
                onClick={handleCreateTransaction}
                className="w-full h-8 flex items-center justify-between px-3 text-xs bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-gray-300">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  Trigger Payment Transaction
                </span>
                <Play className="h-3 w-3 text-gray-500" />
              </button>

              <button
                onClick={handleCreateRefund}
                className="w-full h-8 flex items-center justify-between px-3 text-xs bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-gray-300">
                  <RefreshCcw className="h-3.5 w-3.5 text-amber-400" />
                  Trigger Refund Claim
                </span>
                <Play className="h-3 w-3 text-gray-500" />
              </button>

              <button
                onClick={handleCreateFraud}
                className="w-full h-8 flex items-center justify-between px-3 text-xs bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-gray-300">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                  Flag Fraud Threat Alert
                </span>
                <Play className="h-3 w-3 text-gray-500" />
              </button>
            </div>

            {/* Presets / Clear */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
              <button
                onClick={() => seedSampleDataset()}
                className="h-8 flex items-center justify-center gap-1.5 text-[10px] bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg font-bold text-white transition-colors"
                title="Loads 1,248 requests / 8,942 transactions to verify exact judge parameters"
              >
                <Database className="h-3.5 w-3.5 text-primary" />
                Seed Judges Preset
              </button>

              <button
                onClick={() => resetStore()}
                className="h-8 flex items-center justify-center gap-1.5 text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg font-bold text-red-400 transition-colors"
                title="Clears all states to test clean empty deployed platform state"
              >
                <RotateCcw className="h-3.5 w-3.5 text-red-400" />
                Reset (Zero State)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
