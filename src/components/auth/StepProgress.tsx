import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Props {
  steps: string[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center justify-center w-full max-w-md mx-auto mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <motion.div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                  'border-2 transition-colors duration-300',
                  isCompleted
                    ? 'bg-primary border-primary text-white'
                    : isCurrent
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border text-gray-500 bg-card',
                ].join(' ')}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  index + 1
                )}
              </motion.div>
              <span
                className={[
                  'text-[10px] mt-1 whitespace-nowrap',
                  isCurrent
                    ? 'text-primary font-medium'
                    : isCompleted
                      ? 'text-gray-400'
                      : 'text-gray-600',
                ].join(' ')}
              >
                {step}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="w-8 sm:w-12 h-0.5 mx-1 relative">
                <div className="absolute inset-0 bg-border rounded-full" />
                <motion.div
                  className="absolute inset-0 bg-primary rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
