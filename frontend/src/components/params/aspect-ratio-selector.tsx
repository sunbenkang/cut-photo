'use client';

import { useQuery } from '@tanstack/react-query';
import { getConfigApi } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function AspectRatioSelector({ value, onChange, disabled }: Props) {
  const { data: config, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: getConfigApi,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  const ratios = config?.aspect_ratios || [];

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-hollywood-blue">画幅比例</label>
      <div className="grid grid-cols-4 gap-2">
        {ratios.map((r: { label: string; value: string }) => (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            disabled={disabled}
            className={cn(
              'hollywood-option text-center',
              value === r.value && 'hollywood-option-active',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
