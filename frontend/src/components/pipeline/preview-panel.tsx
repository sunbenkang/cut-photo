'use client';

import { VideoIcon, DownloadIcon, ImageIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PipelineProgress from './pipeline-progress';
import { cn } from '@/lib/utils';

interface Props {
  imageUrl?: string | null;
  imageWidth?: number;
  imageHeight?: number;
  isGenerating?: boolean;
  statusMessage?: string;
  progress?: number;
  isCancelling?: boolean;
  onCancel?: () => void;
  previewUrl?: string | null;
  className?: string;
}

export default function PreviewPanel({
  imageUrl,
  imageWidth,
  imageHeight,
  isGenerating,
  statusMessage,
  progress = 0,
  isCancelling,
  onCancel,
  previewUrl,
  className,
}: Props) {
  const showResult = !!imageUrl;

  return (
    <div
      className={cn(
        'hollywood-panel flex flex-col min-h-[480px] lg:min-h-[560px]',
        className
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 m-1 p-4 relative">
        {isGenerating ? (
          <div className="w-full max-w-sm">
            <PipelineProgress
              statusMessage={statusMessage || ''}
              progress={progress}
              isCancelling={isCancelling}
              onCancel={onCancel}
            />
          </div>
        ) : showResult ? (
          <img
            src={imageUrl}
            alt="生成结果"
            className="max-w-full max-h-[min(60vh,520px)] object-contain"
            width={imageWidth}
            height={imageHeight}
          />
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="参考预览"
            className="max-w-full max-h-[min(50vh,480px)] object-contain opacity-80"
          />
        ) : (
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
              <VideoIcon className="h-10 w-10 text-hollywood-blue" />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold italic text-hollywood-blue">
                NO SIGNAL
              </p>
              <p className="text-sm text-hollywood-orange tracking-widest mt-1 font-medium">
                STANDBY FOR ACTION
              </p>
            </div>
          </div>
        )}
      </div>

      {showResult && imageUrl && (
        <div className="flex gap-2 justify-center pt-4 border-t border-gray-200 mt-2 flex-wrap">
          <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <DownloadIcon className="h-3.5 w-3.5 mr-1.5" />
              下载
            </Button>
          </a>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => window.open(imageUrl, '_blank')}
          >
            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
            查看原图
          </Button>
        </div>
      )}

      {isGenerating && !showResult && (
        <div className="flex justify-center pt-2">
          <Loader2Icon className="h-5 w-5 text-hollywood-blue animate-spin" />
        </div>
      )}
    </div>
  );
}
