'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorksApi, deleteWorkApi, clearWorksApi } from '@/lib/api-client';
import { useWorksStore } from '@/stores/works-store';
import { toast } from 'sonner';
import WorksGrid from '@/components/works/works-grid';
import WorksToolbar from '@/components/works/works-toolbar';
import ImageModal from '@/components/works/image-modal';
import HollywoodLogo from '@/components/layout/hollywood-logo';
import type { WorkItem } from '@/types/models';

export default function WorksPage() {
  const queryClient = useQueryClient();
  const { sortOrder, toggleSort } = useWorksStore();
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['works', sortOrder],
    queryFn: () => getWorksApi(sortOrder),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
      toast.success('作品已删除');
      setModalOpen(false);
      setSelectedWork(null);
    },
    onError: () => toast.error('删除失败，请重试'),
  });

  const clearMutation = useMutation({
    mutationFn: clearWorksApi,
    onSuccess: (data: { deleted_count: number }) => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
      toast.success(`已清空 ${data.deleted_count} 张作品`);
    },
    onError: () => toast.error('清空失败，请重试'),
  });

  const handleDelete = useCallback(
    (id: number) => {
      if (confirm('确认删除这张作品？此操作不可恢复。')) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation]
  );

  const handleClearAll = useCallback(() => {
    if (confirm('确认清空所有作品？此操作不可恢复。')) {
      clearMutation.mutate();
    }
  }, [clearMutation]);

  const handleImageClick = useCallback((work: WorkItem) => {
    setSelectedWork(work);
    setModalOpen(true);
  }, []);

  const handleToggleSort = useCallback(() => {
    toggleSort();
    toast.success(sortOrder === 'desc' ? '已切换为最早在前' : '已切换为最新在前');
  }, [toggleSort, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <HollywoodLogo size="sm" showTagline={false} className="text-left" />
      <h1 className="text-lg font-bold text-hollywood-blue border-b-2 border-hollywood-blue pb-2 inline-block">
        我的作品
      </h1>
      <WorksToolbar
        sortOrder={sortOrder}
        onToggleSort={handleToggleSort}
        onClearAll={handleClearAll}
        clearing={clearMutation.isPending}
        total={data?.total || 0}
      />
      <WorksGrid
        works={data?.works || []}
        isLoading={isLoading}
        onDelete={handleDelete}
        onImageClick={handleImageClick}
      />
      <ImageModal
        work={selectedWork}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedWork(null);
        }}
      />
    </div>
  );
}
