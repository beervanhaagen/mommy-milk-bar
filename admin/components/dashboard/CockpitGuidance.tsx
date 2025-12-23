import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { GuidanceRule } from '@/lib/guidance/rules';
import { cn } from '@/lib/utils';

interface CockpitGuidanceProps {
  guidance: GuidanceRule[];
}

export function CockpitGuidance({ guidance }: CockpitGuidanceProps) {
  if (guidance.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cockpit-status-success/10">
            <Info className="h-5 w-5 text-cockpit-status-success" />
          </div>
          <div>
            <h3 className="font-semibold text-cockpit-text-primary">
              All systems nominal
            </h3>
            <p className="text-sm text-cockpit-text-secondary">
              Geen directe acties vereist - KPI's zijn gezond
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {guidance.map((rule) => {
        const Icon = rule.priority === 'critical'
          ? AlertCircle
          : rule.priority === 'high'
          ? AlertTriangle
          : Info;

        const priorityColors = {
          critical: 'bg-cockpit-status-error/10 border-cockpit-status-error/30 text-cockpit-status-error',
          high: 'bg-cockpit-status-warning/10 border-cockpit-status-warning/30 text-cockpit-status-warning',
          medium: 'bg-cockpit-status-info/10 border-cockpit-status-info/30 text-cockpit-status-info',
        };

        return (
          <GlassCard
            key={rule.id}
            className={cn(
              'p-4 border',
              priorityColors[rule.priority]
            )}
            glow={rule.priority === 'critical'}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                rule.priority === 'critical' && 'bg-cockpit-status-error/20',
                rule.priority === 'high' && 'bg-cockpit-status-warning/20',
                rule.priority === 'medium' && 'bg-cockpit-status-info/20'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-cockpit-text-primary">
                    {rule.message}
                  </h4>
                  <Badge variant={
                    rule.priority === 'critical' ? 'error' :
                    rule.priority === 'high' ? 'warning' : 'info'
                  } className="text-xs">
                    {rule.priority}
                  </Badge>
                </div>
                {rule.action && (
                  <p className="text-sm text-cockpit-text-secondary mb-2">
                    {rule.action}
                  </p>
                )}
                {rule.relatedAssumptions && rule.relatedAssumptions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cockpit-text-tertiary">
                      Related:
                    </span>
                    {rule.relatedAssumptions.map((code) => (
                      <Badge key={code} variant="outline" className="text-xs">
                        {code}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
