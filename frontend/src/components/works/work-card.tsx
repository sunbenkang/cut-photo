'use client';

import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import type { WorkItem } from '@/types/models';

interface Props {
  work: WorkItem;
  onDelete: (id: number) => void;
  onClick: (work: WorkItem) => void;
}

export default function WorkCard({ work, onDelete, onClick }: Props) {
  return (
    <div className="group relative overflow-hidden border-2 border-hollywood-blue bg-white hover:shadow-[4px_4px_0_0_#003399] transition-shadow">
      <button onClick={() => onClick(work)} className="w-full block">
        <img
          src={work.image_url}
          alt={`作品 ${work.id}`}
          className="w-full object-contain bg-hollywood-cream min-h-[120px]"
          loading="lazy"
        />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-white via-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            {work.movie_title_cn && (
              <p className="text-xs text-hollywood-blue truncate font-medium">
                {work.movie_title_cn}
              </p>
            )}
            {work.character_name && (
              <p className="text-[10px] text-gray-500 truncate">{work.character_name}</p>
            )}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(work.id);
            }}
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-gray-500 hover:text-red-600"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
