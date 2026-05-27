'use client';

import { Button } from '@/components/ui/button';
import { ArrowUpDownIcon, Trash2Icon } from 'lucide-react';

interface Props {
  sortOrder: 'desc' | 'asc';
  onToggleSort: () => void;
  onClearAll: () => void;
  clearing: boolean;
  total: number;
}

export default function WorksToolbar({
  sortOrder,
  onToggleSort,
  onClearAll,
  clearing,
  total,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600">共 {total} 张作品</p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSort}
          className="text-xs text-gray-600 hover:text-hollywood-blue"
        >
          <ArrowUpDownIcon className="h-3 w-3 mr-1" />
          {sortOrder === 'desc' ? '最新在前' : '最早在前'}
        </Button>
        {total > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            disabled={clearing}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2Icon className="h-3 w-3 mr-1" />
            {clearing ? '清空中...' : '清空全部'}
          </Button>
        )}
      </div>
    </div>
  );
}
