import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Building2, Server, Key, Cpu, Laptop } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface Workspace {
  id: string;
  name: string;
  environment: 'Production' | 'Staging' | 'Sandbox' | 'Demo';
  role: string;
  permissions: string[];
  lastLogin: string;
  nodeCount: number;
}

interface Props {
  userFullName: string;
  userRole: string;
  onSelect: (workspace: Workspace) => void;
}

const WORKSPACES: Workspace[] = [
  {
    id: 'ws-prod',
    name: 'AgenticFi Enterprise Core',
    environment: 'Production',
    role: 'Administrator',
    permissions: ['all_access', 'write_transfer', 'configure_agents'],
    lastLogin: '2 hours ago',
    nodeCount: 14,
  },
  {
    id: 'ws-staging',
    name: 'AgenticFi Staging Environment',
    environment: 'Staging',
    role: 'Administrator',
    permissions: ['all_access', 'read_only_payments'],
    lastLogin: '1 day ago',
    nodeCount: 8,
  },
  {
    id: 'ws-sandbox',
    name: 'AgenticFi API Sandbox',
    environment: 'Sandbox',
    role: 'Developer',
    permissions: ['read_write_sandbox', 'test_payments'],
    lastLogin: '3 days ago',
    nodeCount: 5,
  },
  {
    id: 'ws-demo',
    name: 'Interactive Retail Demo VM',
    environment: 'Demo',
    role: 'Viewer',
    permissions: ['read_only_access'],
    lastLogin: 'Never',
    nodeCount: 2,
  },
];

export default function WorkspaceSelection({ userFullName, userRole, onSelect }: Props) {
  const [selectedId, setSelectedId] = useState<string>('ws-prod');

  const envColors = {
    Production: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Staging: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Sandbox: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Demo: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 w-full max-w-lg mx-auto"
    >
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white">Select Workspace Environment</h2>
        <p className="text-sm text-gray-400">
          Welcome back, {userFullName}. Choose your session context below.
        </p>
      </div>

      <div className="grid gap-3.5">
        {WORKSPACES.map((ws) => {
          const isSelected = selectedId === ws.id;

          return (
            <motion.div
              key={ws.id}
              onClick={() => setSelectedId(ws.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-lg scale-[1.01]'
                  : 'border-border bg-card/40 hover:bg-card/70 hover:border-white/10'
              }`}
              whileTap={{ scale: 0.99 }}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 h-16 w-16 bg-primary/10 rounded-bl-full flex items-center justify-center pointer-events-none">
                  <Shield className="h-4 w-4 text-primary absolute top-3 right-3" />
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${
                  isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-gray-400'
                }`}>
                  {ws.environment === 'Production' ? (
                    <Building2 className="h-5 w-5" />
                  ) : ws.environment === 'Staging' ? (
                    <Server className="h-5 w-5" />
                  ) : (
                    <Cpu className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{ws.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${envColors[ws.environment]}`}>
                      {ws.environment}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      Role: {ws.role}
                    </span>
                    <span className="flex items-center gap-1">
                      <Laptop className="h-3 w-3" />
                      Nodes: {ws.nodeCount}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Permissions: {ws.permissions.join(', ').replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => {
            const target = WORKSPACES.find((w) => w.id === selectedId);
            if (target) onSelect(target);
          }}
          className="w-full h-11 rounded-lg bg-primary hover:bg-primary/95 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group"
        >
          Access Workspace
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
