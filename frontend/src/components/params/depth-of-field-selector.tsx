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

export default function DepthOfFieldSelector({ value, onChange, disabled }: Props) {
  const { data: config, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: getConfigApi,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  const dofs = config?.depth_of_fields || [];

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-hollywood-blue">镜头景深</label>
      <div className="grid grid-cols-3 gap-2">
        {dofs.map((d: { label: string; value: string; description: string }) => (
          <button
            key={d.value}
            onClick={() => onChange(d.value)}
            disabled={disabled}
            className={cn(
              'hollywood-option text-center',
              value === d.value && 'hollywood-option-active',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <p className="text-xs font-medium">{d.label}</p>
            <p className="text-[10px] opacity-80 mt-0.5">{d.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
