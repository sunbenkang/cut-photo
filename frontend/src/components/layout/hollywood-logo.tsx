import { ClapperboardIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  tagline?: string;
  className?: string;
}

const sizeMap = {
  sm: { icon: 'h-8 w-8', inner: 'h-4 w-4', title: 'text-xl', tagline: 'text-xs' },
  md: { icon: 'h-12 w-12', inner: 'h-6 w-6', title: 'text-2xl', tagline: 'text-sm' },
  lg: { icon: 'h-16 w-16', inner: 'h-8 w-8', title: 'text-3xl', tagline: 'text-base' },
};

export default function HollywoodLogo({
  size = 'md',
  showTagline = true,
  tagline = '打造您的专属电影时刻',
  className,
}: Props) {
  const s = sizeMap[size];

  return (
    <div className={cn('text-center', className)}>
      {size !== 'sm' && (
        <div className="mx-auto mb-3 relative inline-flex">
          <div
            className={cn(
              'rounded-full bg-hollywood-blue flex items-center justify-center ring-4 ring-white ring-offset-2 ring-offset-hollywood-orange',
              s.icon
            )}
          >
            <ClapperboardIcon className={cn('text-white', s.inner)} />
          </div>
        </div>
      )}
      <h1
        className={cn(
          'font-heading font-bold italic tracking-tight leading-tight',
          s.title
        )}
      >
        <span className="text-hollywood-blue">Hollywood</span>{' '}
        <span className="text-hollywood-orange">Cut</span>
      </h1>
      {showTagline && (
        <p
          className={cn(
            'font-serif-cn text-gray-700 mt-1 pb-1 border-b border-dashed border-hollywood-orange/60 inline-block',
            s.tagline
          )}
        >
          {tagline}
        </p>
      )}
    </div>
  );
}
