import { cn } from '@/lib/utils';

interface Props {
  title: string;
  subtitle?: string;
  icon?: 'dot' | 'diamond';
  className?: string;
}

export default function SectionHeader({ title, subtitle, icon = 'dot', className }: Props) {
  return (
    <div className={cn('flex items-center gap-2 mb-3', className)}>
      {icon === 'dot' ? (
        <span className="w-2.5 h-2.5 rounded-full bg-hollywood-orange shrink-0" />
      ) : (
        <span className="w-2.5 h-2.5 bg-hollywood-blue rotate-45 shrink-0" />
      )}
      <h2 className="text-sm font-bold text-hollywood-blue tracking-wide">
        {title}
        {subtitle && (
          <span className="font-normal text-gray-500 ml-1.5">({subtitle})</span>
        )}
      </h2>
    </div>
  );
}
