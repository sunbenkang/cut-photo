'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { LogOutIcon, CameraIcon, FilmIcon } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, userInfo, logout } = useAuthStore();

  if (!isAuthenticated || pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-hollywood-blue bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-heading text-lg font-bold italic text-hollywood-blue">
              Hollywood
            </span>
            <span className="font-heading text-lg font-bold italic text-hollywood-orange">
              Cut
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link
              href="/"
              className={`text-sm transition-colors ${
                pathname === '/'
                  ? 'text-hollywood-orange font-medium'
                  : 'text-gray-600 hover:text-hollywood-blue'
              }`}
            >
              生成
            </Link>
            <Link
              href="/works"
              className={`text-sm transition-colors ${
                pathname === '/works'
                  ? 'text-hollywood-orange font-medium'
                  : 'text-gray-600 hover:text-hollywood-blue'
              }`}
            >
              作品
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:inline font-mono">
            {userInfo?.app_key_prefix || ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-600 hover:text-hollywood-blue text-xs"
          >
            <LogOutIcon className="h-3 w-3 mr-1" />
            退出
          </Button>
        </div>
      </div>

      <div className="sm:hidden flex border-t border-hollywood-blue/20">
        <Link
          href="/"
          className={`flex-1 py-2 text-center text-xs ${
            pathname === '/'
              ? 'text-hollywood-orange border-b-2 border-hollywood-orange'
              : 'text-gray-500'
          }`}
        >
          <CameraIcon className="h-4 w-4 mx-auto mb-0.5" />
          生成
        </Link>
        <Link
          href="/works"
          className={`flex-1 py-2 text-center text-xs ${
            pathname === '/works'
              ? 'text-hollywood-orange border-b-2 border-hollywood-orange'
              : 'text-gray-500'
          }`}
        >
          <FilmIcon className="h-4 w-4 mx-auto mb-0.5" />
          作品
        </Link>
      </div>
    </header>
  );
}
