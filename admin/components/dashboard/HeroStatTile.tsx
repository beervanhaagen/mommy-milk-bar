import { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

interface HeroStatTileProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon: LucideIcon;
  status?: 'good' | 'warning' | 'danger';
  suffix?: string;
}

export function HeroStatTile({
  label,
  value,
  change,
  icon: Icon,
  status = 'good',
  suffix,
}: HeroStatTileProps) {
  const statusColors = {
    good: 'text-cockpit-status-success',
    warning: 'text-cockpit-status-warning',
    danger: 'text-cockpit-status-error',
  };

  return (
    <GlassCard className="p-6" glow={status === 'danger'}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-cockpit-text-secondary mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-cockpit-text-primary">
              {value}{suffix}
            </h3>
          </div>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              <span className={cn('text-xs font-medium', statusColors[status])}>
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
              <span className="text-xs text-cockpit-text-tertiary">
                vs {change.period}
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', 'bg-cockpit-accent-berry/10')}>
          <Icon className="h-6 w-6 text-cockpit-accent-pink" />
        </div>
      </div>
    </GlassCard>
  );
}
