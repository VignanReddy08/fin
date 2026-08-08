import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ChevronDown, ChevronUp, FileText, AlertTriangle, ShieldCheck, Zap, Info, Database } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ExplainabilityPanelProps {
  recommendation: string;
  confidenceScore: number;
  category: string;
}

const CircleProgress = ({ value }: { value: number }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-16 h-16">
        <circle
          className="text-muted stroke-current"
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx="32"
          cy="32"
        />
        <motion.circle
          className={cn("stroke-current", value > 90 ? "text-success" : value > 75 ? "text-pending" : "text-destructive")}
          strokeWidth="4"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="32"
          cy="32"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-xs font-semibold">
        <span>{value}%</span>
      </div>
    </div>
  );
};

export default function ExplainabilityPanel({ recommendation, confidenceScore, category }: ExplainabilityPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  return (
    <Card className="w-full bg-card/80 backdrop-blur-md border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              AI Recommendation Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{category}</p>
          </div>
          <CircleProgress value={confidenceScore} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommendation Summary */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <h3 className="font-semibold text-primary mb-2">Final Recommendation</h3>
          <p className="text-sm text-foreground">{recommendation}</p>
          <ul className="mt-3 space-y-1">
            <li className="text-sm flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-success mt-0.5" />
              <span className="text-muted-foreground">Within acceptable risk thresholds (Risk Score: 12/100)</span>
            </li>
            <li className="text-sm flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-success mt-0.5" />
              <span className="text-muted-foreground">Policy matched: Refunds & Returns Sec 4.1</span>
            </li>
            <li className="text-sm flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-success mt-0.5" />
              <span className="text-muted-foreground">Customer lifetime value supports favorable resolution</span>
            </li>
          </ul>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {/* Section 1 */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggle('evidence')}
              className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Supporting Evidence</span>
              </div>
              {expanded === 'evidence' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {expanded === 'evidence' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-3 bg-background/50 border-t border-border"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm p-2 rounded bg-muted/20">
                      <span>Previous similar cases approved</span>
                      <Badge variant="outline">24 cases</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2 rounded bg-muted/20">
                      <span>Customer account age</span>
                      <Badge variant="outline">4.2 years</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2 rounded bg-muted/20">
                      <span>Recent fraud alerts</span>
                      <Badge variant="outline" className="text-success border-success/30 bg-success/10">0 found</Badge>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2 */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggle('policies')}
              className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Applied Policies & Rules</span>
              </div>
              {expanded === 'policies' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {expanded === 'policies' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-3 bg-background/50 border-t border-border"
                >
                  <div className="space-y-2">
                    <div className="p-2 border border-border/50 rounded flex items-start gap-2">
                      <FileText className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Standard Refund Policy v2.1</p>
                        <p className="text-xs text-muted-foreground mt-1">"Customers in good standing may receive up to $500 immediate credit while disputes are investigated."</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">Rule: Auto-Approve &lt; $100</Badge>
                      <Badge variant="secondary">Rule: VIP Tier Fast-Track</Badge>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 3 */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggle('rejected')}
              className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Rejected Alternatives</span>
              </div>
              {expanded === 'rejected' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {expanded === 'rejected' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-3 bg-background/50 border-t border-border"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-destructive line-through">Deny Request</p>
                      <p className="text-xs text-muted-foreground">Rejected because fraud score is low and customer is high-value. High risk of churn.</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-pending line-through">Manual Review Queue</p>
                      <p className="text-xs text-muted-foreground">Rejected because confidence score (98%) exceeds auto-resolve threshold (90%).</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Execution: 1.24s</span>
            <span>Tokens: 4,092</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span>Low Risk Classification</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
