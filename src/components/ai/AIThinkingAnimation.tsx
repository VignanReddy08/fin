import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AIThinkingAnimationProps {
  steps: string[];
  isActive: boolean;
  onComplete?: () => void;
}

export default function AIThinkingAnimation({ steps, isActive, onComplete }: AIThinkingAnimationProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<Record<number, { start: number; duration?: number }>>({});

  useEffect(() => {
    if (!isActive) return;

    if (currentStepIndex === 0 && !timestamps[0]) {
      setTimestamps((prev) => ({ ...prev, [0]: { start: Date.now() } }));
    }

    if (currentStepIndex < steps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, currentStepIndex]);
        setTimestamps((prev) => ({
          ...prev,
          [currentStepIndex]: { ...prev[currentStepIndex], duration: Date.now() - prev[currentStepIndex].start },
          [currentStepIndex + 1]: { start: Date.now() }
        }));
        setCurrentStepIndex((prev) => prev + 1);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      onComplete?.();
    }
  }, [currentStepIndex, steps.length, isActive, onComplete]);

  const progress = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

  return (
    <div className="flex flex-col space-y-4 w-full bg-card/80 backdrop-blur-md border border-border p-4 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">AI Processing</span>
        <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="bg-primary h-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="space-y-3 mt-4">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStepIndex === index && isActive;
            const isPending = index > currentStepIndex;

            if (isPending) return null;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex items-start space-x-3 text-sm",
                  isCompleted ? "text-muted-foreground" : isCurrent ? "text-foreground" : "text-muted"
                )}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : isCurrent ? (
                    <div className="relative flex items-center justify-center w-4 h-4">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-muted" />
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <span className={cn("font-medium", isCurrent && "animate-pulse")}>{step}</span>
                  {timestamps[index] && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {isCompleted 
                        ? `Completed in ${timestamps[index].duration}ms` 
                        : 'Processing...'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
