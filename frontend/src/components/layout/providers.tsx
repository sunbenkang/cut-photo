'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import AuthGuard from './auth-guard';
import Header from './header';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
      </AuthGuard>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#1a1a2e',
            border: '2px solid #003399',
          },
        }}
      />
    </QueryClientProvider>
  );
}
