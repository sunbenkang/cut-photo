'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DownloadIcon, Edit3Icon, XIcon } from 'lucide-react';
import type { WorkItem } from '@/types/models';
import { useRouter } from 'next/navigation';

interface Props {
  work: WorkItem | null;
  open: boolean;
  onClose: () => void;
}

export default function ImageModal({ work, open, onClose }: Props) {
  const router = useRouter();

  if (!work) return null;

  const handleReEdit = () => {
    // Store work params for re-edit
    sessionStorage.setItem('re_edit_params', JSON.stringify({
      movie_title_cn: work.movie_title_cn,
      character_name: work.character_name,
      aspect_ratio: work.aspect_ratio,
      depth_of_field: work.depth_of_field,
      template_name: work.template_name,
    }));
    onClose();
    router.push('/');
  };

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-gray-900 border-gray-800">
        <div className="relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
          >
            <XIcon className="h-4 w-4" />
          </Button>
          <img
            src={work.image_url}
            alt={`作品 ${work.id}`}
            className="max-w-full max-h-[75vh] mx-auto object-contain"
          />
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 min-w-0">
            {work.movie_title_cn && <span className="text-gray-300 mr-2">{work.movie_title_cn}</span>}
            {work.character_name && <span className="text-gray-500 text-xs">{work.character_name}</span>}
            <span className="text-gray-600 text-xs ml-2">{work.created_at?.slice(0, 10)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={work.image_url} download target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-klein hover:bg-klein-light text-xs">
                <DownloadIcon className="h-3 w-3 mr-1" />
                下载
              </Button>
            </a>
            <Button size="sm" variant="outline" className="text-xs border-gray-700" onClick={handleReEdit}>
              <Edit3Icon className="h-3 w-3 mr-1" />
              二次编辑
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
