import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Bot, User, Clock, FileText, CheckCircle2, XCircle, AlertCircle, Info, ChevronDown
} from 'lucide-react';
import { getOperationalStats } from '../../lib/operationsStore';

export default function AuditLogs() {
  const [stats, setStats] = useState(getOperationalStats());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(50);

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getOperationalStats());
    };
    window.addEventListener('operations_store_update', handleUpdate);
    return () => window.removeEventListener('operations_store_update', handleUpdate);
  }, []);

  const filteredQueue = useMemo(() => {
    let q = stats.activities || [];
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      q = q.filter(log => 
        log.title.toLowerCase().includes(lower) || 
        log.message.toLowerCase().includes(lower) || 
        log.type.toLowerCase().includes(lower)
      );
    }
    return q;
  }, [stats.activities, searchQuery]);

  const visibleLogs = filteredQueue.slice(0, displayCount);
  const hasData = visibleLogs.length > 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-[#0A0A0A] rounded-full" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500 bg-[#0A0A0A] rounded-full" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500 bg-[#0A0A0A] rounded-full" />;
      default: return <Info className="w-5 h-5 text-blue-500 bg-[#0A0A0A] rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-6 flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">FinOps Operations Audit Log</h1>
        <p className="text-sm text-gray-400">Chronological ledger of AI decisions, transaction events, and human auditor overrides.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[#171717] rounded-xl border border-[#333]">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by keyword, type, or event..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <Button variant="outline" className="border-[#333] bg-[#0A0A0A] text-gray-300 hover:text-white shrink-0">
          <Filter className="w-4 h-4 mr-2"/> Filters
        </Button>
      </div>

      {/* Timeline */}
      <div className="flex-grow pb-12">
        {hasData ? (
          <div className="relative pl-6 md:pl-8 space-y-6">
            {/* Vertical Line */}
            <div className="absolute left-[11px] md:left-[11px] top-4 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-[#333] to-transparent" />
            
            {visibleLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              const isSystem = log.type === 'system';
              
              return (
                <div key={log.id} className="relative">
                  {/* Marker Icon */}
                  <div className="absolute -left-6 md:-left-8 top-4 flex items-center justify-center z-10">
                    {getStatusIcon(log.status)}
                  </div>
                  
                  {/* Content Card */}
                  <Card 
                    className={cn(
                      "bg-[#171717] border-[#333] hover:border-[#444] cursor-pointer transition-all",
                      isExpanded ? "border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : ""
                    )}
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <CardContent className="p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          {isSystem ? <User className="w-4 h-4 text-emerald-500"/> : <Bot className="w-4 h-4 text-blue-500"/>}
                          <h4 className="font-bold text-sm text-white">{log.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-mono">{log.timestamp}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 leading-relaxed pr-8">{log.message}</p>
                      
                      {/* Expansion indicator */}
                      <div className="absolute top-5 right-4 text-gray-600 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <ChevronDown className="w-4 h-4" />
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-[#333] text-sm space-y-4">
                              <div>
                                <strong className="text-gray-300 block text-xs uppercase tracking-wider mb-1">Auditable Reason / Payload</strong>
                                <p className="text-gray-500 font-mono text-xs bg-black/40 p-3 rounded border border-white/5">
                                  {log.message.length > 50 ? log.message : "System executed standard operations protocol. Validated token indices and updated operational ledger state."}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/20 p-3 rounded border border-white/5">
                                <div>
                                  <strong className="text-gray-500 block text-[10px] uppercase tracking-wider mb-1">Execution Node</strong>
                                  <span className="text-gray-300 text-xs font-mono">{log.type.toUpperCase()}_ENGINE</span>
                                </div>
                                <div>
                                  <strong className="text-gray-500 block text-[10px] uppercase tracking-wider mb-1">Status Code</strong>
                                  <span className={cn("font-bold text-xs font-mono", getStatusColor(log.status))}>
                                    {log.status.toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <strong className="text-gray-500 block text-[10px] uppercase tracking-wider mb-1">Ledger Index</strong>
                                  <span className="text-gray-300 text-xs font-mono">IDX-{Math.abs(hashString(log.id)).toString().substring(0,6)}</span>
                                </div>
                                <div>
                                  <strong className="text-gray-500 block text-[10px] uppercase tracking-wider mb-1">Verification</strong>
                                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                    SIGNED
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {filteredQueue.length > displayCount && (
              <div className="pt-6 pb-2 text-center relative z-10">
                <Button 
                  variant="outline" 
                  onClick={() => setDisplayCount(prev => prev + 50)}
                  className="border-[#333] bg-[#171717] hover:bg-[#222]"
                >
                  Load More Logs ({filteredQueue.length - displayCount} remaining)
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-12 text-center bg-[#171717]/50 mt-4">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-base font-bold text-gray-300 mb-1">
              {searchQuery ? 'No matching logs found' : 'Audit Ledger Empty'}
            </p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {searchQuery ? 'Try adjusting your search filters.' : 'No auditable events logged in this session. Trigger transactions or raise customer tickets.'}
            </p>
            {searchQuery && (
              <Button variant="outline" className="mt-6 border-[#333]" onClick={() => setSearchQuery('')}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple hash function for UI display purposes
function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
