'use client';

import { useQuery } from '@tanstack/react-query';
import { getTemplatesApi } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import type { TemplateInfo } from '@/types/models';
import { toast } from 'sonner';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  selected: TemplateInfo | null;
  onSelect: (t: TemplateInfo | null) => void;
}

export default function TemplateSelector({ selected, onSelect }: Props) {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplatesApi,
  });

  if (isLoading) return <Skeleton className="h-24 w-full" />;

  const handleSelect = (t: TemplateInfo) => {
    if (selected?.id === t.id) {
      onSelect(null);
      toast.success('已取消模板选择');
    } else {
      onSelect(t);
      toast.success(`已应用模板：${t.name}`);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-hollywood-blue">片场风格模板</label>
      <div className="grid grid-cols-2 gap-2">
        {templates?.map((t: TemplateInfo) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t)}
            className={cn(
              'hollywood-option text-left p-3',
              selected?.id === t.id && 'hollywood-option-active ring-2 ring-hollywood-orange'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium">{t.name}</p>
              {selected?.id === t.id && <CheckIcon className="h-3 w-3" />}
            </div>
            <p className="text-[10px] opacity-80 line-clamp-2">{t.description}</p>
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-xs text-hollywood-orange">已选模板：{selected.name}</p>
      )}
    </div>
  );
}
