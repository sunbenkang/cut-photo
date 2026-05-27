import { useEffect, useRef } from 'react';

interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
}

export function useSSE(
  url: string | null,
  handlers: {
    onStage?: (data: Record<string, unknown>) => void;
    onRetry?: (data: Record<string, unknown>) => void;
    onComplete?: (data: Record<string, unknown>) => void;
    onError?: (data: Record<string, unknown>) => void;
    onCancelled?: (data: Record<string, unknown>) => void;
  },
  enabled: boolean = true
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!url || !enabled) return;

    const es = new EventSource(url);

    es.addEventListener('stage', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onStage?.(data);
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('retry', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onRetry?.(data);
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('complete', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onComplete?.(data);
        es.close();
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('error', (e: MessageEvent) => {
      try {
        if (e.data) {
          const data = JSON.parse(e.data);
          handlersRef.current.onError?.(data);
        }
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('cancelled', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onCancelled?.(data);
        es.close();
      } catch { /* ignore parse errors */ }
    });

    es.onerror = () => {
      // SSE connection error - will auto-reconnect
    };

    return () => {
      es.close();
    };
  }, [url, enabled]);
}
