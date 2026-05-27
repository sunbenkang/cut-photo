'use client';

import { useFaceDetection } from '@/hooks/use-face-detection';
import type { FaceBox } from '@/types/models';
import { toast } from 'sonner';

interface Props {
  imageUrl: string;
  faces: FaceBox[];
  imageWidth: number;
  imageHeight: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function FaceCanvas({
  imageUrl,
  faces,
  imageWidth,
  imageHeight,
  selectedIndex,
  onSelect,
}: Props) {
  const { canvasRef, handleCanvasClick } = useFaceDetection(
    imageUrl,
    faces,
    imageWidth,
    imageHeight
  );

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const idx = handleCanvasClick(e);
    if (idx !== undefined && idx >= 0) {
      onSelect(idx);
      toast.success(`已选择人脸 ${idx + 1}`);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        检测到 {faces.length} 张人脸，请点击选择参与合成的人物。
        {faces.length > 1 && (
          <span className="text-hollywood-orange ml-1 font-medium">
            当前：人脸 {selectedIndex + 1}
          </span>
        )}
      </p>
      <div className="relative overflow-hidden border-2 border-hollywood-blue">
        <canvas ref={canvasRef} onClick={onClick} className="max-w-full cursor-crosshair" />
      </div>
    </div>
  );
}
