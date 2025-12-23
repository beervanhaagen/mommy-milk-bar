import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AssumptionsPage() {
  const supabase = await createClient();

  const { data: assumptions } = await supabase
    .from('assumptions')
    .select('*')
    .order('code', { ascending: true });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'success';
      case 'testing': return 'info';
      case 'invalidated': return 'error';
      case 'monitoring': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-cockpit-text-primary mb-2">
            Assumptions
          </h1>
          <p className="text-cockpit-text-secondary">
            Core beliefs to validate about the product
          </p>
        </div>
      </div>

      {/* Assumptions List */}
      {assumptions && assumptions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {assumptions.map((assumption) => (
            <GlassCard key={assumption.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-sm font-mono">
                      {assumption.code}
                    </Badge>
                    <Badge variant={getRiskColor(assumption.risk)} className="text-xs">
                      {assumption.risk}
                    </Badge>
                    <Badge variant={getStatusColor(assumption.status)} className="text-xs">
                      {assumption.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {assumption.category}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-cockpit-text-primary mb-2">
                    {assumption.title}
                  </h3>

                  {assumption.notes && (
                    <p className="text-sm text-cockpit-text-secondary mb-3">
                      {assumption.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-cockpit-text-tertiary">
                    <span>Confidence: {assumption.confidence}%</span>
                    {assumption.owner && <span>Owner: {assumption.owner}</span>}
                    <span>Updated: {formatDate(assumption.last_updated_at)}</span>
                  </div>
                </div>

                {/* Confidence Meter */}
                <div className="ml-6">
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-cockpit-text-primary">
                      {assumption.confidence}%
                    </span>
                    <p className="text-xs text-cockpit-text-tertiary">confidence</p>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-cockpit-border relative">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#E47C7C ${assumption.confidence * 3.6}deg, transparent 0deg)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-12 text-center">
          <p className="text-cockpit-text-secondary">
            Geen assumptions gevonden. Pas eerst de database migrations toe.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
