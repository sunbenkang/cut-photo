'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, Loader2Icon, AlertCircleIcon } from 'lucide-react';
import type { UploadResponse } from '@/types/models';
import { cn } from '@/lib/utils';

interface Props {
  onUpload: (data: UploadResponse) => void;
  isUploading: boolean;
  setIsUploading: (v: boolean) => void;
}

export default function UploadZone({ onUpload, isUploading, setIsUploading }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setPreview(URL.createObjectURL(file));
      setIsUploading(true);

      try {
        const { uploadImageApi } = await import('@/lib/api-client');
        const data = await uploadImageApi(file);
        onUpload(data);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          (err as Error).message ||
          '上传失败，请重试';
        setError(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, setIsUploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'upload-dashed p-8 text-center cursor-pointer transition-all',
          isDragActive && 'bg-hollywood-orange/5 border-hollywood-orange',
          isUploading && 'pointer-events-none opacity-50',
          error && 'border-red-500'
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2Icon className="h-10 w-10 text-hollywood-blue animate-spin" />
            <p className="text-gray-600 text-sm">正在上传并校验图片...</p>
          </div>
        ) : preview ? (
          <div className="space-y-3">
            <img src={preview} alt="预览" className="max-h-48 mx-auto object-contain" />
            <p className="text-sm text-hollywood-orange">点击或拖拽更换照片</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <UploadIcon className="h-10 w-10 text-hollywood-orange" />
            <p className="text-hollywood-orange font-medium text-sm">点击上传人物参考图</p>
            <p className="text-xs text-gray-500">支持 JPG / PNG / WebP 等格式</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 border-2 border-red-400 bg-red-50 flex items-start gap-2">
          <AlertCircleIcon className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
