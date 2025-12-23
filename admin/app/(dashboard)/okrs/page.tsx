import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function OKRsPage() {
  const supabase = await createClient();

  const { data: okrs } = await supabase
    .from('okrs')
    .select(`
      *,
      krs (*)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-cockpit-text-primary mb-2">
          OKRs
        </h1>
        <p className="text-cockpit-text-secondary">
          Objectives and Key Results
        </p>
      </div>

      {okrs && okrs.length > 0 ? (
        <div className="space-y-4">
          {okrs.map((okr: any) => (
            <GlassCard key={okr.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {okr.period}
                  </Badge>
                  <h3 className="text-xl font-semibold text-cockpit-text-primary">
                    {okr.objective}
                  </h3>
                  {okr.owner && (
                    <p className="text-sm text-cockpit-text-tertiary mt-1">
                      Owner: {okr.owner}
                    </p>
                  )}
                </div>
                <Badge variant={okr.status === 'active' ? 'success' : 'outline'}>
                  {okr.status}
                </Badge>
              </div>

              {okr.krs && okr.krs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-cockpit-text-secondary">
                    Key Results
                  </h4>
                  {okr.krs.map((kr: any) => {
                    const progress = (kr.current / kr.target) * 100;
                    return (
                      <div key={kr.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-cockpit-text-primary">
                            {kr.name}
                          </span>
                          <span className="text-sm text-cockpit-text-secondary">
                            {kr.current} / {kr.target} {kr.unit}
                          </span>
                        </div>
                        <div className="w-full bg-cockpit-surface rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cockpit-accent-berry to-cockpit-accent-pink h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-cockpit-text-tertiary">
                            Confidence: {kr.confidence}%
                          </span>
                          {kr.due_date && (
                            <span className="text-xs text-cockpit-text-tertiary">
                              Due: {kr.due_date}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-12 text-center">
          <p className="text-cockpit-text-secondary">
            Geen OKRs gevonden. Pas eerst de database migrations toe.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
