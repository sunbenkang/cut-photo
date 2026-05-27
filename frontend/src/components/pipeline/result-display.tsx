'use client';

import { Button } from '@/components/ui/button';
import { Edit3Icon, RotateCcwIcon } from 'lucide-react';

interface Props {
  imageUrl: string;
  width: number;
  height: number;
  retryCount: number;
  onReEdit?: () => void;
  onRegenerate?: () => void;
}

export default function ResultDisplay({
  retryCount,
  onReEdit,
  onRegenerate,
}: Props) {
  return (
    <div className="space-y-3">
      {retryCount > 0 && (
        <p className="text-xs text-gray-500 text-center">
          本次共重试 {retryCount} 次后达到质量标准
        </p>
      )}

      <div className="flex gap-2 justify-center flex-wrap">
        {onReEdit && (
          <Button
            size="sm"
            variant="hollywood-outline"
            className="text-xs rounded-full"
            onClick={onReEdit}
          >
            <Edit3Icon className="h-3 w-3 mr-1" />
            二次编辑
          </Button>
        )}
        {onRegenerate && (
          <Button
            size="sm"
            variant="hollywood-accent"
            className="text-xs rounded-full"
            onClick={onRegenerate}
          >
            <RotateCcwIcon className="h-3 w-3 mr-1" />
            重新生成
          </Button>
        )}
      </div>
    </div>
  );
}
