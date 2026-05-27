'use client';

import { Progress } from '@/components/ui/progress';
import { Loader2Icon, XCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  statusMessage: string;
  progress: number;
  isCancelling?: boolean;
  onCancel?: () => void;
}

export default function PipelineProgress({
  statusMessage,
  progress,
  isCancelling,
  onCancel,
}: Props) {
  return (
    <div className="space-y-4 w-full text-center">
      <Loader2Icon className="h-10 w-10 text-hollywood-blue animate-spin mx-auto" />
      <div>
        <p className="font-heading text-lg font-bold italic text-hollywood-blue">ON AIR</p>
        <p className="text-sm text-gray-600 mt-1 truncate">{statusMessage || '准备中...'}</p>
        <Progress value={Math.min(progress, 99)} className="h-1.5 mt-3 max-w-xs mx-auto" />
      </div>

      {onCancel && (
        <Button
          onClick={onCancel}
          disabled={isCancelling}
          variant="hollywood-outline"
          size="sm"
          className="text-xs"
        >
          <XCircleIcon className="h-3 w-3 mr-1" />
          {isCancelling ? '正在终止...' : '终止生成'}
        </Button>
      )}
    </div>
  );
}
