'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { WorkItem } from '@/types/models';
import WorkCard from './work-card';

interface Props {
  works: WorkItem[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  onImageClick: (work: WorkItem) => void;
}

export default function WorksGrid({ works, isLoading, onDelete, onImageClick }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
        ))}
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">暂无作品</p>
        <p className="text-gray-600 text-sm mt-2">生成您的第一张电影片场合影吧</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {works.map((work) => (
        <WorkCard
          key={work.id}
          work={work}
          onDelete={onDelete}
          onClick={onImageClick}
        />
      ))}
    </div>
  );
}
