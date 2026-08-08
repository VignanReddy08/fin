import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Brain, Sparkles, Database, FileText, Layout, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

const models = [
  { id: 1, name: 'Gemini Flash 2.0', task: 'Classification Model', time: '45ms', conf: '98.2%', cost: '$0.001', icon: Layout },
  { id: 2, name: 'Gemini 1.5 Pro', task: 'Reasoning Model', time: '380ms', conf: '94.1%', cost: '$0.008', icon: Brain },
  { id: 3, name: 'Custom ML Pipeline', task: 'Fraud Scoring', time: '120ms', conf: '96.8%', cost: '$0.002', icon: ShieldAlert },
  { id: 4, name: 'RAG + ChromaDB', task: 'Policy Retrieval', time: '210ms', conf: '91.5%', cost: '$0.003', icon: Database },
  { id: 5, name: 'Gemini Flash 2.0', task: 'Summarization', time: '150ms', conf: '95.3%', cost: '$0.001', icon: FileText },
  { id: 6, name: 'text-embedding-004', task: 'Embeddings', time: '30ms', conf: 'N/A', cost: '$0.000', icon: Sparkles },
  { id: 7, name: 'Gemini 1.5 Pro', task: 'Self-Validation', time: '200ms', conf: '97.1%', cost: '$0.004', icon: Brain },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export default function ModelTransparency() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">AI Pipeline Transparency</h2>
      </div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <motion.div key={model.id} variants={itemVariants}>
              <Card className="bg-card/60 backdrop-blur-sm border-border hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{model.task}</p>
                        <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">{model.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground">Latency</span>
                      <span className="text-xs font-mono text-foreground">{model.time}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground">Confidence</span>
                      <span className="text-xs font-mono text-foreground">{model.conf}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground">Est. Cost</span>
                      <span className="text-xs font-mono text-muted-foreground">{model.cost}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 px-2">
        <p>Total Pipeline Latency: 1.13s (Parallelized)</p>
        <p>Total Pipeline Cost: ~$0.019</p>
      </div>
    </div>
  );
}
