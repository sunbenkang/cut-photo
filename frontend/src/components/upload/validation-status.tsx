'use client';

import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react';
import type { ValidationLayer } from '@/types/models';
import { cn } from '@/lib/utils';

interface Props {
  layers: ValidationLayer[];
  isValid: boolean;
}

const LAYER_LABELS: Record<string, string> = {
  basic_classification: '基础分类校验',
  content_safety: '内容安全检测',
  portrait_features: '人像特征提取',
};

const LAYER_ORDER = ['basic_classification', 'content_safety', 'portrait_features'];

export default function ValidationStatus({ layers, isValid }: Props) {
  const sorted = LAYER_ORDER.map((name) => layers.find((l) => l.name === name)).filter(
    Boolean
  ) as ValidationLayer[];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-hollywood-blue mb-2">检测结果</h3>
      {sorted.map((layer) => (
        <div
          key={layer.name}
          className={cn(
            'flex items-start gap-3 p-2 border text-sm',
            layer.passed
              ? 'bg-green-50 border-green-300 text-green-800'
              : 'bg-red-50 border-red-300 text-red-800'
          )}
        >
          {layer.passed ? (
            <CheckCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <XCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-xs">{LAYER_LABELS[layer.name] || layer.name}</p>
            <p className="text-[10px] opacity-80 mt-0.5">{layer.detail}</p>
          </div>
        </div>
      ))}
      {!isValid && (
        <div className="p-2 border-2 border-amber-400 bg-amber-50 flex items-start gap-2 text-amber-900">
          <AlertTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-xs">
            请上传包含清晰人脸的照片。检测不通过不会记录违规信息。
          </p>
        </div>
      )}
    </div>
  );
}
