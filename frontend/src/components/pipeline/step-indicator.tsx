'use client';

import { CheckIcon, Loader2Icon } from 'lucide-react';
import type { PipelineStep } from '@/types/pipeline';
import { PIPELINE_STEP_LABELS } from '@/types/pipeline';
import { cn } from '@/lib/utils';

interface Props {
  currentStep: PipelineStep;
  disabled?: boolean;
}

export default function StepIndicator({ currentStep, disabled }: Props) {
  const steps: PipelineStep[] = [1, 2, 3, 4, 5, 6];

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1 flex-wrap py-2',
        disabled && 'opacity-50'
      )}
    >
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs border transition-all',
              step < currentStep
                ? 'border-green-600 bg-green-50 text-green-700'
                : step === currentStep
                  ? 'border-hollywood-orange bg-hollywood-orange/10 text-hollywood-orange font-medium'
                  : 'border-gray-300 bg-white text-gray-400'
            )}
          >
            {step < currentStep ? (
              <CheckIcon className="h-3 w-3" />
            ) : step === currentStep && step >= 5 ? (
              <Loader2Icon className="h-3 w-3 animate-spin" />
            ) : (
              <span className="font-medium">{step}</span>
            )}
            <span className="hidden sm:inline">{PIPELINE_STEP_LABELS[step]}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                'w-3 sm:w-6 h-px',
                step < currentStep ? 'bg-green-400' : 'bg-gray-300'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
