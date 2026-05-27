import { useEffect, useRef, useState, useCallback } from 'react';

interface DetectedFace {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function useFaceDetection(
  imageUrl: string | null,
  serverFaces: DetectedFace[],
  imageWidth: number,
  imageHeight: number
) {
  const [faces, setFaces] = useState<DetectedFace[]>(serverFaces);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use server-detected faces as primary source
  useEffect(() => {
    if (serverFaces.length > 0) {
      setFaces(serverFaces);
    }
  }, [serverFaces]);

  const drawFaces = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      faces.forEach((face, i) => {
        const color = i === selectedIndex ? '#22c55e' : '#3b82f6';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(face.x, face.y, face.w, face.h);

        // Label
        ctx.fillStyle = color;
        ctx.font = '14px sans-serif';
        ctx.fillText(`人脸 ${i + 1}`, face.x, face.y - 6);
      });
    };
    img.src = imageUrl;
  }, [imageUrl, faces, selectedIndex]);

  useEffect(() => {
    drawFaces();
  }, [drawFaces]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (let i = 0; i < faces.length; i++) {
      const f = faces[i];
      if (x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h) {
        setSelectedIndex(i);
        return i;
      }
    }
    return -1;
  }, [faces]);

  return { faces, selectedIndex, setSelectedIndex, canvasRef, handleCanvasClick };
}
